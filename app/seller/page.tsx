'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { getCategoryTag } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import BackButton from '@/components/BackButton'

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
  category: string
  image_url: string | null
  created_at: string
}

function SellerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = usePhoneAuth()
  const sellerId = searchParams.get('id')
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [books, setBooks] = useState<BookItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sellerId) loadData()
  }, [sellerId])

  const loadData = async () => {
    const [profileRes, booksRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', sellerId).single(),
      supabase.from('books').select('*').eq('user_id', sellerId!).eq('status', '在售').order('created_at', { ascending: false }),
    ])
    if (profileRes.data) setProfile(profileRes.data)
    if (booksRes.data) setBooks(booksRes.data)
    setLoading(false)
  }

  if (loading) return <LoadingSpinner />
  if (!profile) return <EmptyState icon="❌" title="用户不存在" />

  return (
    <div className="pb-20">
      <div className="bg-gradient-primary px-4 py-8 text-white">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl">👤</span>}
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">{profile.nickname || '匿名用户'}</div>
            {profile.school && <div className="text-sm opacity-80">{profile.school}</div>}
            <div className="text-xs opacity-60 mt-1">发布 {books.length} 件商品</div>
          </div>
        </div>
        {profile.bio && <div className="mt-4 p-3 bg-white/10 rounded-xl text-sm">{profile.bio}</div>}
      </div>

      <div className="bg-white p-4 flex gap-3">
        {user && user.id !== sellerId && (
          <button onClick={() => router.push(`/chat?id=${sellerId}`)} className="flex-1 btn-primary py-2.5">发消息</button>
        )}
      </div>

      <div className="bg-white mt-2 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">在售商品</h2>
        {books.length === 0 ? (
          <div className="text-center text-gray-400 py-8">暂无在售商品</div>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <a key={book.id} href={`/detail?id=${book.id}`} className="flex gap-3 p-3 bg-gray-50 rounded-xl block">
                {book.image_url ? <img src={book.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center"><span className="text-2xl">📚</span></div>}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{book.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-orange-500">¥{book.price}</span>
                    <span className={`tag text-xs ${getCategoryTag(book.category)}`}>{book.category}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SellerPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SellerContent />
    </Suspense>
  )
}
