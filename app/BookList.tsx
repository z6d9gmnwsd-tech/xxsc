'use client'

import { supabase } from '@/lib/supabase'
import useSWR from 'swr'
import BookCard from '@/components/BookCard'
import EmptyState from '@/components/EmptyState'
import Skeleton from '@/components/Skeleton'
import { Book } from '@/types'

interface BookListProps {
  searchQuery?: string
  sortBy?: 'newest' | 'price_asc' | 'price_desc'
  filterCategory?: string
  searched?: boolean
}

const fetcher = async (key: string) => {
  const [searchQuery, sortBy, filterCategory] = key.split('||')

  let query = supabase.from('books').select('*').eq('status', '在售')

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,isbn.ilike.%${searchQuery}%`)
  }

  if (filterCategory) {
    query = query.eq('category', filterCategory)
  }

  switch (sortBy) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  query = query.limit(20)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

const recommendFetcher = async () => {
  const { data } = await supabase.from('books').select('*').eq('status', '在售').order('created_at', { ascending: false }).limit(10)
  return data || []
}

function BookList({ searchQuery = '', sortBy = 'newest', filterCategory = '', searched = false }: BookListProps) {
  const cacheKey = `${searchQuery}||${sortBy}||${filterCategory}`
  const { data: books, isLoading, error } = useSWR(cacheKey, fetcher, { revalidateOnFocus: true, dedupingInterval: 60000 })
  const { data: recommendBooks } = useSWR('recommend', recommendFetcher, { revalidateOnFocus: false })

  if (isLoading) {
    return <div className="px-4 py-2"><Skeleton type="card" count={3} /></div>
  }

  if (error) {
    return <EmptyState icon="📭" title="加载失败" description="请检查网络后重试" action={{ label: '刷新', href: '/' }} />
  }

  if (!books || books.length === 0) {
    if (searchQuery && searched) {
      return (
        <div className="px-4 py-2">
          <EmptyState icon="🔍" title="没有找到相关商品" description="换个关键词试试吧" />
          {recommendBooks && recommendBooks.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-primary mb-3">猜你喜欢</h3>
              {recommendBooks.map((book: Book, index: number) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          )}
        </div>
      )
    }
    return <EmptyState icon="📚" title="暂无商品" description="快来发布第一件商品吧" action={{ label: '去发布', href: '/publish' }} />
  }

  return (
    <div className="px-4 py-2">
      {books.map((book: Book, index: number) => (
        <BookCard key={book.id} book={book} index={index} />
      ))}
    </div>
  )
}

export default BookList
