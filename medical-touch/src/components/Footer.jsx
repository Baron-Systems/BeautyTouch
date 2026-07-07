import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, MapPin, Instagram, MessageCircle } from 'lucide-react'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="small" />
            <p className="text-sm text-black-light leading-relaxed">
              Beauty Touch — وجهتك الأولى للمنتجات التجميلية الطبية الفاخرة. نقدم لك أجود المنتجات العالمية بأعلى معايير الجودة.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black text-sm">روابط سريعة</h3>
            <div className="flex flex-col gap-2">
              <Link to="/category/bestsellers" className="text-sm text-black-light hover:text-gold transition-colors">
                الأكثر مبيعاً
              </Link>
              <Link to="/category/new" className="text-sm text-black-light hover:text-gold transition-colors">
                جديدنا
              </Link>
              <Link to="/category/offers" className="text-sm text-black-light hover:text-gold transition-colors">
                العروض
              </Link>
              <Link to="/cart" className="text-sm text-black-light hover:text-gold transition-colors">
                سلة التسوق
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black text-sm">تواصل معنا</h3>
            <div className="flex flex-col gap-3">
              <a
                href="whatsapp://send?phone=+972595330105"
                className="flex items-center gap-2 text-sm text-black-light hover:text-gold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب: 0595330105</span>
              </a>
              <a
                href="tel:+970595330105"
                className="flex items-center gap-2 text-sm text-black-light hover:text-gold transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>0595330105</span>
              </a>
              <div className="flex items-center gap-2 text-sm text-black-light">
                <MapPin className="w-4 h-4" />
                <span>فلسطين</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 text-center">
          <p className="text-xs text-black-light">
            &copy; {new Date().getFullYear()} Beauty Touch. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  )
}
