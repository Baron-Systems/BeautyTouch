import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.static(path.join(__dirname, '../dist')))

const PORT = 4001

// In-memory data — mirrors the real seed in database.js
let _categories = [
  { id: 1, slug: 'injections', name: 'الحقن التجميلية', sortOrder: 0, isActive: 1, subcategories: JSON.stringify([{ id: 'sub-filler', name: 'فيلر', slug: 'filler' }, { id: 'sub-botox', name: 'بوتكس', slug: 'botox' }, { id: 'sub-skinbooster', name: 'سكين بوستر', slug: 'skinbooster' }, { id: 'sub-mesotherapy', name: 'ميزوثيرابي', slug: 'mesotherapy' }, { id: 'sub-collagen', name: 'محفزات الكولاجين', slug: 'collagen' }]) },
  { id: 2, slug: 'skincare', name: 'العناية بالبشرة', sortOrder: 1, isActive: 1, subcategories: null },
  { id: 3, slug: 'creams', name: 'الكريمات والسيرومات', sortOrder: 2, isActive: 1, subcategories: null },
  { id: 4, slug: 'devices', name: 'أجهزة التجميل', sortOrder: 3, isActive: 1, subcategories: null },
  { id: 5, slug: 'face-masks', name: 'ماسكات الوجه', sortOrder: 4, isActive: 1, subcategories: null },
  { id: 6, slug: 'eye-care', name: 'العناية بمحيط العين', sortOrder: 5, isActive: 1, subcategories: null },
  { id: 7, slug: 'face-wash', name: 'غسولات الوجه', sortOrder: 6, isActive: 1, subcategories: null },
]

