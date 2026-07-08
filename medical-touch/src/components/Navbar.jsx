import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, Menu, X, ClipboardList, Download, MoreVertical, ArrowLeft, Sun, Moon, Search } from 'lucide-react'
import Logo from './Logo.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { cartCount, wishlist } = useCart()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  // Sync search query with URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1])
    const search = params.get('search')
    if (search) {
      setSearchQuery(search)
    } else {
      setSearchQuery('')
    }
  }, [location])

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    // Update URL with search param
    const url = new URL(window.location.href)
    if (query) {
      url.searchParams.set('search', query)
    } else {
      url.searchParams.delete('search')
    }
    window.history.replaceState({}, '', url)
  }

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsInstalled(isStandalone)

    if (window.deferredInstallPrompt) {
      setInstallPrompt(window.deferredInstallPrompt)
    }

    const handlePromptReady = () => {
      setInstallPrompt(window.deferredInstallPrompt)
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setIsInstalled(true)
      window.deferredInstallPrompt = null
    }

    window.addEventListener('installpromptready', handlePromptReady)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('installpromptready', handlePromptReady)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    const promptEvent = installPrompt || window.deferredInstallPrompt
    if (!promptEvent) {
      setShowManual(true)
      setMenuOpen(false)
      return
    }

    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    setInstallPrompt(null)
    window.deferredInstallPrompt = null
    setMenuOpen(false)
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
          {/* Logo + Back */}
          <div className="flex items-center gap-2">
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className="md:hidden p-2 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="رجوع"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>
          </div>

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

          {/* Search */}
          {!isAdmin && (
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black-light" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="بحث عن منتج..."
                  className="w-48 lg:w-64 pr-9 pl-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors"
                  dir="rtl"
                />
              </div>
            </div>
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
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-50 transition-colors"
              aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
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
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black-light" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="بحث عن منتج..."
                className="w-full pr-9 pl-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors"
                dir="rtl"
              />
            </div>
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
                disabled={isInstalled}
                className="w-full py-2.5 px-3 text-sm font-medium text-gold bg-gold-50 hover:bg-gold/10 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isInstalled ? 'تم تثبيت التطبيق' : 'تحميل التطبيق'}
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
