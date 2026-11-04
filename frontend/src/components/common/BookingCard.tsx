import React, { useState, useEffect } from 'react';
import { BookingRequest } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface BookingCardProps {
  booking: BookingRequest;
  onConfirm?: (bookingId: number) => void;
  onCancel?: (bookingId: number) => void;
  isOwnerView?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onConfirm,
  onCancel,
  isOwnerView = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);

  // Live countdown timer for CONFIRMATION_PENDING status
  useEffect(() => {
    if (booking.status !== 'CONFIRMATION_PENDING' || !booking.confirmation_deadline) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const deadline = new Date(booking.confirmation_deadline!).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('Window Expired');
        setIsExpiringSoon(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
        setIsExpiringSoon(diff < 2 * 60 * 60 * 1000); // under 2 hours
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking.status, booking.confirmation_deadline]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
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

  const isPending = booking.status === 'CONFIRMATION_PENDING';
  const isQueued = booking.status === 'QUEUED';

  return (
    <div className={`bg-white rounded-2xl border p-5 transition shadow-2xs ${
      isPending ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
    }`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-mono text-slate-400 block">
            Booking #{booking.id} · Requested {formatDate(booking.created_at)}
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-0.5">
            {booking.equipment_name || `Equipment #${booking.equipment_id}`}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {isQueued && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Queue Position: #{booking.queue_position}
            </span>
          )}
          <StatusBadge status={booking.status} type="booking" />
        </div>
      </div>

      {/* Dates and Equipment info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div>
          <span className="font-semibold text-slate-700 block mb-0.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Start Window
          </span>
          <span className="font-medium text-slate-800">{formatDate(booking.start_date)}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-700 block mb-0.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> End Window
          </span>
          <span className="font-medium text-slate-800">{formatDate(booking.end_date)}</span>
        </div>

        {booking.equipment_location && (
          <div className="sm:col-span-2 flex items-center gap-1 text-slate-500 pt-1 border-t border-slate-200/60">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Location: {booking.equipment_location}</span>
          </div>
        )}

        {isOwnerView && booking.farmer_name && (
          <div className="sm:col-span-2 text-slate-700 pt-1 border-t border-slate-200/60">
            <span className="font-semibold">Requested By:</span> {booking.farmer_name} (Phone: {booking.farmer_phone || 'N/A'})
          </div>
        )}
      </div>

      {/* Confirmation Window Alert Box */}
      {isPending && timeLeft && (
        <div className={`p-3 rounded-xl mb-4 border flex items-center justify-between gap-3 text-xs ${
          isExpiringSoon
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0 text-current" />
            <div>
              <span className="font-bold block">Your Confirmation Window is Open!</span>
              <span className="text-[11px] opacity-90">Confirm now to lock in this rental slot: <strong>{timeLeft}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {/* If pending and farmer view */}
        {!isOwnerView && isPending && onConfirm && (
          <Button
            size="sm"
            variant="success"
            onClick={() => onConfirm(booking.id)}
            leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
          >
            Confirm Booking
          </Button>
        )}

        {/* Cancel button */}
        {(isPending || isQueued || booking.status === 'CONFIRMED') && onCancel && (
          <Button
            size="sm"
            variant="outline"
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
            onClick={() => onCancel(booking.id)}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
          >
            Cancel Request
          </Button>
        )}
      </div>
    </div>
  );
};
