'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import BookCard from '@/components/BookCard'
import Skeleton from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import BackButton from '@/components/BackButton'
import { Book } from '@/types'

export default function MyItemsPage() {
  const { user, loading } = usePhoneAuth()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/my')
      return
    }
    loadBooks()
  }, [user, loading])

  const loadBooks = async () => {
    if (!user) return
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setBooks(data)
    setLoadingData(false)
  }

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
            <h1 className="text-xl font-bold tracking-wide">我的发布</h1>
          </div>
        </div>
      </div>

      {loadingData ? (
        <Skeleton type="card" count={2} />
      ) : books.length === 0 ? (
        <EmptyState icon="📦" title="暂无发布" description="发布你的闲置教材吧" action={{ label: '去发布', href: '/publish' }} />
      ) : (
        <div className="px-4 py-2">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
