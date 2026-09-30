import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, CheckCircle2, AlertCircle, Tag, Upload } from 'lucide-react'
import { storage } from '../../services/storage.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [name, setName] = useState('')
  const [logo, setLogo] = useState('')
  const [previewLogo, setPreviewLogo] = useState('')
  const [logoError, setLogoError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [deleteModal, setDeleteModal] = useState({ open: false, brand: null })

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    setLoading(true)
    const data = await storage.getBrands()
    setBrands(data)
    setLoading(false)
  }

  const openCreate = () => {
    setEditingBrand(null)
    setName('')
    setLogo('')
    setPreviewLogo('')
    setLogoError('')
    setFormError('')
    setMessage({ type: '', text: '' })
    setShowModal(true)
  }

  const openEdit = (brand) => {
    setEditingBrand(brand)
    setName(brand.name)
    setLogo(brand.logo || '')
    setPreviewLogo(brand.logo || '')
    setLogoError('')
    setFormError('')
    setMessage({ type: '', text: '' })
    setShowModal(true)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/webp', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setLogoError('يُسمح فقط بصيغ PNG و WebP و JPG')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت')
      return
    }
    setLogoError('')
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      setPreviewLogo(result)
      setLogo(result)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setPreviewLogo('')
    setLogo('')
    setLogoError('')
  }

  const handleSave = async () => {
    setFormError('')
    setMessage({ type: '', text: '' })
    const trimmed = name.trim()
    if (!trimmed) {
      setFormError('اسم الماركة مطلوب')
      return
    }
    setSaving(true)
    const payload = { name: trimmed, logo: logo || null }
    if (editingBrand) {
      const res = await storage.updateBrand(editingBrand.id, payload)
      if (res.success === false) {
        setFormError(res.error || 'فشل التحديث')
      } else {
        setMessage({ type: 'success', text: 'تم تحديث الماركة بنجاح' })
        setTimeout(() => setShowModal(false), 800)
        loadBrands()
      }
    } else {
      const res = await storage.createBrand(payload)
      if (res.success === false) {
        setFormError(res.error || 'فشل الإضافة')
      } else {
        setMessage({ type: 'success', text: 'تم إضافة الماركة بنجاح' })
        setTimeout(() => setShowModal(false), 800)
        loadBrands()
      }
    }
    setSaving(false)
  }

  const handleDelete = (brand) => {
    setDeleteModal({ open: true, brand })
  }

  const confirmDelete = async () => {
    if (!deleteModal.brand) return
    const res = await storage.deleteBrand(deleteModal.brand.id)
    if (res.success === false) {
      throw new Error(res.error || 'فشل الحذف')
    }
    loadBrands()
    setDeleteModal({ open: false, brand: null })
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-black">إدارة الماركات</h1>
          <button
            onClick={openCreate}
            className="btn-gold flex items-center gap-2 text-sm px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ماركة</span>
          </button>
        </div>

        {loading ? (
          <p className="text-center text-black-light py-12">جاري التحميل...</p>
        ) : brands.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card shadow-card">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-black-light mb-4">لا توجد ماركات</p>
            <button onClick={openCreate} className="btn-gold inline-block text-sm">
              إضافة ماركة جديدة
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">الماركة</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-black">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {brand.logo ? (
                            <div className="w-[90px] h-[40px] bg-white rounded border border-gray-100 flex items-center justify-center p-1">
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-[90px] h-[40px] bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-xs text-gray-400">
                              بدون شعار
                            </div>
                          )}
                          <p className="font-medium text-black text-sm">{brand.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(brand)}
                            className="p-2 text-black-light hover:text-gold transition-colors"
                            aria-label="تعديل"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand)}
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

      {/* Brand Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-card shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-black">
                {editingBrand ? 'تعديل ماركة' : 'إضافة ماركة جديدة'}
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
                <label className="block text-sm font-medium text-black mb-1.5">اسم الماركة</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
                  placeholder="مثال: لوريال"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">شعار الماركة</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${logoError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gold bg-gray-50'}`}>
                  {previewLogo ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-[180px] h-[80px] bg-white rounded border border-gray-100 flex items-center justify-center p-2">
                        <img
                          src={previewLogo}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="text-xs text-red-600 hover:text-red-700 underline"
                      >
                        حذف الشعار
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-2">
                      <Upload className="w-6 h-6 text-black-light mx-auto mb-2" />
                      <span className="text-sm text-black-light">اضغط لرفع شعار الماركة</span>
                      <span className="block text-xs text-gray-400 mt-1">PNG / WebP / JPG - بحد أقصى 2MB</span>
                      <input type="file" accept="image/png,image/webp,image/jpeg,image/jpg" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                </div>
                {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
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
                {saving ? 'جاري الحفظ...' : editingBrand ? 'حفظ التعديل' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, brand: null })}
        onConfirm={confirmDelete}
        message="هل أنت متأكد من حذف هذه الماركة"
        itemName={deleteModal.brand?.name}
      />
    </>
  )
}
