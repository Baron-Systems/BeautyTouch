import { api } from './api.js'

const CART_KEY = 'medical_touch_cart'
const WISHLIST_KEY = 'medical_touch_wishlist'
const AUTH_TOKEN_KEY = 'medical_touch_auth_token'

export const storage = {
  // Products (API)
  getProducts: async () => {
    try {
      return await api.getProducts()
    } catch {
      return []
    }
  },
  getProductById: async (id) => {
    try {
      return await api.getProduct(id)
    } catch {
      return null
    }
  },
  addProduct: async (product) => {
    return await api.createProduct(product)
  },
  updateProduct: async (id, updates) => {
    return await api.updateProduct(id, updates)
  },
  deleteProduct: async (id) => {
    return await api.deleteProduct(id)
  },
  toggleProduct: async (id) => {
    return await api.toggleProduct(id)
  },

  // Orders (API)
  createOrder: async (order) => {
    return await api.createOrder(order)
  },
  getOrdersByPhone: async (phone) => {
    try {
      return await api.getOrdersByPhone(phone)
    } catch {
      return []
    }
  },
  getOrder: async (id) => {
    try {
      return await api.getOrder(id)
    } catch {
      return null
    }
  },
  updateOrderStatus: async (id, status) => {
    return await api.updateOrderStatus(id, status)
  },
  toggleOrder: async (id) => {
    return await api.toggleOrder(id)
  },

  // Admin stats
  getAdminStats: async () => {
    try {
      return await api.getAdminStats()
    } catch {
      return {}
    }
  },
  getAdminOrders: async () => {
    try {
      return await api.getAdminOrders()
    } catch {
      return []
    }
  },

  // Categories (API)
  getCategories: async () => {
    try {
      return await api.getCategories()
    } catch {
      return []
    }
  },

  // Cart (localStorage)
  getCart: () => {
    const data = localStorage.getItem(CART_KEY)
    if (!data) return []
    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  },
  saveCart: (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  },
  addToCart: (productId, quantity = 1) => {
    const cart = storage.getCart()
    const existing = cart.find((item) => item.productId === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ productId, quantity })
    }
    storage.saveCart(cart)
    return cart
  },
  removeFromCart: (productId) => {
    const cart = storage.getCart().filter((item) => item.productId !== productId)
    storage.saveCart(cart)
    return cart
  },
  updateCartQuantity: (productId, quantity) => {
    const cart = storage.getCart()
    const item = cart.find((i) => i.productId === productId)
    if (item) {
      if (quantity <= 0) {
        return storage.removeFromCart(productId)
      }
      item.quantity = quantity
      storage.saveCart(cart)
    }
    return cart
  },
  clearCart: () => {
    localStorage.removeItem(CART_KEY)
  },

  // Wishlist (localStorage)
  getWishlist: () => {
    const data = localStorage.getItem(WISHLIST_KEY)
    if (!data) return []
    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  },
  toggleWishlist: (productId) => {
    const wishlist = storage.getWishlist()
    const idx = wishlist.indexOf(productId)
    if (idx >= 0) {
      wishlist.splice(idx, 1)
    } else {
      wishlist.push(productId)
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
    return wishlist
  },
  isInWishlist: (productId) => {
    return storage.getWishlist().includes(productId)
  },

  // Auth (API + localStorage token)
  isAdmin: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY)
  },
  getAuthToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  },
  loginAdmin: async (password) => {
    try {
      const res = await api.loginAdmin(password)
      if (res.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.token)
        return true
      }
    } catch {
      // ignore
    }
    return false
  },
  changeAdminPassword: async (currentPassword, newPassword) => {
    try {
      await api.changeAdminPassword(currentPassword, newPassword)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },
  logoutAdmin: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  },

  // Settings (API)
  getSetting: async (key) => {
    try {
      return await api.getSetting(key)
    } catch {
      return { value: '' }
    }
  },
  updateSetting: async (key, value) => {
    try {
      return await api.updateSetting(key, value)
    } catch (err) {
      return { success: false, error: err.message }
    }
  },
}
