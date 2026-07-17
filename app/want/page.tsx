'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import { getTimeAgo } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'
import AuthModal from '@/components/AuthModal'

interface WantBook {
  id: string
  title: string
  description: string | null
  max_price: number | null
  category: string | null
  grade: string | null
  subject: string | null
  status: string
  created_at: string
  user_id: string
  profiles?: {
    nickname: string | null
    avatar_url: string | null
  }
}

export default function WantPage() {
  const { user } = usePhoneAuth()
  const router = useRouter()
  const [wants, setWants] = useState<WantBook[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    fetchWants()
  }, [activeTab, user])

  const fetchWants = async () => {
    setLoading(true)
    
    let query = supabase
      .from('want_books')
      .select('*, profiles:user_id(nickname, avatar_url)')
      .eq('status', '求购中')
      .order('created_at', { ascending: false })

    if (activeTab === 'my' && user) {
      query = query.eq('user_id', user.id)
    }

    const { data } = await query

    if (data) {
      setWants(data as WantBook[])
    }
    setLoading(false)
  }

  const handleAction = () => {
    if (!user) {
      if (confirm('该功能需要登录后才能使用，是否前往登录？')) {
        window.location.href = '/my'
      }
      return
    }
    router.push('/want/post')
  }

  const handleContact = async (want: WantBook) => {
    if (!user) {
      if (confirm('该功能需要登录后才能使用，是否前往登录？')) {
        window.location.href = '/my'
      }
      return
    }
    router.push(`/chat?id=${want.user_id}`)
  }

  const handleDelete = async (wantId: string) => {
    if (!confirm('确定要删除这条求购吗？')) return
    await supabase.from('want_books').delete().eq('id', wantId)
    fetchWants()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="pb-20">
      {/* 标题栏 */}
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <h1 className="text-xl font-bold">求购广场</h1>
        <p className="text-sm mt-1" style={{opacity: 0.8}}>发布你的需求，卖家主动联系你</p>
      </div>

      {/* 标签页 */}
      <div className="flex" style={{background: '#fff', borderBottom: '1px solid #f0f0f0'}}>
        <button
          onClick={() => setActiveTab('all')}
          className="flex-1 py-3 text-center text-sm font-medium"
          style={{
            color: activeTab === 'all' ? '#ffa06f' : '#666',
            borderBottom: activeTab === 'all' ? '2px solid #ffa06f' : '2px solid transparent'
          }}
        >
          全部求购
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className="flex-1 py-3 text-center text-sm font-medium"
          style={{
            color: activeTab === 'my' ? '#ffa06f' : '#666',
            borderBottom: activeTab === 'my' ? '2px solid #ffa06f' : '2px solid transparent'
          }}
        >
          我的求购
        </button>
      </div>

      {/* 求购列表 */}
      {wants.length === 0 ? (
        <EmptyState 
          icon="🔍" 
          title={activeTab === 'my' ? '你还没有发布求购' : '暂无求购信息'} 
          description={activeTab === 'my' ? '发布求购让卖家找到你' : '成为第一个发布求购的人'}
          action={activeTab === 'my' ? { label: "去发布", href: "/want/post" } : undefined}
        />
      ) : (
        <div className="px-4 py-2">
          {wants.map(want => (
            <div key={want.id} className="card animate-fade-in" style={{margin: '16px 0', padding: '28rpx'}}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: '#e0e0e0'}}>
                  {want.profiles?.avatar_url ? (
                    <img src={want.profiles.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-sm">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{color: '#333'}}>{want.profiles?.nickname || '匿名用户'}</div>
                  <div className="text-xs" style={{color: '#999'}}>{getTimeAgo(want.created_at)}</div>
                </div>
                {activeTab === 'my' && user?.id === want.user_id && (
                  <button onClick={() => handleDelete(want.id)} className="text-xs" style={{color: '#999'}}>
                    🗑️
                  </button>
                )}
              </div>
              
              <div className="mb-3">
                <div className="font-medium" style={{color: '#333'}}>求购：{want.title}</div>
                {want.description && <div className="text-sm mt-1" style={{color: '#666'}}>{want.description}</div>}
                {want.max_price && <div className="text-sm mt-1" style={{color: '#999'}}>预算：≤{want.max_price}元</div>}
              </div>

              {activeTab === 'all' && user?.id !== want.user_id && (
                <button
                  onClick={() => handleContact(want)}
                  className="w-full py-2 rounded-xl text-sm font-medium"
                  style={{background: '#FFF3E0', color: '#ffa06f', border: '1px solid #FFE0B2'}}
                >
                  💬 联系买家
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 悬浮发布按钮 */}
      {user && (
        <button
          onClick={handleAction}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg z-50"
          style={{background: 'linear-gradient(135deg, #ffa06f, #E5D5BF)'}}
        >
          +
        </button>
      )}

      <BottomNav activePage="favorites" />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
