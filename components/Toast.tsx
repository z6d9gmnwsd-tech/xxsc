'use client'

import { useState, useEffect, useCallback } from 'react'

interface ToastProps {
  show: boolean
  type: 'success' | 'error' | 'info'
  message: string
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export function showToast(type: 'success' | 'error' | 'info', message: string) {
  const event = new CustomEvent('show-toast', { detail: { type, message } })
  window.dispatchEvent(event)
}

export default function Toast() {
  const [toast, setToast] = useState<ToastProps>({ show: false, type: 'success', message: '' })

  const handleShow = useCallback((e: CustomEvent<ToastProps>) => {
    if (toastTimer) clearTimeout(toastTimer)
    setToast({ show: true, ...e.detail })
    toastTimer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 2000)
  }, [])

  useEffect(() => {
    window.addEventListener('show-toast', handleShow as EventListener)
    return () => {
      window.removeEventListener('show-toast', handleShow as EventListener)
      if (toastTimer) clearTimeout(toastTimer)
    }
  }, [handleShow])

  if (!toast.show) return null

  const icons = { success: '✓', error: '✕', info: 'ℹ' }
  const colors = {
    success: { bg: '#e8f8f0', icon: '#27ae60', text: '#27ae60' },
    error: { bg: '#FFF0F0', icon: '#ee0a24', text: '#ee0a24' },
    info: { bg: '#e3f2fd', icon: '#2196f3', text: '#2196f3' },
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] animate-fade-in" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="px-8 py-6 rounded-2xl flex flex-col items-center animate-scale-in" style={{ background: colors[toast.type].bg }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: colors[toast.type].icon }}>
          <span className="text-2xl text-white">{icons[toast.type]}</span>
        </div>
        <p className="text-base font-semibold" style={{ color: colors[toast.type].text }}>{toast.message}</p>
      </div>
    </div>
  )
}
