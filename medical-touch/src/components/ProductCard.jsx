import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart()
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product.id, 1)
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  return (
    <div className="card-luxury overflow-hidden group">
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-luxury group-hover:scale-105"
            loading="lazy"
          />
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              inWishlist
                ? 'bg-gold text-white shadow-gold'
                : 'bg-white/80 backdrop-blur-sm text-black-light hover:bg-white'
            }`}
            aria-label={inWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Tags */}
          {(product.isNew || product.isBestSeller) && (
            <div className="absolute top-3 left-3 flex gap-1">
              {product.isNew && (
                <span className="bg-gold text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  جديد
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  الأكثر مبيعاً
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-black leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              {product.discountedPrice ? (
                <>
                  <span className="text-lg font-bold text-gold">
                    {product.discountedPrice} <span className="text-xs font-normal text-black-light">₪</span>
                  </span>
                  <span className="text-sm font-medium text-red-500 line-through">
                    {product.price} ₪
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gold">
                  {product.price} <span className="text-xs font-normal text-black-light">₪</span>
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-full bg-gold text-white flex items-center justify-center hover:shadow-gold transition-all duration-200 hover:scale-105"
              aria-label="إضافة للسلة"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}
