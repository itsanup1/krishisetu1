import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  Truck,
  Package,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminOrders();
      setOrders(data || []);
    } catch (e) {
      console.error('Error fetching admin orders', e);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      await api.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (e: any) {
      alert(e.message || 'Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch =
      o.id.toString().includes(search) ||
      (o.farmer_name && o.farmer_name.toLowerCase().includes(search.toLowerCase())) ||
      (o.delivery_address && o.delivery_address.toLowerCase().includes(search.toLowerCase())) ||
      (o.razorpay_order_id && o.razorpay_order_id.toLowerCase().includes(search.toLowerCase())) ||
      (o.razorpay_payment_id && o.razorpay_payment_id.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalGMV = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Administrative Console
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            Platform Fulfillment & Audit
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Marketplace Orders Oversight
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit payment captures, delivery workflows, and oversee cross-vendor fulfillment ({orders.length} total orders, ₹{totalGMV.toLocaleString('en-IN')} GMV).
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by order ID (#101), farmer name, delivery address, or Razorpay payment ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-2xs"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner message="Auditing platform orders..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <p className="text-sm font-semibold">No orders matched your search or status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Buyer / Farmer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Verification</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      #{order.id}
                      <span className="block text-[10px] font-sans text-slate-400 font-normal">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{order.farmer_name || `Farmer #${order.farmer_id}`}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.razorpay_payment_id ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Captured ({order.razorpay_payment_id.slice(0, 14)}...)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <CreditCard className="w-3 h-3 text-amber-600" />
                          <span>Simulated Test Order</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs hover:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={order.delivery_address}>
                      {order.delivery_address}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                      >
                        <span>Invoice</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
