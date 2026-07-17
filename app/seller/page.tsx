'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { getTimeAgo } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'

interface Book {
  id: string
  title: string
  price: number
  condition: string
  category: string
  image_url: string | null
  created_at: string
}

interface SellerProfile {
  id: string
  nickname: string
  avatar_url: string | null
  school: string | null
  bio: string | null
}

function SellerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = usePhoneAuth()
  const sellerId = searchParams.get('id')
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [items, setItems] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sellerId) {
      loadSeller(sellerId)
      loadItems(sellerId)
    }
  }, [sellerId])

  const loadSeller = async (id: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) {
      setSeller(data as SellerProfile)
    }
    setLoading(false)
  }

  const loadItems = async (sellerId: string) => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', sellerId)
      .eq('status', '在售')
      .order('created_at', { ascending: false })
    
    if (data) {
      setItems(data as Book[])
    }
  }

  if (loading) return <LoadingSpinner />

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <span className="text-6xl mb-4">👤</span>
        <h2 className="text-xl font-semibold mb-2" style={{color: '#333'}}>用户不存在</h2>
        <a href="/" className="btn-primary mt-4">返回首页</a>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="fixed top-4 left-4 z-50 max-w-[480px]">
        <BackButton />
      </div>

      {/* 卖家信息 */}
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden" style={{background: 'rgba(255,255,255,0.2)', border: '4px solid rgba(255,255,255,0.5)'}}>
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">{seller.nickname || '匿名用户'}</div>
            {seller.school && <div className="text-sm" style={{opacity: 0.8}}>{seller.school}</div>}
            {seller.bio && <div className="text-xs mt-1" style={{opacity: 0.7}}>{seller.bio}</div>}
          </div>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="px-4 py-4">
        <h2 className="font-semibold mb-3" style={{color: '#333'}}>TA的商品（{items.length}件）</h2>
        
        {items.length === 0 ? (
          <div className="text-center py-8" style={{color: '#999'}}>
            <span className="text-4xl">📦</span>
            <p className="mt-2">暂无在售商品</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <a
                key={item.id}
                href={`/detail?id=${item.id}`}
                className="card flex overflow-hidden animate-fade-in block"
                style={{margin: '0', padding: '0'}}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-24 h-24 object-cover flex-shrink-0" />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center flex-shrink-0" style={{background: '#f0f0f0'}}>
                    <span className="text-3xl">📚</span>
                  </div>
                )}
                <div className="flex-1 p-3">
                  <h3 className="font-medium text-sm line-clamp-1" style={{color: '#333'}}>{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="tag tag-primary text-xs">{item.category}</span>
                    <span className="tag tag-success text-xs">{item.condition}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-bold" style={{color: '#ffa06f'}}>¥{item.price}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SellerPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SellerContent />
    </Suspense>
  )
}
