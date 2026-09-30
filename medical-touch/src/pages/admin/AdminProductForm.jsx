import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import ProductFormModal from './ProductFormModal.jsx'

// Route wrapper: keeps /admin/products/new and /admin/products/edit/:id working
// while the primary UX is the modal opened from the category products page.
export default function AdminProductForm() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const defaultCategory = new URLSearchParams(location.search).get('category') || ''

  const goBack = () => navigate('/admin/products')

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-black-light hover:text-gold transition-colors"
        >
          <span>العودة للمنتجات</span>
        </button>
      </div>
      <ProductFormModal
        isOpen
        productId={productId ? Number(productId) : null}
        defaultCategory={defaultCategory}
        onClose={goBack}
        onSaved={goBack}
      />
    </>
  )
}
