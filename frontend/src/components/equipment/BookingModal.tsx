import React, { useState } from 'react';
import { Equipment } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Calendar, Clock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookingModalProps {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tomorrow 09:00 default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(18, 0, 0, 0);

  const [startDate, setStartDate] = useState(tomorrow.toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(dayAfter.toISOString().slice(0, 16));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.createBooking({
        equipment_id: equipment.id,
        start_date: startDate,
        end_date: endDate,
      });

      if (onSuccess) onSuccess();
      onClose();
      navigate(`/bookings`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to submit booking request.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Equipment Rental (FCFS Queue)" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Equipment summary pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <img
            src={equipment.image_url}
            alt={equipment.name}
            className="w-14 h-14 object-cover rounded-lg bg-slate-200"
          />
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {equipment.type}
            </span>
            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{equipment.name}</h4>
            <p className="text-xs font-semibold text-slate-600">
              ₹{equipment.rate} / {equipment.rate_unit} · {equipment.location}
            </p>
          </div>
        </div>

        {/* FCFS Queue Explanation Callout */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <Clock className="w-4 h-4 text-amber-600" />
            Automated FCFS Booking Queue Rule:
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            If the requested time window is available, you get a <strong>24-hour Confirmation Window</strong>. If another farmer has already requested an overlapping window, you will be placed in the First-Come First-Served queue and automatically promoted if their window expires!
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Date Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Start Date & Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              End Date & Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Submit Rental Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
