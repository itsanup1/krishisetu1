import sys

with open('backend/schemas.py', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update imports
old_import = 'from pydantic import BaseModel, EmailStr'
new_import = 'from pydantic import BaseModel, EmailStr, field_validator'
assert old_import in text, 'old_import not found'
text = text.replace(old_import, new_import, 1)

# 2. Add validators to UserBase and UserCreate, and add ForgotPasswordRequest, ResetPasswordRequest
old_user = '''class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: UserRole
    is_equipment_owner: bool = False
    location: str

class UserCreate(UserBase):
    password: str = "password123"'''

new_user = '''class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: UserRole
    is_equipment_owner: bool = False
    location: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters.')
        return v.strip()

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        digits = ''.join(c for c in v if c.isdigit())
        if len(digits) < 10:
            raise ValueError('Phone number must contain at least 10 digits.')
        return v.strip()

class UserCreate(UserBase):
    password: str = "password123"

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not v or len(v.strip()) < 6:
            raise ValueError('Password must be at least 6 characters.')
        return v.strip()'''

assert old_user in text, 'old_user not found'
text = text.replace(old_user, new_user, 1)

old_login = '''class LoginRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = None'''

new_login = '''class LoginRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str'''

assert old_login in text, 'old_login not found'
text = text.replace(old_login, new_login, 1)

# 3. Update RentalPaymentCreate to accept payment_status
old_pay = '''class RentalPaymentCreate(BaseModel):
    rental_id: int
    amount: float
    payment_method: str = "CASH"
    transaction_reference: Optional[str] = None'''

new_pay = '''class RentalPaymentCreate(BaseModel):
    rental_id: int
    amount: float
    payment_method: str = "CASH"
    payment_status: Optional[str] = "successful"
    transaction_reference: Optional[str] = None'''

assert old_pay in text, 'old_pay not found'
text = text.replace(old_pay, new_pay, 1)

# 4. Append NotificationResponse and Dashboard stats at the end
additions = '''

# 5. Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationMarkReadRequest(BaseModel):
    notification_ids: Optional[List[int]] = None

class FarmerDashboardStatsResponse(BaseModel):
    active_rentals_count: int
    completed_rentals_count: int
    waiting_queue_count: int
    notified_queue_count: int
    total_orders_count: int
    total_rental_spent: float
    total_marketplace_spent: float

class OwnerDashboardStatsResponse(BaseModel):
    total_listings_count: int
    pending_requests_count: int
    active_rentals_count: int
    completed_rentals_count: int
    total_rental_earnings: float
    waiting_queue_count: int
'''
text = text.rstrip() + additions

with open('backend/schemas.py', 'w', encoding='utf-8') as f:
    f.write(text)

print('SUCCESS: backend/schemas.py updated cleanly')
