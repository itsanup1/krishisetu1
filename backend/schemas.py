from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from backend.models import UserRole, ProductCategory, EquipmentType, RateUnit, BookingStatus, OrderStatus

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: UserRole
    is_equipment_owner: bool = False
    location: str

class UserCreate(UserBase):
    password: str = "password123"

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    is_equipment_owner: Optional[bool] = None
    password: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = None

# Product Schemas
class ProductBase(BaseModel):
    name: str
    category: ProductCategory
    description: str
    price: float
    stock: int
    availability_status: Optional[str] = "IN_STOCK"
    image_url: str

class ProductCreate(ProductBase):
    product_id: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[ProductCategory] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    availability_status: Optional[str] = None
    image_url: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    product_id: str
    vendor_id: int
    vendor_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Cart Schemas
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    farmer_id: Optional[int] = None
    product_id: int
    quantity: int
    product: ProductResponse
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: Optional[float] = None

class OrderItemResponse(BaseModel):
    id: int
    order_id: Optional[int] = None
    product_id: int
    quantity: int
    price_at_purchase: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    delivery_address: Optional[str] = "Registered Farm Address"
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    items: Optional[List[OrderItemCreate]] = None

class OrderUpdateStatus(BaseModel):
    status: OrderStatus

class OrderResponse(BaseModel):
    id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    total_amount: float
    status: OrderStatus
    delivery_address: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Equipment Schemas
class EquipmentBase(BaseModel):
    name: str
    type: EquipmentType
    description: str
    specifications: str
    rate: float
    rate_unit: RateUnit
    location: str
    stock_quantity: Optional[int] = 1
    availability_status: Optional[str] = "AVAILABLE"
    image_url: str

class EquipmentCreate(EquipmentBase):
    rental_id: Optional[str] = None
    product_id: Optional[str] = None

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[EquipmentType] = None
    description: Optional[str] = None
    specifications: Optional[str] = None
    rate: Optional[float] = None
    rate_unit: Optional[RateUnit] = None
    location: Optional[str] = None
    stock_quantity: Optional[int] = None
    availability_status: Optional[str] = None
    image_url: Optional[str] = None

class EquipmentResponse(EquipmentBase):
    id: int
    rental_id: str
    product_id: Optional[str] = None
    owner_id: int
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Booking Schemas
class BookingCreate(BaseModel):
    equipment_id: int
    start_date: datetime
    end_date: datetime

class BookingResponse(BaseModel):
    id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    equipment_id: int
    equipment_name: Optional[str] = None
    equipment_type: Optional[EquipmentType] = None
    equipment_rate: Optional[float] = None
    equipment_rate_unit: Optional[RateUnit] = None
    equipment_location: Optional[str] = None
    start_date: datetime
    end_date: datetime
    status: BookingStatus
    queue_position: Optional[int] = None
    confirmation_deadline: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Payment Verification Schema
class PaymentVerifyRequest(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class AdminStatsResponse(BaseModel):
    total_users: int
    total_farmers: int
    total_vendors: int
    total_equipment_owners: int
    total_equipment: int
    total_products: int
    total_orders: int
    total_bookings: int
    total_revenue: float


# ====================================================================
# SEMESTER PROJECT: 4-TABLE RENTAL MODULE SCHEMAS
# ====================================================================

# 1. Equipment Listings Schemas
class EquipmentListingBase(BaseModel):
    equipment_name: str
    category: str
    description: Optional[str] = None
    specifications: Optional[str] = None
    price_per_day: float
    total_quantity: int
    location: Optional[str] = None
    listing_status: Optional[str] = "active"
    image_url: Optional[str] = None
    rental_id: Optional[str] = None

class EquipmentListingCreate(EquipmentListingBase):
    pass

class EquipmentListingUpdate(BaseModel):
    equipment_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    specifications: Optional[str] = None
    price_per_day: Optional[float] = None
    total_quantity: Optional[int] = None
    location: Optional[str] = None
    listing_status: Optional[str] = None
    image_url: Optional[str] = None
    rental_id: Optional[str] = None

class EquipmentListingResponse(EquipmentListingBase):
    listing_id: int
    owner_id: int
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None
    available_quantity: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 2. Rental Records Schemas
class RentalRecordCreate(BaseModel):
    listing_id: int
    quantity_rented: int = 1
    rental_start_date: date
    rental_end_date: date

class RentalRecordUpdateStatus(BaseModel):
    rental_status: str  # approved, rejected, active, completed, cancelled

class RentalRecordResponse(BaseModel):
    rental_id: int
    listing_id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    equipment_name: Optional[str] = None
    location: Optional[str] = None
    quantity_rented: int
    rental_start_date: date
    rental_end_date: date
    rental_status: str
    total_amount: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 3. Rental Payments Schemas
class RentalPaymentCreate(BaseModel):
    rental_id: int
    amount: float
    payment_method: str = "CASH"
    transaction_reference: Optional[str] = None

class RentalPaymentResponse(BaseModel):
    payment_id: int
    rental_id: int
    amount: float
    payment_method: str
    payment_status: str
    transaction_reference: Optional[str] = None
    payment_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# 4. Rental Queue Schemas
class RentalQueueCreate(BaseModel):
    listing_id: int
    requested_quantity: int = 1
    requested_start_date: date
    requested_end_date: date

class RentalQueueResponse(BaseModel):
    queue_id: int
    listing_id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    equipment_name: Optional[str] = None
    requested_quantity: int
    requested_start_date: date
    requested_end_date: date
    queue_position: int
    queue_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AvailabilityCheckResponse(BaseModel):
    listing_id: int
    total_quantity: int
    booked_quantity: int
    available_quantity: int
    start_date: date
    end_date: date


