'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import { getTimeAgo } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import BackButton from '@/components/BackButton'
import {
  Package,
  Pencil,
  EyeOff,
  Eye,
  Trash2,
  ChevronLeft,
  BookOpen,
} from 'lucide-react'

interface BookItem {
  id: string
  title: string
  price: number
  condition: string
  status: string
  image_url: string | null
  created_at: string
}

function ItemsSkeleton() {
  return (
    <div className="px-4 py-2 space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-4 animate-fade-in"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-xl skeleton flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 skeleton rounded-lg" />
              <div className="h-5 w-20 skeleton rounded-lg" />
              <div className="h-3 w-16 skeleton rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '0.5px solid rgba(0,0,0,0.04)' }}>
            <div className="flex-1 h-8 skeleton rounded-xl" />
            <div className="flex-1 h-8 skeleton rounded-xl" />
            <div className="flex-1 h-8 skeleton rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MyItemsPage() {
  const { user, loading: userLoading } = usePhoneAuth()
  const router = useRouter()
  const [items, setItems] = useState<BookItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login')
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
    setItems(items.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))
  }

  const deleteItem = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return
    await supabase.from('books').delete().eq('id', id)
    setItems(items.filter((item) => item.id !== id))
  }

  if (userLoading || loading) {
    return (
      <div style={{ background: '#F2F2F7', minHeight: '100vh' }}>
        <div
          className="header-glass px-4 py-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl font-bold">我的发布</h1>
          </div>
        </div>
        <ItemsSkeleton />
        <BottomNav activeTab="profile" />
      </div>
    )
  }

  if (!user) return null

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
              <Package size={20} />
              <h1 className="text-xl font-bold">我的发布</h1>
            </div>
            <p className="text-sm opacity-80 mt-1">共 {items.length} 件商品</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.85)' }}
          >
            <Package size={32} color="#C4A882" />
          </div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#1a1a1a' }}>暂无发布</h2>
          <p className="text-sm mb-4" style={{ color: '#666' }}>快去发布你的第一本书吧</p>
          <a href="/publish" className="btn-primary">去发布</a>
        </div>
      ) : (
        <div className="px-4 py-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-4 mb-3 animate-fade-in"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(10px)',
                border: '0.5px solid rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex gap-3">
                <div className="relative flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center"
                      style={{ background: '#F2F2F7' }}
                    >
                      <BookOpen size={24} color="#C4A882" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate" style={{ color: '#1a1a1a' }}>{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold" style={{ color: '#E8590C' }}>¥{item.price}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: item.status === '在售' ? 'rgba(52,199,89,0.1)' : 'rgba(0,0,0,0.04)',
                        color: item.status === '在售' ? '#34C759' : '#999',
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#999' }}>{getTimeAgo(item.created_at)}</div>
                </div>
              </div>
              <div
                className="flex gap-2 mt-3 pt-3"
                style={{ borderTop: '0.5px solid rgba(0,0,0,0.04)' }}
              >
                <a
                  href={`/editItem?id=${item.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium"
                  style={{ background: '#FFF0E6', color: '#E8590C' }}
                >
                  <Pencil size={14} />
                  编辑
                </a>
                <button
                  onClick={() => toggleStatus(item.id, item.status)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium"
                  style={{
                    background: item.status === '在售' ? '#F2F2F7' : '#FFF0E6',
                    color: item.status === '在售' ? '#666' : '#E8590C',
                  }}
                >
                  {item.status === '在售' ? <EyeOff size={14} /> : <Eye size={14} />}
                  {item.status === '在售' ? '下架' : '上架'}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30' }}
                >
                  <Trash2 size={14} />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav activeTab="profile" />
    </div>
  )
}
