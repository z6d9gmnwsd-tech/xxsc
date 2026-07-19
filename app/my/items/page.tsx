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
  const { user } = usePhoneAuth()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/my')
      return
    }
    loadBooks()
  }, [user])

  const loadBooks = async () => {
    if (!user) return
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setBooks(data)
    setLoading(false)
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

      {loading ? (
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
