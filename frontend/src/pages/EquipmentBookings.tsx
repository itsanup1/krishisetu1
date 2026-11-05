import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RentalRecord } from '../types';
import { api } from '../services/api';
import { RentalRecordCard } from '../components/equipment/RentalRecordCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Tractor, ArrowLeft, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';

export const EquipmentBookings: React.FC = () => {
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOwnerRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOwnerRentalRequests();
      setRentals(data || []);
    } catch (e) {
      console.error('Error fetching owner rental requests', e);
      setRentals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerRequests();
  }, []);

  const filtered =
    filterStatus === 'ALL'
      ? rentals
      : rentals.filter((r) => r.rental_status.toLowerCase() === filterStatus.toLowerCase());

  const pendingCount = rentals.filter((r) => r.rental_status === 'pending').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/owner/equipment"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Machinery
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <CalendarCheck className="w-4 h-4 text-amber-600" />
            Equipment Owner Dispatch
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Incoming Rental Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve rental requests submitted by neighboring farmers for your machinery.
          </p>
        </div>

        {pendingCount > 0 && (
          <span className="px-3 py-1.5 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs">
            {pendingCount} Pending Approval
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'pending', 'approved', 'active', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap capitalize ${
              filterStatus === s
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading incoming rental requests from farmers..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Tractor className="w-8 h-8 text-amber-600" />}
          title="No Rental Requests"
          description={
            filterStatus !== 'ALL'
              ? `No requests currently with status '${filterStatus}'.`
              : 'You have not received any rental requests for your machinery yet.'
          }
          actionLabel="View Listed Machinery"
          onAction={() => (window.location.href = '/owner/equipment')}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((rental) => (
            <RentalRecordCard
              key={rental.rental_id}
              rental={rental}
              isOwnerView={true}
              onRefresh={fetchOwnerRequests}
            />
          ))}
        </div>
      )}
    </div>
  );
};
