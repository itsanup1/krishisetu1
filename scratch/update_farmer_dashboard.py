farmer_dash_code = '''import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order, RentalRecord, RentalQueueEntry, FarmerDashboardStats, Notification } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { RentalRecordCard } from '../components/equipment/RentalRecordCard';
import { OrderCard } from '../components/common/OrderCard';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Sprout,
  Tractor,
  ShoppingCart,
  CalendarDays,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Coins,
  ListOrdered,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [queueEntries, setQueueEntries] = useState<RentalQueueEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<FarmerDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [userOrders, userRentals, userQueue, userStats, userNotifs] = await Promise.all([
        api.getMyOrders().catch(() => []),
        api.getMyRentals().catch(() => []),
        api.getMyQueueEntries().catch(() => []),
        api.getFarmerDashboardStats().catch(() => null),
        api.getNotifications(4).catch(() => []),
      ]);
      setOrders(userOrders || []);
      setRentals(userRentals || []);
      setQueueEntries(userQueue || []);
      setStats(userStats);
      setNotifications(userNotifs || []);
    } catch (e) {
      console.error('Error loading farmer dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading your farmer dashboard from database..." />;
  }

  const notifiedQueue = queueEntries.filter((q) => q.queue_status === 'notified');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-slate-700 bg-slate-100 text-xs font-semibold">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" /> Farmer Account Center
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || 'Farmer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Registered District: {user?.location} · Real-time equipment reservations, queue priorities, and marketplace orders.
          </p>
        </div>

        {user?.is_equipment_owner && (
          <div className="flex items-center gap-2">
            <Link to="/owner/equipment">
              <Button variant="outline" size="sm" leftIcon={<Tractor className="w-4 h-4 text-amber-600" />}>
                Equipment Owner Portal →
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Queue Alert Banner if notified */}
      {notifiedQueue.length > 0 && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-100 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Machinery Available for Reservation!</h4>
              <p className="text-xs text-emerald-100">
                You have {notifiedQueue.length} equipment queue position(s) that just opened up.
              </p>
            </div>
          </div>
          <Link to="/bookings">
            <Button size="sm" variant="outline" className="bg-white text-emerald-900 hover:bg-emerald-50 border-white shrink-0 font-bold">
              View Available Slot
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards (from Actual Supabase DB Stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Rentals</span>
            <Tractor className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.active_rentals_count ?? rentals.length}</div>
          <span className="text-[11px] text-slate-400">Approved or Active Machinery</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Queue Slots</span>
            <ListOrdered className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {(stats?.waiting_queue_count ?? 0) + (stats?.notified_queue_count ?? 0)}
          </div>
          <span className="text-[11px] text-slate-400">FCFS Waiting List Entries</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Marketplace Orders</span>
            <ShoppingCart className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_orders_count ?? orders.length}</div>
          <span className="text-[11px] text-slate-400">Certified Agri-Inputs</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cart Items</span>
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{itemCount}</div>
          <Link to="/cart" className="text-[11px] font-semibold text-emerald-700 hover:underline">
            Proceed to Checkout →
          </Link>
        </div>
      </div>

      {/* Notifications preview */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" /> Recent Activity & Notifications
            </h3>
            <span className="text-xs text-slate-400">Real-time status updates</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border text-xs ${
                  !n.is_read ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-slate-900">{n.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rentals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Tractor className="w-5 h-5 text-emerald-600" /> My Equipment Rentals (4-Table Module)
            </h2>
            <p className="text-xs text-slate-500">
              Review current approvals, dates, and recorded payments.
            </p>
          </div>
          <Link to="/bookings">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Rentals & Queue
            </Button>
          </Link>
        </div>

        {rentals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No equipment rentals placed yet.
            <div className="mt-3">
              <Link to="/equipment">
                <Button size="sm" variant="primary">
                  Browse Machinery Directory
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rentals.slice(0, 4).map((r) => (
              <RentalRecordCard
                key={r.rental_id}
                rental={r}
                onRefresh={loadDashboardData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" /> Recent Marketplace Orders
            </h2>
            <p className="text-xs text-slate-500">Certified seeds, fertilizers, and crop protection products.</p>
          </div>
          <Link to="/orders">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Orders
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            You haven't made any purchases yet.
            <div className="mt-3">
              <Link to="/products">
                <Button size="sm" variant="primary">
                  Shop Agricultural Inputs
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
'''

with open('frontend/src/pages/FarmerDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(farmer_dash_code)

print("SUCCESS: frontend/src/pages/FarmerDashboard.tsx updated")

