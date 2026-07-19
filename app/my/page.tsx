'use client'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import AuthModal from '@/components/AuthModal'
import Toast from '@/components/Toast'
import { useState } from 'react'

export default function MyPage() {
  const { user, loading, logout } = usePhoneAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      window.location.reload()
    }
  }

  const menuItems = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="#6366F1" strokeWidth="1.8"/>
          <path d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
      label: '编辑个人信息',
      href: '/my/profile',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#FF8C5A" strokeWidth="1.8"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#FF8C5A" strokeWidth="1.8"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#FF8C5A" strokeWidth="1.8"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#FF8C5A" strokeWidth="1.8"/>
        </svg>
      ),
      label: '我的发布',
      href: '/my/items',
    },
  ]

  const settingItems = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="1.8"/>
          <path d="M12 8V12M12 16H12.01" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
      label: '关于新校书仓',
      href: null,
      badge: 'v1.0.0',
    },
  ]

  return (
    <div className="pb-24 min-h-screen" style={{ backgroundColor: '#FEFCF9' }}>
      <Toast />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #FF8C5A 0%, #FF7A45 30%, #FF6B35 70%, #E5784A 100%)' }} />
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)' }} />

        <div className="relative px-5 py-8 text-white safe-area-top">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255, 255, 255, 0.3)' }}>
              {user ? (
                <span className="text-2xl font-bold">{user.nickname?.[0] || '用'}</span>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
                  <path d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </div>

            <div className="flex-1">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-5 w-24 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  <div className="h-4 w-32 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                </div>
              ) : user ? (
                <>
                  <div className="text-xl font-bold">{user.nickname}</div>
                  <div className="text-sm opacity-80 mt-0.5">{user.phone}</div>
                </>
              ) : (
                <>
                  <button onClick={() => setShowAuthModal(true)} className="text-xl font-bold active:scale-95 transition-transform">
                    登录 / 注册
                  </button>
                  <div className="text-sm opacity-80 mt-0.5">登录后查看更多功能</div>
                </>
              )}
            </div>

            {user && (
              <button onClick={handleLogout} className="text-sm px-4 py-2 rounded-full active:scale-95 transition-all duration-200" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(4px)' }}>
                退出
              </button>
            )}
          </div>
        </div>
      </div>

      {user ? (
        <div className="px-4 -mt-6 relative z-10 space-y-3">
          <div className="card overflow-hidden">
            {menuItems.map((item, index) => (
              <a key={item.label} href={item.href} className="flex items-center justify-between px-4 py-4 active:scale-[0.98] transition-all duration-200" style={{ borderBottom: index < menuItems.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEFCF9' }}>{item.icon}</div>
                  <span className="font-medium" style={{ color: '#1A1A1A' }}>{item.label}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#D1D5DB' }}>
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            ))}
          </div>

          <div className="card overflow-hidden">
            {settingItems.map((item, index) => (
              <div key={item.label}>
                {item.href ? (
                  <a href={item.href} className="flex items-center justify-between px-4 py-4 active:scale-[0.98] transition-all duration-200" style={{ borderBottom: index < settingItems.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEFCF9' }}>{item.icon}</div>
                      <span className="font-medium" style={{ color: '#1A1A1A' }}>{item.label}</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#D1D5DB' }}>
                      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                ) : (
                  <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: index < settingItems.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEFCF9' }}>{item.icon}</div>
                      <span className="font-medium" style={{ color: '#1A1A1A' }}>{item.label}</span>
                    </div>
                    <span className="text-sm" style={{ color: '#9CA3AF' }}>{item.badge}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-8" style={{ minHeight: '50vh' }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #FEFCF9 0%, #F5E6D0 100%)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#FF8C5A" strokeWidth="2"/>
              <path d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20" stroke="#FF8C5A" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-center mb-6" style={{ color: '#9CA3AF' }}>登录后查看个人信息</p>
          <button onClick={() => setShowAuthModal(true)} className="btn-primary text-lg px-12 py-3 ripple">
            登录 / 注册
          </button>
        </div>
      )}

      <BottomNav />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => { setShowAuthModal(false); window.location.reload() }} />
    </div>
  )
}
