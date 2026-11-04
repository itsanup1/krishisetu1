import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ShieldCheck, CreditCard, Smartphone, Building2, CheckCircle2, Lock } from 'lucide-react';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId?: string;
  onSuccess: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure?: (error: string) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderId = `order_test_${Date.now()}`,
  onSuccess,
  onFailure,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('farmer@oksbi');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulatePayment = (success: boolean) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (success) {
        const paymentId = `pay_test_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const signature = `rzp_sig_${Math.random().toString(36).substring(2, 16)}`;
        onSuccess({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        });
        onClose();
      } else {
        if (onFailure) {
          onFailure('Payment failed by user or bank server timeout in Test Mode.');
        }
      }
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Razorpay Secure Payment Gateway (TEST MODE)" maxWidth="md">
      <div className="space-y-4">
        {/* Header Badge */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Krishisetu Checkout
            </div>
            <p className="text-xs text-blue-700 mt-0.5">Test Environment · No real money will be deducted</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Payable Amount</span>
            <div className="text-lg font-extrabold text-slate-900">₹{amount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Payment Methods Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Test Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedMethod === 'upi'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Smartphone className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
              <span className="text-xs font-bold block">UPI / QR</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedMethod === 'card'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <span className="text-xs font-bold block">Test Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('netbanking')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedMethod === 'netbanking'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Building2 className="w-5 h-5 mx-auto mb-1 text-amber-600" />
              <span className="text-xs font-bold block">Net Banking</span>
            </button>
          </div>
        </div>

        {/* Details based on method */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-2">
          {selectedMethod === 'upi' && (
            <div>
              <span className="font-semibold text-slate-700">Simulated VPA / UPI ID:</span>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
              />
              <p className="text-[11px] text-slate-500 mt-1">Accepts any test UPI ID (e.g. success@razorpay)</p>
            </div>
          )}
          {selectedMethod === 'card' && (
            <div>
              <p className="font-semibold text-slate-700">Test Visa Card Number:</p>
              <p className="font-mono text-slate-800 bg-white p-1.5 rounded border border-slate-200 mt-1">
                4111 •••• •••• 1111 (Expiry: 12/28, CVV: 123)
              </p>
            </div>
          )}
          {selectedMethod === 'netbanking' && (
            <div>
              <p className="font-semibold text-slate-700">Test Bank:</p>
              <p className="text-slate-800 font-medium mt-0.5">State Bank of India / HDFC Bank (Simulated)</p>
            </div>
          )}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
            <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit Encrypted & RBI Guideline Compliant Demo
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            className="w-full"
            isLoading={isProcessing}
            onClick={() => handleSimulatePayment(true)}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Authorize Test Payment (₹{amount.toLocaleString('en-IN')})
          </Button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSimulatePayment(false)}
            className="w-full text-center text-xs text-rose-600 hover:text-rose-800 font-medium py-1 cursor-pointer"
          >
            Simulate Failed Payment (Test Failure Handling)
          </button>
        </div>
      </div>
    </Modal>
  );
};
