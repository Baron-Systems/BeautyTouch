import React, { useMemo, useEffect, useState, useCallback } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import { getCategoryBySlug, getSubcategoryBySlug, categories as staticCategories } from '../data/categories.js'
import { storage } from '../services/storage.js'

export default function CategoryPage() {
  const { categorySlug, subcategorySlug } = useParams()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(staticCategories)

  const category = useMemo(() => {
    const cat = categories.find((c) => c.slug === categorySlug) || getCategoryBySlug(categorySlug)
    return cat && cat.isActive === false ? null : cat
  }, [categories, categorySlug])

  // Parse search query from hash URL
  const searchQuery = useMemo(() => {
    const hash = location.hash
    const [path, queryString] = hash.split('?')
    const params = new URLSearchParams(queryString || '')
    return params.get('search') || ''
  }, [location.hash])

  const loadCatalog = useCallback(() => {
    storage.getProducts().then((data) => setProducts(data.filter((p) => p.isActive !== false))).catch(() => setProducts([]))
    storage.getCategories().then((data) => {
      const merged = [...staticCategories]
      data.forEach((apiCat) => {
        const idx = merged.findIndex((c) => c.slug === apiCat.slug)
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], ...apiCat, sortOrder: apiCat.sortOrder ?? merged[idx].sortOrder }
        } else if (!['offers', 'new', 'bestsellers', 'packages'].includes(apiCat.slug)) {
          merged.push(apiCat)
        }
      })
      setCategories(merged.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
    }).catch(() => setCategories(staticCategories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))))
  }, [])

  useEffect(() => {
    loadCatalog()
    return storage.onCatalogChange(loadCatalog)
  }, [loadCatalog])

  const filteredProducts = useMemo(() => {
    if (!category) return []

    let result = []

    if (categorySlug === 'bestsellers') {
      result = products.filter((p) => p.isBestSeller)
    } else if (categorySlug === 'new') {
      result = products.filter((p) => p.isNew)
    } else if (categorySlug === 'offers') {
      result = products.filter((p) => p.price < 500)
    } else if (subcategorySlug) {
      result = products.filter(
        (p) => p.category === categorySlug && p.subcategory === subcategorySlug
      )
    } else {
      result = products.filter((p) => p.category === categorySlug)
    }

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    return result.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }, [categorySlug, subcategorySlug, products, searchQuery])

  const subcategory = useMemo(() => {
    if (!subcategorySlug || !category || !category.subcategories) return null
    return category.subcategories.find((s) => s.slug === subcategorySlug)
  }, [category, subcategorySlug])

  const pageTitle = subcategory
    ? subcategory.name
    : category
    ? category.name
    : 'المنتجات'

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-black mb-4">التصنيف غير موجود</h1>
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
        <span className="text-black font-medium">{pageTitle}</span>
      </nav>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">{pageTitle}</h1>
        <p className="text-sm text-black-light">
          {searchQuery ? `نتائج البحث: ${filteredProducts.length} منتج` : `${filteredProducts.length} منتج`}
        </p>
      </div>

      {/* Subcategories */}
      {category.hasSubcategories && !subcategorySlug && (
        <div className="flex gap-2 flex-wrap mb-6">
          {category.subcategories.map((sub) => (
            <Link
              key={sub.id}
              to={`/category/${categorySlug}/${sub.slug}`}
              className="px-4 py-2 rounded-full bg-white shadow-card text-sm text-black hover:bg-gold hover:text-white transition-colors"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

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
          <p className="text-black-light">لا توجد منتجات في هذا التصنيف حالياً</p>
        </div>
      )}
    </div>
  )
}
