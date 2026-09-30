import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Truck, CheckCircle2, AlertCircle } from 'lucide-react'
import { storage } from '../../services/storage.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'

export default function AdminDeliveryPage() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingArea, setEditingArea] = useState(null)
  const [form, setForm] = useState({ name: '', price: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [deleteModal, setDeleteModal] = useState({ open: false, area: null })


  useEffect(() => {
    loadAreas()
  }, [])

  const loadAreas = async () => {
    setLoading(true)
    const data = await storage.getDeliveryAreas()
    setAreas(data)
    setLoading(false)
  }

  const openCreate = () => {
    setEditingArea(null)
    setForm({ name: '', price: '' })
    setFormError('')
    setMessage({ type: '', text: '' })
    setShowModal(true)
  }

  const openEdit = (area) => {
    setEditingArea(area)
    setForm({ name: area.name, price: String(area.price) })
    setFormError('')
    setMessage({ type: '', text: '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    setFormError('')
    setMessage({ type: '', text: '' })
    if (!form.name.trim()) {
      setFormError('اسم المنطقة مطلوب')
      return
    }
    const priceNum = Number(form.price)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setFormError('سعر التوصيل يجب أن يكون رقماً صحيحاً')
      return
    }
    setSaving(true)
    if (editingArea) {
      const res = await storage.updateDeliveryArea(editingArea.id, { name: form.name.trim(), price: priceNum })
      if (res.success === false) {
        setFormError(res.error || 'فشل التحديث')
      } else {
        setMessage({ type: 'success', text: 'تم تحديث المنطقة بنجاح' })
        setTimeout(() => setShowModal(false), 800)
        loadAreas()
      }
    } else {
      const res = await storage.createDeliveryArea({ name: form.name.trim(), price: priceNum })
      if (res.success === false) {
        setFormError(res.error || 'فشل الإنشاء')
      } else {
        setMessage({ type: 'success', text: 'تم إضافة المنطقة بنجاح' })
        setTimeout(() => setShowModal(false), 800)
        loadAreas()
      }
    }
    setSaving(false)
  }

  const handleDelete = (area) => {
    setDeleteModal({ open: true, area })
  }

  const confirmDelete = async () => {
    if (!deleteModal.area) return
    const res = await storage.deleteDeliveryArea(deleteModal.area.id)
    if (res.success === false) {
      throw new Error(res.error || 'فشل الحذف')
    }
    loadAreas()
    setDeleteModal({ open: false, area: null })
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-black">مناطق التوصيل</h1>
          <button
            onClick={openCreate}
            className="btn-gold flex items-center gap-2 text-sm px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منطقة</span>
          </button>
        </div>

        {loading ? (
          <p className="text-center text-black-light py-12">جاري التحميل...</p>
        ) : areas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card shadow-card">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-black-light mb-4">لا توجد مناطق توصيل</p>
            <button onClick={openCreate} className="btn-gold inline-block text-sm">
              إضافة منطقة جديدة
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">المنطقة</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">سعر التوصيل</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {areas.map((area) => (
                    <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-black text-sm">{area.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gold text-sm">{area.price} ₪</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(area)}
                            className="p-2 text-black-light hover:text-gold transition-colors"
                            aria-label="تعديل"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(area)}
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
      </div>

      {/* Area Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-card shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-black">
                {editingArea ? 'تعديل منطقة' : 'إضافة منطقة توصيل'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-black-light" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {message.text && (
                <div className={`flex items-center gap-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{message.text}</span>
                </div>
              )}
              {formError && (
                <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm text-center">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">اسم المنطقة / المدينة</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
                  placeholder="مثال: رام الله"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">سعر التوصيل (₪)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
                  placeholder="0"
                  min="0"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-black-light hover:text-black transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-gold px-5 py-2.5 text-sm disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : editingArea ? 'حفظ التعديل' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, area: null })}
        onConfirm={confirmDelete}
        message="هل أنت متأكد من حذف منطقة التوصيل هذه"
        itemName={deleteModal.area?.name}
      />
    </>
  )
}
