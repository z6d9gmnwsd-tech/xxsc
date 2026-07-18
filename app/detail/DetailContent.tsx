'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { getTimeAgo, getConditionColor, getCategoryTag } from '@/lib/utils'
import AuthModal from '@/components/AuthModal'
import {
  Heart,
  Share2,
  ChevronLeft,
  X,
  AlertTriangle,
  User,
  ChevronLeftCircle,
  ChevronRightCircle,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  EyeOff,
  PackageX,
  Copy,
  Phone,
  MessageSquare,
  BookOpen,
  Clock,
  Tag,
} from 'lucide-react'

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  useEffect(() => {
    if (id && user !== undefined) {
      loadData(id)
    }
  }, [id, user])

  const loadData = async (bookId: string) => {
    setLoading(true)
    try {
      const bookResult = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      const favResult = user
        ? await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('book_id', bookId)
            .single()
        : null

      if (bookResult.error) {
        console.error('Error loading book:', bookResult.error)
        setLoading(false)
        return
      }

      if (bookResult.data) {
        let profile = null
        if (bookResult.data.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('nickname, avatar_url, school')
            .eq('id', bookResult.data.user_id)
            .single()
          profile = profileData
        }

        const bookWithProfile = {
          ...bookResult.data,
          profiles: profile || { nickname: '匿名用户', avatar_url: null, school: null },
        }

        setBook(bookWithProfile as BookDetail)

        if (bookResult.data.isbn) {
          const { count } = await supabase
            .from('books')
            .select('*', { count: 'exact', head: true })
            .eq('isbn', bookResult.data.isbn)
            .eq('status', '在售')
            .neq('id', bookId)
          setIsbnCount(count || 0)
        }
      }

      if (favResult && !favResult.error) {
        setIsFavorite(true)
      }
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }

  const toggleFavorite = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (!book || favoriteLoading) return

    setFavoriteLoading(true)
    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', book.id)
      if (!error) {
        setIsFavorite(false)
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, book_id: book.id })
      if (!error) {
        setIsFavorite(true)
      }
    }
    setFavoriteLoading(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book?.title || '新校书仓商品',
        text: `我在新校书仓发现了一本好书：${book?.title}，只要${book?.price}元`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  const copyWechat = () => {
    if (book?.wechat) {
      navigator.clipboard.writeText(book.wechat)
    }
  }

  const callPhone = () => {
    if (book?.phone) {
      window.location.href = `tel:${book.phone}`
    }
  }

  const handleMore = (action: string) => {
    setShowMoreMenu(false)
    if (action === 'edit') {
      router.push(`/editItem?id=${book?.id}`)
    } else if (action === 'sold') {
      if (confirm('确定要标记为已售出吗？')) {
        supabase.from('books').update({ status: '已售' }).eq('id', book?.id).then(() => {
          router.refresh()
        })
      }
    } else if (action === 'offline') {
      if (confirm('确定要下架商品吗？')) {
        supabase.from('books').update({ status: '已下架' }).eq('id', book?.id).then(() => {
          router.push('/')
        })
      }
    } else if (action === 'delete') {
      if (confirm('确定要删除商品吗？此操作不可恢复')) {
        supabase.from('books').delete().eq('id', book?.id).then(() => {
          router.push('/')
        })
      }
    }
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev < 1 ? prev + 1 : prev))
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#F2F2F7' }}>
        <div className="animate-fade-in">
          <div className="h-[300px] skeleton" />
          <div className="p-4 space-y-3">
            <div className="h-8 w-32 skeleton rounded-lg" />
            <div className="h-5 w-3/4 skeleton rounded-lg" />
            <div className="flex gap-2">
              <div className="h-6 w-16 skeleton rounded-full" />
              <div className="h-6 w-16 skeleton rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20" style={{ background: '#F2F2F7' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.85)' }}>
          <PackageX size={32} color="#999" />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#1a1a1a' }}>商品不存在</h2>
        <p className="text-sm mb-4" style={{ color: '#666' }}>该商品可能已被删除或下架</p>
        <a href="/" className="btn-primary">返回首页</a>
      </div>
    )
  }

  const isMine = user?.id === book.user_id
  const images = book.image_url ? [book.image_url] : []

  return (
    <div className="pb-24" style={{ background: '#F2F2F7', minHeight: '100vh' }}>
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-[60] max-w-[480px]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <ChevronLeft size={20} color="#1a1a1a" />
        </button>
      </div>

      {/* Image Section */}
      {book.image_url ? (
        <div className="relative">
          <img
            src={book.image_url}
            alt={book.title}
            className="w-full h-[300px] object-cover"
            onClick={() => setShowImagePreview(true)}
          />
          <div
            className={`absolute top-3 left-3 text-white text-xs px-3 py-1 rounded-full font-medium ${getConditionColor(book.condition)}`}
          >
            {book.condition}
          </div>
        </div>
      ) : (
        <div
          className="w-full h-[200px] flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.85)' }}
        >
          <BookOpen size={48} color="#C4A882" />
        </div>
      )}

      {/* Price & Title Card */}
      <div
        className="mx-4 -mt-4 relative rounded-2xl p-4 animate-slide-up"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          border: '0.5px solid rgba(0,0,0,0.04)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold" style={{ color: '#E8590C' }}>
            ¥{book.price}
          </span>
          {book.original_price && (
            <span className="text-sm line-through" style={{ color: '#999' }}>
              原价 ¥{book.original_price}
            </span>
          )}
        </div>
        <h1 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {book.title}
        </h1>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className={`tag ${getCategoryTag(book.category)}`}>{book.category}</span>
          <span className="tag tag-success">{book.condition}</span>
          {book.grade && <span className="tag tag-info">{book.grade}</span>}
          {book.subject && <span className="tag tag-warning">{book.subject}</span>}
        </div>
        {book.isbn && isbnCount > 0 && (
          <a
            href={`/isbn?isbn=${book.isbn}`}
            className="flex items-center gap-1 mt-3 text-sm font-medium"
            style={{ color: '#E8590C' }}
          >
            查看同ISBN商品比价（{isbnCount}件在售）
          </a>
        )}
      </div>

      {/* Book Details Card */}
      <div
        className="mx-4 mt-2 rounded-2xl p-4 animate-slide-up"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          border: '0.5px solid rgba(0,0,0,0.04)',
        }}
      >
        <h2 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#1a1a1a' }}>
          <Tag size={16} color="#C4A882" />
          详细信息
        </h2>
        <div className="space-y-2.5 text-sm">
          {book.isbn && (
            <div className="flex justify-between">
              <span style={{ color: '#666' }}>ISBN</span>
              <span style={{ color: '#1a1a1a' }}>{book.isbn}</span>
            </div>
          )}
          {book.author && (
            <div className="flex justify-between">
              <span style={{ color: '#666' }}>作者</span>
              <span style={{ color: '#1a1a1a' }}>{book.author}</span>
            </div>
          )}
          {book.publisher && (
            <div className="flex justify-between">
              <span style={{ color: '#666' }}>出版社</span>
              <span style={{ color: '#1a1a1a' }}>{book.publisher}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span style={{ color: '#666' }}>发布时间</span>
            <span className="flex items-center gap-1" style={{ color: '#1a1a1a' }}>
              <Clock size={12} />
              {getTimeAgo(book.created_at)}
            </span>
          </div>
        </div>
        {book.description && (
          <div
            className="mt-3 p-3 rounded-xl text-sm"
            style={{ background: '#F2F2F7', color: '#666' }}
          >
            {book.description}
          </div>
        )}
      </div>

      {/* Safety Warning */}
      <div
        className="mx-4 mt-2 rounded-2xl p-4 flex items-start gap-3 animate-slide-up"
        style={{ background: 'rgba(255,149,0,0.08)' }}
      >
        <AlertTriangle size={18} color="#E8590C" className="flex-shrink-0 mt-0.5" />
        <div className="text-sm" style={{ color: '#666' }}>
          <p className="font-medium" style={{ color: '#1a1a1a' }}>交易安全提醒</p>
          <p className="mt-1">建议当面交易，核实商品后再付款。平台不承担私下交易产生的风险。</p>
        </div>
      </div>

      {/* Seller Info Card */}
      {book.profiles && (
        <div
          className="mx-4 mt-2 rounded-2xl p-4 animate-slide-up"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <h2 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#1a1a1a' }}>
            <User size={16} color="#C4A882" />
            卖家信息
          </h2>
          <a
            href={`/seller?id=${book.user_id}`}
            className="flex items-center gap-3"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{
                background: book.profiles.avatar_url
                  ? 'transparent'
                  : 'linear-gradient(135deg, #F5E6D0, #E0C9A8)',
              }}
            >
              {book.profiles.avatar_url ? (
                <img
                  src={book.profiles.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} color="#fff" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium" style={{ color: '#1a1a1a' }}>
                {book.profiles.nickname || '匿名用户'}
              </div>
              {book.profiles.school && (
                <div className="text-xs" style={{ color: '#999' }}>
                  {book.profiles.school}
                </div>
              )}
            </div>
            <ChevronRight size={16} color="#999" />
          </a>

          {/* Contact Buttons */}
          <div className="flex gap-2 mt-3">
            {book.wechat && (
              <button
                onClick={copyWechat}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: '#F2F2F7',
                  color: '#1a1a1a',
                }}
              >
                <Copy size={14} />
                微信: {book.wechat}
              </button>
            )}
            {book.phone && (
              <button
                onClick={callPhone}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: '#F2F2F7',
                  color: '#1a1a1a',
                }}
              >
                <Phone size={14} />
                电话联系
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '0.5px solid rgba(0,0,0,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom, 12px)',
        }}
      >
        <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center gap-3">
          {isMine ? (
            <>
              <button
                onClick={toggleFavorite}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all card-interactive"
                style={{
                  background: isFavorite ? '#FFF0E6' : '#F2F2F7',
                  color: isFavorite ? '#E8590C' : '#666',
                }}
              >
                <Heart size={16} fill={isFavorite ? '#E8590C' : 'none'} />
                {isFavorite ? '已收藏' : '收藏'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all card-interactive"
                style={{ background: '#F2F2F7', color: '#666' }}
              >
                <Share2 size={16} />
                分享
              </button>
              <button
                onClick={() => router.push(`/editItem?id=${book.id}`)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium btn-primary"
              >
                <Pencil size={14} />
                编辑商品
              </button>
              <button
                onClick={() => setShowMoreMenu(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 card-interactive"
                style={{ background: '#F2F2F7', color: '#666' }}
              >
                <MoreHorizontal size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all card-interactive"
                style={{
                  background: isFavorite ? '#FFF0E6' : '#F2F2F7',
                  color: isFavorite ? '#E8590C' : '#666',
                }}
              >
                <Heart size={16} fill={isFavorite ? '#E8590C' : 'none'} />
                {isFavorite ? '已收藏' : '收藏'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all card-interactive"
                style={{ background: '#F2F2F7', color: '#666' }}
              >
                <Share2 size={16} />
                分享
              </button>
            </>
          )}
        </div>
      </div>

      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center"
          onClick={() => setShowMoreMenu(false)}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-[480px] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-4 mb-4 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <button
                onClick={() => handleMore('sold')}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium border-b"
                style={{ color: '#1a1a1a', borderColor: 'rgba(0,0,0,0.06)' }}
              >
                <PackageX size={18} color="#E8590C" />
                标记已售出
              </button>
              <button
                onClick={() => handleMore('offline')}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium border-b"
                style={{ color: '#1a1a1a', borderColor: 'rgba(0,0,0,0.06)' }}
              >
                <EyeOff size={18} color="#666" />
                下架商品
              </button>
              <button
                onClick={() => handleMore('delete')}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium"
                style={{ color: '#FF3B30' }}
              >
                <Trash2 size={18} color="#FF3B30" />
                删除商品
              </button>
            </div>
            <button
              onClick={() => setShowMoreMenu(false)}
              className="mx-4 mb-4 w-[calc(100%-32px)] py-3 rounded-2xl text-sm font-medium"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                color: '#1a1a1a',
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Overlay */}
      {showImagePreview && images.length > 0 && (
        <div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.95)' }}
        >
          <button
            onClick={() => {
              setShowImagePreview(false)
              setCurrentImageIndex(0)
            }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <X size={20} color="#fff" />
          </button>

          <div className="relative flex items-center justify-center w-full px-12">
            {images.length > 1 && currentImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 z-10"
              >
                <ChevronLeftCircle size={36} color="rgba(255,255,255,0.8)" />
              </button>
            )}
            <img
              src={images[currentImageIndex]}
              alt=""
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            {images.length > 1 && currentImageIndex < images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 z-10"
              >
                <ChevronRightCircle size={36} color="rgba(255,255,255,0.8)" />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}
