'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BookCard from '@/components/BookCard'
import Skeleton from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import BackButton from '@/components/BackButton'
import { Book } from '@/types'

interface SellerInfo { nickname: string; avatar_url: string | null; school: string | null; bio: string | null }

export default function SellerContent() {
  const searchParams = useSearchParams()
  const sellerId = searchParams.get('id')
  const [seller, setSeller] = useState<SellerInfo | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (!sellerId) { setLoading(false); return } loadData() }, [sellerId])

  const loadData = async () => {
    if (!sellerId) return
    try {
      const { data: profileData } = await supabase.from('profiles').select('nickname, avatar_url, school, bio').eq('id', sellerId).single()
      if (profileData) setSeller(profileData)
      const { data: booksData } = await supabase.from('books').select('*').eq('user_id', sellerId).eq('status', '在售').order('created_at', { ascending: false })
      if (booksData) setBooks(booksData)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) return (<div className="min-h-screen" style={{ backgroundColor: '#F8F6F2' }}><div className="px-4 py-4 flex items-center gap-3" style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E5' }}><BackButton /><h1 className="text-lg font-bold" style={{ color: '#333' }}>卖家主页</h1></div><div className="p-4"><Skeleton type="card" count={2} /></div></div>)

  if (!seller) return (<div className="min-h-screen" style={{ backgroundColor: '#F8F6F2' }}><div className="px-4 py-4 flex items-center gap-3" style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E5' }}><BackButton /><h1 className="text-lg font-bold" style={{ color: '#333' }}>卖家主页</h1></div><EmptyState icon="👤" title="未找到该卖家" /></div>)

  return (
    <div className="pb-20 min-h-screen" style={{ backgroundColor: '#F8F6F2' }}>
      <div className="px-4 py-4 flex items-center gap-3" style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E5' }}>
        <BackButton />
        <h1 className="text-lg font-bold" style={{ color: '#333' }}>卖家主页</h1>
      </div>
      <div className="p-4">
        <div className="rounded-xl p-4 bg-white mb-4" style={{ border: '1px solid #E5E5E5' }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#E5E5E5' }}>
              {seller.avatar_url ? <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl">👤</span>}
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold" style={{ color: '#333' }}>{seller.nickname || '匿名用户'}</div>
              {seller.school && <div className="text-sm mt-0.5" style={{ color: '#666' }}>🏫 {seller.school}</div>}
              {seller.bio && <div className="text-sm mt-1" style={{ color: '#999' }}>📝 {seller.bio}</div>}
            </div>
          </div>
        </div>
        <h2 className="font-bold mb-3" style={{ color: '#333' }}>TA发布的商品（{books.length}）</h2>
        {books.length === 0 ? <EmptyState icon="📦" title="暂无在售商品" /> : books.map((book, index) => <BookCard key={book.id} book={book} index={index} />)}
      </div>
    </div>
  )
}
