import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { RazorpayCheckoutModal } from '../components/common/RazorpayCheckoutModal';
import { EmptyState } from '../components/common/EmptyState';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Truck,
  Building,
} from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.location || 'Plot #42, Nashik Agro Hub');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Razorpay Checkout Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    orderId: number;
    razorpayOrderId: string;
    amount: number;
  } | null>(null);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8 text-emerald-600" />}
          title="Your Agro Cart is Empty"
          description="Browse our high-quality certified seeds, fertilizers, and eco-friendly pesticides to stock up for the harvest season."
          actionLabel="Explore Marketplace"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  const handleInitiateCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please provide a delivery address.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Generate Razorpay order
      const rzpOrder = await api.createRazorpayOrder(totalAmount);
      const rzpId = rzpOrder?.id || `order_test_${Date.now()}`;

      // 2. Create order on backend with linked Razorpay ID
      const order = await api.createOrder({
        delivery_address: deliveryAddress,
        razorpay_order_id: rzpId,
        items: cart.map((c) => ({
          product_id: c.product?.id || c.product_id,
          quantity: c.quantity,
          price_at_purchase: c.product?.price || 0,
        })),
      });

      // 3. Open Razorpay test gateway
      setPaymentDetails({
        orderId: order.id,
        razorpayOrderId: rzpId,
        amount: order.total_amount || totalAmount,
      });
      setIsPaymentModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to initialize checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    if (!paymentDetails) return;
    const targetOrderId = paymentDetails.orderId;

    try {
      setIsProcessing(true);
      // Verify payment signature on backend (or mock fallback)
      await api.verifyPayment({
        order_id: targetOrderId,
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });

      // Clear local cart & redirect to order detail
      try {
        await clearCart();
      } catch (cErr) {
        console.warn('Cart clear non-fatal error:', cErr);
      }
      setIsPaymentModalOpen(false);
      navigate(`/orders/${targetOrderId}`);
    } catch (err: any) {
      setError('Payment verification failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your selected seeds, fertilizers, and pesticides ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl p-4 mb-6 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs divide-y divide-slate-100">
            {cart.map((item, idx) => {
              const prod = item.product;
              const unitPrice = prod?.price || 0;
              return (
              <div key={item.id || prod?.id || idx} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={prod?.image_url || '/placeholder.png'}
                    alt={prod?.name || 'Agri Item'}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {prod?.category || 'INPUTS'}
                      </span>
                      {prod?.product_id && (
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          PID: {prod.product_id}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                      {prod?.name || `Product #${item.product_id}`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      ₹{unitPrice} per unit · Vendor: {prod?.vendor_name || 'Agri Vendor'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Math.min(prod?.stock ?? 999, item.quantity + 1)
                        )
                      }
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="text-right min-w-[5rem]">
                    <span className="text-sm font-black text-slate-900">
                      ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>

          {/* Farm Delivery Address Input */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" /> Farm Delivery Address
            </h3>
            <p className="text-xs text-slate-500">
              Vendor will dispatch certified inputs directly to your village, farm gate, or cooperative center.
            </p>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="e.g. Survey No. 42, Near Cooperative Society, Niphad, Nashik"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>
        </div>

        {/* Order Summary & Payment Gateway trigger */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 sticky top-24">
            <h2 className="text-base font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-slate-800">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Farmer Agri Subsidy Discount</span>
                <span className="font-semibold text-emerald-600">FREE DELIVERY</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Cess</span>
                <span className="font-semibold text-slate-800">₹0 (Exempt)</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base">
                <span className="font-black text-slate-900">Total Payable</span>
                <span className="font-black text-emerald-600">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] text-slate-600 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Razorpay Test Mode with automatic mock signature verification.</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isProcessing}
              onClick={handleInitiateCheckout}
              leftIcon={<CreditCard className="w-5 h-5" />}
            >
              Pay ₹{totalAmount.toLocaleString('en-IN')} with Razorpay
            </Button>

            <div className="text-center">
              <Link to="/products" className="text-xs text-slate-500 hover:text-emerald-600">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Test Modal */}
      {isPaymentModalOpen && paymentDetails && (
        <RazorpayCheckoutModal
          isOpen={isPaymentModalOpen}
          amount={paymentDetails.amount}
          orderId={paymentDetails.razorpayOrderId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}
    </div>
  );
};
