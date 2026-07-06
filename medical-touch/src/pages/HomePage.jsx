import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

  return (
    <div className="space-y-16">
      {/* Video Hero */}
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
            href="https://wa.me/970595330105"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-gold font-bold px-8 py-3 rounded-button hover:bg-white/90 transition-colors"
          >
            تواصل عبر واتساب
          </a>
        </div>
      </section>

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
