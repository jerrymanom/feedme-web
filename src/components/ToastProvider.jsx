import { useCallback, useRef, useState } from 'react'
import { ToastContext } from './toast-context'

// One message at a time, announced to screen readers, gone after a few seconds.
export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const show = useCallback((message, tone = 'ok') => {
    clearTimeout(timer.current)
    setToast({ message, tone, id: Date.now() })
    timer.current = setTimeout(() => setToast(null), 3500)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && <p key={toast.id} className={`toast toast-${toast.tone}`}>{toast.message}</p>}
      </div>
    </ToastContext.Provider>
  )
}
