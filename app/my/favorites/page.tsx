'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import { getTimeAgo, getConditionColor, getCategoryTag } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'
import AuthModal from '@/components/AuthModal'

interface FavoriteItem {
  id: string
  book_id: string
  created_at: string
  books: {
    id: string
    title: string
    price: number
    condition: string
    category: string
    image_url: string | null
    created_at: string
  }
}

export default function MyFavoritesPage() {
  const { user, loading: userLoading } = usePhoneAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && !user) {
      if (confirm('该功能需要登录后才能使用，是否前往登录？')) {
        window.location.href = '/my'
      }
    }
    if (user) fetchFavorites()
  }, [user, userLoading])

  const fetchFavorites = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('*, books:book_id(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })

    if (data) setFavorites(data as FavoriteItem[])
    setLoading(false)
  }

  const removeFavorite = async (favId: string) => {
    await supabase.from('favorites').delete().eq('id', favId)
    setFavorites(favorites.filter(f => f.id !== favId))
  }

  if (userLoading || loading) return <LoadingSpinner />
  if (!user) return null

  return (
    <div className="pb-20">
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div>
          <h1 className="text-xl font-bold">我的收藏</h1>
          <p className="text-sm mt-1" style={{opacity: 0.8}}>共收藏 {favorites.length} 本书</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <EmptyState icon="⭐" title="暂无收藏" description="浏览商品时点击收藏按钮" action={{ label: "去逛逛", href: "/" }} />
      ) : (
        <div className="px-4 py-2">
          {favorites.map((fav) => (
            <a key={fav.id} href={`/detail?id=${fav.book_id}`} className="card flex overflow-hidden mb-3 animate-fade-in block">
              <div className="relative flex-shrink-0">
                {fav.books.image_url ? (
                  <img src={fav.books.image_url} alt={fav.books.title} className="w-[100px] h-[100px] object-cover" />
                ) : (
                  <div className="w-[100px] h-[100px] bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl">📚</span>
                  </div>
                )}
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{fav.books.title}</h3>
                  <div className="flex gap-1 mt-1">
                    <span className={`tag text-xs ${getCategoryTag(fav.books.category)}`}>{fav.books.category}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-orange-500">¥{fav.books.price}</span>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFavorite(fav.id) }}
                    className="text-xs text-red-400 px-2 py-1"
                  >
                    取消收藏
                  </button>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <BottomNav activePage="my" />
    </div>
  )
}
