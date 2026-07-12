import React, { useEffect, useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, Sparkles, ShoppingBag, MessageCircle, TrendingUp, Star, Zap, Download, X } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import { categories } from '../data/categories.js'
import { storage } from '../services/storage.js'

const promoCategories = [
  { slug: 'offers', name: 'العروض', icon: Zap, color: 'from-gold to-gold-dark', desc: 'أفضل العروض المحدودة' },
  { slug: 'new', name: 'جديدنا', icon: Sparkles, color: 'from-gold-light to-gold', desc: 'آخر المنتجات الواصلة' },
  { slug: 'bestsellers', name: 'الأكثر مبيعاً', icon: TrendingUp, color: 'from-black to-black-light', desc: 'المنتجات الأكثر طلباً' },
  { slug: 'injections', name: 'الحقن التجميلية', icon: Star, color: 'from-gold to-gold-dark', desc: 'فيلر، بوتكس، سكين بوستر' },
  { slug: 'skincare', name: 'العناية بالبشرة', icon: Sparkles, color: 'from-black to-black-light', desc: 'منتجات متخصصة للبشرة' },
  { slug: 'creams', name: 'الكريمات والسيرومات', icon: ShoppingBag, color: 'from-gold to-gold-dark', desc: 'أفضل الماركات العالمية' },
]

