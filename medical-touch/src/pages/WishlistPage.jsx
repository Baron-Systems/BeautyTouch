import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { storage } from '../services/storage.js'
import ProductCard from '../components/ProductCard.jsx'

export default function WishlistPage() {
  const { wishlist } = useCart()
  const [products, setProducts] = useState([])

  useEffect(() => {
    storage.getProducts().then((data) => setProducts(data.filter((p) => p.isActive !== false))).catch(() => setProducts([]))
  }, [])

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id))

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-20 h-20 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-gold" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-3">المفضلة فارغة</h1>
        <p className="text-black-light mb-8">أضف منتجاتك المفضلة للوصول إليها بسهولة</p>
        <Link to="/category/bestsellers" className="btn-gold inline-block">
          تصفح المنتجات
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-black mb-2">المفضلة</h1>
      <p className="text-sm text-black-light mb-6">{wishlistProducts.length} منتج</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
