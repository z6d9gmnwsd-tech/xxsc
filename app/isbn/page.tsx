'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getTimeAgo } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'

interface Book {
  id: string
  title: string
  price: number
  original_price: number | null
  condition: string
  category: string
  grade: string
  image_url: string | null
  created_at: string
}

function IsbnContent() {
  const searchParams = useSearchParams()
  const isbn = searchParams.get('isbn')
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [lowestPrice, setLowestPrice] = useState(0)
  const [avgPrice, setAvgPrice] = useState(0)

  useEffect(() => {
    if (isbn) {
      fetchBooks(isbn)
    }
  }, [isbn])

  const fetchBooks = async (isbnCode: string) => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('isbn', isbnCode)
      .eq('status', '在售')
      .order('price', { ascending: true })

    if (data) {
      setBooks(data as Book[])
      
      if (data.length > 0) {
        const prices = data.map(b => b.price)
        setLowestPrice(Math.min(...prices))
        setAvgPrice(prices.reduce((a, b) => a + b, 0) / prices.length)
      }
    }
    setLoading(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="pb-20">
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold">ISBN比价</h1>
            <p className="text-sm mt-1" style={{opacity: 0.8}}>共找到 {books.length} 本同ISBN商品</p>
          </div>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12" style={{color: '#999'}}>
          <span className="text-5xl">📚</span>
          <p className="mt-4 text-lg">暂无此ISBN的商品</p>
        </div>
      ) : (
        <>
          {/* 价格统计 */}
          <div className="flex gap-3 px-4 py-4">
            <div className="flex-1 p-4 rounded-2xl text-center" style={{background: '#fff'}}>
              <div className="text-2xl font-bold" style={{color: '#ffa06f'}}>¥{lowestPrice.toFixed(2)}</div>
              <div className="text-xs mt-1" style={{color: '#999'}}>最低价</div>
            </div>
            <div className="flex-1 p-4 rounded-2xl text-center" style={{background: '#fff'}}>
              <div className="text-2xl font-bold" style={{color: '#5A8F5C'}}>¥{avgPrice.toFixed(2)}</div>
              <div className="text-xs mt-1" style={{color: '#999'}}>平均价</div>
            </div>
          </div>

          {/* 商品列表 */}
          <div className="px-4 pb-4">
            <h2 className="font-semibold mb-3" style={{color: '#333'}}>商品列表</h2>
            {books.map((book, index) => (
              <a
                key={book.id}
                href={`/detail?id=${book.id}`}
                className="card flex items-center gap-3 mb-3 animate-fade-in block"
                style={{margin: '16px 0', padding: '28rpx'}}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{background: index === 0 ? '#ffa06f' : '#e0e0e0', color: index === 0 ? '#fff' : '#666'}}>
                  {index + 1}
                </div>
                {book.image_url ? (
                  <img src={book.image_url} alt={book.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: '#f0f0f0'}}>
                    <span className="text-2xl">📚</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-1" style={{color: '#333'}}>{book.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="tag tag-success text-xs">{book.condition}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold" style={{color: '#ffa06f'}}>¥{book.price}</div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function IsbnPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <IsbnContent />
    </Suspense>
  )
}
