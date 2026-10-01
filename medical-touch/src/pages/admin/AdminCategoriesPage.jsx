import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle2, Tag } from 'lucide-react'
import { storage } from '../../services/storage.js'
import { categories as staticCategories } from '../../data/categories.js'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const apiCats = await storage.getCategories()
      const merged = staticCategories.map((sc) => {
        const api = apiCats.find((c) => c.slug === sc.slug)
        return {
          ...sc,
          isActive: api ? api.isActive !== false : true,
          dbId: api ? api.id : null,
          sortOrder: api ? api.sortOrder ?? sc.sortOrder : sc.sortOrder,
        }
      })
      apiCats.forEach((apiCat) => {
        if (!merged.find((c) => c.slug === apiCat.slug)) {
          merged.push({
            id: apiCat.slug,
            slug: apiCat.slug,
            name: apiCat.name,
            sortOrder: apiCat.sortOrder ?? 0,
            isActive: apiCat.isActive !== false,
            dbId: apiCat.id,
          })
        }
      })
      setCategories(merged.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
    } catch {
      setCategories(staticCategories.map((c) => ({ ...c, isActive: true, dbId: null })))
    }
    setLoading(false)
  }

  const handleToggle = async (cat) => {
    if (!cat.dbId) {
      setMessage({ type: 'error', text: 'لا يمكن تغيير حالة هذا التصنيف لأنه غير مسجل في قاعدة البيانات' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return
    }
    setTogglingId(cat.dbId)
    setMessage({ type: '', text: '' })
    const res = await storage.toggleCategory(cat.dbId)
    if (res && res.success === false) {
      setMessage({ type: 'error', text: res.error || 'فشل تغيير الحالة' })
    } else {
      setMessage({
        type: 'success',
        text: cat.isActive ? 'تم إخفاء التصنيف من صفحة العملاء' : 'تم إظهار التصنيف في صفحة العملاء',
      })
      loadCategories()
    }
    setTogglingId(null)
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-black">إدارة التصنيفات</h1>
        <p className="text-sm text-black-light">
          يمكنك إخفاء أي تصنيف من صفحة العملاء دون حذف منتجاته
        </p>
      </div>

      {message.text && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <p className="text-center text-black-light py-12">جاري التحميل...</p>
      ) : (
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-black">التصنيف</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-black">المعرف</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-black">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-black">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat.slug} className={`hover:bg-gray-50 transition-colors ${cat.isActive === false ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-black text-sm">{cat.name}</p>
                          <p className="text-xs text-black-light">{cat.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-black-light font-mono">{cat.dbId ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cat.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cat.isActive !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            ظاهر للعملاء
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            مخفي
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(cat)}
                        disabled={togglingId === cat.dbId || !cat.dbId}
                        className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-button border transition-colors disabled:opacity-50 ${
                          cat.isActive !== false
                            ? 'bg-white text-black-light border-gray-200 hover:border-red-300 hover:text-red-500'
                            : 'bg-gold text-white border-gold hover:bg-gold-dark'
                        }`}
                      >
                        {togglingId === cat.dbId ? (
                          'جاري...'
                        ) : cat.isActive !== false ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            إخفاء
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            إظهار
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
