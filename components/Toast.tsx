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

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'info': return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success': return 'text-emerald-700'
      case 'error': return 'text-red-700'
      case 'info': return 'text-blue-700'
    }
  }

  return (
    <div
      className={`
        fixed top-12 left-1/2 -translate-x-1/2 z-[100]
        px-4 py-3 rounded-xl border
        flex items-center gap-2.5
        shadow-card-hover backdrop-blur-sm
        transition-all duration-300 ease-ios
        ${getBgColor()}
        ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'}
        max-w-[calc(100%-2rem)]
      `}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <span className={`text-sm font-medium ${getTextColor()}`}>
        {message}
      </span>
    </div>
  )
}
