'use client'

import { useEffect, useState, useCallback } from 'react'
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
}

const fetcher = async (key: string) => {
  const [searchQuery, sortBy, filterCategory] = key.split('||')

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

  const { data, error } = await query
  if (error) throw error
  return data || []
}

function BookList({ searchQuery = '', sortBy = 'newest', filterCategory = '' }: BookListProps) {
  const cacheKey = `${searchQuery}||${sortBy}||${filterCategory}`

  const { data: books, isLoading, error } = useSWR(cacheKey, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="px-4 py-2">
        <Skeleton type="card" count={3} />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon="📭"
        title="加载失败"
        description="请检查网络后重试"
        action={{ label: '刷新', href: '/' }}
      />
    )
  }

  if (!books || books.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title={searchQuery ? '没有找到相关商品' : '暂无商品'}
        description={searchQuery ? '换个关键词试试吧' : '快来发布第一件商品吧'}
        action={!searchQuery ? { label: '去发布', href: '/publish' } : undefined}
      />
    )
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
