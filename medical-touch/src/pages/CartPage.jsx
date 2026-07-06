import React, { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MessageCircle, Send, User, MapPin, Phone } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { storage } from '../services/storage.js'

function generateWhatsAppMessage(cartItems, total, products, customer) {
  const lines = cartItems.map((item) => {
    const product = products.find((p) => String(p.id) === String(item.productId))
    if (!product) return ''
    return `${product.name} × ${item.quantity}`
  }).filter(Boolean)

  const message = [
    'مرحباً Beauty Touch',
    '',
    'أرغب بطلب المنتجات التالية:',
    '',
    ...lines,
    '',
    `الإجمالي: ${total} ₪`,
    '',
    `الاسم: ${customer.name}`,
    `رقم الهاتف: ${customer.phone}`,
    `العنوان: ${customer.address}`,
    '',
    'شكراً لكم.',
  ].join('\n')

  return encodeURIComponent(message)
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const [products, setProducts] = useState([])
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [orderSent, setOrderSent] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    storage.getProducts().then((data) => {
      const activeProducts = data.filter((p) => p.isActive !== false)
      setProducts(activeProducts)
      // If cart has old localStorage IDs that don't match API IDs, clear it
      const validIds = new Set(activeProducts.map((p) => String(p.id)))
      const hasInvalid = cartItems.some((item) => !validIds.has(String(item.productId)))
      if (hasInvalid) clearCart()
    }).catch(() => setProducts([]))
    const saved = localStorage.getItem('beauty_touch_customer')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setCustomer({ name: data.name || '', phone: data.phone || '', address: data.address || '' })
      } catch { /* ignore */ }
    }
  }, [])

  const cartProducts = useMemo(() => {
    return cartItems
      .map((item) => {
        const product = products.find((p) => String(p.id) === String(item.productId))
        if (!product) return null
        return { ...product, quantity: item.quantity }
      })
      .filter(Boolean)
  }, [cartItems, products])

  const total = cartProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)

  const validate = () => {
    const errs = {}
    if (!customer.name.trim()) errs.name = 'الاسم مطلوب'
    if (!customer.phone.trim()) errs.phone = 'رقم الهاتف مطلوب'
    if (!customer.address.trim()) errs.address = 'العنوان مطلوب'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCustomerChange = (field, value) => {
    const updated = { ...customer, [field]: value }
    setCustomer(updated)
    localStorage.setItem('beauty_touch_customer', JSON.stringify(updated))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmitOrder = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const items = cartProducts.map((p) => ({ name: p.name, price: p.price, quantity: p.quantity }))
      await storage.createOrder({
        customer_name: customer.name,
        phone: customer.phone,
        address: customer.address,
        items,
        total,
      })
      localStorage.setItem('beauty_touch_customer', JSON.stringify(customer))
      clearCart()
      setOrderSent(true)
    } catch {
      alert('حدث خطأ أثناء إرسال الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  if (orderSent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-3">تم إرسال الطلب بنجاح</h1>
        <p className="text-black-light mb-8">سنتواصل معك قريباً لتأكيد الطلب</p>
        <Link to="/" className="btn-gold inline-block">
          العودة للرئيسية
        </Link>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-20 h-20 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gold" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-3">سلة التسوق فارغة</h1>
        <p className="text-black-light mb-8">ابدأ التسوق واكتشف منتجاتنا الفاخرة</p>
        <Link to="/category/bestsellers" className="btn-gold inline-block">
          تصفح المنتجات
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-black mb-8">سلة التسوق</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-card shadow-card p-4 flex gap-4 items-center"
            >
              <Link to={`/product/${product.id}`} className="flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-medium text-black text-sm md:text-base leading-snug line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-gold font-bold text-sm md:text-base mb-2">
                  {product.price} ₪
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product.id, product.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{product.quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, product.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-black-light hover:text-red-500 transition-colors"
                    aria-label="حذف من السلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <p className="font-bold text-black">
                  {product.price * product.quantity} ₪
                </p>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-black-light hover:text-red-500 transition-colors underline"
          >
            تفريغ السلة
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-card shadow-card p-6 sticky top-24 space-y-5">
            <h2 className="font-bold text-black">ملخص الطلب</h2>

            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-black-light">عدد المنتجات</span>
                <span className="font-medium">{cartItems.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-black">الإجمالي</span>
              <span className="text-2xl font-bold text-gold">{total} ₪</span>
            </div>

            {/* Customer Form */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-black mb-1">الاسم الكامل *</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black-light" />
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                    placeholder="محمد أحمد"
                    className={`w-full pr-9 pl-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                    dir="rtl"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">رقم الهاتف *</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black-light" />
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    placeholder="0595330105"
                    className={`w-full pr-9 pl-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
                    dir="rtl"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">العنوان *</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black-light" />
                  <input
                    type="text"
                    value={customer.address}
                    onChange={(e) => handleCustomerChange('address', e.target.value)}
                    placeholder="فلسطين - رام الله - شارع الرشيد"
                    className={`w-full pr-9 pl-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold ${errors.address ? 'border-red-300' : 'border-gray-200'}`}
                    dir="rtl"
                  />
                </div>
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 rounded-button flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-5 h-5" />
              {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>

            <Link
              to="/"
              className="w-full border-2 border-gray-200 text-black font-medium py-2.5 rounded-button flex items-center justify-center gap-2 hover:border-gold hover:text-gold transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
