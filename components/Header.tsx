'use client'

import { useRouter } from 'next/navigation'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
}

export default function Header({ title, subtitle, showBack }: HeaderProps) {
  const router = useRouter()

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, #FF8C5A 0%, #FF7A45 30%, #FF6B35 70%, #E5784A 100%)',
        }}
      />
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
        }}
      />

      <div className="relative px-4 py-6 text-white safe-area-top">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="touch-target text-white text-lg mr-1 active:scale-90 transition-transform duration-150 rounded-xl hover:bg-white/10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">📖</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-wide">{title}</h1>
            {subtitle && (
              <p className="text-sm opacity-80 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
