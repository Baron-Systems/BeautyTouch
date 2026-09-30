import React, { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد الحذف',
  message,
  itemName,
  confirmLabel = 'حذف',
  cancelLabel = 'إلغاء',
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleConfirm = async () => {
    setError('')
    setDeleting(true)
    try {
      await onConfirm()
      setDeleting(false)
      onClose()
    } catch (err) {
      setDeleting(false)
      setError(typeof err === 'string' ? err : err?.message || 'حدث خطأ أثناء الحذف')
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={!deleting ? onClose : undefined} />
      <div className="relative bg-white rounded-card shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-black">{title}</h2>
          </div>
          <button
            onClick={!deleting ? onClose : undefined}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-black-light" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-black-light leading-relaxed">
            {message}
            {itemName && (
              <>
                <span className="font-bold text-black"> &quot;{itemName}&quot;</span>
                {'؟'}
              </>
            )}
            {!itemName && '؟'}
          </p>
          <p className="text-xs text-red-500 mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
          {error && (
            <div className="mt-3 bg-red-50 text-red-600 rounded-lg p-3 text-sm text-center">
              {error}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
          <button
            onClick={!deleting ? onClose : undefined}
            disabled={deleting}
            className="px-5 py-2.5 text-sm font-medium text-black-light hover:text-black transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="px-5 py-2.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جارٍ الحذف...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
