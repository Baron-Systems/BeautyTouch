const API_URL = import.meta.env.VITE_API_URL || '/api'

async function fetchJSON(path, options = {}) {
  const url = `${API_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  const res = await fetch(url, {
    ...options,
    headers,
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
  updateCategory: (id, data) =>
    fetchJSON(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  toggleCategory: (id) =>
    fetchJSON(`/admin/categories/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),

  // Products
  getProducts: () => fetchJSON('/products'),
  getProduct: (id) => fetchJSON(`/products/${id}`),
  getAdminProducts: () =>
    fetchJSON('/admin/products', {
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  getAdminProduct: (id) =>
    fetchJSON(`/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  createProduct: (product) =>
    fetchJSON('/products', {
      method: 'POST',
      body: JSON.stringify(product),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  updateProduct: (id, product) =>
    fetchJSON(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  deleteProduct: (id) => fetchJSON(`/products/${id}`, { method: 'DELETE' }),
  toggleProduct: (id) => fetchJSON(`/products/${id}/toggle`, { method: 'PATCH' }),
  reorderCategories: (ids) =>
    fetchJSON('/admin/reorder/categories', {
      method: 'POST',
      body: JSON.stringify({ ids }),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  reorderProducts: (ids) =>
    fetchJSON('/admin/reorder/products', {
      method: 'POST',
      body: JSON.stringify({ ids }),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  moveProduct: (productId, category, subcategory, sortOrder) =>
    fetchJSON('/admin/move-product', {
      method: 'POST',
      body: JSON.stringify({ productId, category, subcategory, sortOrder }),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),

  // Orders
  createOrder: (order) => fetchJSON('/orders', { method: 'POST', body: JSON.stringify(order) }),
  getOrdersByPhone: (phone) => fetchJSON(`/orders/phone/${encodeURIComponent(phone)}`),
  getOrder: (id) => fetchJSON(`/orders/${id}`),
  updateOrderStatus: (id, status) => fetchJSON(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  toggleOrder: (id) => fetchJSON(`/orders/${id}/toggle`, { method: 'PATCH' }),

  // Admin
  loginAdmin: (password) => fetchJSON('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  checkAdmin: (token) => fetchJSON('/admin/check', { headers: { Authorization: `Bearer ${token}` } }),
  importDatabase: async (file) => {
    const url = `${API_URL}/admin/import`
    const res = await fetch(url, {
      method: 'POST',
      body: file,
      headers: {
        'Content-Type': 'application/octet-stream',
        Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}`,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${res.status}`)
    }
    return res.json()
  },
  changeAdminPassword: (currentPassword, newPassword) =>
    fetchJSON('/admin/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: { Authorization: `Bearer ${localStorage.getItem('beauty_touch_admin_token')}` },
    }),
  getAdminOrders: () => fetchJSON('/admin/orders'),
  getAdminStats: () => fetchJSON('/admin/stats'),
  getAdminProfitsReport: (from, to) => {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    const query = params.toString()
    return fetchJSON(`/admin/profits-report${query ? `?${query}` : ''}`)
  },
  updateSetting: (key, value) =>
    fetchJSON(`/admin/settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),

  // Settings
  getSetting: (key) => fetchJSON(`/settings/${key}?_t=${Date.now()}`),

  // Delivery Areas
  getDeliveryAreas: () => fetchJSON('/delivery-areas'),
  createDeliveryArea: (area) =>
    fetchJSON('/admin/delivery-areas', {
      method: 'POST',
      body: JSON.stringify(area),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  updateDeliveryArea: (id, area) =>
    fetchJSON(`/admin/delivery-areas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(area),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  deleteDeliveryArea: (id) =>
    fetchJSON(`/admin/delivery-areas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),

  // Brands
  getBrands: () => fetchJSON('/brands'),
  getBrand: (id) => fetchJSON(`/brands/${id}`),
  createBrand: (data) =>
    fetchJSON('/admin/brands', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  updateBrand: (id, data) =>
    fetchJSON(`/admin/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
  deleteBrand: (id) =>
    fetchJSON(`/admin/brands/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('medical_touch_auth_token')}` },
    }),
}
