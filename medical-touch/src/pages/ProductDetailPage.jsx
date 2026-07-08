import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRight, Heart, ShoppingBag, Minus, Plus, Truck, Shield, Clock } from 'lucide-react'
import { storage } from '../services/storage.js'
import { useCart } from '../context/CartContext.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isInWishlist } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const inWishlist = isInWishlist(productId)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const p = await storage.getProductById(productId)
      setProduct(p)
      if (p) {
        const all = await storage.getProducts()
        setRelatedProducts(
          all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)
        )
      }
      setLoading(false)
    }
    load()
  }, [productId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-black-light">جاري التحميل...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-black mb-4">المنتج غير موجود</h1>
        <button onClick={() => navigate(-1)} className="text-gold hover:underline">
          العودة
        </button>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-black-light mb-6">
        <Link to="/" className="hover:text-gold transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/category/${product.category}`} className="hover:text-gold transition-colors">
          {product.category === 'injections' ? 'الحقن التجميلية' : product.category}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-black font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-card overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {(product.isNew || product.isBestSeller) && (
            <div className="absolute top-4 right-4 flex gap-2">
              {product.isNew && (
                <span className="bg-gold text-white text-xs font-bold px-3 py-1 rounded-full">جديد</span>
              )}
              {product.isBestSeller && (
                <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full">الأكثر مبيعاً</span>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-4 leading-snug">
            {product.name}
          </h1>

          <div className="mb-6">
            {product.discountedPrice ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gold">
                  {product.discountedPrice} <span className="text-base font-normal text-black-light">₪</span>
                </span>
                <span className="text-2xl font-medium text-red-500 line-through">
                  {product.price} ₪
                </span>
              </div>
            ) : (
              <div className="text-3xl font-bold text-gold">
                {product.price} <span className="text-base font-normal text-black-light">₪</span>
              </div>
            )}
          </div>

          <p className="text-black-light leading-relaxed mb-8 text-base">
            {product.description}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-black">الكمية:</span>
            <div className="flex items-center border border-gray-200 rounded-button overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="تقليل الكمية"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold text-black">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="زيادة الكمية"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              className="flex-1 btn-gold flex items-center justify-center gap-2 py-4"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>إضافة للسلة</span>
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`w-14 h-14 rounded-button flex items-center justify-center border-2 transition-all duration-200 ${
                inWishlist
                  ? 'border-gold bg-gold text-white'
                  : 'border-gray-200 text-black-light hover:border-gold hover:text-gold'
              }`}
              aria-label={inWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center gap-2 text-center">
              <Shield className="w-6 h-6 text-gold" />
              <span className="text-xs text-black-light">منتجات أصلية</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Truck className="w-6 h-6 text-gold" />
              <span className="text-xs text-black-light">توصيل سريع</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Clock className="w-6 h-6 text-gold" />
              <span className="text-xs text-black-light">دعم على مدار الساعة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-black mb-6">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
