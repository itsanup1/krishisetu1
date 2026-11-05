import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RentalRecord, RentalQueueEntry } from '../types';
import { api } from '../services/api';
import { RentalRecordCard } from '../components/equipment/RentalRecordCard';
import { RentalQueueCard } from '../components/equipment/RentalQueueCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Tractor, Clock, PlusCircle, CheckCircle, ListOrdered } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Bookings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RENTALS' | 'QUEUE'>('RENTALS');
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [queueEntries, setQueueEntries] = useState<RentalQueueEntry[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rentalsData, queueData] = await Promise.all([
        api.getMyRentals().catch(() => []),
        api.getMyQueueEntries().catch(() => []),
      ]);
      setRentals(rentalsData || []);
      setQueueEntries(queueData || []);
    } catch (e) {
      console.error('Error fetching bookings and queue', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRentals =
    filterStatus === 'ALL'
      ? rentals
      : rentals.filter((r) => r.rental_status.toLowerCase() === filterStatus.toLowerCase());

  const notifiedCount = queueEntries.filter((q) => q.queue_status === 'notified').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Tractor className="w-4 h-4 text-emerald-600" />
            Equipment Rental Management
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Rentals & Waiting Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track rental records, approval status, rent payments, and First-Come First-Served queue position.
          </p>
        </div>

        <Link to="/equipment">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Rent Machinery
          </Button>
        </Link>
      </div>

      {/* Notified Queue Notification Banner */}
      {notifiedCount > 0 && (
        <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-100 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Machinery Available for You!</h4>
              <p className="text-xs text-emerald-100">
                You have {notifiedCount} waiting queue slot(s) that just opened up. Rent before others claim it!
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="bg-white text-emerald-800 hover:bg-emerald-50 border-white shrink-0 font-bold"
            onClick={() => setActiveTab('QUEUE')}
          >
            View Available Queue Slot
          </Button>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('RENTALS')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'RENTALS'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tractor className="w-4 h-4" />
          Rental Records ({rentals.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('QUEUE')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'QUEUE'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          Waiting Queue ({queueEntries.length})
          {notifiedCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute top-1 right-2" />
          )}
        </button>
      </div>

      {/* Tab 1: Rentals List */}
      {activeTab === 'RENTALS' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'pending', 'approved', 'active', 'completed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap capitalize ${
                  filterStatus === s
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading your rental transactions..." />
          ) : filteredRentals.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-8 h-8 text-emerald-600" />}
              title="No Rental Records Found"
              description={
                filterStatus !== 'ALL'
                  ? `No rental records currently with status '${filterStatus}'.`
                  : 'You have not submitted any equipment rental requests yet.'
              }
              actionLabel="Explore Farm Machinery"
              onAction={() => (window.location.href = '/equipment')}
            />
          ) : (
            <div className="space-y-4">
              {filteredRentals.map((rental) => (
                <RentalRecordCard
                  key={rental.rental_id}
                  rental={rental}
                  onRefresh={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Waiting Queue List */}
      {activeTab === 'QUEUE' && (
        <div className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Checking queue position..." />
          ) : queueEntries.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-8 h-8 text-emerald-600" />}
              title="No Active Queue Entries"
              description="You are not currently in any equipment waiting lists. When equipment is in high demand, you can join the queue to be prioritized!"
              actionLabel="Explore Farm Machinery"
              onAction={() => (window.location.href = '/equipment')}
            />
          ) : (
            <div className="space-y-4">
              {queueEntries.map((q) => (
                <RentalQueueCard
                  key={q.queue_id}
                  entry={q}
                  onRefresh={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
