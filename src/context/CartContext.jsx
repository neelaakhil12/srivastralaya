import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const getShippingSettings = () => {
  try {
    const raw = localStorage.getItem('sv_shipping_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    standardShippingFee: 99,
    freeShippingThreshold: 2000,
    enableFreeShipping: true,
    deliveryNote: 'Fast Shipping Across India'
  };
};

export const saveShippingSettings = (settings) => {
  try {
    localStorage.setItem('sv_shipping_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('sv_shipping_updated'));
  } catch (e) {
    console.error('Failed to save shipping settings:', e);
  }
};

export const CartProvider = ({ children }) => {
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
