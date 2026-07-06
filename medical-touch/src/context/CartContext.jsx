import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { storage } from '../services/storage.js'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => storage.getCart())
  const [wishlist, setWishlist] = useState(() => storage.getWishlist())

  useEffect(() => {
    storage.saveCart(cartItems)
  }, [cartItems])

  const addToCart = useCallback((productId, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { productId, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCartItems([])
    storage.clearCart()
  }, [])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const toggleWishlist = useCallback((productId) => {
    const updated = storage.toggleWishlist(productId)
    setWishlist([...updated])
  }, [])

  const isInWishlist = useCallback((productId) => wishlist.includes(productId), [wishlist])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
