import React, { useState } from 'react';
import { RentalRecord, RentalPayment } from '../../types';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  CreditCard,
  DollarSign,
  User,
  ShieldCheck,
  AlertCircle,
  Truck,
} from 'lucide-react';

interface RentalRecordCardProps {
  rental: RentalRecord;
  isOwnerView?: boolean;
  onRefresh: () => void;
}

export const RentalRecordCard: React.FC<RentalRecordCardProps> = ({
  rental,
  isOwnerView = false,
  onRefresh,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [payments, setPayments] = useState<RentalPayment[]>([]);
  const [showPayments, setShowPayments] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'CASH'>('RAZORPAY');

  const handleStatusChange = async (newStatus: string) => {
    setIsProcessing(true);
    try {
      await api.updateRentalStatus(rental.rental_id, newStatus);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to update rental status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayRent = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === 'RAZORPAY') {
        const rzpOrder = await api.createRazorpayOrder(Number(rental.total_amount));
        const paymentRes = await api.createRentalPayment({
          rental_id: rental.rental_id,
          amount: Number(rental.total_amount),
          payment_method: 'RAZORPAY',
          transaction_reference: rzpOrder?.id || `rzp_rent_${Date.now()}`,
        });
        alert(`Payment successful! Transaction reference: ${paymentRes.transaction_reference}`);
      } else {
        await api.createRentalPayment({
          rental_id: rental.rental_id,
          amount: Number(rental.total_amount),
          payment_method: 'CASH_ON_DELIVERY',
          transaction_reference: `CASH-${rental.rental_id}-${Date.now()}`,
        });
        alert('Payment recorded as Cash on Delivery with Machinery Owner!');
      }
      setShowPaymentModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadPayments = async () => {
    if (!showPayments) {
      try {
        const list = await api.getRentalPayments(rental.rental_id);
        setPayments(list);
      } catch (err) {
        console.error('Failed loading payments', err);
      }
    }
    setShowPayments(!showPayments);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    active: 'bg-blue-50 text-blue-800 border-blue-200',
    completed: 'bg-slate-100 text-slate-800 border-slate-200',
    cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
    rejected: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-mono text-slate-400 block">
            Rental #{rental.rental_id} · Booked on {new Date(rental.created_at).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h4 className="text-base font-bold text-slate-900">{rental.equipment_name}</h4>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              Listing #{rental.listing_id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
              statusColors[rental.rental_status] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {rental.rental_status}
          </span>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
        <div>
          <span className="font-semibold text-slate-500 block mb-0.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Rental Duration
          </span>
          <span className="font-bold text-slate-800">
            {rental.rental_start_date} to {rental.rental_end_date}
          </span>
        </div>

        <div>
          <span className="font-semibold text-slate-500 block mb-0.5 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-emerald-600" /> Quantity Rented
          </span>
          <span className="font-bold text-slate-800">
            {rental.quantity_rented} unit(s)
          </span>
        </div>

        <div>
          <span className="font-semibold text-slate-500 block mb-0.5 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Total Rental Amount
          </span>
          <span className="text-sm font-black text-slate-900">
            ₹{Number(rental.total_amount).toLocaleString('en-IN')}
          </span>
        </div>

        {rental.location && (
          <div className="sm:col-span-3 text-slate-600 flex items-center gap-1 pt-2 border-t border-slate-200/60">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Farm Location: {rental.location}</span>
          </div>
        )}

        {isOwnerView && rental.farmer_name && (
          <div className="sm:col-span-3 text-slate-700 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span>
              <User className="w-3.5 h-3.5 inline text-emerald-700 mr-1" />
              <strong>Farmer:</strong> {rental.farmer_name}
            </span>
            {rental.farmer_phone && (
              <span className="font-mono text-slate-500">📞 +91 {rental.farmer_phone}</span>
            )}
          </div>
        )}
      </div>

      {/* Payment details view */}
      {showPayments && (
        <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
          <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-700" /> Rental Payment Records
          </h5>
          {payments.length === 0 ? (
            <p className="text-slate-500 text-[11px]">No payment records registered yet for this rental.</p>
          ) : (
            payments.map((p) => (
              <div
                key={p.payment_id}
                className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900">₹{p.amount}</span> via {p.payment_method}
                  <p className="text-[10px] text-slate-400 font-mono">Ref: {p.transaction_reference}</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded uppercase">
                  {p.payment_status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={loadPayments}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          {showPayments ? 'Hide Payments ▲' : 'View Payments ▼'}
        </button>

        <div className="flex items-center gap-2">
          {/* Owner Actions */}
          {isOwnerView && rental.rental_status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="success"
                isLoading={isProcessing}
                onClick={() => handleStatusChange('approved')}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve Request
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                isLoading={isProcessing}
                onClick={() => handleStatusChange('rejected')}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Reject
              </Button>
            </>
          )}

          {isOwnerView && rental.rental_status === 'approved' && (
            <Button
              size="sm"
              variant="primary"
              isLoading={isProcessing}
              onClick={() => handleStatusChange('active')}
              leftIcon={<Truck className="w-4 h-4" />}
            >
              Mark In Use (Active)
            </Button>
          )}

          {isOwnerView && rental.rental_status === 'active' && (
            <Button
              size="sm"
              variant="outline"
              isLoading={isProcessing}
              onClick={() => handleStatusChange('completed')}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Mark Returned & Completed
            </Button>
          )}

          {/* Farmer Actions */}
          {!isOwnerView && rental.rental_status === 'approved' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => setShowPaymentModal(true)}
              leftIcon={<CreditCard className="w-4 h-4" />}
            >
              Pay Rent (₹{Number(rental.total_amount).toLocaleString('en-IN')})
            </Button>
          )}

          {!isOwnerView && (rental.rental_status === 'pending' || rental.rental_status === 'approved') && (
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
              isLoading={isProcessing}
              onClick={() => {
                if (confirm('Are you sure you want to cancel this rental booking?')) {
                  handleStatusChange('cancelled');
                }
              }}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Cancel Rental
            </Button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Confirm Rental Payment</h3>
            <p className="text-xs text-slate-500">
              Payment is linked to Rental #{rental.rental_id} for {rental.equipment_name}.
            </p>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
              <span className="text-xs text-emerald-800 font-semibold block">Total Rent Payable:</span>
              <span className="text-3xl font-black text-emerald-900">
                ₹{Number(rental.total_amount).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <label className="block">Select Payment Option:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  Razorpay / UPI / Cards
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  Cash on Delivery
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPaymentModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={handlePayRent}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Confirm & Pay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
