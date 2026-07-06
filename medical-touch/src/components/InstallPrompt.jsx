import React, { useEffect, useState } from 'react'
import { Download, X, Share2, MoreVertical } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Show prompt after a short delay if not on desktop
    const timer = setTimeout(() => {
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
      if (isMobile) setVisible(true)
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setVisible(false)
        setDeferredPrompt(null)
      }
    } else {
      setShowManual(true)
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    setShowManual(false)
  }

  if (!visible) return null

  if (showManual) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    return (
      <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 bg-black/50 md:hidden">
        <div className="bg-white rounded-card shadow-xl w-full max-w-sm p-5">
          <h3 className="text-lg font-bold text-black mb-3">إضافة للشاشة الرئيسية</h3>
          {isIOS ? (
            <ol className="text-sm text-black-light space-y-2 mb-4">
              <li>1. اضغط زر <span className="font-bold text-black">Share</span> في أسفل المتصفح</li>
              <li>2. اختر <span className="font-bold text-black">"Add to Home Screen"</span></li>
              <li>3. اضغط <span className="font-bold text-black">"Add"</span></li>
            </ol>
          ) : (
            <ol className="text-sm text-black-light space-y-2 mb-4">
              <li>1. اضغط زر القائمة <MoreVertical className="w-4 h-4 inline" /> في المتصفح</li>
              <li>2. اختر <span className="font-bold text-black">"Add to Home screen"</span> أو <span className="font-bold text-black">"Install app"</span></li>
              <li>3. اضغط <span className="font-bold text-black">"Install"</span></li>
            </ol>
          )}
          <button onClick={handleDismiss} className="w-full btn-gold py-2.5 text-sm">
            فهمت
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] bg-white border-t border-gray-100 shadow-lg px-4 py-3 md:hidden">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-black">تطبيق Beauty Touch</p>
          <p className="text-xs text-black-light">حمّل التطبيق لمتابعة طلباتك بسهولة</p>
        </div>
        <button
          onClick={handleInstall}
          className="btn-gold text-xs px-4 py-2 flex-shrink-0"
        >
          تحميل
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-black-light hover:text-black transition-colors flex-shrink-0"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
