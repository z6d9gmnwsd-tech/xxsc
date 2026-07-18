'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

interface Book {
  id: string
  title: string
  price: number
  original_price: number | null
  condition: string
  category: string
  grade: string
  subject: string
  image_url: string | null
  created_at: string
}

interface BookListProps {
  searchQuery?: string
  sortBy?: 'newest' | 'price_asc' | 'price_desc'
  filterCategory?: string
}

export default function BookList({ searchQuery = '', sortBy = 'newest', filterCategory = '' }: BookListProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBooks = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('books')
      .select('*')
      .eq('status', '在售')

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,isbn.ilike.%${searchQuery}%`)
    }

    if (filterCategory) {
      query = query.eq('category', filterCategory)
    }

    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    query = query.limit(20)

    const { data } = await query

    if (data) {
      setBooks(data)
    }
    setLoading(false)
  }, [searchQuery, sortBy, filterCategory])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  if (loading) return <LoadingSpinner />
  if (books.length === 0) {
    return (
      <EmptyState 
        icon="📚" 
        title="暂无商品" 
        description="快来发布第一本书吧！" 
        action={{ label: "去发布", href: "/publish" }}
      />
    )
  }

  return (
    <div className="px-4 py-2">
      {books.map((book) => (
        <a key={book.id} href={`/detail?id=${book.id}`} className="block mb-3 animate-fade-in">
          <div className="card flex overflow-hidden" style={{margin: '0', padding: '0'}}>
            {/* 图片区域 - 相对定位用于放置标签 */}
            <div className="relative flex-shrink-0">
              {book.image_url ? (
                <img src={book.image_url} alt={book.title} className="w-[120px] h-[120px] object-cover" />
              ) : (
                <div className="w-[120px] h-[120px] flex items-center justify-center" style={{background: '#f0f0f0'}}>
                  <span className="text-4xl">📚</span>
                </div>
              )}
              {/* 品质标签 - 右上角，不遮盖图片 */}
              <div 
                className="absolute top-1 right-1 text-xs px-2 py-0.5 rounded"
                style={{
                  background: book.condition === '全新' ? '#5A8F5C' : 
                              book.condition === '九成新' ? '#7BAFD4' : 
                              book.condition === '八成新' ? '#F6C12C' : '#FF9800',
                  color: '#fff',
                  fontSize: '10px'
                }}
              >
                {book.condition}
              </div>
            </div>
            
            {/* 商品信息 */}
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm line-clamp-2" style={{color: '#333'}}>{book.title}</h3>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <span className="tag tag-primary text-xs">{book.category}</span>
                  {book.grade && <span className="tag tag-info text-xs">{book.grade}</span>}
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-lg font-bold" style={{color: '#ffa06f'}}>¥{book.price}</span>
                  {book.original_price && (
                    <span className="text-xs line-through ml-2" style={{color: '#999'}}>¥{book.original_price}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
