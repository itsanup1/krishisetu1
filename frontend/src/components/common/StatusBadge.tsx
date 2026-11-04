import React from 'react';
import { OrderStatus, BookingStatus } from '../../types';
import { Clock, CheckCircle2, Truck, Package, XCircle, AlertCircle, PlayCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus | BookingStatus | string;
  type?: 'order' | 'booking';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order' }) => {
  const normalized = status.toUpperCase();

  // Booking statuses
  if (normalized === 'CONFIRMATION_PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
        <Clock className="w-3.5 h-3.5 text-amber-700" />
        CONFIRMATION PENDING
      </span>
    );
  }

  if (normalized === 'QUEUED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        IN QUEUE (FCFS)
      </span>
    );
  }

  if (normalized === 'CONFIRMED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        CONFIRMED
      </span>
    );
  }

  if (normalized === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
        <PlayCircle className="w-3.5 h-3.5 text-indigo-600" />
        RENTAL ACTIVE
      </span>
    );
  }

  if (normalized === 'COMPLETED' || normalized === 'DELIVERED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
        {normalized}
      </span>
    );
  }

  if (normalized === 'EXPIRED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
        <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
        EXPIRED (WINDOW CLOSED)
      </span>
    );
  }

  if (normalized === 'CANCELLED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        CANCELLED
      </span>
    );
  }

  // Order statuses
  if (normalized === 'PLACED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
        <Package className="w-3.5 h-3.5 text-sky-600" />
        ORDER PLACED
      </span>
    );
  }

  if (normalized === 'SHIPPED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
        <Truck className="w-3.5 h-3.5 text-purple-600" />
        DISPATCHED / SHIPPED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
      {status}
    </span>
  );
};
