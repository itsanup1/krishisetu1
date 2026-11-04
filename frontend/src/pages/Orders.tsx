import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { OrderCard } from '../components/common/OrderCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ShoppingBag, Package } from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyOrders();
      setOrders(data || []);
    } catch (e) {
      console.error('Error fetching orders', e);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = selectedStatus === 'ALL'
    ? orders
    : orders.filter((o) => o.status === selectedStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your seeds, fertilizers, and pesticide shipments
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
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Retrieving order history..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-emerald-600" />}
          title="No Orders Found"
          description={
            selectedStatus !== 'ALL'
              ? `No orders currently in '${selectedStatus}' state.`
              : 'You have not placed any orders yet. Visit our marketplace to get started.'
          }
          actionLabel="Explore Marketplace"
          onAction={() => (window.location.href = '/products')}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
