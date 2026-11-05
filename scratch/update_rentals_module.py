import re

with open('backend/routers/rentals.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
old_models = '''from backend.models import (
    User,
    UserRole,
    EquipmentListing,
    RentalRecord,
    RentalPayment,
    RentalQueue,
    Equipment,
)'''

new_models = '''from backend.models import (
    User,
    UserRole,
    EquipmentListing,
    RentalRecord,
    RentalPayment,
    RentalQueue,
    Equipment,
    Notification,
    Order,
)'''
assert old_models in code, "old_models not found"
code = code.replace(old_models, new_models, 1)

old_schemas = '''    RentalQueueResponse,
    AvailabilityCheckResponse,
)'''
new_schemas = '''    RentalQueueResponse,
    AvailabilityCheckResponse,
    FarmerDashboardStatsResponse,
    OwnerDashboardStatsResponse,
)'''
assert old_schemas in code, "old_schemas not found"
code = code.replace(old_schemas, new_schemas, 1)

# 2. Add create_notification helper
helper_code = '''
def create_notification(db: Session, user_id: int, title: str, message: str, type: str, link: Optional[str] = None):
    try:
        notif = Notification(user_id=user_id, title=title, message=message, type=type, link=link)
        db.add(notif)
    except Exception as e:
        logger.warning(f"Failed to create notification: {e}")
'''
if "def create_notification(" not in code:
    code = code.replace("logger = logging.getLogger(__name__)", "logger = logging.getLogger(__name__)" + helper_code, 1)

# 3. Update process_queue_notifications to notify farmer
old_pq = '''        if avail >= entry.requested_quantity:
            entry.queue_status = "notified"
            db.commit()
            logger.info(
                f"[Queue] Farmer {entry.farmer_id} notified for listing {listing_id}."
            )
            break'''

new_pq = '''        if avail >= entry.requested_quantity:
            entry.queue_status = "notified"
            listing = db.query(EquipmentListing).filter(EquipmentListing.listing_id == listing_id).first()
            eq_name = listing.equipment_name if listing else "Machinery"
            create_notification(
                db,
                user_id=entry.farmer_id,
                title="Machinery Available! (Queue Alert)",
                message=f"A unit of {eq_name} is now available for your requested dates ({entry.requested_start_date} to {entry.requested_end_date}). Claim your reservation now!",
                type="QUEUE_NOTIFIED",
                link="/bookings",
            )
            db.commit()
            logger.info(
                f"[Queue] Farmer {entry.farmer_id} notified for listing {listing_id}."
            )
            break'''
assert old_pq in code, "old_pq not found"
code = code.replace(old_pq, new_pq, 1)

# 4. Update get_equipment_listings to support min_price and max_price
old_listings_sig = '''@router.get("/listings", response_model=List[EquipmentListingResponse])
def get_equipment_listings(
    category: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(EquipmentListing).filter(EquipmentListing.listing_status == "active")'''

new_listings_sig = '''@router.get("/listings", response_model=List[EquipmentListingResponse])
def get_equipment_listings(
    category: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(EquipmentListing).filter(EquipmentListing.listing_status == "active")

    if min_price is not None:
        query = query.filter(EquipmentListing.price_per_day >= min_price)
    if max_price is not None:
        query = query.filter(EquipmentListing.price_per_day <= max_price)'''
assert old_listings_sig in code, "old_listings_sig not found"
code = code.replace(old_listings_sig, new_listings_sig, 1)

# 5. Update request_rental to notify owner
old_req_rental = '''    db.add(new_rental)
    db.commit()
    db.refresh(new_rental)

    resp = RentalRecordResponse.model_validate(new_rental)'''

new_req_rental = '''    db.add(new_rental)
    create_notification(
        db,
        user_id=listing.owner_id,
        title="New Rental Request",
        message=f"Farmer {current_user.name} submitted a rental request for {payload.quantity_rented} unit(s) of {listing.equipment_name} ({payload.rental_start_date} to {payload.rental_end_date}).",
        type="RENTAL_REQUEST",
        link="/owner/bookings",
    )
    db.commit()
    db.refresh(new_rental)

    resp = RentalRecordResponse.model_validate(new_rental)'''
assert old_req_rental in code, "old_req_rental not found"
code = code.replace(old_req_rental, new_req_rental, 1)

# 6. Update update_rental_status to notify parties
old_update_status = '''    rental.rental_status = new_status
    rental.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(rental)

    # If completed or cancelled, trigger queue processing for waiting farmers
    if new_status in ["completed", "cancelled", "rejected"]:
        process_queue_notifications(db, rental.listing_id)'''

new_update_status = '''    rental.rental_status = new_status
    rental.updated_at = datetime.utcnow()

    # Issue status notifications
    if new_status == "approved":
        create_notification(
            db,
            user_id=rental.farmer_id,
            title="Rental Request Approved!",
            message=f"Your request for {listing.equipment_name} was approved by {current_user.name}.",
            type="RENTAL_APPROVED",
            link="/bookings",
        )
    elif new_status == "rejected":
        create_notification(
            db,
            user_id=rental.farmer_id,
            title="Rental Request Declined",
            message=f"Your request for {listing.equipment_name} was declined by the machinery owner.",
            type="RENTAL_REJECTED",
            link="/bookings",
        )
    elif new_status == "cancelled":
        if current_user.id == rental.farmer_id:
            create_notification(
                db,
                user_id=listing.owner_id,
                title="Rental Cancelled by Farmer",
                message=f"Rental #{rental.rental_id} for {listing.equipment_name} was cancelled by {current_user.name}.",
                type="RENTAL_CANCELLED",
                link="/owner/bookings",
            )
        else:
            create_notification(
                db,
                user_id=rental.farmer_id,
                title="Rental Cancelled by Owner",
                message=f"Rental #{rental.rental_id} for {listing.equipment_name} was cancelled.",
                type="RENTAL_CANCELLED",
                link="/bookings",
            )
    elif new_status == "completed":
        create_notification(
            db,
            user_id=rental.farmer_id,
            title="Rental Completed",
            message=f"Rental #{rental.rental_id} for {listing.equipment_name} marked as completed. Thank you for using Krishisetu!",
            type="RENTAL_COMPLETED",
            link="/bookings",
        )

    db.commit()
    db.refresh(rental)

    # If completed or cancelled, trigger queue processing for waiting farmers
    if new_status in ["completed", "cancelled", "rejected"]:
        process_queue_notifications(db, rental.listing_id)'''
assert old_update_status in code, "old_update_status not found"
code = code.replace(old_update_status, new_update_status, 1)

# 7. Update record_rental_payment to validate status, prevent duplicates, and notify
old_pay_func = '''@router.post("/payments", response_model=RentalPaymentResponse, status_code=status.HTTP_201_CREATED)
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

    return RentalPaymentResponse.model_validate(new_payment)'''

new_pay_func = '''@router.post("/payments", response_model=RentalPaymentResponse, status_code=status.HTTP_201_CREATED)
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

    if float(payload.amount) > float(rental.total_amount):
        raise HTTPException(
            status_code=400,
            detail=f"Payment amount ({payload.amount}) exceeds total rental amount ({rental.total_amount}).",
        )

    status_val = (payload.payment_status or "successful").lower()
    if status_val not in {"successful", "failed", "pending"}:
        raise HTTPException(status_code=400, detail="Payment status must be 'successful', 'failed', or 'pending'.")

    tx_ref = payload.transaction_reference or f"TXN-RENT-{payload.rental_id}-{int(datetime.utcnow().timestamp())}"

    # Duplicate transaction reference prevention
    existing_txn = db.query(RentalPayment).filter(RentalPayment.transaction_reference == tx_ref).first()
    if existing_txn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Duplicate transaction reference '{tx_ref}'. A payment with this reference already exists.",
        )

    new_payment = RentalPayment(
        rental_id=payload.rental_id,
        amount=payload.amount,
        payment_method=payload.payment_method.upper(),
        payment_status=status_val,
        transaction_reference=tx_ref,
        payment_date=datetime.utcnow(),
    )
    db.add(new_payment)

    # Notifications
    if status_val == "successful":
        create_notification(
            db,
            user_id=rental.farmer_id,
            title="Rent Payment Confirmed",
            message=f"Your payment of ₹{payload.amount} for {listing.equipment_name if listing else 'equipment'} was recorded.",
            type="PAYMENT_RECEIVED",
            link="/bookings",
        )
        if listing:
            create_notification(
                db,
                user_id=listing.owner_id,
                title="Rent Payment Received",
                message=f"Received payment of ₹{payload.amount} from {rental.farmer.name if rental.farmer else 'Farmer'} for rental #{rental.rental_id}.",
                type="PAYMENT_RECEIVED",
                link="/owner/bookings",
            )
    elif status_val == "failed":
        create_notification(
            db,
            user_id=rental.farmer_id,
            title="Payment Failed",
            message=f"Payment attempt of ₹{payload.amount} for rental #{rental.rental_id} failed.",
            type="PAYMENT_FAILED",
            link="/bookings",
        )

    db.commit()
    db.refresh(new_payment)

    return RentalPaymentResponse.model_validate(new_payment)'''
assert old_pay_func in code, "old_pay_func not found"
code = code.replace(old_pay_func, new_pay_func, 1)

# 8. Add Dashboard Stats endpoints at the end of rentals.py
dashboard_endpoints = '''

# ====================================================================
# MODULE 6: DASHBOARD AGGREGATE METRICS FROM SUPABASE
# ====================================================================

@router.get("/dashboard/farmer", response_model=FarmerDashboardStatsResponse)
def get_farmer_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    active_rentals = db.query(RentalRecord).filter(
        RentalRecord.farmer_id == current_user.id,
        RentalRecord.rental_status.in_(["pending", "approved", "active"])
    ).count()

    completed_rentals = db.query(RentalRecord).filter(
        RentalRecord.farmer_id == current_user.id,
        RentalRecord.rental_status == "completed"
    ).count()

    waiting_queue = db.query(RentalQueue).filter(
        RentalQueue.farmer_id == current_user.id,
        RentalQueue.queue_status == "waiting"
    ).count()

    notified_queue = db.query(RentalQueue).filter(
        RentalQueue.farmer_id == current_user.id,
        RentalQueue.queue_status == "notified"
    ).count()

    total_orders = db.query(Order).filter(
        Order.farmer_id == current_user.id
    ).count()

    rental_spent = db.query(func.coalesce(func.sum(RentalPayment.amount), 0)).join(
        RentalRecord, RentalPayment.rental_id == RentalRecord.rental_id
    ).filter(
        RentalRecord.farmer_id == current_user.id,
        RentalPayment.payment_status == "successful"
    ).scalar()

    mkt_spent = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
        Order.farmer_id == current_user.id
    ).scalar()

    return FarmerDashboardStatsResponse(
        active_rentals_count=active_rentals,
        completed_rentals_count=completed_rentals,
        waiting_queue_count=waiting_queue,
        notified_queue_count=notified_queue,
        total_orders_count=total_orders,
        total_rental_spent=float(rental_spent or 0.0),
        total_marketplace_spent=float(mkt_spent or 0.0),
    )


@router.get("/dashboard/owner", response_model=OwnerDashboardStatsResponse)
def get_owner_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_listings = db.query(EquipmentListing).filter(
        EquipmentListing.owner_id == current_user.id,
        EquipmentListing.listing_status != "deactivated"
    ).count()

    pending_requests = db.query(RentalRecord).join(
        EquipmentListing, RentalRecord.listing_id == EquipmentListing.listing_id
    ).filter(
        EquipmentListing.owner_id == current_user.id,
        RentalRecord.rental_status == "pending"
    ).count()

    active_rentals = db.query(RentalRecord).join(
        EquipmentListing, RentalRecord.listing_id == EquipmentListing.listing_id
    ).filter(
        EquipmentListing.owner_id == current_user.id,
        RentalRecord.rental_status.in_(["approved", "active"])
    ).count()

    completed_rentals = db.query(RentalRecord).join(
        EquipmentListing, RentalRecord.listing_id == EquipmentListing.listing_id
    ).filter(
        EquipmentListing.owner_id == current_user.id,
        RentalRecord.rental_status == "completed"
    ).count()

    earnings = db.query(func.coalesce(func.sum(RentalPayment.amount), 0)).join(
        RentalRecord, RentalPayment.rental_id == RentalRecord.rental_id
    ).join(
        EquipmentListing, RentalRecord.listing_id == EquipmentListing.listing_id
    ).filter(
        EquipmentListing.owner_id == current_user.id,
        RentalPayment.payment_status == "successful"
    ).scalar()

    waiting_queue = db.query(RentalQueue).join(
        EquipmentListing, RentalQueue.listing_id == EquipmentListing.listing_id
    ).filter(
        EquipmentListing.owner_id == current_user.id,
        RentalQueue.queue_status == "waiting"
    ).count()

    return OwnerDashboardStatsResponse(
        total_listings_count=total_listings,
        pending_requests_count=pending_requests,
        active_rentals_count=active_rentals,
        completed_rentals_count=completed_rentals,
        total_rental_earnings=float(earnings or 0.0),
        waiting_queue_count=waiting_queue,
    )
'''

code = code.rstrip() + dashboard_endpoints

with open('backend/routers/rentals.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: backend/routers/rentals.py updated cleanly")
