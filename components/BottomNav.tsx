'use client'

interface BottomNavProps {
  activePage: 'home' | 'publish' | 'favorites' | 'my'
}

const navItems = [
  { key: 'home' as const, href: '/', icon: '🏠', label: '首页' },
  { key: 'publish' as const, href: '/publish', icon: '📖', label: '卖书' },
  { key: 'favorites' as const, href: '/my/favorites', icon: '⭐', label: '收藏' },
  { key: 'my' as const, href: '/my', icon: '👤', label: '我的' },
]

export default function BottomNav({ activePage }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t z-50" style={{background: '#fff', borderColor: '#e0e0e0'}}>
      <div className="flex">
        {navItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className="flex-1 flex flex-col items-center py-2"
            style={{color: activePage === item.key ? '#ffa06f' : '#999999'}}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
