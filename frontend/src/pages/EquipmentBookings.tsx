import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BookingRequest } from '../types';
import { api } from '../services/api';
import { BookingCard } from '../components/common/BookingCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Tractor, ArrowLeft, CalendarCheck } from 'lucide-react';
import { Button } from '../components/common/Button';

export const EquipmentBookings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eqIdParam = searchParams.get('equipment_id');

  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOwnerBookings();
      if (eqIdParam) {
        setBookings(data.filter((b) => b.equipment_id === parseInt(eqIdParam, 10)));
      } else {
        setBookings(data);
      }
    } catch (e) {
      console.error('Error fetching owner bookings', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [eqIdParam]);

  const handleCancelBooking = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancelBooking(id);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Error cancelling booking');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/owner/equipment"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Machinery
      </Link>

      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
          <CalendarCheck className="w-4 h-4 text-amber-600" />
          Owner Queue Monitor
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Incoming Machinery Rental Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your equipment's active confirmation windows, queue sequence, and confirmed bookings.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading incoming booking requests..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="w-8 h-8 text-amber-600" />}
          title="No Rental Requests Yet"
          description="Neighboring farmers have not requested slots for this machinery yet."
          actionLabel="View My Equipment"
          onAction={() => (window.location.href = '/owner/equipment')}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
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
