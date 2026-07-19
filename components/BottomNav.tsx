'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  {
    key: 'home',
    href: '/',
    label: '首页',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
          stroke={active ? '#FF8C5A' : '#9CA3AF'}
          strokeWidth={active ? '2.2' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? 'rgba(255, 140, 90, 0.08)' : 'none'}
        />
        <path
          d="M9 22V12H15V22"
          stroke={active ? '#FF8C5A' : '#9CA3AF'}
          strokeWidth={active ? '2.2' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'publish',
    href: '/publish',
    label: '卖书',
    highlight: true,
    icon: (_active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 5V19M5 12H19"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'favorites',
    href: '/my/favorites',
    label: '收藏',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
          stroke={active ? '#FF8C5A' : '#9CA3AF'}
          strokeWidth={active ? '2' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? 'rgba(255, 140, 90, 0.15)' : 'none'}
        />
      </svg>
    ),
  },
  {
    key: 'my',
    href: '/my',
    label: '我的',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="8"
          r="4"
          stroke={active ? '#FF8C5A' : '#9CA3AF'}
          strokeWidth={active ? '2.2' : '1.8'}
          fill={active ? 'rgba(255, 140, 90, 0.08)' : 'none'}
        />
        <path
          d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20"
          stroke={active ? '#FF8C5A' : '#9CA3AF'}
          strokeWidth={active ? '2.2' : '1.8'}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [pressedKey, setPressedKey] = useState<string | null>(null)

  const getActiveKey = () => {
    if (pathname === '/') return 'home'
    if (pathname.startsWith('/publish')) return 'publish'
    if (pathname.startsWith('/my/favorites')) return 'favorites'
    if (pathname.startsWith('/my')) return 'my'
    return 'home'
  }

  const activeKey = getActiveKey()

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 glass border-t"
      style={{
        borderColor: 'rgba(240, 230, 216, 0.5)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = activeKey === item.key
          const isPressed = pressedKey === item.key
          const isHighlight = !!item.highlight

          return (
            <a
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center relative ${isHighlight ? '-mt-5' : 'py-2 px-4'}`}
              onTouchStart={() => setPressedKey(item.key)}
              onTouchEnd={() => setPressedKey(null)}
              onMouseDown={() => setPressedKey(item.key)}
              onMouseUp={() => setPressedKey(null)}
              onMouseLeave={() => setPressedKey(null)}
            >
              {isHighlight ? (
                <>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #FF8C5A 0%, #FF6B35 100%)',
                      boxShadow: '0 4px 16px rgba(255, 140, 90, 0.35)',
                      transform: isPressed ? 'scale(0.9)' : 'scale(1)',
                      transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}
                  >
                    {item.icon(isActive)}
                  </div>
                  <span
                    className="text-xs mt-1.5 font-medium"
                    style={{
                      color: isActive ? '#FF8C5A' : '#9CA3AF',
                      fontSize: '0.625rem',
                    }}
                  >
                    {item.label}
                  </span>
                </>
              ) : (
                <>
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? 'rgba(255, 140, 90, 0.08)' : isPressed ? '#FBF6EE' : 'transparent',
                      transform: isPressed ? 'scale(0.9)' : 'scale(1)',
                      transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}
                  >
                    {item.icon(isActive)}
                  </div>
                  <span
                    className="text-xs mt-1 font-medium"
                    style={{
                      color: isActive ? '#FF8C5A' : '#9CA3AF',
                      fontSize: '0.625rem',
                    }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div
                      className="absolute -bottom-0.5 w-4 h-0.5 rounded-full"
                      style={{ backgroundColor: '#FF8C5A' }}
                    />
                  )}
                </>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
