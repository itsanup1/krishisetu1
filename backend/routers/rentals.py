import logging
from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, text
from backend.database import get_db
from backend.models import (
    User,
    UserRole,
    EquipmentListing,
    RentalRecord,
    RentalPayment,
    RentalQueue,
    Equipment,
)
from backend.schemas import (
    EquipmentListingCreate,
    EquipmentListingUpdate,
    EquipmentListingResponse,
    RentalRecordCreate,
    RentalRecordUpdateStatus,
    RentalRecordResponse,
    RentalPaymentCreate,
    RentalPaymentResponse,
    RentalQueueCreate,
    RentalQueueResponse,
    AvailabilityCheckResponse,
)
from backend.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/rentals", tags=["4-Table Agricultural Equipment Rental Module"])


# --------------------------------------------------------------------
# HELPER: Compute dynamic availability
# --------------------------------------------------------------------
def compute_available_quantity(
    db: Session,
    listing_id: int,
    start_date: date,
    end_date: date,
) -> int:
    """
    Available Quantity = Total Quantity - Sum of overlapping approved/active rentals.
    Overlapping condition: rental_start_date <= end_date AND rental_end_date >= start_date
    """
    listing = db.query(EquipmentListing).filter(EquipmentListing.listing_id == listing_id).first()
    if not listing:
        return 0

    booked = (
        db.query(func.coalesce(func.sum(RentalRecord.quantity_rented), 0))
        .filter(
            RentalRecord.listing_id == listing_id,
            RentalRecord.rental_status.in_(["approved", "active"]),
            RentalRecord.rental_start_date <= end_date,
            RentalRecord.rental_end_date >= start_date,
        )
        .scalar()
    )
    return max(0, listing.total_quantity - int(booked))


def process_queue_notifications(db: Session, listing_id: int):
    """
    Checks waiting queue entries for this listing and marks the first eligible
    farmer whose requested dates and quantity fit into the available quantity.
    """
    waiting_entries = (
        db.query(RentalQueue)
        .filter(
            RentalQueue.listing_id == listing_id,
            RentalQueue.queue_status == "waiting",
        )
        .order_by(RentalQueue.queue_position.asc(), RentalQueue.created_at.asc())
        .all()
    )

    for entry in waiting_entries:
        avail = compute_available_quantity(
            db, listing_id, entry.requested_start_date, entry.requested_end_date
        )
        if avail >= entry.requested_quantity:
            entry.queue_status = "notified"
            db.commit()
            logger.info(
                f"[Queue] Farmer {entry.farmer_id} notified for listing {listing_id}."
            )
            break


# ====================================================================
# MODULE 1: EQUIPMENT LISTINGS
# ====================================================================

@router.get("/listings", response_model=List[EquipmentListingResponse])
def get_equipment_listings(
    category: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(EquipmentListing).filter(EquipmentListing.listing_status == "active")

    if category and category != "ALL":
        query = query.filter(EquipmentListing.category.ilike(f"%{category.strip()}%"))

    if location:
        query = query.filter(EquipmentListing.location.ilike(f"%{location.strip()}%"))

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                EquipmentListing.equipment_name.ilike(s),
                EquipmentListing.description.ilike(s),
                EquipmentListing.specifications.ilike(s),
                EquipmentListing.location.ilike(s),
            )
        )

    listings = query.order_by(EquipmentListing.created_at.desc()).all()
    results = []
    
    check_start = start_date or date.today()
    check_end = end_date or date.today()

    for item in listings:
        resp = EquipmentListingResponse.model_validate(item)
        resp.owner_name = item.owner.name if item.owner else "Machinery Owner"
        resp.owner_phone = item.owner.phone if item.owner else None
        resp.available_quantity = compute_available_quantity(
            db, item.listing_id, check_start, check_end
        )
        results.append(resp)

    return results


