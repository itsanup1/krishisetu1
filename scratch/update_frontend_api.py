with open('frontend/src/services/api.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update imports
old_import = '''  RentalQueueEntry,
  AvailabilityCheck,
} from '../types';'''

new_import = '''  RentalQueueEntry,
  AvailabilityCheck,
  Notification,
  FarmerDashboardStats,
  OwnerDashboardStats,
} from '../types';'''
assert old_import in text, "old_import not found"
text = text.replace(old_import, new_import, 1)

# 2. Add auth methods after register
old_auth = '''  async register(data: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: 'FARMER' | 'VENDOR' | 'ADMIN';
    is_equipment_owner?: boolean;
    location: string;
  }) {
    try {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    } catch {
      return mockBackend.register(data);
    }
  },'''

new_auth = '''  async register(data: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: 'FARMER' | 'VENDOR' | 'ADMIN';
    is_equipment_owner?: boolean;
    location: string;
  }) {
    try {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    } catch {
      return mockBackend.register(data);
    }
  },

  async forgotPassword(email: string): Promise<{ status: string; message: string; reset_token?: string }> {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token: string, new_password: string): Promise<{ status: string; message: string }> {
    const res = await apiClient.post('/auth/reset-password', { token, new_password });
    return res.data;
  },'''
assert old_auth in text, "old_auth not found"
text = text.replace(old_auth, new_auth, 1)

# 3. Update getEquipment signature to include maxPrice
old_get_eq = '''  async getEquipment(type?: string, location?: string, search?: string): Promise<Equipment[]> {
    try {
      const params: any = {};
      if (type && type !== 'ALL') params.type = type;
      if (location) params.location = location;
      if (search) params.search = search;
      const res = await apiClient.get('/equipment', { params });
      return res.data;
    } catch {
      return mockBackend.getEquipment(type, location, search);
    }
  },'''

new_get_eq = '''  async getEquipment(type?: string, location?: string, search?: string, maxPrice?: number): Promise<Equipment[]> {
    try {
      const params: any = {};
      if (type && type !== 'ALL') params.type = type;
      if (location) params.location = location;
      if (search) params.search = search;
      if (maxPrice !== undefined && maxPrice !== null) params.max_price = maxPrice;
      const res = await apiClient.get('/equipment', { params });
      return res.data;
    } catch {
      let result = mockBackend.getEquipment(type, location, search);
      if (maxPrice !== undefined && maxPrice !== null) {
        result = result.filter((e) => e.rate <= maxPrice);
      }
      return result;
    }
  },'''
assert old_get_eq in text, "old_get_eq not found"
text = text.replace(old_get_eq, new_get_eq, 1)

# 4. Update createRentalPayment
old_crp = '''  async createRentalPayment(data: {
    rental_id: number;
    amount: number;
    payment_method?: string;
    transaction_reference?: string;
  }): Promise<RentalPayment> {
    const res = await apiClient.post('/rentals/payments', data);
    return res.data;
  },'''

new_crp = '''  async createRentalPayment(data: {
    rental_id: number;
    amount: number;
    payment_method?: string;
    payment_status?: string;
    transaction_reference?: string;
  }): Promise<RentalPayment> {
    const res = await apiClient.post('/rentals/payments', data);
    return res.data;
  },'''
assert old_crp in text, "old_crp not found"
text = text.replace(old_crp, new_crp, 1)

# 5. Add notifications and dashboard methods before the end of api object
old_end = '''  async getListingQueue(listingId: number): Promise<RentalQueueEntry[]> {
    const res = await apiClient.get(`/rentals/listings/${listingId}/queue`);
    return res.data;
  },
};'''

new_end = '''  async getListingQueue(listingId: number): Promise<RentalQueueEntry[]> {
    const res = await apiClient.get(`/rentals/listings/${listingId}/queue`);
    return res.data;
  },

  // In-App Notifications
  async getNotifications(limit: number = 50): Promise<Notification[]> {
    const res = await apiClient.get('/notifications', { params: { limit } });
    return res.data;
  },

  async getUnreadNotificationCount(): Promise<{ unread_count: number }> {
    const res = await apiClient.get('/notifications/unread-count');
    return res.data;
  },

  async markNotificationRead(id: number): Promise<Notification> {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllNotificationsRead(): Promise<{ status: string; message: string }> {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  },

  // Actual Database Dashboard Statistics
  async getFarmerDashboardStats(): Promise<FarmerDashboardStats> {
    const res = await apiClient.get('/rentals/dashboard/farmer');
    return res.data;
  },

  async getOwnerDashboardStats(): Promise<OwnerDashboardStats> {
    const res = await apiClient.get('/rentals/dashboard/owner');
    return res.data;
  },
};'''
assert old_end in text, "old_end not found"
text = text.replace(old_end, new_end, 1)

with open('frontend/src/services/api.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: frontend/src/services/api.ts updated cleanly")
