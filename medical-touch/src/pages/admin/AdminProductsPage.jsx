import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, LogOut, Package, Power, ClipboardList, Lock, X, Search } from 'lucide-react'
import { storage } from '../../services/storage.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Logo from '../../components/Logo.jsx'

export default function AdminProductsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    storage.getProducts().then(setProducts).catch(() => setProducts([]))
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await storage.deleteProduct(id)
      const updated = await storage.getProducts()
      setProducts(updated)
    }
  }

  const handleToggle = async (id) => {
    await storage.toggleProduct(id)
    const updated = await storage.getProducts()
    setProducts(updated)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/products">
              <Logo size="small" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/orders"
                className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-200 rounded-button hover:border-gold hover:text-gold transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                <span>الطلبات</span>
              </Link>
              <Link
                to="/admin/products/new"
                className="btn-gold flex items-center gap-2 text-sm px-4 py-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج</span>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-black">إدارة المنتجات</h1>
          <div className="relative max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث عن منتج..."
              className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              dir="rtl"
            />
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card shadow-card">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-black-light mb-4">لا توجد منتجات</p>
            <Link to="/admin/products/new" className="btn-gold inline-block text-sm">
              إضافة منتج جديد
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">الصورة</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">المنتج</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">التصنيف</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">السعر</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">الحالة</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products
                    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-black text-sm">{product.name}</p>
                        <p className="text-xs text-black-light line-clamp-1">{product.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-gold-50 text-gold-dark text-xs font-medium px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gold text-sm">{product.price} ₪</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          product.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {product.isActive ? 'مفعّل' : 'معطّل'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="p-2 text-black-light hover:text-gold transition-colors"
                            aria-label="تعديل"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleToggle(product.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              product.isActive
                                ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                            }`}
                            aria-label={product.isActive ? 'تعطيل' : 'تفعيل'}
                            title={product.isActive ? 'تعطيل المنتج' : 'تفعيل المنتج'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-black-light hover:text-red-500 transition-colors"
                            aria-label="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
    </div>
  )
}
