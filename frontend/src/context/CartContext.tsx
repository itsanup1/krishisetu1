import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!user || user.role !== 'FARMER') {
      setCart([]);
      return;
    }
    try {
      setIsLoading(true);
      const items = await api.getCart();
      setCart(items);
    } catch (e) {
      console.error('Error fetching cart', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      setIsLoading(true);
      await api.addToCart(productId, quantity);
      await refreshCart();
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    try {
      await api.updateCartItem(cartItemId, quantity);
      await refreshCart();
    } catch (e) {
      console.error('Error updating cart item', e);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      await api.deleteCartItem(cartItemId);
      await refreshCart();
    } catch (e) {
      console.error('Error removing from cart', e);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await api.clearCart();
      setCart([]);
    } catch (e) {
      console.error('Error clearing cart', e);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        totalAmount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

