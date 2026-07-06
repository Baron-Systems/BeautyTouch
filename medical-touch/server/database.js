import Database from 'better-sqlite3'

const seedProducts = [
  { name: 'فيلر شفاه Restylane Kysse', category: 'injections', subcategory: 'filler', price: 450, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop', description: 'فيلر شفاه فاخر يمنح شفتيك حجماً طبيعياً وجاذبية. يدوم لمدة 12 شهراً.', isBestSeller: true, isNew: false },
  { name: 'بوتكس Allergan Botox', category: 'injections', subcategory: 'botox', price: 380, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop', description: 'علاج البوتكس للتجاعيد بتركيبة أصلية من شركة أليرجان الأمريكية.', isBestSeller: true, isNew: false },
  { name: 'سكين بوستر Profhilo', category: 'injections', subcategory: 'skinbooster', price: 520, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', description: 'محفز طبيعي للكولاجين لبشرة نضرة وشابة. 5 نقاط تقنية للحقن.', isBestSeller: true, isNew: false },
  { name: 'ميزوثيرابي Mesoestetic', category: 'injections', subcategory: 'mesotherapy', price: 290, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop', description: 'كوكتيل فيتامينات وأحماض أمينية لتفتيح البشرة وعلاج التصبغات.', isBestSeller: false, isNew: true },
  { name: 'محفز كولاجين Sculptra', category: 'injections', subcategory: 'collagen', price: 650, image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop', description: 'يعيد بناء الكولاجين الطبيعي للوجه تدريجياً. نتائج تظهر خلال 3 أشهر.', isBestSeller: false, isNew: true },
  { name: 'كريم فيتامين C La Roche-Posay', category: 'skincare', subcategory: null, price: 185, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', description: 'مضاد أكسدة قوي يحمي البشرة من الشيخوخة المبكرة ويخفف البقع الداكنة.', isBestSeller: true, isNew: false },
  { name: 'سيروم حمض الهيالورونيك PCA Skin', category: 'skincare', subcategory: null, price: 240, image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=400&fit=crop', description: 'ترطيب عميق للبشرة الجافة والحساسة. خالي من العطور والبارابين.', isBestSeller: false, isNew: true },
  { name: 'سيروم C E Ferulic SkinCeuticals', category: 'skincare', subcategory: null, price: 320, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&h=400&fit=crop', description: 'التركيبة الذهبية لحماية البشرة من الأشعة فوق البنفسجية والشوارد الحرة.', isBestSeller: true, isNew: false },
  { name: 'كريم ريتينول Teoxane', category: 'creams', subcategory: null, price: 210, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop', description: 'تجديد خلايا البشرة أثناء النوم. يقلل الخطوط الدقيقة ويعالج آثار حب الشباب.', isBestSeller: false, isNew: false },
  { name: 'مرطب فيلر Juvederm Hydrate', category: 'creams', subcategory: null, price: 175, image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&h=400&fit=crop', description: 'مرطب عميق يحتوي على حمض الهيالورونيك النقي لترطيب يدوم 24 ساعة.', isBestSeller: false, isNew: true },
  { name: 'سيروم مضاد التجاعيد PCA Skin', category: 'creams', subcategory: null, price: 280, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400&h=400&fit=crop', description: 'كوكتيل ببتيدات متقدمة يعمل على شد البشرة وتقليل التجاعيد العميقة.', isBestSeller: true, isNew: false },
  { name: 'كريم واقي شمس Mesoestetic SPF 50+', category: 'creams', subcategory: null, price: 195, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', description: 'حماية قصوى من الأشعة فوق البنفسجية مع مضادات أكسدة. خالي من الزيوت.', isBestSeller: false, isNew: true },
]

const categories = [
  { id: 'cat-injections', slug: 'injections', name: 'الحقن التجميلية', hasSubcategories: true, subcategories: [{ id: 'sub-filler', name: 'فيلر', slug: 'filler' }, { id: 'sub-botox', name: 'بوتكس', slug: 'botox' }, { id: 'sub-skinbooster', name: 'سكين بوستر', slug: 'skinbooster' }, { id: 'sub-mesotherapy', name: 'ميزوثيرابي', slug: 'mesotherapy' }, { id: 'sub-collagen', name: 'محفزات الكولاجين', slug: 'collagen' }] },
  { id: 'cat-skincare', slug: 'skincare', name: 'العناية بالبشرة', hasSubcategories: false, subcategories: null },
  { id: 'cat-creams', slug: 'creams', name: 'الكريمات والسيرومات', hasSubcategories: false, subcategories: null },
  { id: 'cat-devices', slug: 'devices', name: 'أجهزة التجميل', hasSubcategories: false, subcategories: null },
]

const db = new Database('./db.sqlite')
db.pragma('journal_mode = WAL')

// Categories table
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    subcategories TEXT
  )
`)

// Products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    description TEXT,
    isBestSeller INTEGER DEFAULT 0,
    isNew INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Orders table
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    items TEXT NOT NULL,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Migrate: add isActive if missing
try {
  db.prepare('SELECT isActive FROM products LIMIT 1').get()
} catch {
  db.exec('ALTER TABLE products ADD COLUMN isActive INTEGER DEFAULT 1')
  console.log('Migrated: added isActive to products')
}

// Admin table
db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY,
    password TEXT NOT NULL
  )
`)

function seedIfEmpty() {
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get()
  if (productCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (name, category, subcategory, price, image, description, isBestSeller, isNew, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    seedProducts.forEach((p) => {
      insertProduct.run(
        p.name,
        p.category,
        p.subcategory || null,
        p.price,
        p.image,
        p.description,
        p.isBestSeller ? 1 : 0,
        p.isNew ? 1 : 0,
        p.isActive !== false ? 1 : 0
      )
    })
    console.log('Seeded', seedProducts.length, 'products')
  }

  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get()
  if (catCount.count === 0) {
    const insertCat = db.prepare('INSERT INTO categories (slug, name, subcategories) VALUES (?, ?, ?)')
    categories.forEach((c) => {
      const subs = c.subcategories ? JSON.stringify(c.subcategories.map(s => ({ id: s.id, name: s.name, slug: s.slug }))) : null
      insertCat.run(c.slug, c.name, subs)
    })
    console.log('Seeded', categories.length, 'categories')
  }

  const adminRow = db.prepare('SELECT COUNT(*) as count FROM admin').get()
  if (adminRow.count === 0) {
    db.prepare("INSERT INTO admin (id, password) VALUES (1, 'medical2025')").run()
    console.log('Seeded admin password')
  }
}

seedIfEmpty()

export { db }
