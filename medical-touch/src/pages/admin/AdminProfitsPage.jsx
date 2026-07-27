import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ClipboardList, Truck, LogOut, Lock, X, Calendar, TrendingUp, Search, CheckCircle2, AlertCircle } from 'lucide-react'
import { storage } from '../../services/storage.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Logo from '../../components/Logo.jsx'

const statusMap = {
  pending: { label: 'قيد الانتظار', color: 'text-amber-600 bg-amber-50' },
  confirmed: { label: 'تم التأكيد', color: 'text-blue-600 bg-blue-50' },
  shipped: { label: 'تم الشحن', color: 'text-indigo-600 bg-indigo-50' },
  delivered: { label: 'تم التوصيل', color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'ملغي', color: 'text-red-600 bg-red-50' },
}

function formatDateInput(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function AdminProfitsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [report, setReport] = useState({ revenue: 0, cost: 0, profit: 0, count: 0, byStatus: [], orders: [] })
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    setFrom(formatDateInput(firstDay))
    setTo(formatDateInput(now))
  }, [])

  const loadReport = async () => {
    setLoading(true)
    const data = await storage.getAdminProfitsReport(from, to)
    setReport(data)
    setLoading(false)
  }

  useEffect(() => {
    if (from && to) {
      loadReport()
    }
  }, [from, to])

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

  const average = report.count > 0 ? Math.round(report.revenue / report.count) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/products">
              <Logo size="small" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/products"
                className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-200 rounded-button hover:border-gold hover:text-gold transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>المنتجات</span>
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-200 rounded-button hover:border-gold hover:text-gold transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                <span>الطلبات</span>
              </Link>
              <Link
                to="/admin/delivery"
                className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-200 rounded-button hover:border-gold hover:text-gold transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>التوصيل</span>
              </Link>
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
        <h1 className="text-2xl font-bold text-black mb-6">تقرير الأرباح</h1>

        <div className="bg-white rounded-card shadow-card p-5 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-black mb-1.5">من تاريخ</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
                />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-black mb-1.5">إلى تاريخ</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
                />
              </div>
            </div>
            <button
              onClick={loadReport}
              disabled={loading || !from || !to}
              className="btn-gold px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? 'جاري التحميل...' : 'عرض التقرير'}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-black-light py-12">جاري التحميل...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gold text-white rounded-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 opacity-80" />
                  <p className="text-sm opacity-90">صافي الربح</p>
                </div>
                <p className="text-3xl font-bold">{report.profit} ₪</p>
              </div>
              <div className="bg-white rounded-card shadow-card p-5">
                <p className="text-sm text-black-light mb-2">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-black">{report.revenue} ₪</p>
              </div>
              <div className="bg-white rounded-card shadow-card p-5">
                <p className="text-sm text-black-light mb-2">إجمالي التكلفة</p>
                <p className="text-3xl font-bold text-black">{report.cost} ₪</p>
              </div>
              <div className="bg-white rounded-card shadow-card p-5">
                <p className="text-sm text-black-light mb-2">عدد الطلبات</p>
                <p className="text-3xl font-bold text-black">{report.count}</p>
              </div>
            </div>

            {report.byStatus.length > 0 && (
              <div className="bg-white rounded-card shadow-card p-5 mb-6">
                <h2 className="font-bold text-black mb-4">تفاصيل حسب الحالة</h2>
                <div className="flex flex-wrap gap-3">
                  {report.byStatus.map((s) => {
                    const st = statusMap[s.status] || statusMap.pending
                    return (
                      <div key={s.status} className={`rounded-lg px-4 py-3 flex items-center gap-3 ${st.color}`}>
                        <div>
                          <p className="text-xs opacity-80">{st.label}</p>
                          <p className="font-bold">{s.profit} ₪ ربح</p>
                        </div>
                        <div className="text-xs font-medium opacity-70 text-left">
                          <p>{s.count} طلب</p>
                          <p>{s.revenue} ₪ إيراد</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {report.orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-card shadow-card">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-black-light">لا توجد أرباح في هذا النطاق الزمني</p>
              </div>
            ) : (
              <div className="bg-white rounded-card shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">#</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">العميل</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">التاريخ</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">الحالة</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">التكلفة</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">الربح</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {report.orders.map((order) => {
                        const st = statusMap[order.status] || statusMap.pending
                        return (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-black-light">{order.id}</td>
                            <td className="px-4 py-3 text-sm text-black">{order.customer_name}</td>
                            <td className="px-4 py-3 text-sm text-black-light">{new Date(order.created_at).toLocaleString('ar-SA')}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${st.color}`}>{st.label}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-black-light">{order.cost} ₪</td>
                            <td className="px-4 py-3 text-sm font-bold text-green-600">{order.profit} ₪</td>
                            <td className="px-4 py-3 text-sm font-bold text-gold">{order.revenue} ₪</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
    </div>
  )
}
