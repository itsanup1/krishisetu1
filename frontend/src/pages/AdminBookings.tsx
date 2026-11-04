import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookingRequest } from '../types';
import { api } from '../services/api';
import { BookingCard } from '../components/common/BookingCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ArrowLeft, CalendarCheck, ShieldAlert } from 'lucide-react';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllBookings();
      setBookings(data);
    } catch (e) {
      console.error('Error fetching admin bookings', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: number) => {
    if (!confirm('Admin action: Cancel this booking request?')) return;
    try {
      await api.cancelBooking(id);
      await fetchBookings();
    } catch (e: any) {
      alert(e.message || 'Error cancelling booking');
    }
  };

  const filtered = filterStatus === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === filterStatus);

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
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            Platform Queue Governance
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            FCFS Booking Queue Inspector
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Inspect live confirmation deadlines, queue position sequences, and rental slot overlaps.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'CONFIRMATION_PENDING', 'QUEUED', 'CONFIRMED', 'CANCELLED', 'EXPIRED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Auditing platform booking queues..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No bookings currently in state '{filterStatus}'.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              isOwnerView={true}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
};
