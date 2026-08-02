import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import { storage } from '../services/storage.js'

export default function BrandPage() {
  const { brandId } = useParams()
  const [brand, setBrand] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [brandData, productData] = await Promise.all([
        storage.getBrand(brandId),
        storage.getProducts(),
      ])
      setBrand(brandData)
      setProducts(productData.filter((p) => p.isActive !== false))
      setLoading(false)
    }
    load()
  }, [brandId])

  const filteredProducts = useMemo(() => {
    if (!brand) return []
    return products
      .filter((p) => p.brand === brand.name)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }, [brand, products])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-black-light">جاري التحميل...</p>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-black mb-4">الماركة غير موجودة</h1>
        <Link to="/" className="text-gold hover:underline">العودة للرئيسية</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-black-light mb-6">
        <Link to="/" className="hover:text-gold transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-black font-medium">{brand.name}</span>
      </nav>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">منتجات {brand.name}</h1>
        <p className="text-sm text-black-light">{filteredProducts.length} منتج</p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-black-light">لا توجد منتجات لهذه الماركة حالياً</p>
        </div>
      )}
    </div>
  )
}