let _products = [
  { id: 1, name: 'فيلر شفاه Restylane Kysse', category: 'injections', subcategory: 'filler', brand: null, price: 450, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop', description: 'فيلر شفاه فاخر يمنح شفتيك حجماً طبيعياً وجاذبية. يدوم لمدة 12 شهراً.', isBestSeller: 1, isNew: 0, isActive: 1, sortOrder: 0 },
  { id: 2, name: 'بوتكس Allergan Botox', category: 'injections', subcategory: 'botox', brand: null, price: 380, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop', description: 'علاج البوتكس للتجاعيد بتركيبة أصلية من شركة أليرجان الأمريكية.', isBestSeller: 1, isNew: 0, isActive: 1, sortOrder: 1 },
  { id: 3, name: 'سكين بوستر Profhilo', category: 'injections', subcategory: 'skinbooster', brand: null, price: 520, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', description: 'محفز طبيعي للكولاجين لبشرة نضرة وشابة. 5 نقاط تقنية للحقن.', isBestSeller: 1, isNew: 0, isActive: 1, sortOrder: 2 },
  { id: 4, name: 'ميزوثيرابي Mesoestetic', category: 'injections', subcategory: 'mesotherapy', brand: null, price: 290, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop', description: 'كوكتيل فيتامينات وأحماض أمينية لتفتيح البشرة وعلاج التصبغات.', isBestSeller: 0, isNew: 1, isActive: 1, sortOrder: 3 },
  { id: 5, name: 'محفز كولاجين Sculptra', category: 'injections', subcategory: 'collagen', brand: null, price: 650, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop', description: 'يعيد بناء الكولاجين الطبيعي للوجه تدريجياً. نتائج تظهر خلال 3 أشهر.', isBestSeller: 0, isNew: 1, isActive: 1, sortOrder: 4 },
  { id: 6, name: 'كريم فيتامين C La Roche-Posay', category: 'skincare', subcategory: null, brand: null, price: 185, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', description: 'مضاد أكسدة قوي يحمي البشرة من الشيخوخة المبكرة ويخفف البقع الداكنة.', isBestSeller: 1, isNew: 0, isActive: 1, sortOrder: 0 },
  { id: 7, name: 'سيروم حمض الهيالورونيك PCA Skin', category: 'skincare', subcategory: null, brand: null, price: 240, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=400&fit=crop', description: 'ترطيب عميق للبشرة الجافة والحساسة. خالي من العطور والبارابين.', isBestSeller: 0, isNew: 1, isActive: 1, sortOrder: 1 },
  { id: 8, name: 'سيروم C E Ferulic SkinCeuticals', category: 'skincare', subcategory: null, brand: null, price: 320, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&h=400&fit=crop', description: 'التركيبة الذهبية لحماية البشرة من الأشعة فوق البنفسجية والشوارد الحرة.', isBestSeller: 1, isNew: 0, isActive: 1, sortOrder: 2 },
  { id: 9, name: 'كريم ريتينول Teoxane', category: 'creams', subcategory: null, brand: null, price: 210, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop', description: 'تجديد خلايا البشرة أثناء النوم. يقلل الخطوط الدقيقة ويعالج آثار حب الشباب.', isBestSeller: 0, isNew: 0, isActive: 1, sortOrder: 0 },
  { id: 10, name: 'مرطب فيلر Juvederm Hydrate', category: 'creams', subcategory: null, brand: null, price: 175, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&h=400&fit=crop', description: 'مرطب عميق يحتوي على حمض الهيالورونيك النقي لترطيب يدوم 24 ساعة.', isBestSeller: 0, isNew: 1, isActive: 1, sortOrder: 1 },
  { id: 11, name: 'سيروم مضاد التجاعيد PCA Skin', category: 'creams', subcategory: null, brand: null, price: 280, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400&h=400&fit=crop', description: 'كوكتيل ببتيدات متقدمة يعمل على شد البشرة وتقليل التجاعيد العميقة.', isBestSeller: 1, isNew: 0, isActive: 1, sortOrder: 2 },
  { id: 12, name: 'كريم واقي شمس Mesoestetic SPF 50+', category: 'creams', subcategory: null, brand: null, price: 195, discountedPrice: null, costPrice: null, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', description: 'حماية قصوى من الأشعة فوق البنفسجية مع مضادات أكسدة. خالي من الزيوت.', isBestSeller: 0, isNew: 1, isActive: 1, sortOrder: 3 },
]

function mapProduct(p) {
  return { ...p, isBestSeller: !!p.isBestSeller, isNew: !!p.isNew, isActive: p.isActive !== 0, sortOrder: p.sortOrder ?? 0 }
}

function mapAdminProduct(p) {
  return { ...p, isBestSeller: !!p.isBestSeller, isNew: !!p.isNew, isActive: p.isActive !== 0, sortOrder: p.sortOrder ?? 0 }
}

// Categories
app.get('/api/categories', (_req, res) => {
  res.json(_categories.map(c => ({ ...c, subcategories: c.subcategories ? JSON.parse(c.subcategories) : null, isActive: c.isActive !== 0 })).sort((a, b) => a.sortOrder - b.sortOrder))
})

app.get('/api/categories/:slug', (req, res) => {
  const row = _categories.find(c => c.slug === req.params.slug)
  if (!row) return res.status(404).json({ error: 'Category not found' })
  res.json({ ...row, subcategories: row.subcategories ? JSON.parse(row.subcategories) : null, isActive: row.isActive !== 0 })
})

app.put('/api/admin/categories/:id', (req, res) => {
  const cat = _categories.find(c => c.id === Number(req.params.id))
  if (!cat) return res.status(404).json({ error: 'Category not found' })
  const { name, slug, subcategories, sortOrder, isActive } = req.body
  cat.name = name
  cat.slug = slug
  cat.subcategories = subcategories ?? cat.subcategories
  cat.sortOrder = sortOrder ?? cat.sortOrder
  cat.isActive = isActive !== false ? 1 : 0
  res.json({ success: true })
})

app.patch('/api/admin/categories/:id/toggle', (req, res) => {
  const cat = _categories.find(c => c.id === Number(req.params.id))
  if (!cat) return res.status(404).json({ error: 'Category not found' })
  cat.isActive = cat.isActive ? 0 : 1
  res.json({ isActive: cat.isActive === 1 })
})

app.get('/api/admin/export', (_req, res) => {
  res.json({ categories: _categories, products: _products })
})

app.post('/api/admin/import', (_req, res) => {
  res.json({ success: true })
})

// Products
app.get('/api/products', (_req, res) => {
  res.json(_products.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map(mapProduct))
})

app.get('/api/products/:id', (req, res) => {
  const row = _products.find(p => p.id === Number(req.params.id))
  if (!row) return res.status(404).json({ error: 'Product not found' })
  res.json(mapProduct(row))
})

app.get('/api/admin/products', (_req, res) => {
  res.json(_products.sort((a, b) => a.sortOrder - b.sortOrder).map(mapAdminProduct))
})

app.get('/api/admin/products/:id', (req, res) => {
  const row = _products.find(p => p.id === Number(req.params.id))
  if (!row) return res.status(404).json({ error: 'Product not found' })
  res.json(mapAdminProduct(row))
})

app.post('/api/products', (req, res) => {
  const { name, category, subcategory, brand, price, discountedPrice, costPrice, image, description, isBestSeller, isNew, isActive } = req.body
  const newId = Math.max(0, ..._products.map(p => p.id)) + 1
  // Auto-calculate sortOrder: max in same category + 1
  const catProducts = _products.filter(p => p.category === category)
  const maxSort = catProducts.length > 0 ? Math.max(...catProducts.map(p => p.sortOrder ?? 0)) : -1
  const newProduct = {
    id: newId, name, category, subcategory: subcategory || null, brand: brand || null,
    price: Number(price), discountedPrice: discountedPrice ? Number(discountedPrice) : null,
    costPrice: costPrice ? Number(costPrice) : null, image: image || '', description: description || '',
    isBestSeller: isBestSeller ? 1 : 0, isNew: isNew ? 1 : 0, isActive: isActive !== false ? 1 : 0,
    sortOrder: maxSort + 1,
  }
  _products.push(newProduct)
  res.status(201).json({ id: newId })
})

app.put('/api/products/:id', (req, res) => {
  const idx = _products.findIndex(p => p.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Product not found' })
  const { name, category, subcategory, brand, price, discountedPrice, costPrice, image, description, isBestSeller, isNew, isActive } = req.body
  const oldCategory = _products[idx].category
  let newSortOrder = _products[idx].sortOrder
  // If category changed, auto-assign sortOrder = max in new category + 1
  if (category !== oldCategory) {
    const catProducts = _products.filter(p => p.category === category && p.id !== _products[idx].id)
    const maxSort = catProducts.length > 0 ? Math.max(...catProducts.map(p => p.sortOrder ?? 0)) : -1
    newSortOrder = maxSort + 1
  }
  _products[idx] = { ..._products[idx], name, category, subcategory: subcategory || null, brand: brand || null, price: Number(price), discountedPrice: discountedPrice ? Number(discountedPrice) : null, costPrice: costPrice ? Number(costPrice) : null, image: image || '', description: description || '', isBestSeller: isBestSeller ? 1 : 0, isNew: isNew ? 1 : 0, isActive: isActive !== false ? 1 : 0, sortOrder: newSortOrder }
  res.json({ success: true })
})

app.delete('/api/products/:id', (req, res) => {
  _products = _products.filter(p => p.id !== Number(req.params.id))
  res.json({ success: true })
})

app.patch('/api/products/:id/toggle', (req, res) => {
  const idx = _products.findIndex(p => p.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Product not found' })
  const newVal = _products[idx].isActive ? 0 : 1
  _products[idx].isActive = newVal
  res.json({ isActive: newVal === 1 })
})

// Reorder
app.post('/api/admin/reorder/categories', (req, res) => {
  const { ids } = req.body
  ids.forEach((id, index) => {
    const cat = _categories.find(c => c.id === id)
    if (cat) cat.sortOrder = index
  })
  res.json({ success: true })
})

app.post('/api/admin/reorder/products', (req, res) => {
  const { ids } = req.body
  ids.forEach((id, index) => {
    const prod = _products.find(p => p.id === id)
    if (prod) prod.sortOrder = index
  })
  res.json({ success: true })
})

app.post('/api/admin/move-product', (req, res) => {
  const { productId, category, subcategory, sortOrder } = req.body
  const idx = _products.findIndex(p => p.id === Number(productId))
  if (idx === -1) return res.status(404).json({ error: 'Product not found' })
  _products[idx].category = category
  _products[idx].subcategory = subcategory || null
  _products[idx].sortOrder = sortOrder ?? 0
  res.json({ success: true })
})

// Admin auth
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body
  if (password === 'medical2025' || password === 'baronadmin') {
    res.json({ success: true, token: 'beauty-touch-admin-token' })
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' })
  }
})

app.get('/api/admin/check', (req, res) => {
  const auth = req.headers.authorization
  if (auth === 'Bearer beauty-touch-admin-token') {
    res.json({ authenticated: true })
  } else {
    res.status(401).json({ authenticated: false })
  }
})

app.patch('/api/admin/password', (req, res) => {
  res.json({ success: true })
})

// Settings
app.get('/api/settings/:key', (req, res) => {
  res.json({ value: '' })
})

app.patch('/api/admin/settings/:key', (req, res) => {
  res.json({ success: true })
})

// Brands
let _brands = [
  { id: 1, name: 'La Roche-Posay' },
  { id: 2, name: 'SkinCeuticals' },
  { id: 3, name: 'PCA Skin' },
  { id: 4, name: 'Mesoestetic' },
  { id: 5, name: 'Restylane' },
  { id: 6, name: 'Juvederm' },
  { id: 7, name: 'Allergan' },
]

app.get('/api/brands', (_req, res) => {
  res.json(_brands)
})

app.get('/api/brands/:id', (req, res) => {
  const brand = _brands.find(b => b.id === Number(req.params.id))
  if (!brand) return res.status(404).json({ error: 'Brand not found' })
  const brandProducts = _products.filter(p => p.brand === brand.name && p.isActive)
  res.json({ ...brand, products: brandProducts.map(mapProduct) })
})

app.post('/api/admin/brands', (req, res) => {
  const { name, logo } = req.body
  const newId = Math.max(0, ..._brands.map(b => b.id)) + 1
  const brand = { id: newId, name, logo: logo || null }
  _brands.push(brand)
  res.status(201).json({ id: newId, name, logo: logo || null })
})

app.put('/api/admin/brands/:id', (req, res) => {
  const brand = _brands.find(b => b.id === Number(req.params.id))
  if (!brand) return res.status(404).json({ error: 'Brand not found' })
  brand.name = req.body.name
  if ('logo' in req.body) {
    brand.logo = req.body.logo || null
  }
  res.json({ success: true })
})

app.delete('/api/admin/brands/:id', (req, res) => {
  _brands = _brands.filter(b => b.id !== Number(req.params.id))
  res.json({ success: true })
})

// Delivery areas
let _deliveryAreas = [
  { id: 1, area_name: 'القدس', delivery_price: 20, isActive: 1 },
  { id: 2, area_name: 'رام الله', delivery_price: 25, isActive: 1 },
]

app.get('/api/delivery-areas', (_req, res) => {
  res.json(_deliveryAreas.filter(a => a.isActive))
})

app.post('/api/admin/delivery-areas', (req, res) => {
  const newId = Math.max(0, ..._deliveryAreas.map(a => a.id)) + 1
  _deliveryAreas.push({ id: newId, ...req.body, isActive: 1 })
  res.status(201).json({ id: newId })
})

app.put('/api/admin/delivery-areas/:id', (req, res) => {
  const area = _deliveryAreas.find(a => a.id === Number(req.params.id))
  if (!area) return res.status(404).json({ error: 'Area not found' })
  Object.assign(area, req.body)
  res.json({ success: true })
})

app.delete('/api/admin/delivery-areas/:id', (req, res) => {
  _deliveryAreas = _deliveryAreas.filter(a => a.id !== Number(req.params.id))
  res.json({ success: true })
})

// Orders
let _orders = []

app.post('/api/orders', (req, res) => {
  const newId = Math.max(0, ..._orders.map(o => o.id)) + 1
  const order = { id: newId, ...req.body, status: 'pending', created_at: new Date().toISOString() }
  _orders.push(order)
  res.status(201).json({ id: newId })
})

app.get('/api/orders/phone/:phone', (req, res) => {
  res.json(_orders.filter(o => o.phone === req.params.phone))
})

app.get('/api/orders/:id', (req, res) => {
  const order = _orders.find(o => o.id === Number(req.params.id))
  if (!order) return res.status(404).json({ error: 'Order not found' })
  res.json(order)
})

app.get('/api/admin/orders', (_req, res) => {
  res.json(_orders)
})

app.patch('/api/orders/:id/status', (req, res) => {
  const order = _orders.find(o => o.id === Number(req.params.id))
  if (!order) return res.status(404).json({ error: 'Order not found' })
  order.status = req.body.status
  res.json({ success: true })
})

app.patch('/api/orders/:id/toggle', (req, res) => {
  const order = _orders.find(o => o.id === Number(req.params.id))
  if (!order) return res.status(404).json({ error: 'Order not found' })
  order.isActive = order.isActive ? 0 : 1
  res.json({ success: true })
})

app.get('/api/admin/stats', (_req, res) => {
  res.json({ totalOrders: _orders.length, pending: _orders.filter(o => o.status === 'pending').length, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0, totalProducts: _products.length, activeProducts: _products.filter(p => p.isActive).length, totalRevenue: 0, revenuePending: 0, revenueConfirmed: 0, revenueShipped: 0, revenueDelivered: 0, revenueCancelled: 0 })
})

app.get('/api/admin/profits-report', (_req, res) => {
  res.json({ total: 0, count: 0, byStatus: [], orders: [] })
})

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' })
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TEST SERVER running on http://0.0.0.0:${PORT}`)
})
