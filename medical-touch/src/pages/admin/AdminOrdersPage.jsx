import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardList, Package, CheckCircle, Truck, XCircle, Clock, ArrowLeft, Power, Eye, X, MapPin, Phone, User, Calendar, Download, LogOut, Lock } from 'lucide-react'
import { storage } from '../../services/storage.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Logo from '../../components/Logo.jsx'

const statusMap = {
  pending: { label: 'قيد الانتظار', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  confirmed: { label: 'تم التأكيد', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
  shipped: { label: 'تم الشحن', icon: Truck, color: 'text-indigo-600 bg-indigo-50' },
  delivered: { label: 'تم التوصيل', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'text-red-600 bg-red-50' },
}

const nextStatus = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
}

export default function AdminOrdersPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [ordersData, statsData] = await Promise.all([
      storage.getAdminOrders(),
      storage.getAdminStats(),
    ])
    setOrders(ordersData)
    setStats(statsData)
    setLoading(false)
  }

  const handleAdvance = async (id, current) => {
    const next = nextStatus[current]
    if (!next) return
    await storage.updateOrderStatus(id, next)
    loadData()
  }

  const handleToggle = async (id) => {
    await storage.toggleOrder(id)
    loadData()
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError('يرجى ملء جميع الحقول')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('كلمة المرور الجديدة غير متطابقة')
      return
    }
    if (passwordForm.new.length < 4) {
      setPasswordError('كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل')
      return
    }
    setChangingPassword(true)
    const result = await storage.changeAdminPassword(passwordForm.current, passwordForm.new)
    if (result.success) {
      setPasswordSuccess(true)
      setPasswordForm({ current: '', new: '', confirm: '' })
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(false)
      }, 1500)
    } else {
      setPasswordError(result.error || 'فشل تغيير كلمة المرور')
    }
    setChangingPassword(false)
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/products">
              <Logo size="small" />
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/admin/products" className="text-sm text-gold hover:underline">
                المنتجات
              </Link>
              <a
                href="/api/admin/export"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gold-50 text-gold rounded-lg hover:bg-gold hover:text-white transition-colors"
                title="تحميل نسخة من قاعدة البيانات"
              >
                <Download className="w-4 h-4" />
                <span>تحميل DB</span>
              </a>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="p-2 text-black-light hover:text-gold transition-colors"
                aria-label="تغيير كلمة المرور"
                title="تغيير كلمة المرور"
              >
                <Lock className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-black-light hover:text-red-500 transition-colors"
                aria-label="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-black mb-6">لوحة الطلبات</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'إجمالي الطلبات', count: stats.totalOrders || 0, revenue: stats.totalRevenue || 0, color: 'bg-gold text-white' },
            { label: 'قيد الانتظار', count: stats.pending || 0, revenue: stats.revenuePending || 0, color: 'bg-amber-50 text-amber-600' },
            { label: 'تم التأكيد', count: stats.confirmed || 0, revenue: stats.revenueConfirmed || 0, color: 'bg-blue-50 text-blue-600' },
            { label: 'تم الشحن', count: stats.shipped || 0, revenue: stats.revenueShipped || 0, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'تم التوصيل', count: stats.delivered || 0, revenue: stats.revenueDelivered || 0, color: 'bg-green-50 text-green-600' },
          ].map((s) => (
            <div key={s.label} className={`rounded-card p-4 ${s.color}`}>
              <p className="text-sm opacity-90 mb-1">{s.label}</p>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs opacity-80 mt-1">{s.revenue} ₪</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'pending', label: 'قيد الانتظار' },
            { key: 'confirmed', label: 'تم التأكيد' },
            { key: 'shipped', label: 'تم الشحن' },
            { key: 'delivered', label: 'تم التوصيل' },
            { key: 'cancelled', label: 'ملغي' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-gold text-white'
                  : 'bg-white text-black-light hover:bg-gold-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-black-light py-12">جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card shadow-card">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-black-light">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-black">#</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-black">العميل</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-black">الهاتف</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-black">المنتجات</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-black">المجموع</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-black">الحالة</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-black">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((order) => {
                    const st = statusMap[order.status] || statusMap.pending
                    const Icon = st.icon
                    const canAdvance = !!nextStatus[order.status]
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-black-light">{order.id}</td>
                        <td className="px-4 py-3 text-sm text-black">{order.customer_name}</td>
                        <td className="px-4 py-3 text-sm text-black-light">{order.phone}</td>
                        <td className="px-4 py-3 text-sm text-black-light">
                          {order.items.length} منتج
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gold">{order.total} ₪</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${st.color}`}>
                            <Icon className="w-3 h-3" />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1.5 text-xs font-medium border border-gold text-gold rounded-full hover:bg-gold hover:text-white transition-colors flex items-center gap-1"
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              تفاصيل
                            </button>
                            {canAdvance && (
                              <button
                                onClick={() => handleAdvance(order.id, order.status)}
                                className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                title="تقديم الحالة"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggle(order.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                order.status === 'cancelled'
                                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                              title={order.status === 'cancelled' ? 'إعادة التنشيط' : 'إلغاء'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowPasswordModal(false)} />
            <div className="relative bg-white rounded-card shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-black">تغيير كلمة المرور</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-black-light" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {passwordSuccess && (
                  <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm text-center">
                    تم تغيير كلمة المرور بنجاح
                  </div>
                )}
                {passwordError && (
                  <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm text-center">
                    {passwordError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">كلمة المرور الحالية</label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
                    placeholder="أدخل كلمة المرور الحالية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, new: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">تأكيد كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-black-light hover:text-black transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="btn-gold px-5 py-2.5 text-sm disabled:opacity-50"
                >
                  {changingPassword ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedOrder(null)} />
            <div className="relative bg-white rounded-card shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-black">تفاصيل الطلب #{selectedOrder.id}</h2>
                  {(() => {
                    const st = statusMap[selectedOrder.status] || statusMap.pending
                    const StIcon = st.icon
                    return (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${st.color}`}>
                        <StIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    )
                  })()}
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-black-light" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Customer Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-black">معلومات العميل</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gold" />
                      <span className="text-black-light">الاسم:</span>
                      <span className="font-medium text-black">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gold" />
                      <span className="text-black-light">الهاتف:</span>
                      <span className="font-medium text-black">{selectedOrder.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gold" />
                      <span className="text-black-light">العنوان:</span>
                      <span className="font-medium text-black">{selectedOrder.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gold" />
                      <span className="text-black-light">التاريخ:</span>
                      <span className="font-medium text-black">{new Date(selectedOrder.created_at).toLocaleString('ar-SA')}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-black">المنتجات</h3>
                  <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-black">{item.name}</p>
                          <p className="text-xs text-black-light">{item.price} ₪ × {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-gold">{item.price * item.quantity} ₪</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-black">الإجمالي</span>
                  <span className="text-xl font-bold text-gold">{selectedOrder.total} ₪</span>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                    <span className="font-semibold">ملاحظات: </span>
                    {selectedOrder.notes}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 text-sm font-medium text-black-light hover:text-black transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
