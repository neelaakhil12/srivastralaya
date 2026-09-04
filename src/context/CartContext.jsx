import React, { createContext, useContext, useState, useEffect } from 'react';

import { getStoreConfig, saveStoreConfig } from '../services/supabase';

import { useAuth } from './AuthContext';

const CartContext = createContext();

export const syncShippingFromCloud = async () => {
  try {
    const config = await getStoreConfig();
    if (config && config.shipping) {
      const merged = {
        standardShippingFee: Number(config.shipping.standardShippingFee ?? 80),
        freeShippingThreshold: Number(config.shipping.freeShippingThreshold ?? 2000),
        enableFreeShipping: Boolean(config.shipping.enableFreeShipping ?? true),
        enableCOD: config.shipping.enableCOD === false ? false : Boolean(config.shipping.enableCOD),
        deliveryNote: config.shipping.deliveryNote || 'Fast Shipping Across India'
      };
      localStorage.setItem('sv_shipping_settings', JSON.stringify(merged));
      window.dispatchEvent(new Event('sv_shipping_updated'));
      return merged;
    }
  } catch (e) {
    console.warn('syncShippingFromCloud error:', e);
  }
  return null;
};

export const getShippingSettings = () => {
  try {
    const raw = localStorage.getItem('sv_shipping_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        standardShippingFee: Number(parsed.standardShippingFee ?? 80),
        freeShippingThreshold: Number(parsed.freeShippingThreshold ?? 2000),
        enableFreeShipping: Boolean(parsed.enableFreeShipping ?? true),
        enableCOD: parsed.enableCOD === false ? false : Boolean(parsed.enableCOD),
        deliveryNote: parsed.deliveryNote || 'Fast Shipping Across India'
      };
    }
  } catch (e) {}
  return {
    standardShippingFee: 80,
    freeShippingThreshold: 2000,
    enableFreeShipping: true,
    enableCOD: false,
    deliveryNote: '3 - 4 days delivery'
  };
};

export const saveShippingSettings = async (settings) => {
  try {
    localStorage.setItem('sv_shipping_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('sv_shipping_updated'));
    await saveStoreConfig({ shipping: settings });
    return true;
  } catch (e) {
    console.error('Failed to save shipping settings:', e);
    return false;
  }
};

export const CartProvider = ({ children }) => {
  const { isLoggedIn, openAuthModal } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('sv_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [shippingConfig, setShippingConfig] = useState(getShippingSettings);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync fresh config from Supabase cloud on mount
  useEffect(() => {
    syncShippingFromCloud().then(cloudSettings => {
      if (cloudSettings) setShippingConfig(cloudSettings);
    });
  }, []);

  // When cart drawer opens, ensure fresh cloud settings are applied
  useEffect(() => {
    if (isCartOpen) {
      syncShippingFromCloud().then(cloudSettings => {
        if (cloudSettings) setShippingConfig(cloudSettings);
      });
    }
  }, [isCartOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('sv_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  useEffect(() => {
    const handleShippingUpdate = () => {
      setShippingConfig(getShippingSettings());
    };
    window.addEventListener('sv_shipping_updated', handleShippingUpdate);
    return () => window.removeEventListener('sv_shipping_updated', handleShippingUpdate);
  }, []);

  const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null) => {
    if (!isLoggedIn) {
      if (openAuthModal) openAuthModal();
      return false;
    }

    setCartItems(prev => {
      const itemKey = `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`;
      const existingIndex = prev.findIndex(item => item.itemKey === itemKey);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            ...product,
            itemKey,
            quantity,
            selectedColor,
            selectedSize
          }
        ];
      }
    });

    showToast(`Added "${product.name}" to your cart!`);
    return true;
  };

  const removeFromCart = (itemKey) => {
    setCartItems(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCartItems(prev => prev.map(item => item.itemKey === itemKey ? { ...item, quantity: newQuantity } : item));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const standardShippingFee = Number(shippingConfig.standardShippingFee ?? 99);
  const freeShippingThreshold = Number(shippingConfig.freeShippingThreshold ?? 2000);
  const enableFreeShipping = Boolean(shippingConfig.enableFreeShipping ?? true);
  const enableCOD = Boolean(shippingConfig.enableCOD ?? true);

  const isFreeShipping = standardShippingFee === 0 || (enableFreeShipping && subtotal >= freeShippingThreshold);
  const currentShippingCharge = isFreeShipping ? 0 : standardShippingFee;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItemsCount,
      subtotal,
      shippingConfig,
      standardShippingFee,
      currentShippingCharge,
      freeShippingThreshold,
      enableFreeShipping,
      enableCOD,
      isFreeShipping,
      amountNeededForFreeShipping,
      toastMessage,
      showToast
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
