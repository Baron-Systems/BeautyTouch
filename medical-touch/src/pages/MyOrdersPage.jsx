import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Search, Package, CheckCircle, Truck, XCircle, Clock, AlertCircle } from 'lucide-react'
import { storage } from '../services/storage.js'

const statusMap = {
  pending: { label: 'قيد الانتظار', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  confirmed: { label: 'تم التأكيد', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
  shipped: { label: 'تم الشحن', icon: Truck, color: 'text-indigo-600 bg-indigo-50' },
  delivered: { label: 'تم التوصيل', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'text-red-600 bg-red-50' },
}

export default function MyOrdersPage() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('beauty_touch_customer')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.phone) setPhone(data.phone)
      } catch { /* ignore */ }
    }
  }, [])

  const handleSearch = async () => {
    if (!phone.trim()) return
    setLoading(true)
    setSearched(true)
    const data = await storage.getOrdersByPhone(phone.trim())
    setOrders(data)
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-black mb-6">طلباتي</h1>

      {/* Phone lookup */}
      <div className="bg-white rounded-card shadow-card p-6 mb-8">
        <label className="block text-sm font-medium text-black mb-2">أدخل رقم الهاتف لتتبع طلباتك</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="0595330105"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              dir="rtl"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-gold px-6 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            بحث
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && orders.length === 0 && !loading && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-black-light">لا توجد طلبات مرتبطة بهذا الرقم</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <p className="text-black-light">جاري التحميل...</p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const st = statusMap[order.status] || statusMap.pending
          const Icon = st.icon
          return (
            <div key={order.id} className="bg-white rounded-card shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-black">طلب #{order.id}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${st.color}`}>
                    <Icon className="w-3 h-3" />
                    {st.label}
                  </span>
                </div>
                <span className="text-sm text-black-light">{new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-black">{item.name} × {item.quantity}</span>
                    <span className="text-black-light">{item.price * item.quantity} ₪</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="font-bold text-black">الإجمالي</span>
                <span className="text-xl font-bold text-gold">{order.total} ₪</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
