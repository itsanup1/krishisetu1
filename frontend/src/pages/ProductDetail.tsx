import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  Package,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await api.getProduct(parseInt(id, 10));
        setProduct(data);
      } catch (e) {
        console.error('Error fetching product detail', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async (goToCart = false) => {
    if (!product || product.stock <= 0) return;
    await addToCart(product.id, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    if (goToCart) {
      navigate('/cart');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading product information..." />;
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-4">The agricultural item you requested could not be located.</p>
        <Link to="/products">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const isFarmer = !user || user.role === 'FARMER';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-xl border border-slate-200 p-5 sm:p-7 shadow-2xs">
        {/* Product Image */}
        <div className="lg:col-span-6">
          <div className="relative rounded-lg overflow-hidden bg-slate-50 h-80 sm:h-96 border border-slate-200/80">
            {!imgError && product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                <Package className="w-12 h-12 text-slate-400 mb-2" />
                <span className="text-xs font-medium text-slate-500">Agri Product</span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-white/95 text-slate-800 text-[11px] font-semibold rounded shadow-2xs border border-slate-200">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details & Purchase Form */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Seller:</span>
              <span className="font-semibold text-slate-800">{product.vendor_name || 'Verified Agri Vendor'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500">Inclusive of all agricultural taxes</span>
            </div>

            {/* Stock & Availability indicator */}
            <div className="flex flex-wrap items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              {product.stock <= 0 || product.availability_status === 'OUT_OF_STOCK' ? (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Out of Stock (0 units available)
                </span>
              ) : product.stock <= 10 || product.availability_status === 'LOW_STOCK' ? (
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Low Stock — {product.stock} units available for dispatch
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  In Stock ({product.stock} units available)
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
              {product.description}
            </p>
          </div>

          {/* Action form */}
          {isFarmer && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-slate-900 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    Subtotal: <strong>₹{(product.price * quantity).toLocaleString('en-IN')}</strong>
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="md"
                  variant={isAdded ? 'success' : 'primary'}
                  disabled={product.stock <= 0 || isCartLoading}
                  onClick={() => handleAddToCart(false)}
                  className="flex-1"
                  leftIcon={
                    isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />
                  }
                >
                  {isAdded ? 'Added to Cart' : 'Add to Cart'}
                </Button>

                <Button
                  size="md"
                  variant="secondary"
                  disabled={product.stock <= 0 || isCartLoading}
                  onClick={() => handleAddToCart(true)}
                  className="flex-1"
                >
                  Buy Now & Checkout
                </Button>
              </div>
            </div>
          )}

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-slate-600 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Certified Seed / Batch Tested</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct Vendor Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Razorpay Test Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
