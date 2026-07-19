'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BackButton from '@/components/BackButton'
import BottomNav from '@/components/BottomNav'
import { Store, BookOpen, MessageSquare, Star } from 'lucide-react'

interface SellerProfile {
  id: string
  nickname: string
  avatar_url: string | null
  school: string
  bio: string
}

interface BookItem {
  id: string
  title: string
  price: number
  condition: string
  image_url: string | null
  created_at: string
}

export default function SellerPage() {
  const searchParams = useSearchParams()
  const sellerId = searchParams.get('id')
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [books, setBooks] = useState<BookItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sellerId) loadData()
  }, [sellerId])

  const loadData = async () => {
    const [sellerRes, booksRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', sellerId).single(),
      supabase.from('books').select('*').eq('user_id', sellerId).eq('status', '在售').order('created_at', { ascending: false }),
    ])

    if (sellerRes.data) setSeller(sellerRes.data)
    if (booksRes.data) setBooks(booksRes.data)
    setLoading(false)
  }

  if (loading) {
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
            <h1 className="text-xl font-bold">卖家主页</h1>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-4 skeleton animate-fade-in" style={{ height: 100 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20" style={{ background: '#F2F2F7', minHeight: '100vh' }}>
      <div
        className="header-glass px-4 py-6 text-white"
        style={{
          background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex items-center gap-2">
            <Store size={20} />
            <h1 className="text-xl font-bold">卖家主页</h1>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="px-4 -mt-2">
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)' }}
            >
              {seller?.avatar_url ? (
                <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store size={24} color="#fff" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold" style={{ color: '#1a1a1a' }}>{seller?.nickname || '匿名卖家'}</h2>
              <p className="text-xs" style={{ color: '#999' }}>{seller?.school || '未填写学校'}</p>
            </div>
            <a
              href={`/chat?id=${sellerId}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#FFF0E6', color: '#E8590C' }}
            >
              <MessageSquare size={14} />
              联系
            </a>
          </div>
          {seller?.bio && (
            <p className="text-sm mt-3" style={{ color: '#666' }}>{seller.bio}</p>
          )}
        </div>
      </div>

      {/* Seller Books */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-medium mb-3" style={{ color: '#1a1a1a' }}>在售商品 ({books.length})</h3>
        <div className="space-y-3">
          {books.map((book) => (
            <a
              key={book.id}
              href={`/detail?id=${book.id}`}
              className="block rounded-2xl overflow-hidden animate-fade-in"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(10px)',
                border: '0.5px solid rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex">
                <div className="relative flex-shrink-0">
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} className="w-[100px] h-[100px] object-cover" />
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
                    <h3 className="font-semibold text-sm line-clamp-2" style={{ color: '#1a1a1a' }}>{book.title}</h3>
                    <span className="text-xs" style={{ color: '#999' }}>{book.condition}</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: '#E8590C' }}>¥{book.price}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <BottomNav activeTab="home" />
    </div>
  )
}
