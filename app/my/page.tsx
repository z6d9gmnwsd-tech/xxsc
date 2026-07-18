'use client'

import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import AuthModal from '@/components/AuthModal'
import { useState, useEffect } from 'react'
import { Package, Search, CreditCard, Settings, Info, LogOut, ChevronRight, User } from 'lucide-react'

export default function MyPage() {
  const { user, loading, logout } = usePhoneAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (user) {
      router.refresh()
    }
  }, [user])

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
    }
  }

  const menuItems = [
    { icon: Package, label: '我的发布', href: '/my/items' },
    { icon: Search, label: '我的求购', href: '/want' },
    { icon: CreditCard, label: '交易记录', href: '/my/transactions' },
  ]

  const settingsItems = [
    { icon: Settings, label: '编辑个人信息', href: '/my/profile' },
    { icon: Info, label: '关于新校书仓', href: '', extra: 'v1.0.0' },
  ]

  return (
    <div className="pb-20 animate-fade-in">
      <div className="header-glass px-4 py-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)'}}>
            <User size={28} />
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="h-6 rounded-full w-24 skeleton-shimmer" style={{background: 'rgba(255,255,255,0.2)'}} />
            ) : user ? (
              <>
                <div className="text-lg font-bold">{user.nickname}</div>
                <div className="text-xs" style={{opacity: 0.7}}>{user.phone}</div>
              </>
            ) : (
              <>
                <button onClick={() => setShowAuthModal(true)} className="text-lg font-bold">登录/注册</button>
                <div className="text-xs" style={{opacity: 0.7}}>登录后查看更多功能</div>
              </>
            )}
          </div>
          {user && (
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full" style={{background: 'rgba(255,255,255,0.15)'}}>
              <LogOut size={12} /> 退出
            </button>
          )}
        </div>
      </div>

      {user ? (
        <>
          <div className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)'}}>
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <a key={index} href={item.href} className="flex items-center justify-between px-4 py-3.5 transition-colors" style={{borderBottom: index < menuItems.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)'}}>
                      <Icon size={16} style={{color: '#8B6914'}} />
                    </div>
                    <span className="text-sm font-medium" style={{color: '#333'}}>{item.label}</span>
                  </div>
                  <ChevronRight size={16} style={{color: '#ccc'}} />
                </a>
              )
            })}
          </div>

          <div className="mx-4 mt-3 rounded-2xl overflow-hidden" style={{background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)'}}>
            {settingsItems.map((item, index) => {
              const Icon = item.icon
              return (
                <a key={index} href={item.href} className="flex items-center justify-between px-4 py-3.5 transition-colors" style={{borderBottom: index < settingsItems.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)'}}>
                      <Icon size={16} style={{color: '#8B6914'}} />
                    </div>
                    <span className="text-sm font-medium" style={{color: '#333'}}>{item.label}</span>
                  </div>
                  {item.extra ? (
                    <span className="text-xs" style={{color: '#ccc'}}>{item.extra}</span>
                  ) : (
                    <ChevronRight size={16} style={{color: '#ccc'}} />
                  )}
                </a>
              )
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center animate-fade-in" style={{minHeight: '50vh'}}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)'}}>
            <User size={32} style={{color: '#8B6914'}} />
          </div>
          <button onClick={() => setShowAuthModal(true)} className="btn-primary text-sm px-10 py-3">登录/注册</button>
        </div>
      )}

      <BottomNav activePage="my" />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          router.refresh()
        }}
      />
    </div>
  )
}
