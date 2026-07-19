'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { getTimeAgo } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'
import AuthModal from '@/components/AuthModal'
import { showToast } from '@/components/Toast'
import { BookWithProfile } from '@/types'

export default function DetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = usePhoneAuth()
  const id = searchParams.get('id')
  const [book, setBook] = useState<BookWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isbnCount, setIsbnCount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

      if (error || !data) {
        setLoading(false)
        return
      }

      let profile = null
      if (data.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('nickname, avatar_url, school')
          .eq('id', data.user_id)
          .single()
        profile = profileData
      }

      setBook({
        ...data,
        profiles: profile || { nickname: '匿名用户', avatar_url: null, school: null }
      })

      if (data.isbn) {
        const { count } = await supabase
          .from('books')
          .select('*', { count: 'exact', head: true })
          .eq('isbn', data.isbn)
          .eq('status', '在售')
          .neq('id', bookId)
        setIsbnCount(count || 0)
      }
    } catch (err) {
      console.error('Error loading book:', err)
    }
    setLoading(false)
  }

  const checkFavorite = async (bookId: string) => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user!.id)
        .eq('book_id', bookId)
        .single()
      setIsFavorite(!!data)
    } catch (err) {
      console.error('Error checking favorite:', err)
    }
  }

  const toggleFavorite = async () => {
    if (!user) { setShowAuthModal(true); return }
    if (!book) return

    try {
      if (isFavorite) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('book_id', book.id)
        setIsFavorite(false)
        showToast('info', '已取消收藏')
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, book_id: book.id })
        setIsFavorite(true)
        showToast('success', '收藏成功')
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
      showToast('error', '操作失败，请重试')
    }
  }

  const handleCopyWechat = () => {
    if (book?.description) {
      const wechatMatch = book.description.match(/微信号：(.+?)[\n\r]/)
      if (wechatMatch) {
        navigator.clipboard.writeText(wechatMatch[1].trim())
        showToast('success', '微信号已复制')
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
    try {
      await supabase.from('books').delete().eq('id', book.id)
      showToast('success', '已删除')
      setTimeout(() => router.push('/'), 1000)
    } catch (err) {
      console.error('Error deleting book:', err)
      showToast('error', '删除失败，请重试')
    }
  }

  const handleMarkSold = async () => {
    if (!book) return
    try {
      await supabase.from('books').update({ status: '已售出' }).eq('id', book.id)
      setBook({ ...book!, status: '已售出' })
      setShowMore(false)
      showToast('success', '已标记为售出')
    } catch (err) {
      console.error('Error marking sold:', err)
      showToast('error', '操作失败，请重试')
    }
  }

  const handleOffline = async () => {
    if (!book) return
    try {
      await supabase.from('books').update({ status: '已下架' }).eq('id', book.id)
      setBook({ ...book!, status: '已下架' })
      setShowMore(false)
      showToast('success', '已下架')
    } catch (err) {
      console.error('Error taking offline:', err)
      showToast('error', '操作失败，请重试')
    }
  }

  const getAllImages = () => {
    if (!book) return []
    if (book.images && book.images.length > 0) {
      return book.images.filter(img => img)
    }
    return book.image_url ? [book.image_url] : []
  }

  if (loading) return <LoadingSpinner />
  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="text-4xl">❌</span>
        </div>
        <h2 className="text-xl font-semibold mb-2 text-primary">商品不存在</h2>
        <a href="/" className="btn-primary mt-4">返回首页</a>
      </div>
    )
  }

  const isMine = user?.id === book.user_id
  const allImages = getAllImages()

  return (
    <div className="pb-20">
      <div className="fixed top-4 left-4 z-50 max-w-[480px]">
        <BackButton />
      </div>

      {allImages.length > 0 ? (
        <div className="relative">
          <div className="w-full h-[300px] cursor-pointer" onClick={() => setShowImageViewer(true)}>
            <img src={allImages[currentImageIndex]} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
          {allImages.length > 1 && (
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs bg-black/50 text-white">
              {allImages.length}张图 · 点击可放大
            </div>
          )}
          <div className="absolute top-3 left-3 text-white text-xs px-3 py-1 rounded-full bg-green-600">
            {book.condition}
          </div>
        </div>
      ) : (
        <div className="w-full h-[200px] flex items-center justify-center bg-gradient-to-br from-warm-50 to-warm-100">
          <span className="text-7xl">📚</span>
        </div>
      )}

      <div className="p-4 bg-white">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-accent">¥{book.price}</span>
          {book.original_price && (
            <span className="text-sm line-through text-gray-400">原价 ¥{book.original_price}</span>
          )}
        </div>
        <h1 className="text-lg font-semibold text-primary">{book.title}</h1>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="tag tag-primary">{book.category}</span>
          <span className="tag tag-success">{book.condition}</span>
          {book.grade && <span className="tag tag-info">{book.grade}</span>}
          {book.subject && <span className="tag tag-warning">{book.subject}</span>}
        </div>
      </div>

      <div className="mt-2 p-4 bg-white">
        <h2 className="font-semibold mb-3 text-primary">详细信息</h2>
        <div className="space-y-2 text-sm">
          {book.isbn && <div className="flex justify-between"><span className="text-gray-500">ISBN</span><span className="text-primary">{book.isbn}</span></div>}
          {book.author && <div className="flex justify-between"><span className="text-gray-500">作者</span><span className="text-primary">{book.author}</span></div>}
          {book.publisher && <div className="flex justify-between"><span className="text-gray-500">出版社</span><span className="text-primary">{book.publisher}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">发布时间</span><span className="text-primary">{getTimeAgo(book.created_at)}</span></div>
        </div>
        {book.description && (
          <div className="mt-3 p-3 rounded-xl text-sm bg-gray-50 text-gray-600 whitespace-pre-wrap">{book.description}</div>
        )}
      </div>

      {book.profiles && (
        <div className="mt-2 p-4 bg-white">
          <h2 className="font-semibold mb-3 text-primary">卖家信息</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
              {book.profiles.avatar_url ? (
                <img src={book.profiles.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-primary">{book.profiles.nickname || '匿名用户'}</div>
              {book.profiles.school && <div className="text-xs text-gray-400">{book.profiles.school}</div>}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleCopyWechat} className="flex-1 py-2 rounded-xl text-sm font-medium bg-green-50 text-green-600 border border-green-200 active:scale-95 transition-transform touch-target">
              复制微信号
            </button>
            <button onClick={handleCallPhone} className="flex-1 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200 active:scale-95 transition-transform touch-target">
              拨打电话
            </button>
          </div>
        </div>
      )}

      <div className="p-3 mx-4 mt-4 rounded-card bg-amber-50 border-l-4 border-amber-400">
        <div className="flex items-start gap-2">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-amber-700">本平台仅提供信息撮合服务，不涉及在线支付，请当面交易，谨防诈骗</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 flex gap-3 z-50 bg-white border-t border-gray-100"
           style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <button onClick={toggleFavorite} className="flex flex-col items-center gap-1 px-4 py-2 touch-target active:scale-95 transition-transform"
                style={{ color: isFavorite ? '#ffa06f' : '#666' }}>
          <span className="text-xl">{isFavorite ? '⭐' : '☆'}</span>
          <span className="text-xs">{isFavorite ? '已收藏' : '收藏'}</span>
        </button>
        {isMine ? (
          <>
            <button onClick={() => router.push(`/editItem?id=${book.id}`)} className="flex-1 py-3 rounded-xl text-white font-semibold bg-indigo-500 active:scale-95 transition-transform touch-target">
              编辑商品
            </button>
            <button onClick={() => setShowMore(!showMore)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 active:scale-95 transition-transform touch-target">
              更多
            </button>
          </>
        ) : (
          <button onClick={() => { if (!user) { setShowAuthModal(true) } else { showToast('info', '功能开发中') } }} className="flex-1 py-3 rounded-xl text-white font-semibold bg-accent active:scale-95 transition-transform touch-target">
            联系卖家
          </button>
        )}
      </div>

      {showMore && isMine && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-50 bg-white border-t border-gray-100 animate-slide-up"
             style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <button onClick={handleMarkSold} className="w-full py-3 text-center text-green-600 border-b border-gray-100 active:scale-95 transition-transform touch-target">标记为已售出</button>
          <button onClick={handleOffline} className="w-full py-3 text-center text-amber-600 border-b border-gray-100 active:scale-95 transition-transform touch-target">下架商品</button>
          <button onClick={handleDelete} className="w-full py-3 text-center text-red-500 border-b border-gray-100 active:scale-95 transition-transform touch-target">删除商品</button>
          <button onClick={() => setShowMore(false)} className="w-full py-3 text-center text-gray-500 active:scale-95 transition-transform touch-target">取消</button>
        </div>
      )}

      {showImageViewer && allImages.length > 0 && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 animate-fade-in" onClick={() => setShowImageViewer(false)}>
          <button onClick={() => setShowImageViewer(false)} className="absolute top-4 right-4 text-white text-2xl z-[110] touch-target active:scale-95 transition-transform">✕</button>
          <div className="flex items-center justify-between w-full px-4">
            {currentImageIndex > 0 && (
              <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(currentImageIndex - 1) }} className="text-white text-3xl p-2 touch-target active:scale-95 transition-transform">‹</button>
            )}
            <img src={allImages[currentImageIndex]} alt="" className="max-w-full max-h-[80vh] object-contain" onClick={(e) => e.stopPropagation()} loading="lazy" />
            {currentImageIndex < allImages.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(currentImageIndex + 1) }} className="text-white text-3xl p-2 touch-target active:scale-95 transition-transform">›</button>
            )}
          </div>
          <div className="absolute bottom-4 text-white text-sm">{currentImageIndex + 1} / {allImages.length}</div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => router.refresh()} />
    </div>
  )
}
