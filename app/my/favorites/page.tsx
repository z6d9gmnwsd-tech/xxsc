'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import { getTimeAgo, getCategoryTag } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import BackButton from '@/components/BackButton'
import { Heart, BookOpen, Trash2 } from 'lucide-react'

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

function FavoritesSkeleton() {
  return (
    <div className="px-4 py-2 space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden animate-fade-in"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex">
            <div className="w-[100px] h-[100px] skeleton flex-shrink-0" />
            <div className="flex-1 p-3 space-y-2">
              <div className="h-4 w-3/4 skeleton rounded-lg" />
              <div className="h-4 w-1/2 skeleton rounded-lg" />
              <div className="h-5 w-20 skeleton rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
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
    setFavorites(favorites.filter((f) => f.id !== favId))
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
            <h1 className="text-xl font-bold">我的收藏</h1>
          </div>
        </div>
        <FavoritesSkeleton />
        <BottomNav activePage="my" />
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
        <div>
          <div className="flex items-center gap-2">
            <Heart size={20} />
            <h1 className="text-xl font-bold">我的收藏</h1>
          </div>
          <p className="text-sm mt-1" style={{ opacity: 0.8 }}>共收藏 {favorites.length} 本书</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.85)' }}
          >
            <Heart size={32} color="#C4A882" />
          </div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#1a1a1a' }}>暂无收藏</h2>
          <p className="text-sm mb-4" style={{ color: '#666' }}>浏览商品时点击收藏按钮</p>
          <a href="/" className="btn-primary">去逛逛</a>
        </div>
      ) : (
        <div className="px-4 py-2">
          {favorites.map((fav) => (
            <a
              key={fav.id}
              href={`/detail?id=${fav.book_id}`}
              className="block rounded-2xl overflow-hidden mb-3 animate-fade-in"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(10px)',
                border: '0.5px solid rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex">
                <div className="relative flex-shrink-0">
                  {fav.books.image_url ? (
                    <img src={fav.books.image_url} alt={fav.books.title} className="w-[100px] h-[100px] object-cover" />
                  ) : (
                    <div
                      className="w-[100px] h-[100px] flex items-center justify-center"
                      style={{ background: '#F2F2F7' }}
                    >
                      <BookOpen size={32} color="#C4A882" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2" style={{ color: '#1a1a1a' }}>{fav.books.title}</h3>
                    <div className="flex gap-1 mt-1">
                      <span className={`tag text-xs ${getCategoryTag(fav.books.category)}`}>{fav.books.category}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold" style={{ color: '#E8590C' }}>¥{fav.books.price}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeFavorite(fav.id)
                      }}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                      style={{ color: '#FF3B30', background: 'rgba(255,59,48,0.08)' }}
                    >
                      <Trash2 size={12} />
                      取消收藏
                    </button>
                  </div>
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
