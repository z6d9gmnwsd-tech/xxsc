'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { getTimeAgo, getConditionColor, getCategoryTag } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'
import AuthModal from '@/components/AuthModal'

interface BookDetail {
  id: string
  title: string
  description: string
  original_price: number | null
  price: number
  condition: string
  category: string
  grade: string
  subject: string
  image_url: string | null
  isbn: string | null
  author: string | null
  publisher: string | null
  user_id: string
  status: string
  created_at: string
  wechat?: string
  phone?: string
  remark?: string
  profiles?: {
    nickname: string
    avatar_url: string | null
    school: string | null
  }
}

export default function DetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: userLoading } = usePhoneAuth()
  const id = searchParams.get('id')
  const [book, setBook] = useState<BookDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isbnCount, setIsbnCount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)

  useEffect(() => {
    if (id) {
      loadBook(id)
      if (user) checkFavorite(id)
    }
  }, [id, user])

  const loadBook = async (bookId: string) => {
    try {
      // 首先尝试获取商品数据（不关联profiles表）
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      if (error) {
        console.error('Error loading book:', error)
        setLoading(false)
        return
      }

      if (data) {
        // 尝试获取卖家信息
        let profile = null
        if (data.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('nickname, avatar_url, school')
            .eq('id', data.user_id)
            .single()
          profile = profileData
        }

        const bookWithProfile = {
          ...data,
          profiles: profile || { nickname: '匿名用户', avatar_url: null, school: null }
        }
        
        setBook(bookWithProfile as BookDetail)
        
        if (data.isbn) {
          const { count } = await supabase
            .from('books')
            .select('*', { count: 'exact', head: true })
            .eq('isbn', data.isbn)
            .eq('status', '在售')
            .neq('id', bookId)
          setIsbnCount(count || 0)
        }
      }
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }

  const checkFavorite = async (bookId: string) => {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user!.id)
      .eq('book_id', bookId)
      .single()
    setIsFavorite(!!data)
  }

  const toggleFavorite = async () => {
    if (!user) { setShowAuthModal(true); return }
    if (!book) return

    if (isFavorite) {
      const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('book_id', book.id)
      if (!error) {
        setIsFavorite(false)
        alert('已取消收藏')
      }
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: user.id, book_id: book.id })
      if (!error) {
        setIsFavorite(true)
        alert('已收藏')
      } else {
        console.error('收藏失败:', error)
        alert('收藏失败：' + error.message)
      }
    }
  }

  const startChat = () => {
    if (!user) { setShowAuthModal(true); return }
    if (!book) return
    router.push(`/chat?id=${book.user_id}`)
  }

  const copyWechat = () => {
    if (book?.wechat) {
      navigator.clipboard.writeText(book.wechat)
      alert('微信号已复制')
    }
  }

  const callPhone = () => {
    if (book?.phone) {
      window.location.href = `tel:${book.phone}`
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book?.title || '新校书仓商品',
        text: `我在新校书仓发现了一本好书：${book?.title}，只要${book?.price}元`,
        url: window.location.href
      })
    } else {
      alert('分享功能暂不支持')
    }
  }

  const handleMore = (action: string) => {
    setShowMoreMenu(false)
    if (action === 'edit') {
      router.push(`/editItem?id=${book?.id}`)
    } else if (action === 'sold') {
      if (confirm('确定要标记为已售出吗？')) {
        supabase.from('books').update({ status: '已售' }).eq('id', book?.id).then(() => {
          alert('已标记为已售出')
          router.refresh()
        })
      }
    } else if (action === 'offline') {
      if (confirm('确定要下架商品吗？')) {
        supabase.from('books').update({ status: '已下架' }).eq('id', book?.id).then(() => {
          alert('商品已下架')
          router.push('/')
        })
      }
    } else if (action === 'delete') {
      if (confirm('确定要删除商品吗？此操作不可恢复')) {
        supabase.from('books').delete().eq('id', book?.id).then(() => {
          alert('商品已删除')
          router.push('/')
        })
      }
    } else if (action === 'report') {
      alert('举报功能开发中')
    }
  }

  if (loading) return <LoadingSpinner />
  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <span className="text-6xl mb-4">❌</span>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">商品不存在</h2>
        <a href="/" className="btn-primary mt-4">返回首页</a>
      </div>
    )
  }

  const isMine = user?.id === book.user_id

  return (
    <div className="pb-20">
      <div className="fixed top-4 left-4 z-50 max-w-[480px]">
        <BackButton />
      </div>
      {book.image_url ? (
        <div className="relative">
          <img src={book.image_url} alt={book.title} className="w-full h-[300px] object-cover" />
          <div className={`absolute top-3 left-3 ${getConditionColor(book.condition)} text-white text-xs px-3 py-1 rounded-full`}>
            {book.condition}
          </div>
        </div>
      ) : (
        <div className="w-full h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-7xl">📚</span>
        </div>
      )}

      <div className="bg-white p-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-orange-500">¥{book.price}</span>
          {book.original_price && (
            <span className="text-sm text-gray-400 line-through">原价 ¥{book.original_price}</span>
          )}
        </div>
        <h1 className="text-lg font-semibold text-gray-900">{book.title}</h1>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className={`tag ${getCategoryTag(book.category)}`}>{book.category}</span>
          <span className="tag tag-success">{book.condition}</span>
          {book.grade && <span className="tag tag-info">{book.grade}</span>}
          {book.subject && <span className="tag tag-warning">{book.subject}</span>}
        </div>
        {book.isbn && isbnCount > 0 && (
          <a href={`/isbn?isbn=${book.isbn}`} className="flex items-center gap-1 mt-3 text-sm text-orange-500">
            查看同ISBN商品比价（{isbnCount}件在售）
          </a>
        )}
      </div>

      <div className="bg-white mt-2 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">详细信息</h2>
        <div className="space-y-2 text-sm">
          {book.isbn && <div className="flex justify-between"><span className="text-gray-500">ISBN</span><span className="text-gray-900">{book.isbn}</span></div>}
          {book.author && <div className="flex justify-between"><span className="text-gray-500">作者</span><span className="text-gray-900">{book.author}</span></div>}
          {book.publisher && <div className="flex justify-between"><span className="text-gray-500">出版社</span><span className="text-gray-900">{book.publisher}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">发布时间</span><span className="text-gray-900">{getTimeAgo(book.created_at)}</span></div>
        </div>
        {book.description && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">{book.description}</div>
        )}
      </div>

      {book.profiles && (
        <div className="bg-white mt-2 p-4">
          <h2 className="font-semibold text-gray-900 mb-3">卖家信息</h2>
          <a href={`/seller?id=${book.user_id}`} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {book.profiles.avatar_url ? (
                <img src={book.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{book.profiles.nickname || '匿名用户'}</div>
              {book.profiles.school && <div className="text-xs text-gray-500">{book.profiles.school}</div>}
            </div>
            <span className="text-gray-400">›</span>
          </a>
        </div>
      )}

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-3 flex gap-3 z-50" style={{background: '#fff', borderTop: '1px solid #e0e0e0'}}>
        <button
          onClick={toggleFavorite}
          className="flex items-center gap-1 px-4 py-2.5 rounded-full border text-sm font-medium"
          style={{
            background: isFavorite ? '#FBF8F3' : '#f5f5f5',
            color: isFavorite ? '#ffa06f' : '#666',
            borderColor: isFavorite ? '#E0C9A8' : '#e0e0e0'
          }}
        >
          {isFavorite ? '⭐ 已收藏' : '☆ 收藏'}
        </button>
        {!isMine ? (
          <>
            <a href={`/report?id=${book.id}&type=book`} className="flex items-center gap-1 px-4 py-2.5 rounded-full border text-sm font-medium" style={{background: '#f5f5f5', color: '#666', borderColor: '#e0e0e0'}}>
              ⚠️ 举报
            </a>
            <button onClick={startChat} className="flex-1 btn-primary py-2.5">联系卖家</button>
          </>
        ) : (
          <div className="flex-1 text-center py-2.5 text-sm" style={{color: '#ccc'}}>这是你的商品</div>
        )}
      </div>
    </div>
  )
}
