from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.database import get_db
from backend.models import Equipment, EquipmentType, User, UserRole, BookingRequest, BookingStatus
from backend.schemas import EquipmentCreate, EquipmentUpdate, EquipmentResponse, BookingResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api/equipment", tags=["Farm Equipment"])

def format_equipment_response(eq: Equipment) -> EquipmentResponse:
    return EquipmentResponse(
        id=eq.id,
        rental_id=getattr(eq, "rental_id", None) or f"EQ-{eq.id:04d}",
        owner_id=eq.owner_id,
        owner_name=eq.owner.name if eq.owner else "Equipment Owner",
        owner_phone=eq.owner.phone if eq.owner else None,
        name=eq.name,
        type=eq.type,
        description=eq.description,
        specifications=eq.specifications,
        rate=eq.rate,
        rate_unit=eq.rate_unit,
        location=eq.location,
        stock_quantity=getattr(eq, "stock_quantity", 1) or 1,
        availability_status=getattr(eq, "availability_status", "AVAILABLE") or "AVAILABLE",
        image_url=eq.image_url,
        created_at=eq.created_at,
        updated_at=getattr(eq, "updated_at", None),
    )

@router.get("", response_model=List[EquipmentResponse])
def get_equipment(
    type: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Equipment).outerjoin(User, Equipment.owner_id == User.id)
    query = query.filter(Equipment.availability_status != "DEACTIVATED")
    if min_price is not None:
        query = query.filter(Equipment.rate >= min_price)
    if max_price is not None:
        query = query.filter(Equipment.rate <= max_price)
    if type and type != "ALL":
        query = query.filter(Equipment.type == type)
    if location:
        query = query.filter(Equipment.location.ilike(f"%{location.strip()}%"))
    if search:
        q = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Equipment.name.ilike(q),
                Equipment.description.ilike(q),
                Equipment.specifications.ilike(q),
                User.name.ilike(q),
            )
        )
    equipment_list = query.order_by(Equipment.created_at.desc()).all()
    results = []
    for eq in equipment_list:
        resp = EquipmentResponse.model_validate(eq)
        if eq.owner:
            resp.owner_name = eq.owner.name
            resp.owner_phone = eq.owner.phone
        results.append(resp)
    return results

@router.get("/my", response_model=List[EquipmentResponse])
def get_my_equipment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    equipment_list = db.query(Equipment).filter(Equipment.owner_id == current_user.id).all()
    return [EquipmentResponse.model_validate(eq) for eq in equipment_list]

@router.get("/{id}", response_model=EquipmentResponse)
def get_equipment_by_id(id: int, db: Session = Depends(get_db)):
    eq = db.query(Equipment).filter(Equipment.id == id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment machinery not found")
    resp = EquipmentResponse.model_validate(eq)
    if eq.owner:
        resp.owner_name = eq.owner.name
        resp.owner_phone = eq.owner.phone
    return resp

@router.get("/{id}/bookings", response_model=List[BookingResponse])
def get_equipment_bookings(id: int, db: Session = Depends(get_db)):
    eq = db.query(Equipment).filter(Equipment.id == id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment machinery not found")
    bookings = (
        db.query(BookingRequest)
        .filter(
            BookingRequest.equipment_id == id,
            BookingRequest.status.in_([BookingStatus.CONFIRMED, BookingStatus.CONFIRMATION_PENDING]),
        )
        .order_by(BookingRequest.start_date.asc())
        .all()
    )
    results = []
    for b in bookings:
        resp = BookingResponse.model_validate(b)
        resp.equipment_name = eq.name
        resp.equipment_location = eq.location
        resp.farmer_name = "Booked Farmer"
        resp.farmer_phone = None
        results.append(resp)
    return results

import re

def get_next_rental_id(db: Session) -> str:
    max_num = 0
    items = db.query(Equipment.rental_id).all()
    for (rid,) in items:
        if rid and rid.startswith("R"):
            digits = re.findall(r'\d+', rid)
            if digits:
                max_num = max(max_num, int(digits[0]))
    return f"R{max_num + 1:03d}"

@router.post("", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
def create_equipment(
    eq_in: EquipmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_equipment_owner and current_user.role != UserRole.ADMIN:
        current_user.is_equipment_owner = True
        db.add(current_user)

    rid = eq_in.rental_id or eq_in.product_id or get_next_rental_id(db)
    equipment = Equipment(
        rental_id=rid,
        product_id=rid,
        owner_id=current_user.id,
        name=eq_in.name,
        type=eq_in.type,
        description=eq_in.description,
        specifications=eq_in.specifications,
        rate=eq_in.rate,
        rate_unit=eq_in.rate_unit,
        location=eq_in.location,
        stock_quantity=eq_in.stock_quantity or 1,
        availability_status=eq_in.availability_status or "AVAILABLE",
        image_url=eq_in.image_url,
    )
    db.add(equipment)
    db.commit()
    db.refresh(equipment)

    resp = EquipmentResponse.model_validate(equipment)
    resp.owner_name = current_user.name
    resp.owner_phone = current_user.phone
    return resp

@router.put("/{id}", response_model=EquipmentResponse)
def update_equipment(
    id: int,
    eq_update: EquipmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    eq = db.query(Equipment).filter(Equipment.id == id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if eq.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to modify this equipment")

    update_data = eq_update.model_dump(exclude_unset=True) if hasattr(eq_update, "model_dump") else eq_update.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(eq, field, val)

    db.commit()
    db.refresh(eq)
    resp = EquipmentResponse.model_validate(eq)
    resp.owner_name = current_user.name
    return resp

@router.delete("/{id}")
def delete_equipment(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    eq = db.query(Equipment).filter(Equipment.id == id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if eq.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this equipment")

    # Safe deactivation policy
    eq.availability_status = "DEACTIVATED"
    db.commit()
    return {"status": "success", "message": "Equipment listing successfully deactivated."}

