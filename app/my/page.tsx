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
    }
  }

  return (
    <div className="pb-20">
      <Toast />

      {/* 头部信息 */}
      <div className="bg-gradient-primary px-4 py-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-white/20 border-[3px] border-white/50">
            👤
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="text-xl font-bold">加载中...</div>
            ) : user ? (
              <>
                <div className="text-xl font-bold">{user.nickname}</div>
                <div className="text-sm opacity-80">{user.phone}</div>
              </>
            ) : (
              <>
                <button onClick={() => setShowAuthModal(true)} className="text-xl font-bold active:scale-95 transition-transform">登录/注册</button>
                <div className="text-sm opacity-80">登录后查看更多功能</div>
              </>
            )}
          </div>
          {user && (
            <button onClick={handleLogout} className="text-sm px-3 py-1.5 rounded-full bg-white/20 active:scale-95 transition-transform touch-target">
              退出
            </button>
          )}
        </div>
      </div>

      {user ? (
        <>
          <div className="mt-2 bg-white">
            <a href="/my/items" className="flex items-center justify-between px-4 py-4 border-b border-gray-50 active:bg-gray-50 transition-colors touch-target">
              <div className="flex items-center gap-3"><span className="text-xl">📦</span><span className="font-medium">我的发布</span></div>
              <span className="text-gray-300">›</span>
            </a>
            <a href="/my/favorites" className="flex items-center justify-between px-4 py-4 border-b border-gray-50 active:bg-gray-50 transition-colors touch-target">
              <div className="flex items-center gap-3"><span className="text-xl">⭐</span><span className="font-medium">我的收藏</span></div>
              <span className="text-gray-300">›</span>
            </a>
            <a href="/my/transactions" className="flex items-center justify-between px-4 py-4 border-b border-gray-50 active:bg-gray-50 transition-colors touch-target">
              <div className="flex items-center gap-3"><span className="text-xl">💰</span><span className="font-medium">交易记录</span></div>
              <span className="text-gray-300">›</span>
            </a>
          </div>

          <div className="mt-2 bg-white">
            <a href="/my/profile" className="flex items-center justify-between px-4 py-4 border-b border-gray-50 active:bg-gray-50 transition-colors touch-target">
              <div className="flex items-center gap-3"><span className="text-xl">⚙️</span><span className="font-medium">编辑个人信息</span></div>
              <span className="text-gray-300">›</span>
            </a>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3"><span className="text-xl">ℹ️</span><span className="font-medium">关于新校书仓</span></div>
              <span className="text-sm text-gray-300">v1.0.0</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center" style={{ minHeight: '50vh' }}>
          <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center mb-4">
            <span className="text-4xl">👤</span>
          </div>
          <p className="text-gray-500 mb-6">登录后查看个人信息</p>
          <button onClick={() => setShowAuthModal(true)} className="btn-primary text-lg px-12 py-3">登录/注册</button>
        </div>
      )}

      <BottomNav />

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
