import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Package, ClipboardList, Truck, Tag, TrendingUp, Lock, LogOut, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { storage } from '../services/storage.js'
import Logo from './Logo.jsx'

const navItems = [
  { to: '/admin/products', label: 'المنتجات', icon: Package },
  { to: '/admin/orders', label: 'الطلبات', icon: ClipboardList },
  { to: '/admin/delivery', label: 'التوصيل', icon: Truck },
  { to: '/admin/brands', label: 'الماركات', icon: Tag },
  { to: '/admin/profits', label: 'الأرباح', icon: TrendingUp },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/products" className="shrink-0">
              <Logo size="small" />
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 text-sm px-3 sm:px-4 py-2 rounded-button border transition-colors ${
                      isActive
                        ? 'bg-gold text-white border-gold'
                        : 'bg-white text-black-light border-gray-200 hover:border-gold hover:text-gold'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
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
            </nav>
          </div>
        </div>
      </header>

      <Outlet />

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
    </div>
  )
}
