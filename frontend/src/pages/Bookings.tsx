import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookingRequest } from '../types';
import { api } from '../services/api';
import { BookingCard } from '../components/common/BookingCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Tractor, Clock, PlusCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyBookings();
      setBookings(data || []);
    } catch (e) {
      console.error('Error fetching bookings', e);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirm = async (id: number) => {
    try {
      await api.confirmBooking(id);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Error confirming booking window');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this equipment booking?')) return;
    try {
      await api.cancelBooking(id);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Error cancelling booking');
    }
  };

  const filtered = filterStatus === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === filterStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Tractor className="w-4 h-4 text-emerald-600" />
            Equipment Rental Bookings
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Rental Queue & Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track confirmation deadlines, queue position (#1, #2), and confirmed rental windows.
          </p>
        </div>

        <Link to="/equipment">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Rent More Equipment
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'CONFIRMATION_PENDING', 'QUEUED', 'CONFIRMED', 'CANCELLED', 'EXPIRED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterStatus === s
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Checking rental queue status with server..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8 text-emerald-600" />}
          title="No Bookings Found"
          description={
            filterStatus !== 'ALL'
              ? `No rental bookings currently with status '${filterStatus}'.`
              : 'You have not submitted any equipment rental requests yet.'
          }
          actionLabel="Explore Farm Machinery"
          onAction={() => (window.location.href = '/equipment')}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