@router.get("/listings/{listing_id}", response_model=EquipmentListingResponse)
def get_listing_detail(
    listing_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    item = db.query(EquipmentListing).filter(EquipmentListing.listing_id == listing_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment listing not found.")

    check_start = start_date or date.today()
    check_end = end_date or date.today()

    resp = EquipmentListingResponse.model_validate(item)
    resp.owner_name = item.owner.name if item.owner else "Machinery Owner"
    resp.owner_phone = item.owner.phone if item.owner else None
    resp.available_quantity = compute_available_quantity(
        db, item.listing_id, check_start, check_end
    )
    return resp


@router.post("/listings", response_model=EquipmentListingResponse, status_code=status.HTTP_201_CREATED)
def create_equipment_listing(
    payload: EquipmentListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.total_quantity <= 0:
        raise HTTPException(status_code=400, detail="Total quantity must be greater than 0.")
    if payload.price_per_day < 0:
        raise HTTPException(status_code=400, detail="Price per day cannot be negative.")

    # Auto-generate rental_id (e.g. R015) if not provided
    rental_id = payload.rental_id
    if not rental_id:
        max_id = db.query(func.max(EquipmentListing.listing_id)).scalar() or 0
        rental_id = f"R{max_id + 1:03d}"

    new_listing = EquipmentListing(
        owner_id=current_user.id,
        equipment_name=payload.equipment_name,
        category=payload.category,
        description=payload.description or "",
        specifications=payload.specifications or "",
        price_per_day=payload.price_per_day,
        total_quantity=payload.total_quantity,
        location=payload.location or current_user.location,
        listing_status=payload.listing_status or "active",
        image_url=payload.image_url or "/src/assets/images/mahindra_575_di_tractor_1791501015615.jpg",
        rental_id=rental_id,
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    resp = EquipmentListingResponse.model_validate(new_listing)
    resp.owner_name = current_user.name
    resp.owner_phone = current_user.phone
    resp.available_quantity = new_listing.total_quantity
    return resp


@router.put("/listings/{listing_id}", response_model=EquipmentListingResponse)
def update_equipment_listing(
    listing_id: int,
    payload: EquipmentListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(EquipmentListing).filter(EquipmentListing.listing_id == listing_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment listing not found.")

    if item.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: You can only edit your own equipment listings.",
        )

    for field, val in payload.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(item, field, val)

    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)

    resp = EquipmentListingResponse.model_validate(item)
    resp.owner_name = current_user.name
    resp.owner_phone = current_user.phone
    resp.available_quantity = compute_available_quantity(
        db, item.listing_id, date.today(), date.today()
    )
    return resp


@router.delete("/listings/{listing_id}")
def delete_or_deactivate_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(EquipmentListing).filter(EquipmentListing.listing_id == listing_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment listing not found.")

    if item.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: You can only delete your own equipment listings.",
        )

    # Check for active or approved rentals
    active_rentals = (
        db.query(RentalRecord)
        .filter(
            RentalRecord.listing_id == listing_id,
            RentalRecord.rental_status.in_(["approved", "active"]),
            RentalRecord.rental_end_date >= date.today(),
        )
        .count()
    )

    if active_rentals > 0:
        # Safe deactivation policy
        item.listing_status = "deactivated"
        item.updated_at = datetime.utcnow()
        db.commit()
        return {
            "status": "deactivated",
            "message": f"Listing has {active_rentals} active/approved rental bookings. It has been safely deactivated from the public catalog instead of deleted.",
        }

    # Safe deactivation
    item.listing_status = "deactivated"
    item.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "message": "Equipment listing successfully deactivated."}


@router.get("/my-listings", response_model=List[EquipmentListingResponse])
def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listings = (
        db.query(EquipmentListing)
        .filter(EquipmentListing.owner_id == current_user.id)
        .order_by(EquipmentListing.created_at.desc())
        .all()
    )
    results = []
    for item in listings:
        resp = EquipmentListingResponse.model_validate(item)
        resp.owner_name = current_user.name
        resp.owner_phone = current_user.phone
        resp.available_quantity = compute_available_quantity(
            db, item.listing_id, date.today(), date.today()
        )
        results.append(resp)
    return results


# ====================================================================
# MODULE 2: AVAILABILITY CHECK
# ====================================================================

@router.get("/listings/{listing_id}/availability", response_model=AvailabilityCheckResponse)
def check_availability(
    listing_id: int,
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    if end_date < start_date:
        raise HTTPException(status_code=400, detail="End date must be on or after start date.")

    listing = db.query(EquipmentListing).filter(EquipmentListing.listing_id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Equipment listing not found.")

    booked = (
        db.query(func.coalesce(func.sum(RentalRecord.quantity_rented), 0))
        .filter(
            RentalRecord.listing_id == listing_id,
            RentalRecord.rental_status.in_(["approved", "active"]),
            RentalRecord.rental_start_date <= end_date,
            RentalRecord.rental_end_date >= start_date,
        )
        .scalar()
    )

    avail = max(0, listing.total_quantity - int(booked))

    return AvailabilityCheckResponse(
        listing_id=listing_id,
        total_quantity=listing.total_quantity,
        booked_quantity=int(booked),
        available_quantity=avail,
        start_date=start_date,
        end_date=end_date,
    )


# ====================================================================
# MODULE 3: RENTAL RECORDS (REQUEST, APPROVAL, AVAILABILITY ENFORCEMENT)
# ====================================================================

@router.post("/records", response_model=RentalRecordResponse, status_code=status.HTTP_201_CREATED)
def request_rental(
    payload: RentalRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.rental_end_date < payload.rental_start_date:
        raise HTTPException(status_code=400, detail="Rental end date must be on or after start date.")

    if payload.quantity_rented <= 0:
        raise HTTPException(status_code=400, detail="Quantity rented must be greater than 0.")

    # Row-locking to prevent simultaneous race conditions
    listing = (
        db.query(EquipmentListing)
        .filter(EquipmentListing.listing_id == payload.listing_id)
        .with_for_update()
        .first()
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Equipment listing not found.")

    if listing.listing_status != "active":
        raise HTTPException(status_code=400, detail="This equipment listing is currently inactive.")

    # Calculate dynamic availability
    booked_quantity = (
        db.query(func.coalesce(func.sum(RentalRecord.quantity_rented), 0))
        .filter(
            RentalRecord.listing_id == payload.listing_id,
            RentalRecord.rental_status.in_(["approved", "active"]),
            RentalRecord.rental_start_date <= payload.rental_end_date,
            RentalRecord.rental_end_date >= payload.rental_start_date,
        )
        .scalar()
    )
    available_qty = max(0, listing.total_quantity - int(booked_quantity))

    if payload.quantity_rented > available_qty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Requested quantity ({payload.quantity_rented}) exceeds available quantity ({available_qty}) "
                f"for the selected dates ({payload.rental_start_date} to {payload.rental_end_date}). "
                f"You can join the waiting queue for this equipment."
            ),
        )

    # Compute duration and total amount
    duration_days = max(1, (payload.rental_end_date - payload.rental_start_date).days + 1)
    total_amount = round(float(listing.price_per_day) * duration_days * payload.quantity_rented, 2)

    new_rental = RentalRecord(
        listing_id=payload.listing_id,
        farmer_id=current_user.id,
        quantity_rented=payload.quantity_rented,
        rental_start_date=payload.rental_start_date,
        rental_end_date=payload.rental_end_date,
        rental_status="pending",
        total_amount=total_amount,
    )
    db.add(new_rental)
    db.commit()
    db.refresh(new_rental)

    resp = RentalRecordResponse.model_validate(new_rental)
    resp.farmer_name = current_user.name
    resp.farmer_phone = current_user.phone
    resp.equipment_name = listing.equipment_name
    resp.location = listing.location
    return resp


@router.get("/my-rentals", response_model=List[RentalRecordResponse])
def get_my_rentals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(RentalRecord)
        .filter(RentalRecord.farmer_id == current_user.id)
        .order_by(RentalRecord.created_at.desc())
        .all()
    )
    results = []
    for r in records:
        resp = RentalRecordResponse.model_validate(r)
        resp.farmer_name = current_user.name
        resp.farmer_phone = current_user.phone
        resp.equipment_name = r.listing.equipment_name if r.listing else "Machinery"
        resp.location = r.listing.location if r.listing else ""
        results.append(resp)
    return results


@router.get("/owner-requests", response_model=List[RentalRecordResponse])
def get_owner_rental_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(RentalRecord)
        .join(EquipmentListing, RentalRecord.listing_id == EquipmentListing.listing_id)
        .filter(EquipmentListing.owner_id == current_user.id)
        .order_by(RentalRecord.created_at.desc())
        .all()
    )
    results = []
    for r in records:
        resp = RentalRecordResponse.model_validate(r)
        resp.farmer_name = r.farmer.name if r.farmer else "Farmer"
        resp.farmer_phone = r.farmer.phone if r.farmer else ""
        resp.equipment_name = r.listing.equipment_name if r.listing else "Machinery"
        resp.location = r.listing.location if r.listing else ""
        results.append(resp)
    return results


@router.patch("/records/{rental_id}/status", response_model=RentalRecordResponse)
def update_rental_status(
    rental_id: int,
    payload: RentalRecordUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rental = db.query(RentalRecord).filter(RentalRecord.rental_id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental record not found.")

    listing = db.query(EquipmentListing).filter(EquipmentListing.listing_id == rental.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Associated equipment listing not found.")

    is_owner = listing.owner_id == current_user.id
    is_farmer = rental.farmer_id == current_user.id
    is_admin = current_user.role == UserRole.ADMIN

    new_status = payload.rental_status.lower()
    valid_statuses = {"pending", "approved", "active", "completed", "cancelled", "rejected"}
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid rental status: {new_status}")

    # Permission verification
    if new_status in ["approved", "rejected"]:
        if not is_owner and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the machinery owner can approve or reject rental requests.",
            )
        # When approving, verify stock has not been exhausted with row-level locking
        if new_status == "approved":
            db.query(EquipmentListing).filter(EquipmentListing.listing_id == rental.listing_id).with_for_update().first()
            avail = compute_available_quantity(
                db, rental.listing_id, rental.rental_start_date, rental.rental_end_date
            )
            if rental.quantity_rented > avail:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot approve: remaining available quantity ({avail}) is insufficient for requested quantity ({rental.quantity_rented}).",
                )
    elif new_status == "cancelled":
        if not is_farmer and not is_owner and not is_admin:
            raise HTTPException(status_code=403, detail="Unauthorized to cancel this rental.")

    rental.rental_status = new_status
    rental.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(rental)

    # If completed or cancelled, trigger queue processing for waiting farmers
    if new_status in ["completed", "cancelled", "rejected"]:
        process_queue_notifications(db, rental.listing_id)

    resp = RentalRecordResponse.model_validate(rental)
    resp.farmer_name = rental.farmer.name if rental.farmer else "Farmer"
    resp.farmer_phone = rental.farmer.phone if rental.farmer else ""
    resp.equipment_name = listing.equipment_name
    resp.location = listing.location
    return resp


# ====================================================================
# MODULE 4: RENTAL PAYMENTS
# ====================================================================

@router.post("/payments", response_model=RentalPaymentResponse, status_code=status.HTTP_201_CREATED)
def record_rental_payment(
    payload: RentalPaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rental = db.query(RentalRecord).filter(RentalRecord.rental_id == payload.rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental record not found.")

    listing = db.query(EquipmentListing).filter(EquipmentListing.listing_id == rental.listing_id).first()

    # Only farmer who rented it, or owner, or admin can record payment
    if (
        rental.farmer_id != current_user.id
        and (not listing or listing.owner_id != current_user.id)
        and current_user.role != UserRole.ADMIN
    ):
        raise HTTPException(status_code=403, detail="Unauthorized to record payment for this rental.")

    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than 0.")

    tx_ref = payload.transaction_reference or f"TXN-RENT-{payload.rental_id}-{int(datetime.utcnow().timestamp())}"

    new_payment = RentalPayment(
        rental_id=payload.rental_id,
        amount=payload.amount,
        payment_method=payload.payment_method.upper(),
        payment_status="successful",
        transaction_reference=tx_ref,
        payment_date=datetime.utcnow(),
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return RentalPaymentResponse.model_validate(new_payment)


@router.get("/records/{rental_id}/payments", response_model=List[RentalPaymentResponse])
def get_rental_payments(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rental = db.query(RentalRecord).filter(RentalRecord.rental_id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental record not found.")

    listing = db.query(EquipmentListing).filter(EquipmentListing.listing_id == rental.listing_id).first()

    # RLS & Privacy check: Only the farmer who rented or the machine owner can view payment records
    is_farmer = rental.farmer_id == current_user.id
    is_owner = listing and listing.owner_id == current_user.id
    is_admin = current_user.role == UserRole.ADMIN

    if not is_farmer and not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You cannot view payment records belonging to another farmer's rental.",
        )

    payments = (
        db.query(RentalPayment)
        .filter(RentalPayment.rental_id == rental_id)
        .order_by(RentalPayment.created_at.desc())
        .all()
    )
    return [RentalPaymentResponse.model_validate(p) for p in payments]


# ====================================================================
# MODULE 5: RENTAL QUEUE (WAITING LIST, PRIORITY, NOTIFICATIONS)
# ====================================================================

@router.post("/queue", response_model=RentalQueueResponse, status_code=status.HTTP_201_CREATED)
def join_rental_queue(
    payload: RentalQueueCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.requested_end_date < payload.requested_start_date:
        raise HTTPException(status_code=400, detail="Requested end date must be on or after start date.")

    if payload.requested_quantity <= 0:
        raise HTTPException(status_code=400, detail="Requested quantity must be greater than 0.")

    listing = db.query(EquipmentListing).filter(EquipmentListing.listing_id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Equipment listing not found.")

    # Prevent duplicate active queue entries
    existing_queue = (
        db.query(RentalQueue)
        .filter(
            RentalQueue.listing_id == payload.listing_id,
            RentalQueue.farmer_id == current_user.id,
            RentalQueue.queue_status == "waiting",
        )
        .first()
    )
    if existing_queue:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You are already in the waiting queue for this equipment at position #{existing_queue.queue_position}.",
        )

    # Next queue position
    current_max_pos = (
        db.query(func.coalesce(func.max(RentalQueue.queue_position), 0))
        .filter(
            RentalQueue.listing_id == payload.listing_id,
            RentalQueue.queue_status == "waiting",
        )
        .scalar()
    )

    new_queue = RentalQueue(
        listing_id=payload.listing_id,
        farmer_id=current_user.id,
        requested_quantity=payload.requested_quantity,
        requested_start_date=payload.requested_start_date,
        requested_end_date=payload.requested_end_date,
        queue_position=int(current_max_pos) + 1,
        queue_status="waiting",
    )
    db.add(new_queue)
    db.commit()
    db.refresh(new_queue)

    resp = RentalQueueResponse.model_validate(new_queue)
    resp.farmer_name = current_user.name
    resp.equipment_name = listing.equipment_name
    return resp


@router.get("/my-queue", response_model=List[RentalQueueResponse])
def get_my_queue_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entries = (
        db.query(RentalQueue)
        .filter(
            RentalQueue.farmer_id == current_user.id,
            RentalQueue.queue_status.in_(["waiting", "notified"]),
        )
        .order_by(RentalQueue.created_at.desc())
        .all()
    )
    results = []
    for e in entries:
        resp = RentalQueueResponse.model_validate(e)
        resp.farmer_name = current_user.name
        resp.equipment_name = e.listing.equipment_name if e.listing else "Machinery"
        results.append(resp)
    return results


@router.delete("/queue/{queue_id}")
def leave_rental_queue(
    queue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(RentalQueue).filter(RentalQueue.queue_id == queue_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Queue entry not found.")

    if entry.farmer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized to leave this queue.")

    listing_id = entry.listing_id
    removed_pos = entry.queue_position

    entry.queue_status = "cancelled"
    db.commit()

    # Safely update positions for remaining waiting entries
    remaining = (
        db.query(RentalQueue)
        .filter(
            RentalQueue.listing_id == listing_id,
            RentalQueue.queue_status == "waiting",
            RentalQueue.queue_position > removed_pos,
        )
        .all()
    )
    for rem in remaining:
        rem.queue_position -= 1
    db.commit()

    return {"status": "success", "message": "Successfully left the waiting queue."}


@router.get("/listings/{listing_id}/queue", response_model=List[RentalQueueResponse])
def get_listing_queue(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.query(EquipmentListing).filter(EquipmentListing.listing_id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Equipment listing not found.")

    if listing.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized to view queue for this machinery.")

    entries = (
        db.query(RentalQueue)
        .filter(
            RentalQueue.listing_id == listing_id,
            RentalQueue.queue_status == "waiting",
        )
        .order_by(RentalQueue.queue_position.asc())
        .all()
    )
    results = []
    for e in entries:
        resp = RentalQueueResponse.model_validate(e)
        resp.farmer_name = e.farmer.name if e.farmer else "Farmer"
        resp.equipment_name = listing.equipment_name
        results.append(resp)
    return results
