import React, { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const alreadyDismissed = localStorage.getItem('install_prompt_dismissed')
      if (!alreadyDismissed) setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    localStorage.setItem('install_prompt_dismissed', 'true')
  }

  if (!visible || dismissed) return null

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
