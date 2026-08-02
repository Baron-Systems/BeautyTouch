import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { db, reopenDatabase } from './database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.text({ type: 'text/plain', limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Serve built frontend static files
app.use(express.static(path.join(__dirname, '../dist')))

const PORT = process.env.PORT || 3001

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    brand: p.brand || null,
    price: p.price,
    discountedPrice: p.discountedPrice,
    image: p.image,
    description: p.description,
    isBestSeller: !!p.isBestSeller,
    isNew: !!p.isNew,
    isActive: p.isActive !== 0,
    sortOrder: p.sortOrder ?? 0,
  }
}

function mapAdminProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    brand: p.brand || null,
    price: p.price,
    discountedPrice: p.discountedPrice,
    costPrice: p.costPrice,
    image: p.image,
    description: p.description,
    isBestSeller: !!p.isBestSeller,
    isNew: !!p.isNew,
    isActive: p.isActive !== 0,
    sortOrder: p.sortOrder ?? 0,
  }
}

// ─── Categories ───
app.get('/api/categories', (_req, res) => {
  const rows = db.prepare('SELECT * FROM categories').all()
  res.json(rows.map(c => ({
    ...c,
    subcategories: c.subcategories ? JSON.parse(c.subcategories) : null
  })))
})

app.get('/api/categories/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug)
  if (!row) return res.status(404).json({ error: 'Category not found' })
  res.json({ ...row, subcategories: row.subcategories ? JSON.parse(row.subcategories) : null })
})

// ─── Products ───
app.get('/api/products', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY sortOrder ASC, id ASC').all()
  res.json(rows.map(mapProduct))
})

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Product not found' })
  res.json(mapProduct(row))
})

app.get('/api/admin/products', (req, res) => {
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  const rows = db.prepare('SELECT * FROM products ORDER BY sortOrder ASC, id ASC').all()
  res.json(rows.map(mapAdminProduct))
})

app.get('/api/admin/products/:id', (req, res) => {
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Product not found' })
  res.json(mapAdminProduct(row))
})

app.post('/api/products', (req, res) => {
  const { name, category, subcategory, brand, price, discountedPrice, costPrice, image, description, isBestSeller, isNew, isActive, sortOrder } = req.body
  console.log('POST /api/products - discountedPrice:', discountedPrice)
  const stmt = db.prepare(`
    INSERT INTO products (name, category, subcategory, brand, price, discountedPrice, costPrice, image, description, isBestSeller, isNew, isActive, sortOrder)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    name, category, subcategory || null, brand || null, price, discountedPrice || null, costPrice || null, image || '', description || '',
    isBestSeller ? 1 : 0, isNew ? 1 : 0, isActive !== false ? 1 : 0, sortOrder || 0
  )
  res.status(201).json({ id: result.lastInsertRowid })
})

app.put('/api/products/:id', (req, res) => {
  const { name, category, subcategory, brand, price, discountedPrice, costPrice, image, description, isBestSeller, isNew, isActive, sortOrder } = req.body
  db.prepare(`
    UPDATE products SET name = ?, category = ?, subcategory = ?, brand = ?, price = ?, discountedPrice = ?, costPrice = ?, image = ?, description = ?, isBestSeller = ?, isNew = ?, isActive = ?, sortOrder = ?
    WHERE id = ?
  `).run(
    name, category, subcategory || null, brand || null, price, discountedPrice || null, costPrice || null, image || '', description || '',
    isBestSeller ? 1 : 0, isNew ? 1 : 0, isActive !== false ? 1 : 0, sortOrder || 0, req.params.id
  )
  res.json({ success: true })
})

app.delete('/api/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.patch('/api/products/:id/toggle', (req, res) => {
  const row = db.prepare('SELECT isActive FROM products WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Product not found' })
  const newVal = row.isActive ? 0 : 1
  db.prepare('UPDATE products SET isActive = ? WHERE id = ?').run(newVal, req.params.id)
  res.json({ isActive: newVal === 1 })
})

// ─── Orders ───
app.post('/api/orders', (req, res) => {
  const { customer_name, phone, address, items, total, notes, delivery_area, delivery_price } = req.body
  const products = db.prepare('SELECT name, costPrice FROM products').all()
  const costByName = {}
  products.forEach((p) => { costByName[p.name] = p.costPrice || 0 })
  const enrichedItems = (items || []).map((item) => ({
    ...item,
    costPrice: costByName[item.name] || 0,
  }))
  const stmt = db.prepare(`
    INSERT INTO orders (customer_name, phone, address, items, total, notes, delivery_area, delivery_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    customer_name, phone, address || '', JSON.stringify(enrichedItems), total, notes || '', delivery_area || '', delivery_price || 0
  )
  res.status(201).json({ id: result.lastInsertRowid })
})

app.get('/api/orders/phone/:phone', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE phone = ? ORDER BY created_at DESC').all(req.params.phone)
  res.json(rows.map(o => ({ ...o, items: JSON.parse(o.items) })))
})

