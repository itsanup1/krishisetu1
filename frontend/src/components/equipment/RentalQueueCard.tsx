import React, { useState } from 'react';
import { RentalQueueEntry } from '../../types';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { Clock, Calendar, CheckCircle, AlertTriangle, ArrowRight, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RentalQueueCardProps {
  entry: RentalQueueEntry;
  onRefresh: () => void;
}

export const RentalQueueCard: React.FC<RentalQueueCardProps> = ({ entry, onRefresh }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();

  const handleLeaveQueue = async () => {
    if (!confirm('Are you sure you want to leave this equipment waiting list?')) return;
    setIsLeaving(true);
    try {
      await api.leaveRentalQueue(entry.queue_id);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to leave queue.');
    } finally {
      setIsLeaving(false);
    }
  };

  const isNotified = entry.queue_status === 'notified';

  return (
    <div
      className={`rounded-2xl border p-5 shadow-2xs space-y-3 transition ${
        isNotified ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-mono text-slate-400 block">
            Queue #{entry.queue_id} · Joined on {new Date(entry.created_at).toLocaleDateString()}
          </span>
          <h4 className="text-base font-bold text-slate-900">{entry.equipment_name}</h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
            Position: #{entry.queue_position}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isNotified
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 animate-pulse'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {entry.queue_status}
          </span>
        </div>
      </div>

      {/* Notified Alert Callout */}
      {isNotified && (
        <div className="bg-emerald-100/90 border border-emerald-300 p-3 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
          <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-sm">Machinery Stock Has Freed Up!</span>
            <span className="text-[11px]">
              You have been prioritized from the waiting queue! Request your rental now before other queue members claim it.
            </span>
          </div>
          <Button
            size="sm"
            variant="success"
            onClick={() => navigate(`/equipment/${entry.listing_id}`)}
            leftIcon={<ArrowRight className="w-4 h-4" />}
          >
            Rent Now
          </Button>
        </div>
      )}

      {/* Requested Window Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div>
          <span className="font-semibold text-slate-500 block mb-0.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Requested Window
          </span>
          <span className="font-bold text-slate-800">
            {entry.requested_start_date} to {entry.requested_end_date}
          </span>
        </div>

        <div>
          <span className="font-semibold text-slate-500 block mb-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" /> Requested Quantity
          </span>
          <span className="font-bold text-slate-800">{entry.requested_quantity} unit(s)</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end pt-1">
        <Button
          size="sm"
          variant="outline"
          className="text-rose-600 border-rose-200 hover:bg-rose-50"
          isLoading={isLeaving}
          onClick={handleLeaveQueue}
          leftIcon={<XCircle className="w-3.5 h-3.5" />}
        >
          Leave Waiting List
        </Button>
      </div>
    </div>
  );
};

