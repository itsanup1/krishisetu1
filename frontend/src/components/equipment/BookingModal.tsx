import React, { useState, useEffect } from 'react';
import { Equipment } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  CreditCard,
  DollarSign,
  Truck,
} from 'lucide-react';
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

  // Tomorrow default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startDateDefault = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);
  const endDateDefault = dayAfter.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(startDateDefault);
  const [endDate, setEndDate] = useState(endDateDefault);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvail, setIsCheckingAvail] = useState(false);
  const [availableQty, setAvailableQty] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check dynamic availability whenever dates change
  useEffect(() => {
    if (!startDate || !endDate) return;
    if (endDate < startDate) {
      setAvailableQty(0);
      return;
    }

    const checkAvail = async () => {
      setIsCheckingAvail(true);
      try {
        const res = await api.checkEquipmentAvailability(equipment.id, startDate, endDate);
        setAvailableQty(res.available_quantity);
      } catch {
        // Fallback to stock quantity
        setAvailableQty(equipment.stock_quantity ?? 1);
      } finally {
        setIsCheckingAvail(false);
      }
    };

    checkAvail();
  }, [equipment.id, startDate, endDate]);

  const daysDuration = Math.max(
    1,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
  );
  const totalAmount = Math.round(Number(equipment.rate) * daysDuration * quantity);

  const isAvailable = availableQty !== null && availableQty >= quantity;

  // Handle Rental Request
  const handleRentalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.requestRental({
        listing_id: equipment.id,
        quantity_rented: quantity,
        rental_start_date: startDate,
        rental_end_date: endDate,
      });

      if (onSuccess) onSuccess();
      onClose();
      navigate('/bookings');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to submit rental request.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Join Queue
  const handleJoinQueue = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const qRes = await api.joinRentalQueue({
        listing_id: equipment.id,
        requested_quantity: quantity,
        requested_start_date: startDate,
        requested_end_date: endDate,
      });

      alert(`Successfully joined waiting queue at Position #${qRes.queue_position}!`);
      if (onSuccess) onSuccess();
      onClose();
      navigate('/bookings');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to join waiting queue.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rent Farm Equipment" maxWidth="md">
      <form onSubmit={handleRentalRequest} className="space-y-4">
        {/* Equipment summary pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <img
            src={equipment.image_url}
            alt={equipment.name}
            className="w-14 h-14 object-cover rounded-lg bg-slate-200"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {equipment.type}
              </span>
              {(equipment.rental_id || equipment.product_id) && (
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                  {equipment.rental_id || equipment.product_id}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">{equipment.name}</h4>
            <p className="text-xs font-semibold text-slate-600">
              ₹{equipment.rate} / {equipment.rate_unit.toLowerCase()} · {equipment.location}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Quantity Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Quantity to Rent
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={equipment.stock_quantity ?? 5}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-28 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
            />
            <span className="text-xs text-slate-500">
              {isCheckingAvail
                ? 'Calculating availability...'
                : availableQty !== null
                ? availableQty > 0
                  ? `✓ ${availableQty} unit(s) available for selected dates`
                  : '⚠️ 0 units available (Fully Booked)'
                : ''}
            </span>
          </div>
        </div>

        {/* Real-time Pricing Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Rental Duration:</span>
            <span className="font-semibold text-slate-800">{daysDuration} Day(s)</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Daily Rate per Machine:</span>
            <span className="font-semibold text-slate-800">₹{equipment.rate}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Quantity:</span>
            <span className="font-semibold text-slate-800">{quantity} unit(s)</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="font-bold text-slate-900 text-sm">Total Rental Estimate:</span>
            <span className="text-xl font-black text-emerald-800">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          {isAvailable ? (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Request Rental
            </Button>
          ) : (
            <Button
              type="button"
              variant="warning"
              size="sm"
              isLoading={isLoading}
              onClick={handleJoinQueue}
              leftIcon={<Clock className="w-4 h-4" />}
            >
              Join Waiting Queue
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};
