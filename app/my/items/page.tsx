'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import { getTimeAgo } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'
import AuthModal from '@/components/AuthModal'

interface BookItem {
  id: string
  title: string
  price: number
  condition: string
  status: string
  image_url: string | null
  created_at: string
}

export default function MyItemsPage() {
  const { user, loading: userLoading } = usePhoneAuth()
  const router = useRouter()
  const [items, setItems] = useState<BookItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!userLoading && !user) {
      if (confirm('该功能需要登录后才能使用，是否前往登录？')) {
        window.location.href = '/my'
      }
    }
    if (user) fetchItems()
  }, [user, userLoading])

  const fetchItems = async () => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })

    if (data) setItems(data)
    setLoading(false)
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === '在售' ? '已下架' : '在售'
    await supabase.from('books').update({ status: newStatus }).eq('id', id)
    setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item))
  }

  const deleteItem = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return
    await supabase.from('books').delete().eq('id', id)
    setItems(items.filter(item => item.id !== id))
  }

  if (userLoading || loading) return <LoadingSpinner />
  if (!user) return null

  return (
    <div className="pb-20">
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold">我的发布</h1>
            <p className="text-sm mt-1" style={{opacity: 0.8}}>共 {items.length} 件商品</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="📦" title="暂无发布" description="快去发布你的第一本书吧" action={{ label: "去发布", href: "/publish" }} />
      ) : (
        <div className="px-4 py-2">
          {items.map((item) => (
            <div key={item.id} className="card mb-3 animate-fade-in" style={{margin: '16px 0', padding: '28rpx'}}>
              <div className="flex gap-3">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: '#f0f0f0'}}>
                    <span className="text-3xl">📚</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate" style={{color: '#333'}}>{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold" style={{color: '#ffa06f'}}>¥{item.price}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: item.status === '在售' ? '#e8f8f0' : '#f0f0f0',
                      color: item.status === '在售' ? '#27ae60' : '#999'
                    }}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{color: '#999'}}>{getTimeAgo(item.created_at)}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3" style={{borderTop: '1px solid #f5f5f5'}}>
                <a href={`/editItem?id=${item.id}`} className="flex-1 py-2 rounded-xl text-sm font-medium text-center" style={{background: '#FFF3E0', color: '#ffa06f', border: '1px solid #FFE0B2'}}>
                  编辑
                </a>
                <button
                  onClick={() => toggleStatus(item.id, item.status)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium"
                  style={{
                    background: item.status === '在售' ? '#f5f5f5' : '#FFF3E0',
                    color: item.status === '在售' ? '#666' : '#ffa06f',
                    border: `1px solid ${item.status === '在售' ? '#e0e0e0' : '#FFE0B2'}`
                  }}
                >
                  {item.status === '在售' ? '下架' : '上架'}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium"
                  style={{background: '#FFF0F0', color: '#ee0a24', border: '1px solid #FFD0D0'}}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
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
