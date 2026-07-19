'use client'

import { useEffect, useState } from 'react'
import { ToastProps } from '@/types'

export default function Toast({ show, type, message }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#10B981" strokeWidth="1.5" />
            <path d="M6 10L9 13L14 7" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#EF4444" strokeWidth="1.5" />
            <path d="M7 7L13 13M13 7L7 13" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#3B82F6" strokeWidth="1.5" />
            <path d="M10 9V14M10 6.5V7" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#15803D',
        }
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          text: '#B91C1C',
        }
      case 'info':
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#1D4ED8',
        }
    }
  }

  const styles = getStyles()

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl border flex items-center gap-2.5 backdrop-blur-sm transition-all duration-300 max-w-[calc(100%-2rem)]"
      style={{
        top: '48px',
        backgroundColor: styles?.bg,
        borderColor: styles?.border,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        opacity: show ? 1 : 0,
        transform: `translateX(-50%) translateY(${show ? '0' : '-8px'}) scale(${show ? '1' : '0.95'})`,
      }}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <span className="text-sm font-medium" style={{ color: styles?.text }}>
        {message}
      </span>
    </div>
  )
}
