'use client'

import { usePathname } from 'next/navigation'

const navItems = [
  { key: 'home', href: '/', icon: '🏠', label: '首页' },
  { key: 'publish', href: '/publish', icon: '📖', label: '卖书', highlight: true },
  { key: 'favorites', href: '/my/favorites', icon: '⭐', label: '收藏' },
  { key: 'my', href: '/my', icon: '👤', label: '我的' },
]

export default function BottomNav() {
  const pathname = usePathname()

  const getActiveKey = () => {
    if (pathname === '/') return 'home'
    if (pathname.startsWith('/publish')) return 'publish'
    if (pathname.startsWith('/my/favorites')) return 'favorites'
    if (pathname.startsWith('/my')) return 'my'
    return 'home'
  }

  const activeKey = getActiveKey()

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t z-50 bg-white"
         style={{ borderColor: '#e0e0e0', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex">
        {navItems.map((item) => {
          const isActive = activeKey === item.key
          return (
            <a
              key={item.key}
              href={item.href}
              className="flex-1 flex flex-col items-center py-2 touch-target active:scale-95 transition-transform duration-150"
              style={{ color: isActive ? '#ffa06f' : '#999999' }}
            >
              <span className={`text-xl ${item.highlight && !isActive ? 'opacity-80' : ''}`}>
                {item.icon}
              </span>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-6 h-0.5 rounded-full bg-accent" />
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