const brands = [
  'Restylane', 'Allergan', 'Profhilo', 'La Roche-Posay', 'Mesoestetic',
  'Sculptra', 'PCA Skin', 'SkinCeuticals', 'Juvederm', 'Teoxane',
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [showInstall, setShowInstall] = useState(true)
  const [showManual, setShowManual] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const location = useLocation()
  
  // Parse search query from hash URL
  const searchQuery = useMemo(() => {
    const hash = location.hash
    const [path, queryString] = hash.split('?')
    const params = new URLSearchParams(queryString || '')
    return params.get('search') || ''
  }, [location.hash])

  useEffect(() => {
    storage.getProducts().then((data) => setProducts(data.filter((p) => p.isActive !== false))).catch(() => setProducts([]))

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsInstalled(isStandalone)

    const hasSeenInstallBanner = localStorage.getItem('hasSeenInstallBanner')
    if (hasSeenInstallBanner) {
      setShowInstall(false)
    }

    if (window.deferredInstallPrompt) {
      setInstallPrompt(window.deferredInstallPrompt)
    }

    const handlePromptReady = () => {
      setInstallPrompt(window.deferredInstallPrompt)
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setIsInstalled(true)
      setShowInstall(false)
      localStorage.setItem('hasSeenInstallBanner', 'true')
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
  }

  const isSamsung = /SamsungBrowser/i.test(navigator.userAgent)
  const isChrome = /Chrome/i.test(navigator.userAgent) && !isSamsung
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4)
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4)

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const query = searchQuery.toLowerCase()
    return products.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  return (
    <div className="space-y-16">
      {/* Search Results Header */}
      {searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-black mb-2">
            نتائج البحث: <span className="text-gold">{searchQuery}</span>
          </h1>
          <p className="text-black-light text-sm mb-6">
            {filteredProducts.length} منتج متوفر
          </p>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-black-light">لا توجد نتائج مطابقة لبحثك</p>
            </div>
          )}
        </section>
      )}

      {/* Video Hero - Hide when searching */}
      {!searchQuery && (
        <>
          <section className="relative w-full overflow-hidden bg-black">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[50vh] md:h-[60vh] object-cover"
              poster="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=600&fit=crop"
            >
              <source src="/intro.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </section>

          {/* Hero */}
          <section className="relative bg-gradient-to-br from-white via-gold-50 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center md:text-right">
                  <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-dark px-4 py-2 rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>تجربة تسوق فاخرة</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-black leading-tight">
                    Beauty Touch
                  </h1>
                  <h2 className="text-xl md:text-2xl font-semibold text-gold mt-2">
                    لأنك تستحق الأفضل
                  </h2>
                  <p className="text-black-light text-base md:text-lg leading-relaxed max-w-lg">
                    نقدم مجموعة متكاملة من منتجات التجميل الطبي والعناية، لنلبي احتياجات المختصين والأفراد بجودة عالية.
                  </p>
                  <Link to="/category/bestsellers" className="btn-gold inline-block text-center">
                    تسوق الآن
                  </Link>
                </div>
                <div className="relative hidden md:block">
                  <div className="aspect-square max-w-md mx-auto rounded-card overflow-hidden shadow-gold">
                    <img
                      src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=800&fit=crop"
                      alt="Beauty Touch Products"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-card shadow-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">+500</p>
                        <p className="text-xs text-black-light">منتج طبي فاخر</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-bold text-black mb-6">تصفح حسب التصنيف</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {promoCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="group relative overflow-hidden rounded-card p-4 bg-white shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3`}>
                    <cat.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-black text-sm mb-1">{cat.name}</h3>
                  <p className="text-xs text-black-light">{cat.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Category Promo Banners */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
            {categories.filter(c => c.slug !== 'offers' && c.slug !== 'new' && c.slug !== 'bestsellers').map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="block group"
              >
                <div className="bg-gradient-to-r from-gold-50 via-white to-gold-50 rounded-card p-6 md:p-8 flex items-center justify-between hover:shadow-card transition-all duration-300">
                  <div>
                    <h3 className="text-lg font-bold text-black group-hover:text-gold transition-colors">{cat.name}</h3>
                    <p className="text-sm text-black-light mt-1">اكتشف مجموعة {cat.name} الفاخرة</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gold group-hover:-translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </section>

          {/* Best Sellers */}
          {bestSellers.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">الأكثر مبيعاً</h2>
                <Link to="/category/bestsellers" className="text-sm text-gold font-medium flex items-center gap-1 hover:underline">
                  عرض الكل
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">جديدنا</h2>
                <Link to="/category/new" className="text-sm text-gold font-medium flex items-center gap-1 hover:underline">
                  عرض الكل
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Brands Carousel */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-bold text-black mb-6">الماركات العالمية</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {brands.map((brand) => (
                <div
                  key={brand}
                  className="flex-shrink-0 bg-white rounded-card shadow-card px-6 py-4 flex items-center justify-center min-w-[140px] hover:shadow-card-hover transition-shadow"
                >
                  <span className="font-semibold text-black text-sm">{brand}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Social Media Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-card shadow-card p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold text-black mb-4">تابعنا على وسائل التواصل</h2>
              <p className="text-black-light max-w-lg mx-auto mb-8">
                كن على اطلاع بأحدث المنتجات والعروض والنصائح التجميلية عبر قنواتنا الرسمية.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://youtube.com/@beauty.touch1?si=FfMqfGEF-vK3GzI9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube</span>
                </a>
                <a
                  href="https://www.instagram.com/beauty.touch.ps?utm_source=qr&igsh=bDZjemZ0Y3VyeGlr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a
                  href="https://www.snapchat.com/add/beautytouch.ps?share_id=EPjxNY54sCM&locale=ar-PS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.703 2.374.624 3.537-.099 1.365-.587 2.695-1.355 3.814-.745 1.087-1.965 2.009-3.525 2.675.375.733.834 1.303 1.358 1.687.51.373 1.193.604 1.989.604.265 0 .521-.026.766-.078.238-.05.461-.107.669-.171.208-.064.399-.124.576-.18.365-.114.68-.171.946-.171.114 0 .222.017.323.052.264.09.479.263.634.515.156.254.229.542.216.856-.013.314-.127.607-.338.872-.374.477-.943.852-1.691 1.114-.745.261-1.542.393-2.366.393-.525 0-.978-.048-1.359-.144-.381-.096-.717-.224-1.008-.383-.291-.159-.54-.324-.747-.494-.206-.171-.383-.327-.531-.469-.148.142-.325.298-.531.469-.207.17-.456.335-.747.494-.291.159-.627.287-1.008.383-.381.096-.834.144-1.359.144-.824 0-1.621-.132-2.366-.393-.748-.262-1.317-.637-1.691-1.114-.211-.265-.325-.558-.338-.872-.013-.314.06-.602.216-.856.155-.252.37-.425.634-.515.101-.035.209-.052.323-.052.266 0 .581.057.946.171.177.056.368.116.576.18.208.064.431.121.669.171.245.052.501.078.766.078.796 0 1.479-.231 1.989-.604.524-.384.983-.954 1.358-1.687-1.56-.666-2.78-1.588-3.525-2.675-.768-1.119-1.256-2.449-1.355-3.814-.079-1.163.095-2.344.624-3.537C7.753 1.069 11.11.793 12.206.793zm0 1.5c-1.724 0-3.513.727-4.242 2.834-.396 1.185-.332 2.346.188 3.452.523 1.11 1.577 2.04 3.054 2.733.18.08.312.243.352.438.04.196-.022.399-.167.539-.478.451-.917.893-1.312 1.327-.393.432-.702.876-.922 1.33-.42.049-.805.012-1.157-.111-.404-.143-.749-.361-1.04-.654-.29.293-.636.511-1.04.654-.352.123-.737.16-1.157.111-.22-.454-.529-.898-.922-1.33-.395-.434-.834-.876-1.312-1.327-.145-.14-.207-.343-.167-.539.04-.195.172-.358.352-.438 1.477-.693 2.531-1.623 3.054-2.733.52-1.106.584-2.267.188-3.452-.729-2.107-2.518-2.834-4.242-2.834z"/>
                  </svg>
                  <span>Snapchat</span>
                </a>
                <a
                  href="https://www.tiktok.com/@beauty.touch.ps?_r=1&_t=ZS-97xxPI2xPeu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.62 2.66-4.9 1.54-1.38 3.65-2.05 5.77-1.86 1.17.1 2.34.46 3.33 1.06.01-1.67-.02-3.33.02-5-.01-.05-.04-.09-.06-.14-.23-.66-.39-1.34-.48-2.04-.07-.47-.09-.95-.06-1.43.14-1.56 1.1-2.96 2.49-3.78 1.18-.66 2.57-.86 3.9-.57.02.04.05.07.06.11-.35.21-.68.47-.96.78-.49.52-.82 1.2-.91 1.93-.08.57-.03 1.15.13 1.7.19.74.53 1.44.99 2.03z"/>
                  </svg>
                  <span>TikTok</span>
                </a>
                <a
                  href="https://www.facebook.com/share/1HKdSBgf3S/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </section>

          {/* WhatsApp Order Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-gold to-gold-dark rounded-card p-8 md:p-12 text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">اطلب عبر واتساب</h2>
              <p className="text-white/90 max-w-lg mx-auto mb-6 leading-relaxed">
                تسوق بسهولة وأمان، وأرسل طلبك مباشرة عبر واتساب وسنقوم بالتواصل معك فوراً لتأكيد الطلب.
              </p>
              <a
                href="whatsapp://send?phone=+972595330105"
                className="inline-block bg-white text-gold font-bold px-8 py-3 rounded-button hover:bg-white/90 transition-colors"
              >
                تواصل عبر واتساب
              </a>
            </div>
          </section>
        </>
      )}

      {/* Mobile Install Banner */}
      {showInstall && !isInstalled && (
        <div className="fixed bottom-0 inset-x-0 z-[60] bg-white border-t border-gray-100 shadow-lg px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black">تطبيق Beauty Touch</p>
              <p className="text-xs text-black-light">
                {isChrome && installPrompt
                  ? 'اضغط تحميل للتثبيت مباشرة'
                  : isIOS
                  ? 'افتح من Safari ثم Share → Add to Home Screen'
                  : 'افتح من Chrome للتثبيت المباشر'}
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="btn-gold text-xs px-4 py-2 flex-shrink-0"
            >
              تحميل
            </button>
            <button
              onClick={() => {
                setShowInstall(false)
                localStorage.setItem('hasSeenInstallBanner', 'true')
              }}
              className="p-1.5 text-black-light hover:text-black transition-colors flex-shrink-0"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Manual Install Instructions Modal */}
      {showManual && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 bg-black/50 md:hidden" onClick={() => setShowManual(false)}>
          <div className="bg-white rounded-card shadow-xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-black mb-3">إضافة للشاشة الرئيسية</h3>
            {isIOS ? (
              <ol className="text-sm text-black-light space-y-2 mb-4">
                <li>1. اضغط زر <span className="font-bold text-black">Share</span> في أسفل المتصفح</li>
                <li>2. اختر <span className="font-bold text-black">"Add to Home Screen"</span></li>
                <li>3. اضغط <span className="font-bold text-black">"Add"</span></li>
              </ol>
            ) : (
              <ol className="text-sm text-black-light space-y-2 mb-4">
                <li>1. افتح الموقع في <span className="font-bold text-black">Google Chrome</span></li>
                <li>2. اضغط زر القائمة <span className="font-bold text-black">⋮</span></li>
                <li>3. اختر <span className="font-bold text-black">"Add to Home screen"</span> أو <span className="font-bold text-black">"Install app"</span></li>
                <li>4. اضغط <span className="font-bold text-black">"Install"</span></li>
              </ol>
            )}
            <button onClick={() => setShowManual(false)} className="w-full btn-gold py-2.5 text-sm">
              فهمت
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
