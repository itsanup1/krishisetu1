import React from 'react';
import { Link } from 'react-router-dom';
import { Order, OrderStatus } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Package, ChevronRight, CreditCard } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onUpdateStatus?: (orderId: number, status: OrderStatus) => void;
  isVendorView?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, isVendorView = false }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-sm transition">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-mono text-slate-400 block">
            Order #{order.id} · {formatDate(order.created_at)}
          </span>
          <span className="text-sm font-bold text-slate-900">
            {(order.items || []).length} {(order.items || []).length === 1 ? 'Item' : 'Items'}
          </span>
          {order.farmer_name && (
            <span className="text-xs text-slate-500 ml-2">Customer: {order.farmer_name}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-extrabold text-slate-900">
            ₹{(order.total_amount || 0).toLocaleString('en-IN')}
          </span>
          <StatusBadge status={order.status} type="order" />
        </div>
      </div>

      {/* Items list */}
      <div className="divide-y divide-slate-100 mb-4">
        {(order.items || []).map((item, idx) => (
          <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">
                  {item.product?.name || `Product #${item.product_id}`}
                </p>
                <p className="text-[11px] text-slate-500">
                  Quantity: {item.quantity} × ₹{item.price_at_purchase || 0}
                </p>
              </div>
            </div>
            <span className="font-bold text-slate-800">
              ₹{(item.quantity * (item.price_at_purchase || 0)).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Razorpay ID: {order.razorpay_order_id || 'Direct'}</span>
        </div>

        {/* Vendor status change dropdown */}
        {isVendorView && onUpdateStatus && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Update Status:</span>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-medium"
            >
              <option value="PLACED">PLACED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        )}

        {!isVendorView && (
          <Link
            to={`/orders/${order.id}`}
            className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:text-emerald-700"
          >
            <span>View Receipt & Invoice</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
};
