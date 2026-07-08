import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Upload, X } from 'lucide-react'
import { storage } from '../../services/storage.js'
import { categories } from '../../data/categories.js'
import Logo from '../../components/Logo.jsx'

export default function AdminProductForm() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(productId)

  const [form, setForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    price: '',
    discountedPrice: '',
    image: '',
    description: '',
    isBestSeller: false,
    isNew: false,
    isActive: true,
  })
  const [previewImage, setPreviewImage] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      storage.getProductById(productId).then((product) => {
        if (product) {
          setForm({
            name: product.name || '',
            category: product.category || '',
            subcategory: product.subcategory || '',
            price: String(product.price) || '',
            discountedPrice: product.discountedPrice ? String(product.discountedPrice) : '',
            image: product.image || '',
            description: product.description || '',
            isBestSeller: product.isBestSeller || false,
            isNew: product.isNew || false,
            isActive: product.isActive !== false,
          })
          setPreviewImage(product.image || '')
        }
      }).catch(() => {})
    }
  }, [isEdit, productId])

  const selectedCategory = categories.find((c) => c.slug === form.category)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result)
      setForm((prev) => ({ ...prev, image: reader.result }))
    }
    reader.readAsDataURL(file)
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

    const productData = {
      ...form,
      price: Number(form.price),
      discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : null,
      subcategory: form.subcategory || null,
    }

    if (isEdit) {
      await storage.updateProduct(productId, productData)
    } else {
      await storage.addProduct(productData)
    }

    navigate('/admin/products')
  }

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'category') {
        updated.subcategory = ''
      }
      return updated
    })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
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
            <Link
              to="/admin/products"
              className="flex items-center gap-1 text-sm text-black-light hover:text-gold transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للمنتجات</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-black mb-6">
          {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-6 md:p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">اسم المنتج *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              }`}
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm bg-white ${
                errors.category ? 'border-red-300' : 'border-gray-200'
              }`}
              dir="rtl"
            >
              <option value="">اختر التصنيف</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* Subcategory */}
          {selectedCategory?.hasSubcategories && (
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
                  <option key={sub.id} value={sub.slug}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">السعر (₪) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm ${
                errors.price ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="مثال: 350"
              min="0"
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>

          {/* Discounted Price */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">السعر بعد الخصم (₪)</label>
            <input
              type="number"
              value={form.discountedPrice}
              onChange={(e) => handleChange('discountedPrice', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors text-sm"
              placeholder="مثال: 300"
              min="0"
            />
            <p className="text-xs text-black-light mt-1">اتركه فارغاً إذا لم يكن هناك خصم</p>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">صورة المنتج *</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                errors.image ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gold bg-gray-50'
              }`}
            >
              {previewImage ? (
                <div className="relative inline-block">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage('')
                      setForm((prev) => ({ ...prev, image: '' }))
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-black-light mx-auto mb-2" />
                  <span className="text-sm text-black-light">اضغط لرفع صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
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
              rows="4"
              placeholder="وصف المنتج..."
              dir="rtl"
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-6 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isBestSeller}
                onChange={(e) => handleChange('isBestSeller', e.target.checked)}
                className="w-4 h-4 accent-gold rounded"
              />
              <span className="text-sm text-black">الأكثر مبيعاً</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => handleChange('isNew', e.target.checked)}
                className="w-4 h-4 accent-gold rounded"
              />
              <span className="text-sm text-black">جديد</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 accent-gold rounded"
              />
              <span className="text-sm text-black">مفعّل</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 btn-gold py-3">
              {isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </button>
            <Link
              to="/admin/products"
              className="px-6 py-3 border-2 border-gray-200 rounded-button text-sm font-medium text-black hover:border-gold hover:text-gold transition-colors"
            >
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
