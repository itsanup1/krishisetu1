import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Check, Package } from 'lucide-react';
import { Button } from '../common/Button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isLoading } = useCart();
  const { user } = useAuth();
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    await addToCart(product.id, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'SEEDS':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'FERTILIZER':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PESTICIDE':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'IRRIGATION':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'SPRAYER':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getAvailabilityStatus = () => {
    if (product.stock <= 0 || product.availability_status === 'OUT_OF_STOCK') {
      return {
        label: 'Out of Stock',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (product.stock <= 10 || product.availability_status === 'LOW_STOCK') {
      return {
        label: `Low Stock (${product.stock} left)`,
        className: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return {
      label: `In Stock (${product.stock} units)`,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  };

  const availability = getAvailabilityStatus();
  const isFarmer = !user || user.role === 'FARMER';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:border-slate-300 hover:shadow-sm transition flex flex-col group">
      {/* Image container */}
      <Link to={`/products/${product.id}`} className="relative block h-48 overflow-hidden bg-slate-50">
        {!imgError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
            <Package className="w-8 h-8 text-slate-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-500">Agri Product</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5">
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase border shadow-2xs ${getCategoryBadge(
              product.category
            )}`}
          >
            {product.category}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border shadow-2xs ${availability.className}`}
          >
            {availability.label}
          </span>
        </div>

        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-xs">
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] text-slate-500 mb-1 truncate font-medium">
            Seller: <span className="text-slate-700 font-semibold">{product.vendor_name || 'Verified Agro Vendor'}</span>
          </p>
          <Link
            to={`/products/${product.id}`}
            className="text-sm font-bold text-slate-900 hover:text-emerald-700 line-clamp-2 transition mb-1.5 leading-snug"
          >
            {product.name}
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Price</span>
            <span className="text-base font-bold text-slate-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {isFarmer && (
            <Button
              size="sm"
              variant={isAdded ? 'success' : 'primary'}
              disabled={product.stock <= 0 || isLoading}
              onClick={handleAddToCart}
              leftIcon={
                isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />
              }
            >
              {isAdded ? 'Added' : 'Add to Cart'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
