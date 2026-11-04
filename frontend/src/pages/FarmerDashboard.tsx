import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order, BookingRequest } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BookingCard } from '../components/common/BookingCard';
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
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [userOrders, userBookings] = await Promise.all([
        api.getMyOrders(),
        api.getMyBookings(),
      ]);
      setOrders(userOrders);
      setBookings(userBookings);
    } catch (e) {
      console.error('Error loading farmer dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleConfirmBooking = async (id: number) => {
    try {
      await api.confirmBooking(id);
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Error confirming booking');
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await api.cancelBooking(id);
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Error cancelling booking');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your farmer dashboard..." />;
  }

  const activeBookings = bookings.filter(
    (b) => b.status === 'CONFIRMATION_PENDING' || b.status === 'CONFIRMED' || b.status === 'QUEUED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-slate-700 bg-slate-100 text-xs font-semibold">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" /> Farmer Account Center
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || 'Farmer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Registered District: {user?.location} · Manage your equipment rental reservations and marketplace orders.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Bookings</span>
            <CalendarDays className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeBookings.length}</div>
          <span className="text-xs text-slate-400">In FCFS Queue or Confirmed</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{orders.length}</div>
          <span className="text-xs text-slate-400">Marketplace Purchases</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cart Items</span>
            <ShoppingCart className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{itemCount}</div>
          <Link to="/cart" className="text-xs font-semibold text-emerald-700 hover:underline">
            Proceed to Checkout →
          </Link>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Tractor className="w-5 h-5 text-emerald-600" /> My Equipment Bookings (FCFS)
            </h2>
            <p className="text-xs text-slate-500">
              Review your confirmation windows and queued positions.
            </p>
          </div>
          <Link to="/bookings">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Bookings
            </Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No equipment rental requests placed yet.
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
            {bookings.slice(0, 4).map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onConfirm={handleConfirmBooking}
                onCancel={handleCancelBooking}
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
            <p className="text-xs text-slate-500">Seeds, fertilizers, and crop protection products.</p>
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
