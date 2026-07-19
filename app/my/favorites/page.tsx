'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import BookCard from '@/components/BookCard'
import Skeleton from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import BackButton from '@/components/BackButton'
import { Book } from '@/types'

export default function FavoritesPage() {
  const { user, loading } = usePhoneAuth()
  const router = useRouter()

  const fetcher = async () => {
    if (!user) return []
    const { data: favData } = await supabase
      .from('favorites')
      .select('book_id')
      .eq('user_id', user.id)

    if (!favData || favData.length === 0) return []

    const bookIds = favData.map(f => f.book_id)
    const { data: books } = await supabase
      .from('books')
      .select('*')
      .in('id', bookIds)
      .eq('status', '在售')

    return books || []
  }

  const { data: books, isLoading } = useSWR(
    user ? `favorites-${user.id}` : null,
    fetcher,
    { revalidateOnFocus: true }
  )

  useEffect(() => {
    if (loading) return
    if (!user) router.push('/my')
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-2 border-warm-200 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-wide">我的收藏</h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton type="card" count={2} />
      ) : !books || books.length === 0 ? (
        <EmptyState icon="⭐" title="暂无收藏" description="收藏你喜欢的书籍吧" action={{ label: '去逛逛', href: '/' }} />
      ) : (
        <div className="px-4 py-2">
          {books.map((book: Book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
