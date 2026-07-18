'use client'

import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
}

export default function Header({ title, subtitle, showBack }: HeaderProps) {
  return (
    <div className="header-glass px-4 py-5 text-white">
      <div className="flex items-center gap-3">
        {showBack && (
          <a href="javascript:history.back()" className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'rgba(255,255,255,0.15)'}}>
            <ChevronLeft size={20} />
          </a>
        )}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background: 'rgba(255,255,255,0.2)'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            <path d="M8 7h6"/>
            <path d="M8 11h8"/>
          </svg>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold tracking-wide">{title}</h1>
          {subtitle && <p className="text-xs" style={{opacity: 0.7}}>{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