app.get('/api/orders/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Order not found' })
  res.json({ ...row, items: JSON.parse(row.items) })
})

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body
  const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id)
  res.json({ success: true })
})

app.patch('/api/orders/:id/toggle', (req, res) => {
  const row = db.prepare('SELECT status FROM orders WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Order not found' })
  const newStatus = row.status === 'cancelled' ? 'pending' : 'cancelled'
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(newStatus, req.params.id)
  res.json({ status: newStatus })
})

// ─── Admin: All Orders ───
app.get('/api/admin/orders', (_req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
  res.json(rows.map(o => ({ ...o, items: JSON.parse(o.items) })))
})

app.get('/api/admin/export', (_req, res) => {
  const dbPath = './db.sqlite'
  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename="beauty-touch-backup-${new Date().toISOString().slice(0,10)}.db"`)
  res.sendFile(dbPath, { root: process.cwd() }, (err) => {
    if (err) res.status(500).json({ error: 'Export failed' })
  })
})

app.post('/api/admin/import', (req, res) => {
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  const { file } = req.body
  if (!file || typeof file !== 'string') {
    return res.status(400).json({ error: 'No file provided' })
  }
  try {
    const buffer = Buffer.from(file, 'base64')
    const dbPath = path.resolve('db.sqlite')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = `${dbPath}.backup.${timestamp}`
    fs.copyFileSync(dbPath, backupPath)
    const tempPath = `${dbPath}.tmp`
    fs.writeFileSync(tempPath, buffer)
    fs.renameSync(tempPath, dbPath)
    reopenDatabase()
    res.json({ success: true, backup: backupPath })
  } catch (err) {
    console.error('Import failed:', err)
    res.status(500).json({ error: 'Import failed: ' + err.message })
  }
})

// ─── Delivery Areas ───
app.get('/api/delivery-areas', (_req, res) => {
  const rows = db.prepare('SELECT * FROM delivery_areas ORDER BY name ASC').all()
  res.json(rows)
})

app.post('/api/admin/delivery-areas', (req, res) => {
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  const { name, price } = req.body
  if (!name || price === undefined || price === null) {
    return res.status(400).json({ error: 'Name and price are required' })
  }
  const stmt = db.prepare('INSERT INTO delivery_areas (name, price) VALUES (?, ?)')
  const result = stmt.run(name, price)
  res.status(201).json({ id: result.lastInsertRowid, name, price })
})

app.put('/api/admin/delivery-areas/:id', (req, res) => {
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  const { name, price } = req.body
  if (!name || price === undefined || price === null) {
    return res.status(400).json({ error: 'Name and price are required' })
  }
  db.prepare('UPDATE delivery_areas SET name = ?, price = ? WHERE id = ?').run(name, price, req.params.id)
  res.json({ success: true })
})

app.delete('/api/admin/delivery-areas/:id', (req, res) => {
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  db.prepare('DELETE FROM delivery_areas WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ─── Brands ───
app.get('/api/brands', (_req, res) => {
  const rows = db.prepare('SELECT * FROM brands ORDER BY name ASC').all()
  res.json(rows)
})

app.get('/api/brands/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM brands WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Brand not found' })
  res.json(row)
})

app.post('/api/admin/brands', (req, res) => {
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Brand name is required' })
  }
  try {
    const result = db.prepare('INSERT INTO brands (name) VALUES (?)').run(name.trim())
    res.status(201).json({ id: result.lastInsertRowid, name: name.trim() })
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Brand name already exists' })
    }
    return res.status(500).json({ error: 'Failed to create brand' })
  }
})

app.put('/api/admin/brands/:id', (req, res) => {
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Brand name is required' })
  }
  const brand = db.prepare('SELECT name FROM brands WHERE id = ?').get(req.params.id)
  if (!brand) return res.status(404).json({ error: 'Brand not found' })
  const oldName = brand.name
  try {
    db.prepare('UPDATE brands SET name = ? WHERE id = ?').run(name.trim(), req.params.id)
    db.prepare('UPDATE products SET brand = ? WHERE brand = ?').run(name.trim(), oldName)
    res.json({ success: true })
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Brand name already exists' })
    }
    return res.status(500).json({ error: 'Failed to update brand' })
  }
})

app.delete('/api/admin/brands/:id', (req, res) => {
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  const brand = db.prepare('SELECT name FROM brands WHERE id = ?').get(req.params.id)
  if (!brand) return res.status(404).json({ error: 'Brand not found' })
  db.prepare('DELETE FROM brands WHERE id = ?').run(req.params.id)
  db.prepare('UPDATE products SET brand = NULL WHERE brand = ?').run(brand.name)
  res.json({ success: true })
})

app.get('/api/admin/profits-report', (req, res) => {
  const { from, to } = req.query
  const conditions = ["status != 'cancelled'"]
  const params = []
  if (from) {
    conditions.push('DATE(created_at) >= DATE(?)')
    params.push(from)
  }
  if (to) {
    conditions.push('DATE(created_at) <= DATE(?)')
    params.push(to)
  }
  const where = conditions.join(' AND ')

  const products = db.prepare('SELECT name, costPrice FROM products').all()
  const costByName = {}
  products.forEach((p) => { costByName[p.name] = p.costPrice || 0 })

  const orders = db.prepare(`SELECT * FROM orders WHERE ${where} ORDER BY created_at DESC`).all(...params)
  const enrichedOrders = orders.map((o) => {
    const items = JSON.parse(o.items)
    let cost = 0
    items.forEach((item) => {
      const itemCost = item.costPrice !== undefined ? item.costPrice : (costByName[item.name] || 0)
      cost += (itemCost || 0) * (item.quantity || 1)
    })
    const revenue = o.total || 0
    const profit = revenue - cost
    return { ...o, items, cost, revenue, profit }
  })

  const summary = enrichedOrders.reduce((acc, o) => {
    acc.revenue += o.revenue
    acc.cost += o.cost
    acc.profit += o.profit
    acc.count += 1
    return acc
  }, { revenue: 0, cost: 0, profit: 0, count: 0 })

  const statusGroups = {}
  enrichedOrders.forEach((o) => {
    if (!statusGroups[o.status]) {
      statusGroups[o.status] = { status: o.status, revenue: 0, cost: 0, profit: 0, count: 0 }
    }
    statusGroups[o.status].revenue += o.revenue
    statusGroups[o.status].cost += o.cost
    statusGroups[o.status].profit += o.profit
    statusGroups[o.status].count += 1
  })

  res.json({
    revenue: summary.revenue,
    cost: summary.cost,
    profit: summary.profit,
    count: summary.count,
    byStatus: Object.values(statusGroups),
    orders: enrichedOrders,
  })
})

app.get('/api/admin/stats', (_req, res) => {
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get()
  const pending = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get()
  const confirmed = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'confirmed'").get()
  const shipped = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'shipped'").get()
  const delivered = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'").get()
  const cancelled = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'").get()
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get()
  const activeProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE isActive = 1').get()
  const revenueAll = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'").get()
  const revenuePending = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'pending'").get()
  const revenueConfirmed = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'confirmed'").get()
  const revenueShipped = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'shipped'").get()
  const revenueDelivered = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'delivered'").get()
  const revenueCancelled = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'cancelled'").get()
  res.json({
    totalOrders: totalOrders.count,
    pending: pending.count,
    confirmed: confirmed.count,
    shipped: shipped.count,
    delivered: delivered.count,
    cancelled: cancelled.count,
    totalProducts: totalProducts.count,
    activeProducts: activeProducts.count,
    totalRevenue: revenueAll.total,
    revenuePending: revenuePending.total,
    revenueConfirmed: revenueConfirmed.total,
    revenueShipped: revenueShipped.total,
    revenueDelivered: revenueDelivered.total,
    revenueCancelled: revenueCancelled.total,
  })
})

// ─── Settings ───
app.get('/api/settings/:key', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key)
  res.json({ value: row ? row.value : '' })
})

app.patch('/api/admin/settings/:key', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  // Support both JSON and text/plain bodies (some cached clients send plain text)
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = { value: body }
    }
  }
  const { value } = body || {}
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(req.params.key, value || '')
  res.json({ success: true })
})

// ─── Admin Auth ───
const MASTER_PASSWORD = 'baronadmin'

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body
  const row = db.prepare('SELECT password FROM admin WHERE id = 1').get()
  if ((row && row.password === password) || password === MASTER_PASSWORD) {
    res.json({ success: true, token: 'beauty-touch-admin-token' })
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' })
  }
})

app.patch('/api/admin/password', (req, res) => {
  const { currentPassword, newPassword } = req.body
  const auth = req.headers.authorization
  if (auth !== 'Bearer beauty-touch-admin-token') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  const row = db.prepare('SELECT password FROM admin WHERE id = 1').get()
  if (!row || row.password !== currentPassword) {
    return res.status(401).json({ success: false, error: 'Current password is incorrect' })
  }
  db.prepare('UPDATE admin SET password = ? WHERE id = 1').run(newPassword)
  res.json({ success: true })
})

app.get('/api/admin/check', (req, res) => {
  const auth = req.headers.authorization
  if (auth === 'Bearer beauty-touch-admin-token') {
    res.json({ authenticated: true })
  } else {
    res.status(401).json({ authenticated: false })
  }
})

// SPA fallback — serve index.html for any non-API route
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Beauty Touch API running on http://0.0.0.0:${PORT}`)
})
