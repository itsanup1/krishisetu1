// User Roles
export type UserRole = 'FARMER' | 'VENDOR' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  is_equipment_owner: boolean;
  location: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Product Categories
export type ProductCategory = 'SEEDS' | 'FERTILIZER' | 'PESTICIDE' | 'IRRIGATION' | 'SPRAYER';

export interface Product {
  id: number;
  vendor_id: number;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  vendor_name?: string;
  availability_status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  created_at: string;
  updated_at?: string;
}

// Cart Item
export interface CartItem {
  id: number;
  farmer_id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

// Order Statuses
export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
}

export interface Order {
  id: number;
  farmer_id: number;
  farmer_name?: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
}

// Equipment Types & Rate Units
export type EquipmentType = 
  | 'TRACTOR' 
  | 'ROTAVATOR' 
  | 'HARVESTER' 
  | 'CULTIVATOR' 
  | 'SEED_DRILL' 
  | 'SPRAYER'
  | 'PLOUGH_LEVELER';

export type RateUnit = 'HOUR' | 'DAY';

export interface Equipment {
  id: number;
  owner_id: number;
  owner_name?: string;
  owner_phone?: string;
  type: EquipmentType;
  name: string;
  description: string;
  specifications: string;
  rate: number;
  rate_unit: RateUnit;
  location: string;
  image_url: string;
  stock_quantity?: number;
  availability_status?: 'AVAILABLE' | 'HIGH_DEMAND' | 'MAINTENANCE';
  created_at: string;
  updated_at?: string;
}

export interface AvailabilitySlot {
  id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  is_booked: boolean;
}

// Booking Statuses
export type BookingStatus = 
  | 'QUEUED' 
  | 'CONFIRMATION_PENDING' 
  | 'CONFIRMED' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'EXPIRED' 
  | 'CANCELLED';

export interface BookingRequest {
  id: number;
  equipment_id: number;
  equipment_name?: string;
  equipment_type?: EquipmentType;
  equipment_rate?: number;
  equipment_rate_unit?: RateUnit;
  equipment_location?: string;
  farmer_id: number;
  farmer_name?: string;
  farmer_phone?: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  queue_position: number;
  confirmation_deadline?: string;
  created_at: string;
  updated_at?: string;
}

// Payment
export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface Payment {
  id: number;
  user_id: number;
  order_id?: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
}

// Admin Stats
export interface AdminStats {
  total_users: number;
  total_farmers: number;
  total_vendors: number;
  total_equipment_owners: number;
  total_products: number;
  total_equipment: number;
  total_orders: number;
  total_bookings: number;
  total_revenue: number;
}
