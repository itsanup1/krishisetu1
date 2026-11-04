import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OrderCard } from '../components/common/OrderCard';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        api.getMyVendorProducts(),
        api.getMyOrders(),
      ]);
      setProducts(prods);
      setOrders(ords);
    } catch (e) {
      console.error('Error loading vendor dashboard', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Error updating order status');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading agro vendor analytics..." />;
  }

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingDispatches = orders.filter(
    (o) => o.status === 'PLACED' || o.status === 'CONFIRMED'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-700/60 text-blue-300 text-xs font-semibold">
            <Store className="w-3.5 h-3.5" /> Agro Vendor Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.name || 'Vendor Business Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 max-w-xl">
            Manage your input catalogs, update inventory levels, and process farmer shipments.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Items</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{products.length}</div>
          <span className="text-xs text-slate-400">Seeds, Fertilizers & Chemicals</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Dispatches</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingDispatches}</div>
          <span className="text-xs text-slate-400">Orders to Pack or Ship</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400">Recorded via Razorpay Test</span>
        </div>
      </div>

      {/* Quick Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <span className="text-xs font-bold text-slate-700">Quick Inventory Management:</span>
        <div className="flex items-center gap-3">
          <Link to="/vendor/products">
            <Button variant="outline" size="sm">
              Manage Catalog
            </Button>
          </Link>
          <Link to="/vendor/products/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders to Dispatch */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" /> Incoming Customer Orders
            </h2>
            <p className="text-xs text-slate-500">
              Update dispatch and delivery status to keep farmers informed.
            </p>
          </div>
          <Link to="/vendor/orders">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Orders
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No customer orders received yet.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
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
    </div>
  );
};
