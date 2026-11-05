with open('frontend/src/types.ts', 'r', encoding='utf-8') as f:
    text = f.read()

types_to_add = '''
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface FarmerDashboardStats {
  active_rentals_count: number;
  completed_rentals_count: number;
  waiting_queue_count: number;
  notified_queue_count: number;
  total_orders_count: number;
  total_rental_spent: number;
  total_marketplace_spent: number;
}

export interface OwnerDashboardStats {
  total_listings_count: number;
  pending_requests_count: number;
  active_rentals_count: number;
  completed_rentals_count: number;
  total_rental_earnings: number;
  waiting_queue_count: number;
}
'''

if 'export interface Notification' not in text:
    text = text.rstrip() + '\n' + types_to_add

with open('frontend/src/types.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: frontend/src/types.ts updated")

