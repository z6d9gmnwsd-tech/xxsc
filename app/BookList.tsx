'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import BookCard, { Book } from '@/components/BookCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

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
        title={searchQuery ? '未找到相关书籍' : '暂无商品，快来发布第一本书吧！'}
      />
    )
  }

  return (
    <div className="px-4 py-2">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
