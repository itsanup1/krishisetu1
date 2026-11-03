from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import User, Product, Equipment, Order, BookingRequest, UserRole, OrderStatus
from backend.schemas import UserResponse, OrderResponse, BookingResponse, AdminStatsResponse
from backend.auth import require_roles
from backend.routers.bookings import format_booking_response
from backend.routers.orders import format_order_response

router = APIRouter(prefix="/api/admin", tags=["Admin Governance"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_farmers = db.query(User).filter(User.role == UserRole.FARMER).count()
    total_vendors = db.query(User).filter(User.role == UserRole.VENDOR).count()
    total_equipment_owners = db.query(User).filter(User.is_equipment_owner == True).count()
    total_equipment = db.query(Equipment).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_bookings = db.query(BookingRequest).count()

    revenue_query = db.query(func.sum(Order.total_amount)).filter(Order.status != OrderStatus.CANCELLED).scalar()
    total_revenue = float(revenue_query or 0.0)

    return {
        "total_users": total_users,
        "total_farmers": total_farmers,
        "total_vendors": total_vendors,
        "total_equipment_owners": total_equipment_owners,
        "total_equipment": total_equipment,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]

@router.get("/orders", response_model=List[OrderResponse])
def get_all_orders(
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    results = []
    for o in orders:
        resp = OrderResponse.model_validate(o)
        if o.farmer:
            resp.farmer_name = o.farmer.name
        results.append(resp)
    return results

@router.get("/bookings", response_model=List[BookingResponse])
def get_all_bookings(
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    bookings = db.query(BookingRequest).order_by(BookingRequest.created_at.desc()).all()
    return [format_booking_response(b) for b in bookings]

