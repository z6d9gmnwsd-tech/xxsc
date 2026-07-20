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
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState<'on_sale' | 'offline'>('on_sale')

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/my'); return }
    loadBooks()
  }, [user, loading])

  const loadBooks = async () => {
    if (!user) return
    const { data } = await supabase.from('books').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setAllBooks(data)
    setLoadingData(false)
  }

  const onSaleBooks = allBooks.filter(b => b.status === '在售')
  const offlineBooks = allBooks.filter(b => b.status === '已下架')
  const displayBooks = activeTab === 'on_sale' ? onSaleBooks : offlineBooks

  if (loading) return (<div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F8F6F2' }}><div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#E5E5E5', borderTopColor: '#F6C12C' }} /></div>)

  return (
    <div className="pb-20 min-h-screen" style={{ backgroundColor: '#F8F6F2' }}>
      <div className="px-4 py-4 flex items-center gap-3" style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E5' }}>
        <BackButton />
        <h1 className="text-lg font-bold" style={{ color: '#333' }}>我的发布</h1>
      </div>

      <div className="flex gap-2 p-4">
        <button onClick={() => setActiveTab('on_sale')} className="flex-1 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-all" style={{ backgroundColor: activeTab === 'on_sale' ? '#F6C12C' : 'white', color: activeTab === 'on_sale' ? 'white' : '#666', border: activeTab === 'on_sale' ? 'none' : '1px solid #E5E5E5' }}>
          在售 ({onSaleBooks.length})
        </button>
        <button onClick={() => setActiveTab('offline')} className="flex-1 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-all" style={{ backgroundColor: activeTab === 'offline' ? '#F6C12C' : 'white', color: activeTab === 'offline' ? 'white' : '#666', border: activeTab === 'offline' ? 'none' : '1px solid #E5E5E5' }}>
          已下架 ({offlineBooks.length})
        </button>
      </div>

      {loadingData ? <div className="px-4"><Skeleton type="card" count={2} /></div>
        : displayBooks.length === 0 ? <EmptyState icon={activeTab === 'on_sale' ? '📦' : '📋'} title={activeTab === 'on_sale' ? '暂无在售商品' : '暂无下架商品'} description={activeTab === 'on_sale' ? '发布你的闲置教材吧' : '下架的商品会显示在这里'} action={activeTab === 'on_sale' ? { label: '去发布', href: '/publish' } : undefined} />
        : <div className="px-4 py-2">{displayBooks.map(book => <BookCard key={book.id} book={book} />)}</div>}
    </div>
  )
}
