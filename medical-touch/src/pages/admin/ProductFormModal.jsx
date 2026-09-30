import React, { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import { storage } from '../../services/storage.js'
import { categories as staticCategories } from '../../data/categories.js'

const EMPTY_FORM = {
  name: '',
  category: '',
  subcategory: '',
  brand: '',
  price: '',
  discountedPrice: '',
  costPrice: '',
  image: '',
  description: '',
  isBestSeller: false,
  isNew: false,
  isActive: true,
}

export default function ProductFormModal({ isOpen, onClose, onSaved, productId = null, defaultCategory = '' }) {
  const isEdit = productId != null

  const [form, setForm] = useState({ ...EMPTY_FORM, category: defaultCategory })
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState(staticCategories)
  const [previewImage, setPreviewImage] = useState('')
  const [errors, setErrors] = useState({})
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Load brands & categories each time the modal opens
  useEffect(() => {
    if (!isOpen) return
    storage.getBrands().then(setBrands).catch(() => setBrands([]))
    storage.getCategories().then((data) => {
      const sorted = data
        .filter((c) => !['offers', 'new', 'bestsellers', 'packages'].includes(c.slug))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      if (sorted.length > 0) setCategories(sorted)
    }).catch(() => {})
  }, [isOpen])

  // Load product for edit, or reset form for add
  useEffect(() => {
    if (!isOpen) return
    setErrors({})
    setSaveError('')
    if (isEdit) {
      setLoadingProduct(true)
      storage.getAdminProductById(productId).then((product) => {
        if (product) {
          setForm({
            name: product.name || '',
            category: product.category || '',
            subcategory: product.subcategory || '',
            brand: product.brand || '',
            price: String(product.price) || '',
            discountedPrice: product.discountedPrice ? String(product.discountedPrice) : '',
            costPrice: product.costPrice ? String(product.costPrice) : '',
            image: product.image || '',
            description: product.description || '',
            isBestSeller: !!product.isBestSeller,
            isNew: !!product.isNew,
            isActive: product.isActive !== false,
          })
          setPreviewImage(product.image || '')
        }
      }).catch(() => {}).finally(() => setLoadingProduct(false))
    } else {
      setForm({ ...EMPTY_FORM, category: defaultCategory })
      setPreviewImage('')
    }
  }, [isOpen, productId, isEdit, defaultCategory])

  const selectedCategory = categories.find((c) => c.slug === form.category)

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressedImage = await compressImage(file, 800, 0.7)
      setPreviewImage(compressedImage)
      setForm((prev) => ({ ...prev, image: compressedImage }))
    } catch {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        setForm((prev) => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'اسم المنتج مطلوب'
    if (!form.category) errs.category = 'التصنيف مطلوب'
    if (!form.price || Number(form.price) <= 0) errs.price = 'السعر يجب أن يكون أكبر من صفر'
    if (!form.image) errs.image = 'صورة المنتج مطلوبة'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSaveError('')
    const productData = {
      ...form,
      price: Number(form.price),
      discountedPrice: form.discountedPrice && form.discountedPrice.trim() !== '' ? Number(form.discountedPrice) : null,
      costPrice: form.costPrice && form.costPrice.trim() !== '' ? Number(form.costPrice) : null,
      subcategory: form.subcategory || null,
    }
    try {
      if (isEdit) {
        await storage.updateProduct(productId, productData)
      } else {
        await storage.addProduct(productData)
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setSaveError(err.message || 'فشل حفظ المنتج')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'category') updated.subcategory = ''
      return updated
    })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-card shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-black">
            {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 text-black-light" />
          </button>
        </div>

        {/* Body (scrollable) + Footer (fixed) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
            {loadingProduct ? (
              <div className="py-16 flex justify-center">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">اسم المنتج *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="مثال: فيلر شفاه Restylane"
                    dir="rtl"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">التصنيف *</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm bg-white ${errors.category ? 'border-red-300' : 'border-gray-200'}`}
                    dir="rtl"
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>

                {/* Subcategory */}
                {selectedCategory?.subcategories?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">التصنيف الفرعي</label>
                    <select
                      value={form.subcategory}
                      onChange={(e) => handleChange('subcategory', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm bg-white"
                      dir="rtl"
                    >
                      <option value="">اختر التصنيف الفرعي</option>
                      {selectedCategory.subcategories.map((sub) => (
                        <option key={sub.id} value={sub.slug}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">الماركة</label>
                  <select
                    value={form.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm bg-white"
                    dir="rtl"
                  >
                    <option value="">اختر الماركة</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.name}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price + Discounted + Cost */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">السعر (₪) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm ${errors.price ? 'border-red-300' : 'border-gray-200'}`}
                      placeholder="350"
                      min="0"
                    />
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">بعد الخصم (₪)</label>
                    <input
                      type="number"
                      value={form.discountedPrice}
                      onChange={(e) => handleChange('discountedPrice', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm"
                      placeholder="300"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">التكلفة (₪)</label>
                    <input
                      type="number"
                      value={form.costPrice}
                      onChange={(e) => handleChange('costPrice', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm"
                      placeholder="200"
                      min="0"
                    />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">صورة المنتج *</label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${errors.image ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gold bg-gray-50'}`}>
                    {previewImage ? (
                      <div className="relative inline-block">
                        <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                        <button
                          type="button"
                          onClick={() => { setPreviewImage(''); setForm((prev) => ({ ...prev, image: '' })) }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-8 h-8 text-black-light mx-auto mb-2" />
                        <span className="text-sm text-black-light">اضغط لرفع صورة</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">الوصف</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm resize-none"
                    rows="3"
                    placeholder="وصف المنتج..."
                    dir="rtl"
                  />
                </div>

                {/* Toggles */}
                <div className="flex gap-6 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isBestSeller} onChange={(e) => handleChange('isBestSeller', e.target.checked)} className="w-4 h-4 accent-gold rounded" />
                    <span className="text-sm text-black">الأكثر مبيعاً</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isNew} onChange={(e) => handleChange('isNew', e.target.checked)} className="w-4 h-4 accent-gold rounded" />
                    <span className="text-sm text-black">جديد</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} className="w-4 h-4 accent-gold rounded" />
                    <span className="text-sm text-black">مفعّل</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving || loadingProduct} className="btn-gold px-6 py-2.5 text-sm disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-gray-200 rounded-button text-sm font-medium text-black hover:border-gold hover:text-gold transition-colors"
              >
                إلغاء
              </button>
            </div>
            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          </div>
        </form>
      </div>
    </div>
  )
}
