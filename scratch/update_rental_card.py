with open('frontend/src/components/equipment/RentalRecordCard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add import for RazorpayCheckoutModal
if "import { RazorpayCheckoutModal }" not in text:
    text = text.replace(
        "import { Button } from '../common/Button';",
        "import { Button } from '../common/Button';\nimport { RazorpayCheckoutModal } from '../common/RazorpayCheckoutModal';",
        1
    )

# 2. Add state for isRazorpayOpen
old_state = '''  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'CASH'>('RAZORPAY');'''

new_state = '''  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'CASH'>('RAZORPAY');'''
assert old_state in text, "old_state not found"
text = text.replace(old_state, new_state, 1)

# 3. Update handlePayRent and add Razorpay handlers
old_pay_rent = '''  const handlePayRent = async () => {
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
  };'''

new_pay_rent = '''  const handlePayRent = async () => {
    if (paymentMethod === 'RAZORPAY') {
      setShowPaymentModal(false);
      setIsRazorpayOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      await api.createRentalPayment({
        rental_id: rental.rental_id,
        amount: Number(rental.total_amount),
        payment_method: 'CASH_ON_DELIVERY',
        payment_status: 'successful',
        transaction_reference: `CASH-${rental.rental_id}-${Date.now()}`,
      });
      alert('Payment recorded as Cash on Delivery with Machinery Owner!');
      setShowPaymentModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Payment recording failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpaySuccess = async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    setIsProcessing(true);
    try {
      const paymentRes = await api.createRentalPayment({
        rental_id: rental.rental_id,
        amount: Number(rental.total_amount),
        payment_method: 'RAZORPAY',
        payment_status: 'successful',
        transaction_reference: data.razorpay_payment_id,
      });
      alert(`Payment confirmed! Reference: ${paymentRes.transaction_reference}`);
      setIsRazorpayOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed saving payment record.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayFailure = async (errorMsg: string) => {
    try {
      await api.createRentalPayment({
        rental_id: rental.rental_id,
        amount: Number(rental.total_amount),
        payment_method: 'RAZORPAY',
        payment_status: 'failed',
        transaction_reference: `FAILED-RENT-${rental.rental_id}-${Date.now()}`,
      });
      alert(`Online payment failed: ${errorMsg}. A failed payment record has been logged.`);
      setIsRazorpayOpen(false);
      onRefresh();
    } catch (err: any) {
      alert('Payment cancelled / failed.');
    }
  };'''

assert old_pay_rent in text, "old_pay_rent not found"
text = text.replace(old_pay_rent, new_pay_rent, 1)

# 4. Render RazorpayCheckoutModal before closing tag
modal_render = '''      {/* Razorpay Gateway Modal */}
      {isRazorpayOpen && (
        <RazorpayCheckoutModal
          isOpen={isRazorpayOpen}
          amount={Number(rental.total_amount)}
          orderId={`RENT_ORD_${rental.rental_id}_${Date.now()}`}
          onClose={() => setIsRazorpayOpen(false)}
          onSuccess={handleRazorpaySuccess}
          onFailure={handleRazorpayFailure}
        />
      )}
    </div>
  );
};'''

assert "    </div>\n  );\n};" in text, "closing tags not found"
text = text.replace("    </div>\n  );\n};", modal_render, 1)

with open('frontend/src/components/equipment/RentalRecordCard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: frontend/src/components/equipment/RentalRecordCard.tsx updated")

