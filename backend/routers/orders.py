import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Order, OrderItem, CartItem, Product, User, UserRole, OrderStatus
from backend.schemas import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderUpdateStatus,
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
)
from backend.auth import get_current_user, require_roles
from backend.routers.products import format_product_response

router = APIRouter(prefix="/api", tags=["Cart & Orders"])

def format_cart_item(item: CartItem) -> CartItemResponse:
    return CartItemResponse(
        id=item.id,
        farmer_id=item.farmer_id,
        product_id=item.product_id,
        quantity=item.quantity,
        product=format_product_response(item.product),
        created_at=item.created_at,
    )

def format_order_response(o: Order) -> OrderResponse:
    items_resp = []
    for oi in o.items:
        items_resp.append(
            OrderItemResponse(
                id=oi.id,
                order_id=oi.order_id,
                product_id=oi.product_id,
                quantity=oi.quantity,
                price_at_purchase=oi.price_at_purchase,
                product=format_product_response(oi.product) if oi.product else None,
            )
        )
    return OrderResponse(
        id=o.id,
        farmer_id=o.farmer_id,
        farmer_name=o.farmer.name if o.farmer else "Farmer",
        total_amount=o.total_amount,
        status=o.status,
        delivery_address=o.delivery_address or "Registered Farm Address",
        razorpay_order_id=o.razorpay_order_id,
        razorpay_payment_id=o.razorpay_payment_id,
        items=items_resp,
        created_at=o.created_at,
        updated_at=getattr(o, "updated_at", None),
    )

# Cart Endpoints
@router.get("/cart", response_model=List[CartItemResponse])
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(CartItem).filter(CartItem.farmer_id == current_user.id).all()
    return [format_cart_item(i) for i in items if i.product]

@router.post("/cart", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < item_in.quantity:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds available stock")

    existing_item = (
        db.query(CartItem)
        .filter(CartItem.farmer_id == current_user.id, CartItem.product_id == item_in.product_id)
        .first()
    )
    if existing_item:
        existing_item.quantity = min(product.stock, existing_item.quantity + item_in.quantity)
        db.commit()
        db.refresh(existing_item)
        return format_cart_item(existing_item)

    new_item = CartItem(
        farmer_id=current_user.id,
        product_id=item_in.product_id,
        quantity=item_in.quantity,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return format_cart_item(new_item)

@router.put("/cart/{id}", response_model=CartItemResponse)
def update_cart_item(
    id: int,
    item_update: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(CartItem)
        .filter(
            CartItem.farmer_id == current_user.id,
            (CartItem.id == id) | (CartItem.product_id == id),
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if item_update.quantity <= 0:
        db.delete(item)
        db.commit()
        raise HTTPException(status_code=204, detail="Item removed")

    if item.product and item_update.quantity > item.product.stock:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds available stock")

    item.quantity = item_update.quantity
    db.commit()
    db.refresh(item)
    return format_cart_item(item)

@router.delete("/cart", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(CartItem).filter(CartItem.farmer_id == current_user.id).delete()
    db.commit()
    return None

@router.delete("/cart/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cart_item(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(CartItem).filter(CartItem.id == id, CartItem.farmer_id == current_user.id).first()
    if item:
        db.delete(item)
        db.commit()
    return None

# Order Endpoints
@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart_items = db.query(CartItem).filter(CartItem.farmer_id == current_user.id).all()
    if not cart_items and not order_in.items:
        raise HTTPException(status_code=400, detail="Cannot checkout with empty cart.")

    # Create Order
    db_order = Order(
        farmer_id=current_user.id,
        total_amount=total_amount,
        status=OrderStatus.PLACED,
        delivery_address=order_in.delivery_address or current_user.location or "Registered Farm Address",
        razorpay_order_id=rzp_order_id,
        razorpay_payment_id=order_in.razorpay_payment_id,
    )
    db.add(db_order)
    db.flush()

    # Deduct stock and create OrderItems
    for product, qty, price in order_items:
        product.stock -= qty
        product.availability_status = (
            "OUT_OF_STOCK" if product.stock <= 0 else "LOW_STOCK" if product.stock <= 15 else "IN_STOCK"
        )
        db.add(product)
        oi = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=qty,
            price_at_purchase=price,
        )
        db.add(oi)

    # Empty user's cart in database
    for item in cart_items:
        db.delete(item)

    db.commit()
    db.refresh(db_order)

    resp = OrderResponse.model_validate(db_order)
    resp.farmer_name = current_user.name
    return resp

@router.get("/orders/my", response_model=List[OrderResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == UserRole.ADMIN:
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
    elif current_user.role == UserRole.VENDOR:
        orders = (
            db.query(Order)
            .join(OrderItem, Order.id == OrderItem.order_id)
            .join(Product, OrderItem.product_id == Product.id)
            .filter(Product.vendor_id == current_user.id)
            .distinct()
            .order_by(Order.created_at.desc())
            .all()
        )
    else:
        orders = (
            db.query(Order)
            .filter(Order.farmer_id == current_user.id)
            .order_by(Order.created_at.desc())
            .all()
        )

    results = []
    for o in orders:
        resp = OrderResponse.model_validate(o)
        if o.farmer:
            resp.farmer_name = o.farmer.name
        results.append(resp)
    return results

@router.get("/orders/{id}", response_model=OrderResponse)
def get_order_by_id(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    resp = OrderResponse.model_validate(order)
    if order.farmer:
        resp.farmer_name = order.farmer.name
    return resp

@router.put("/orders/{id}/status", response_model=OrderResponse)
def update_order_status(
    id: int,
    status_update: OrderUpdateStatus,
    current_user: User = Depends(require_roles([UserRole.VENDOR, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    resp = OrderResponse.model_validate(order)
    if order.farmer:
        resp.farmer_name = order.farmer.name
    return resp
