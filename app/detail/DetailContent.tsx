'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { getTimeAgo } from '@/lib/utils'
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
  profiles?: {
    nickname: string
    avatar_url: string | null
    school: string | null
  }
}

export default function DetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = usePhoneAuth()
  const id = searchParams.get('id')
  const [book, setBook] = useState<BookDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isbnCount, setIsbnCount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    if (id) {
      loadBook(id)
      if (user) checkFavorite(id)
    }
  }, [id, user])

  const loadBook = async (bookId: string) => {
    try {
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
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('book_id', book.id)
      setIsFavorite(false)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, book_id: book.id })
      setIsFavorite(true)
    }
  }

  const handleCopyWechat = () => {
    if (book?.description) {
      const wechatMatch = book.description.match(/微信号：(.+?)[\n\r]/)
      if (wechatMatch) {
        navigator.clipboard.writeText(wechatMatch[1].trim())
        alert('微信号已复制')
      }
    }
  }

  const handleCallPhone = () => {
    if (book?.description) {
      const phoneMatch = book.description.match(/联系电话：(.+?)[\n\r]/)
      if (phoneMatch) {
        window.location.href = `tel:${phoneMatch[1].trim()}`
      }
    }
  }

  const handleDelete = async () => {
    if (!book || !confirm('确定要删除这个商品吗？')) return
    await supabase.from('books').delete().eq('id', book.id)
    router.push('/')
  }

  const handleMarkSold = async () => {
    if (!book) return
    await supabase.from('books').update({ status: '已售出' }).eq('id', book.id)
    setBook({ ...book!, status: '已售出' })
  }

  const handleOffline = async () => {
    if (!book) return
    await supabase.from('books').update({ status: '已下架' }).eq('id', book.id)
    setBook({ ...book!, status: '已下架' })
  }

  if (loading) return <LoadingSpinner />
  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <span className="text-6xl mb-4">❌</span>
        <h2 className="text-xl font-semibold mb-2" style={{color: '#333'}}>商品不存在</h2>
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
          <div className="absolute top-3 left-3 text-white text-xs px-3 py-1 rounded-full" style={{background: '#5A8F5C'}}>
            {book.condition}
          </div>
        </div>
      ) : (
        <div className="w-full h-[200px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)'}}>
          <span className="text-7xl">📚</span>
        </div>
      )}

      <div style={{background: '#fff'}} className="p-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold" style={{color: '#ffa06f'}}>¥{book.price}</span>
          {book.original_price && (
            <span className="text-sm line-through" style={{color: '#999'}}>原价 ¥{book.original_price}</span>
          )}
        </div>
        <h1 className="text-lg font-semibold" style={{color: '#333'}}>{book.title}</h1>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="tag tag-primary">{book.category}</span>
          <span className="tag tag-success">{book.condition}</span>
          {book.grade && <span className="tag tag-info">{book.grade}</span>}
          {book.subject && <span className="tag tag-warning">{book.subject}</span>}
        </div>
        {book.isbn && isbnCount > 0 && (
          <a href={`/isbn?isbn=${book.isbn}`} className="flex items-center gap-1 mt-3 text-sm" style={{color: '#ffa06f'}}>
            🔍 查看同ISBN商品比价（{isbnCount}件在售）
          </a>
        )}
      </div>

      <div className="mt-2 p-4" style={{background: '#fff'}}>
        <h2 className="font-semibold mb-3" style={{color: '#333'}}>详细信息</h2>
        <div className="space-y-2 text-sm">
          {book.isbn && <div className="flex justify-between"><span style={{color: '#666'}}>ISBN</span><span style={{color: '#333'}}>{book.isbn}</span></div>}
          {book.author && <div className="flex justify-between"><span style={{color: '#666'}}>作者</span><span style={{color: '#333'}}>{book.author}</span></div>}
          {book.publisher && <div className="flex justify-between"><span style={{color: '#666'}}>出版社</span><span style={{color: '#333'}}>{book.publisher}</span></div>}
          <div className="flex justify-between"><span style={{color: '#666'}}>发布时间</span><span style={{color: '#333'}}>{getTimeAgo(book.created_at)}</span></div>
        </div>
        {book.description && (
          <div className="mt-3 p-3 rounded-xl text-sm" style={{background: '#f8f8f8', color: '#666'}}>{book.description}</div>
        )}
      </div>

      {book.profiles && (
        <div className="mt-2 p-4" style={{background: '#fff'}}>
          <h2 className="font-semibold mb-3" style={{color: '#333'}}>卖家信息</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{background: '#e0e0e0'}}>
              {book.profiles.avatar_url ? (
                <img src={book.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium" style={{color: '#333'}}>{book.profiles.nickname || '匿名用户'}</div>
              {book.profiles.school && <div className="text-xs" style={{color: '#999'}}>{book.profiles.school}</div>}
            </div>
          </div>
          
          <div className="flex gap-3 mb-4">
            <button onClick={handleCopyWechat} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{background: '#e8f8f0', color: '#27ae60', border: '1px solid #c8e6c9'}}>
              👤 复制微信号
            </button>
            <button onClick={handleCallPhone} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{background: '#e3f2fd', color: '#2196f3', border: '1px solid #bbdefb'}}>
              📞 拨打电话
            </button>
          </div>

          {book.description && (
            <>
              {book.description.includes('微信号') && (
                <div className="p-3 rounded-xl mb-2" style={{background: '#f5f5f5'}}>
                  <div className="text-xs" style={{color: '#999'}}>卖家微信号</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-medium" style={{color: '#333'}}>{book.description.match(/微信号：(.+?)[\n\r]/)?.[1]?.trim() || '未填写'}</span>
                    <button onClick={handleCopyWechat} className="px-3 py-1 rounded-lg text-sm" style={{background: '#ffa06f', color: '#fff'}}>复制</button>
                  </div>
                </div>
              )}
              {book.description.includes('联系电话') && (
                <div className="p-3 rounded-xl" style={{background: '#f5f5f5'}}>
                  <div className="text-xs" style={{color: '#999'}}>联系电话</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-medium" style={{color: '#333'}}>{book.description.match(/联系电话：(.+?)[\n\r]/)?.[1]?.trim() || '未填写'}</span>
                    <button onClick={handleCallPhone} className="px-3 py-1 rounded-lg text-sm" style={{background: '#ffa06f', color: '#fff'}}>拨打</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="p-4" style={{background: '#FFF8E1', borderLeft: '4px solid #FF9800'}}>
        <div className="flex items-start gap-2">
          <span className="text-xl">⚠️</span>
          <p className="text-sm" style={{color: '#F57C00'}}>本平台仅提供信息撮合服务，不涉及在线支付，请当面交易，谨防诈骗</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 flex gap-3 z-50" style={{background: '#fff', borderTop: '1px solid #e0e0e0'}}>
        <button onClick={toggleFavorite} className="flex flex-col items-center gap-1 px-4 py-2" style={{color: isFavorite ? '#ffa06f' : '#666'}}>
          <span className="text-xl">{isFavorite ? '⭐' : '☆'}</span>
          <span className="text-xs">{isFavorite ? '已收藏' : '收藏'}</span>
        </button>
        <button className="flex flex-col items-center gap-1 px-4 py-2" style={{color: '#666'}}>
          <span className="text-xl">↗️</span>
          <span className="text-xs">分享</span>
        </button>
        {isMine ? (
          <button onClick={() => router.push(`/editItem?id=${book.id}`)} className="flex-1 py-3 rounded-xl text-white font-semibold" style={{background: '#5c6bc0'}}>
            编辑商品
          </button>
        ) : (
          <button onClick={() => { if (!user) { setShowAuthModal(true) } else { alert('功能开发中') } }} className="flex-1 py-3 rounded-xl text-white font-semibold" style={{background: '#ffa06f'}}>
            联系卖家
          </button>
        )}
        {isMine && (
          <button onClick={() => setShowMore(!showMore)} className="px-4 py-2 rounded-xl" style={{background: '#f5f5f5', color: '#666'}}>
            更多
          </button>
        )}
      </div>

      {showMore && isMine && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-50" style={{background: '#fff', borderTop: '1px solid #e0e0e0'}}>
          <button onClick={handleMarkSold} className="w-full py-3 text-center" style={{color: '#27ae60', borderBottom: '1px solid #f0f0f0'}}>标记为已售出</button>
          <button onClick={handleOffline} className="w-full py-3 text-center" style={{color: '#ff9800', borderBottom: '1px solid #f0f0f0'}}>下架商品</button>
          <button onClick={handleDelete} className="w-full py-3 text-center" style={{color: '#f44336', borderBottom: '1px solid #f0f0f0'}}>删除商品</button>
          <button onClick={() => setShowMore(false)} className="w-full py-3 text-center" style={{color: '#666'}}>取消</button>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
