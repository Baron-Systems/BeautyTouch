const API_URL = import.meta.env.VITE_API_URL || '/api'

async function fetchJSON(path, options = {}) {
  const url = `${API_URL}${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Categories
  getCategories: () => fetchJSON('/categories'),
  getCategory: (slug) => fetchJSON(`/categories/${slug}`),

  // Products
  getProducts: () => fetchJSON('/products'),
  getProduct: (id) => fetchJSON(`/products/${id}`),
  createProduct: (product) => fetchJSON('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id, product) => fetchJSON(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id) => fetchJSON(`/products/${id}`, { method: 'DELETE' }),
  toggleProduct: (id) => fetchJSON(`/products/${id}/toggle`, { method: 'PATCH' }),

  // Orders
  createOrder: (order) => fetchJSON('/orders', { method: 'POST', body: JSON.stringify(order) }),
  getOrdersByPhone: (phone) => fetchJSON(`/orders/phone/${encodeURIComponent(phone)}`),
  getOrder: (id) => fetchJSON(`/orders/${id}`),
  updateOrderStatus: (id, status) => fetchJSON(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  toggleOrder: (id) => fetchJSON(`/orders/${id}/toggle`, { method: 'PATCH' }),

  // Admin
  loginAdmin: (password) => fetchJSON('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  checkAdmin: (token) => fetchJSON('/admin/check', { headers: { Authorization: `Bearer ${token}` } }),
  changeAdminPassword: (currentPassword, newPassword) =>
    fetchJSON('/admin/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: { Authorization: `Bearer ${localStorage.getItem('beauty_touch_admin_token')}` },
    }),
  getAdminOrders: () => fetchJSON('/admin/orders'),
  getAdminStats: () => fetchJSON('/admin/stats'),
  updateSetting: (key, value) =>
    fetchJSON(`/admin/settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),

  // Settings
  getSetting: (key) => fetchJSON(`/settings/${key}?_t=${Date.now()}`),
}
