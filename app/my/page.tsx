'use client'

import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import AuthModal from '@/components/AuthModal'
import UserAgreement from '@/components/UserAgreement'
import { useState } from 'react'

export default function MyPage() {
  const { user, loading, logout } = usePhoneAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <div className="pb-20">
      <UserAgreement />

      <div className="px-4 py-8 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{background: 'rgba(255,255,255,0.2)', border: '6rpx solid rgba(255,255,255,0.5)'}}>
            👤
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="text-xl font-bold">加载中...</div>
            ) : user ? (
              <>
                <div className="text-xl font-bold">{user.nickname}</div>
                <div className="text-sm" style={{opacity: 0.8}}>{user.phone}</div>
              </>
            ) : (
              <>
                <button onClick={() => setShowAuthModal(true)} className="text-xl font-bold">登录/注册</button>
                <div className="text-sm" style={{opacity: 0.8}}>登录后查看更多功能</div>
              </>
            )}
          </div>
          {user && (
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-full"
              style={{background: 'rgba(255,255,255,0.2)'}}
            >
              退出
            </button>
          )}
        </div>
      </div>

      {user ? (
        <>
          <div className="mt-2" style={{background: '#fff'}}>
            <a href="/my/items" className="flex items-center justify-between px-4 py-4 border-b" style={{borderColor: '#f5f5f5'}}>
              <div className="flex items-center gap-3"><span className="text-xl">📦</span><span className="font-medium">我的发布</span></div>
              <span style={{color: '#ccc'}}>›</span>
            </a>
            <a href="/want" className="flex items-center justify-between px-4 py-4 border-b" style={{borderColor: '#f5f5f5'}}>
              <div className="flex items-center gap-3"><span className="text-xl">🔍</span><span className="font-medium">我的求购</span></div>
              <span style={{color: '#ccc'}}>›</span>
            </a>
            <a href="/my/transactions" className="flex items-center justify-between px-4 py-4 border-b" style={{borderColor: '#f5f5f5'}}>
              <div className="flex items-center gap-3"><span className="text-xl">💰</span><span className="font-medium">交易记录</span></div>
              <span style={{color: '#ccc'}}>›</span>
            </a>
          </div>

          <div className="mt-2" style={{background: '#fff'}}>
            <a href="/my/profile" className="flex items-center justify-between px-4 py-4 border-b" style={{borderColor: '#f5f5f5'}}>
              <div className="flex items-center gap-3"><span className="text-xl">⚙️</span><span className="font-medium">编辑个人信息</span></div>
              <span style={{color: '#ccc'}}>›</span>
            </a>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3"><span className="text-xl">ℹ️</span><span className="font-medium">关于新校书仓</span></div>
              <span className="text-sm" style={{color: '#ccc'}}>v1.0.0</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center" style={{minHeight: '50vh'}}>
          <button onClick={() => setShowAuthModal(true)} className="btn-primary text-lg px-12 py-4">登录/注册</button>
        </div>
      )}

      <BottomNav activePage="my" />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
