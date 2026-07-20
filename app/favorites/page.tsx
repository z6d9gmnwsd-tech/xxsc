'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import useSWR from 'swr'
import BookCard from '@/components/BookCard'
import Skeleton from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import BottomNav from '@/components/BottomNav'
import AuthModal from '@/components/AuthModal'
import Toast from '@/components/Toast'
import { Book } from '@/types'

export default function FavoritesPage() {
  const { user, loading } = usePhoneAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const fetcher = async () => {
    if (!user) return []
    const { data: favData } = await supabase.from('favorites').select('book_id').eq('user_id', user.id)
    if (!favData || favData.length === 0) return []
    const bookIds = favData.map(f => f.book_id)
    const { data: books } = await supabase.from('books').select('*').in('id', bookIds).eq('status', '在售')
    return books || []
  }

  const { data: books, isLoading } = useSWR(user ? `favorites-${user.id}` : null, fetcher, { revalidateOnFocus: true })

  if (loading) return (<div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F8F6F2' }}><div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#E5E5E5', borderTopColor: '#F6C12C' }} /></div>)

  if (!user) {
    return (
      <div className="pb-24 min-h-screen" style={{ backgroundColor: '#F8F6F2' }}>
        <Toast />
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0DEBF 0%, #E8D0A8 40%, #D4B88A 100%)' }}>
          <div className="relative px-4 py-6 safe-area-top"><h1 className="text-xl font-bold tracking-wide" style={{ color: '#333' }}>我的收藏</h1></div>
        </div>
        <div className="flex flex-col items-center justify-center px-8" style={{ minHeight: '50vh' }}>
          <p className="text-center mb-6" style={{ color: '#999' }}>登录后查看收藏</p>
          <button onClick={() => setShowAuthModal(true)} className="btn-primary text-lg px-12 py-3">登录 / 注册</button>
        </div>
        <BottomNav /><AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="pb-24 min-h-screen" style={{ backgroundColor: '#F8F6F2' }}>
      <Toast />
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0DEBF 0%, #E8D0A8 40%, #D4B88A 100%)' }}>
        <div className="relative px-4 py-6 safe-area-top"><h1 className="text-xl font-bold tracking-wide" style={{ color: '#333' }}>我的收藏</h1></div>
      </div>

      {isLoading ? <div className="px-4 py-2"><Skeleton type="card" count={2} /></div>
        : !books || books.length === 0 ? <EmptyState icon="⭐" title="暂无收藏" description="收藏你喜欢的书籍吧" action={{ label: '去逛逛', href: '/' }} />
        : <div className="px-4 py-2">{books.map((book: Book, index: number) => <BookCard key={book.id} book={book} index={index} />)}</div>}

      <BottomNav />
    </div>
  )
}
