import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Printer,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  Sprout,
  ShieldCheck,
} from 'lucide-react';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const orderIdNum = parseInt(id, 10);
        const data = await api.getOrder(orderIdNum);
        setOrder(data);
      } catch (e) {
        console.error('Error fetching order', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Generating invoice receipt..." />;
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Order Not Found</h2>
        <Link to="/orders">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Tax Invoice
        </button>
      </div>

      {/* Invoice Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs space-y-8 print:shadow-none print:border-none">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                KRISHI<span className="text-emerald-600">SETU</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">Smart Agricultural Marketplace & Equipment Rental</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              TAX INVOICE
            </span>
            <span className="text-lg font-black text-slate-900">Order #{order.id}</span>
            <div className="mt-1">
              <StatusBadge status={order.status} type="order" />
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600 pb-6 border-b border-slate-100">
          <div>
            <span className="font-bold text-slate-900 block mb-1">Order Date:</span>
            <span>
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">Farmer / Customer:</span>
            <span>{order.farmer_name || 'Customer'}</span>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">Delivery Destination:</span>
            <span className="flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              {order.delivery_address}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Purchased Agricultural Items
          </h3>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(order.items || []).map((item, i) => (
                <tr key={i}>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">
                      {item.product?.name || `Product #${item.product_id}`}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Category: {item.product?.category || 'Inputs'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700 font-mono">
                    ₹{(item.price_at_purchase || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                    ₹{(item.quantity * (item.price_at_purchase || 0)).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200">
              <tr>
                <td colSpan={3} className="pt-4 text-right font-bold text-slate-700 text-sm">
                  Grand Total Paid (INR):
                </td>
                <td className="pt-4 text-right font-black text-emerald-600 text-base font-mono">
                  ₹{order.total_amount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Razorpay transaction verification note */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
          <div className="space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Razorpay Test Mode Receipt
            </span>
            <p className="text-slate-500 text-[11px]">
              Razorpay Order ID: <code className="font-mono">{order.razorpay_order_id || 'N/A'}</code>
            </p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
            Payment Verified
          </span>
        </div>
      </div>
    </div>
  );
};
