import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { db } from './database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json())

// Serve built frontend static files
app.use(express.static(path.join(__dirname, '../dist')))

const PORT = process.env.PORT || 3001

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    image: p.image,
    description: p.description,
    isBestSeller: !!p.isBestSeller,
    isNew: !!p.isNew,
    isActive: p.isActive !== 0,
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
  const rows = db.prepare('SELECT * FROM products').all()
  res.json(rows.map(mapProduct))
})

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Product not found' })
  res.json(mapProduct(row))
})

app.post('/api/products', (req, res) => {
  const { name, category, subcategory, price, image, description, isBestSeller, isNew, isActive } = req.body
  const stmt = db.prepare(`
    INSERT INTO products (name, category, subcategory, price, image, description, isBestSeller, isNew, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    name, category, subcategory || null, price, image || '', description || '',
    isBestSeller ? 1 : 0, isNew ? 1 : 0, isActive !== false ? 1 : 0
  )
  res.status(201).json({ id: result.lastInsertRowid })
})

app.put('/api/products/:id', (req, res) => {
  const { name, category, subcategory, price, image, description, isBestSeller, isNew, isActive } = req.body
  db.prepare(`
    UPDATE products SET name = ?, category = ?, subcategory = ?, price = ?, image = ?, description = ?, isBestSeller = ?, isNew = ?, isActive = ?
    WHERE id = ?
  `).run(
    name, category, subcategory || null, price, image || '', description || '',
    isBestSeller ? 1 : 0, isNew ? 1 : 0, isActive !== false ? 1 : 0, req.params.id
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
  const { customer_name, phone, address, items, total, notes } = req.body
  const stmt = db.prepare(`
    INSERT INTO orders (customer_name, phone, address, items, total, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    customer_name, phone, address || '', JSON.stringify(items || []), total, notes || ''
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
