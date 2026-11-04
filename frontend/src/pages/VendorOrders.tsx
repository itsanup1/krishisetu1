import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { OrderCard } from '../components/common/OrderCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyOrders();
      setOrders(data || []);
    } catch (e) {
      console.error('Error fetching vendor orders', e);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (e: any) {
      alert(e.message || 'Error updating order status');
    }
  };

  const filteredOrders = selectedStatus === 'ALL'
    ? orders
    : orders.filter((o) => o.status === selectedStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/vendor/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Vendor Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Orders & Dispatches</h1>
          <p className="text-sm text-slate-500 mt-1">
            Update order fulfillment status from Placed to Confirmed, Shipped, or Delivered.
          </p>
        </div>

        {/* Filter by status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Retrieving orders..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8 text-blue-600" />}
          title="No Orders in this Status"
          description="No customer orders currently match your filter selection."
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isVendorView={true}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
