'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, User, BookOpen } from 'lucide-react'
import { SkeletonCard } from '@/components/LoadingSpinner'
import BookCard from '@/components/BookCard'

interface SellerProfile {
  id: string
  nickname: string
  avatar_url: string | null
  school: string | null
  bio: string | null
}

interface BookItem {
  id: string
  title: string
  price: number
  condition: string
  image_url: string | null
  created_at: string
  category: string
  grade: string
  subject: string
}

function SellerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sellerId = searchParams.get('id')
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [books, setBooks] = useState<BookItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sellerId) loadData(sellerId)
  }, [sellerId])

  const loadData = async (id: string) => {
    const [profileResult, booksResult] = await Promise.all([
      supabase.from('profiles').select('id, nickname, avatar_url, school, bio').eq('id', id).single(),
      supabase.from('books').select('*').eq('user_id', id).eq('status', '在售').order('created_at', { ascending: false }).limit(20)
    ])
    if (profileResult.data) setSeller(profileResult.data)
    if (booksResult.data) setBooks(booksResult.data)
    setLoading(false)
  }

  if (loading) return <SkeletonCard />
  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#F2F2F7' }}>
        <h2 className="text-lg font-semibold" style={{ color: '#333' }}>用户不存在</h2>
        <a href="/" className="btn-primary mt-4">返回首页</a>
      </div>
    )
  }

  return (
    <div className="pb-24 min-h-screen" style={{ background: '#F2F2F7' }}>
      <div className="header-glass px-4 py-5 text-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">卖家主页</h1>
        </div>
      </div>

      <div className="mx-4 mt-4 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B8C5A, #40916C)' }}>
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <User size={28} color="#fff" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold" style={{ color: '#1a1a1a' }}>{seller.nickname}</div>
            {seller.school && <div className="text-xs mt-0.5" style={{ color: '#999' }}>{seller.school}</div>}
            {seller.bio && <div className="text-xs mt-1" style={{ color: '#666' }}>{seller.bio}</div>}
          </div>
        </div>
        <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          <BookOpen size={14} style={{ color: '#5B8C5A' }} />
          <span className="text-xs" style={{ color: '#666' }}>在售 {books.length} 件商品</span>
        </div>
      </div>

      {books.length > 0 ? (
        <div className="px-0 py-2">
          {books.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16" style={{ color: '#999' }}>
          <BookOpen size={32} className="mx-auto mb-3" style={{ color: '#ccc' }} />
          <p className="text-sm">暂无在售商品</p>
        </div>
      )}
    </div>
  )
}

export default function SellerPage() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <SellerContent />
    </Suspense>
  )
}
