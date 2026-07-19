'use client'

import WantList from './WantList'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import BackButton from '@/components/BackButton'
import { Search, Plus, Home, BookOpen, MessageSquare, User } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function WantPage() {
  const { user } = usePhoneAuth()

  return (
    <div className="pb-20" style={{ background: '#F2F2F7', minHeight: '100vh' }}>
      <div
        className="header-glass px-4 py-6 text-white"
        style={{
          background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <Search size={20} />
              <h1 className="text-xl font-bold">求购广场</h1>
            </div>
            <p className="text-sm opacity-80 mt-1">发布你的需求，卖家主动联系你</p>
          </div>
        </div>
      </div>

      <div
        className="flex mx-4 mt-3 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <button
          className="flex-1 py-3 text-center text-sm font-medium transition-all"
          style={{
            background: '#FFF0E6',
            color: '#E8590C',
          }}
        >
          全部求购
        </button>
        <button
          className="flex-1 py-3 text-center text-sm font-medium transition-all"
          style={{ color: '#666' }}
        >
          我的求购
        </button>
      </div>

      <WantList />

      {user && (
        <a
          href="/want/post"
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg z-50 card-interactive"
          style={{
            background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)',
            boxShadow: '0 4px 16px rgba(196,168,130,0.4)',
          }}
        >
          <Plus size={24} color="#5D4E37" />
        </a>
      )}

      <BottomNav activeTab="profile" />
    </div>
  )
}
