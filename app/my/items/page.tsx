'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import { getTimeAgo, getConditionColor } from '@/lib/utils'
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
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold">我的发布</h1>
            <p className="text-sm opacity-80 mt-1">共 {items.length} 件商品</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="📦" title="暂无发布" description="快去发布你的第一本书吧" action={{ label: "去发布", href: "/publish" }} />
      ) : (
        <div className="px-4 py-2">
          {items.map((item) => (
            <div key={item.id} className="card p-4 mb-3 animate-fade-in">
              <div className="flex gap-3">
                <div className="relative flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-20 h-20 rounded-lg object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-3xl">📚</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-orange-500">¥{item.price}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === '在售' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{getTimeAgo(item.created_at)}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <a
                  href={`/editItem?id=${item.id}`}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-center bg-orange-50 text-orange-500 border border-orange-200"
                >
                  编辑
                </a>
                <button
                  onClick={() => toggleStatus(item.id, item.status)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                    item.status === '在售'
                      ? 'bg-gray-50 text-gray-600 border-gray-200'
                      : 'bg-orange-50 text-orange-500 border-orange-200'
                  }`}
                >
                  {item.status === '在售' ? '下架' : '上架'}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-500 border border-red-200"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav activePage="my" />
    </div>
  )
}
