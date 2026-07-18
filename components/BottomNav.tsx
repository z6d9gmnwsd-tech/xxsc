'use client'

import { Home, BookOpen, Heart, User } from 'lucide-react'

interface BottomNavProps {
  activePage: 'home' | 'publish' | 'favorites' | 'my'
}

const navItems = [
  { key: 'home' as const, href: '/', icon: Home, label: '首页' },
  { key: 'publish' as const, href: '/publish', icon: BookOpen, label: '卖书' },
  { key: 'favorites' as const, href: '/my/favorites', icon: Heart, label: '收藏' },
  { key: 'my' as const, href: '/my', icon: User, label: '我的' },
]

export default function BottomNav({ activePage }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 nav-glass">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.key
          return (
            <a
              key={item.key}
              href={item.href}
              className="flex-1 flex flex-col items-center py-2 transition-all duration-300"
              style={{ color: isActive ? '#8B6914' : '#999999' }}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {isActive && (
                <div className="w-4 h-0.5 rounded-full mt-1" style={{background: '#8B6914'}} />
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
