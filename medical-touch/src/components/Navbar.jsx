import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Heart, Menu, X, ClipboardList, Download, MoreVertical } from 'lucide-react'
import Logo from './Logo.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const { cartCount, wishlist } = useCart()
  const location = useLocation()

  const handleInstall = async () => {
    const promptEvent = window.deferredInstallPrompt || window.lastBeforeInstallPrompt
    if (promptEvent) {
      promptEvent.prompt()
      await promptEvent.userChoice
      window.deferredInstallPrompt = null
      window.lastBeforeInstallPrompt = null
      setMenuOpen(false)
    } else {
      setShowManual(true)
      setMenuOpen(false)
    }
  }

  const isAdmin = location.pathname.startsWith('/admin')

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/category/bestsellers', label: 'الأكثر مبيعاً' },
    { to: '/category/new', label: 'جديدنا' },
    { to: '/category/offers', label: 'العروض' },
    { to: '/category/injections', label: 'الحقن التجميلية' },
    { to: '/category/skincare', label: 'العناية بالبشرة' },
    { to: '/category/bodycare', label: 'العناية بالجسم' },
    { to: '/category/haircare', label: 'العناية بالشعر' },
    { to: '/category/sunscreen', label: 'واقيات الشمس' },
    { to: '/category/creams', label: 'الكريمات والسيرومات' },
    { to: '/category/devices', label: 'أجهزة التجميل' },
    { to: '/category/clinic-supplies', label: 'مستلزمات العيادات' },
    { to: '/category/aftercare', label: 'العناية بعد الإجراءات' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          {!isAdmin && (
            <nav className="hidden lg:flex items-center gap-6 mx-4 overflow-x-auto">
              {navLinks.slice(0, 6).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-black-light hover:text-gold transition-colors duration-200 whitespace-nowrap font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <>
                <Link
                  to="/wishlist"
                  className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
                  aria-label="المفضلة"
                >
                  <Heart className="w-5 h-5 text-black-light" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
                  aria-label="سلة التسوق"
                >
                  <ShoppingBag className="w-5 h-5 text-black-light" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/my-orders"
                  className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
                  aria-label="طلباتي"
                >
                  <ClipboardList className="w-5 h-5 text-black-light" />
                </Link>
              </>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="القائمة"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg" style={{ animation: 'slideDown 0.2s ease-out' }}>
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="py-2 px-3 text-sm text-black-light hover:text-gold hover:bg-gold-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleInstall}
                className="w-full py-2.5 px-3 text-sm font-medium text-gold bg-gold-50 hover:bg-gold/10 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                تحميل التطبيق
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Manual Install Modal */}
      {showManual && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 bg-black/50 md:hidden" onClick={() => setShowManual(false)}>
          <div className="bg-white rounded-card shadow-xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-black mb-3">إضافة للشاشة الرئيسية</h3>
            <ol className="text-sm text-black-light space-y-2 mb-4">
              <li>1. اضغط زر القائمة <MoreVertical className="w-4 h-4 inline" /> في المتصفح</li>
              <li>2. اختر <span className="font-bold text-black">"Add to Home screen"</span> أو <span className="font-bold text-black">"Install app"</span></li>
              <li>3. اضغط <span className="font-bold text-black">"Install"</span></li>
            </ol>
            <button onClick={() => setShowManual(false)} className="w-full btn-gold py-2.5 text-sm">
              فهمت
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
