'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { getTimeAgo } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'
import AuthModal from '@/components/AuthModal'
import Toast, { showToast } from '@/components/Toast'
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

  // 图片滑动
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX }
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentImageIndex < getAllImages().length - 1) setCurrentImageIndex(prev => prev + 1)
      else if (diff < 0 && currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1)
    }
  }

  useEffect(() => {
    if (id) { loadBook(id); if (user) checkFavorite(id) }
  }, [id, user])

  const loadBook = async (bookId: string) => {
    try {
      const { data, error } = await supabase.from('books').select('*').eq('id', bookId).single()
      if (error || !data) { setLoading(false); return }
      let profile = null
      if (data.user_id) { const { data: p } = await supabase.from('profiles').select('nickname, avatar_url, school').eq('id', data.user_id).single(); profile = p }
      setBook({ ...data, profiles: profile || { nickname: '匿名用户', avatar_url: null, school: null } })
      if (data.isbn) { const { count } = await supabase.from('books').select('*', { count: 'exact', head: true }).eq('isbn', data.isbn).eq('status', '在售').neq('id', bookId); setIsbnCount(count || 0) }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const checkFavorite = async (bookId: string) => {
    try { const { data } = await supabase.from('favorites').select('id').eq('user_id', user!.id).eq('book_id', bookId).single(); setIsFavorite(!!data) } catch {}
  }

  const toggleFavorite = async () => {
    if (!user) { setShowAuthModal(true); return }
    if (!book) return
    try {
      if (isFavorite) { await supabase.from('favorites').delete().eq('user_id', user.id).eq('book_id', book.id); setIsFavorite(false); showToast('info', '已取消收藏') }
      else { await supabase.from('favorites').insert({ user_id: user.id, book_id: book.id }); setIsFavorite(true); showToast('success', '收藏成功') }
    } catch { showToast('error', '操作失败') }
  }

  const handleShare = () => showToast('info', '分享功能开发中')

  const handleCopyWechat = () => {
    if (book?.description) { const m = book.description.match(/微信号：(.+?)[\n\r]/); if (m) { navigator.clipboard.writeText(m[1].trim()); showToast('success', '微信号已复制') } }
  }
  const handleCallPhone = () => {
    if (book?.description) { const m = book.description.match(/联系电话：(.+?)[\n\r]/); if (m) window.location.href = `tel:${m[1].trim()}` }
  }
  const handleReport = () => showToast('info', '举报功能开发中')
  const handleDelete = async () => {
    if (!book || !confirm('确定要删除这个商品吗？')) return
    try { await supabase.from('books').delete().eq('id', book.id); showToast('success', '已删除'); setTimeout(() => router.push('/'), 1000) } catch { showToast('error', '删除失败') }
  }
  const handleMarkSold = async () => {
    if (!book) return
    try { await supabase.from('books').update({ status: '已售出' }).eq('id', book.id); setBook({ ...book!, status: '已售出' }); setShowMore(false); showToast('success', '已标记为售出') } catch { showToast('error', '操作失败') }
  }
  const handleOffline = async () => {
    if (!book) return
    try { await supabase.from('books').update({ status: '已下架' }).eq('id', book.id); setBook({ ...book!, status: '已下架' }); setShowMore(false); showToast('success', '已下架') } catch { showToast('error', '操作失败') }
  }
  const getAllImages = () => { if (!book) return []; if (book.images?.length > 0) return book.images.filter(i => i); return book.image_url ? [book.image_url] : [] }
  const getWechat = () => book?.description?.match(/微信号：(.+?)[\n\r]/)?.[1]?.trim() || ''
  const getPhone = () => book?.description?.match(/联系电话：(.+?)[\n\r]/)?.[1]?.trim() || ''

  if (loading) return <LoadingSpinner />
  if (!book) return (<div className="flex flex-col items-center justify-center p-8 py-20"><div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4"><span className="text-4xl">❌</span></div><h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>商品不存在</h2><a href="/" className="btn-primary mt-4">返回首页</a></div>)

  const isMine = user?.id === book.user_id
  const allImages = getAllImages()
  const wechat = getWechat()
  const phoneNum = getPhone()

  return (
    <div className="pb-20 min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Toast />
      <div className="fixed top-4 left-4 z-50"><BackButton /></div>

      {allImages.length > 0 && (
        <div className="relative">
          <div className="w-full h-[300px] cursor-pointer" onClick={() => setShowImageViewer(true)}>
            <img src={allImages[currentImageIndex]} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
          {allImages.length > 1 && <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs bg-black/50 text-white">{allImages.length}张图 · 点击可放大</div>}
        </div>
      )}

      <div className="p-4 bg-white">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{book.price}元</span>
          {book.original_price && <span className="text-sm line-through" style={{ color: 'var(--text-tertiary)' }}>原价 {book.original_price}元</span>}
        </div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{book.title}</h1>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="tag tag-primary">{book.category}</span>
          <span className="tag tag-success">{book.condition}</span>
        </div>
        {book.isbn && isbnCount > 0 && (
          <div className="mt-3 p-3 rounded-xl cursor-pointer" style={{ backgroundColor: 'rgba(246,193,44,0.06)', border: '1px solid rgba(246,193,44,0.15)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--accent)' }}>
              <span>🔍</span><span className="font-medium">查看同ISBN商品比价（{isbnCount}件在售）</span><span className="ml-auto">›</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 p-4 bg-white">
        <h2 className="section-header mb-3">详细信息</h2>
        <div className="space-y-3 text-sm">
          {book.isbn && <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}><span style={{ color: 'var(--text-secondary)' }}>ISBN</span><span style={{ color: 'var(--text-primary)' }} className="font-medium">{book.isbn}</span></div>}
          {book.author && <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}><span style={{ color: 'var(--text-secondary)' }}>作者</span><span style={{ color: 'var(--text-primary)' }} className="font-medium">{book.author}</span></div>}
          {book.publisher && <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}><span style={{ color: 'var(--text-secondary)' }}>出版社</span><span style={{ color: 'var(--text-primary)' }} className="font-medium">{book.publisher}</span></div>}
          <div className="flex justify-between py-2"><span style={{ color: 'var(--text-secondary)' }}>发布时间</span><span style={{ color: 'var(--text-primary)' }} className="font-medium">{getTimeAgo(book.created_at)}</span></div>
        </div>
      </div>

      {book.profiles && (
        <div className="mt-2 p-4 bg-white">
          <h2 className="section-header mb-3">卖家信息</h2>
          <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-page)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
                {book.profiles.avatar_url ? <img src={book.profiles.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" /> : <span className="text-2xl">👤</span>}
              </div>
              <div className="flex-1"><div className="font-medium" style={{ color: 'var(--text-primary)' }}>{book.profiles.nickname || '匿名用户'}</div>{book.profiles.school && <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{book.profiles.school}</div>}</div>
              <span style={{ color: 'var(--text-tertiary)' }}>›</span>
            </div>
          </div>
          {!isMine && (
            <div className="flex gap-2 mb-4">
              <button onClick={handleCopyWechat} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgba(246,193,44,0.08)', color: 'var(--accent)' }}>💬 发消息</button>
              <button onClick={handleCopyWechat} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669' }}>👤 复制微信号</button>
            </div>
          )}
          {!isMine && (
            <div className="flex gap-2 mb-4">
              <button onClick={handleCallPhone} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgba(59,130,246,0.08)', color: '#2563EB' }}>📞 拨打电话</button>
              <button onClick={handleReport} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>⚠️ 举报</button>
            </div>
          )}
          {wechat && <div className="p-3 rounded-xl mb-3" style={{ backgroundColor: 'var(--bg-page)' }}><div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>卖家微信号</div><div className="flex items-center justify-between"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{wechat}</span><button onClick={handleCopyWechat} className="px-4 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent)' }}>复制</button></div></div>}
          {phoneNum && <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-page)' }}><div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>联系电话</div><div className="flex items-center justify-between"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{phoneNum}</span><button onClick={handleCallPhone} className="px-4 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent)' }}>拨打</button></div></div>}
        </div>
      )}

      <div className="p-3 mx-4 mt-4 rounded-xl" style={{ backgroundColor: 'rgba(246,193,44,0.06)', borderLeft: '3px solid var(--accent)' }}>
        <div className="flex items-start gap-2"><span className="text-lg">⚠️</span><p className="text-sm" style={{ color: '#92400E' }}>本平台仅提供信息撮合服务，不涉及在线支付，请当面交易，谨防诈骗</p></div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 flex gap-3 z-50 bg-white" style={{ borderTop: '1px solid var(--border-color)', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom,0px))' }}>
        {isMine ? (<>
          <button onClick={() => router.push(`/editItem?id=${book.id}`)} className="flex-1 py-3 rounded-lg text-white font-semibold active:scale-95 transition-transform" style={{ backgroundColor: 'var(--accent)' }}>编辑商品</button>
          <button onClick={() => setShowMore(!showMore)} className="px-4 py-2 rounded-lg active:scale-95 transition-transform" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>更多</button>
        </>) : (<>
          <button onClick={toggleFavorite} className="flex flex-col items-center gap-1 px-4 py-2 touch-target active:scale-95 transition-transform" style={{ color: isFavorite ? 'var(--accent)' : 'var(--text-secondary)' }}>
            <span className="text-xl">{isFavorite ? '⭐' : '☆'}</span><span className="text-xs">{isFavorite ? '已收藏' : '收藏'}</span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center gap-1 px-4 py-2 touch-target active:scale-95 transition-transform" style={{ color: 'var(--text-secondary)' }}>
            <span className="text-xl">↗</span><span className="text-xs">分享</span>
          </button>
        </>)}
      </div>

      {showMore && isMine && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-50 bg-white animate-slide-up" style={{ borderTop: '1px solid var(--border-color)', paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
          <button onClick={handleMarkSold} className="w-full py-3 text-center border-b active:scale-95 transition-transform touch-target" style={{ color: '#059669', borderColor: 'var(--border-color)' }}>标记为已售出</button>
          <button onClick={handleOffline} className="w-full py-3 text-center border-b active:scale-95 transition-transform touch-target" style={{ color: '#D97706', borderColor: 'var(--border-color)' }}>下架商品</button>
          <button onClick={handleDelete} className="w-full py-3 text-center border-b active:scale-95 transition-transform touch-target" style={{ color: '#DC2626', borderColor: 'var(--border-color)' }}>删除商品</button>
          <button onClick={() => setShowMore(false)} className="w-full py-3 text-center active:scale-95 transition-transform touch-target" style={{ color: 'var(--text-tertiary)' }}>取消</button>
        </div>
      )}

      {showImageViewer && allImages.length > 0 && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 animate-fade-in"
          onClick={() => setShowImageViewer(false)}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <button onClick={() => setShowImageViewer(false)} className="absolute top-4 right-4 text-white text-2xl z-[110] touch-target active:scale-95 transition-transform">✕</button>
          <img src={allImages[currentImageIndex]} alt="" className="max-w-full max-h-[80vh] object-contain select-none" onClick={e => e.stopPropagation()} loading="lazy" draggable={false} />
          <div className="absolute bottom-6 text-white text-sm">{currentImageIndex + 1} / {allImages.length}</div>
          {allImages.length > 1 && (<>
            {currentImageIndex > 0 && <button onClick={e => { e.stopPropagation(); setCurrentImageIndex(prev => prev - 1) }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white active:scale-90 transition-transform">‹</button>}
            {currentImageIndex < allImages.length - 1 && <button onClick={e => { e.stopPropagation(); setCurrentImageIndex(prev => prev + 1) }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white active:scale-90 transition-transform">›</button>}
          </>)}
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => router.refresh()} />
    </div>
  )
}
