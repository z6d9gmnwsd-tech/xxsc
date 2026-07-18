'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import { getTimeAgo } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import BackButton from '@/components/BackButton'
import { CreditCard, BookOpen, Package } from 'lucide-react'

interface Transaction {
  id: string
  book_id: string
  buyer_id: string
  seller_id: string
  price: number
  status: string
  created_at: string
  books: {
    title: string
    image_url: string | null
  }
}

function TransactionsSkeleton() {
  return (
    <div className="px-4 py-2 space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-4 animate-fade-in"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl skeleton flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 skeleton rounded-lg" />
              <div className="flex gap-2">
                <div className="h-5 w-16 skeleton rounded-full" />
                <div className="h-4 w-12 skeleton rounded-lg" />
              </div>
            </div>
            <div className="h-5 w-16 skeleton rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TransactionsPage() {
  const { user, loading: userLoading } = usePhoneAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login')
    }
    if (user) fetchTransactions()
  }, [user, userLoading, activeTab])

  const fetchTransactions = async () => {
    if (!user) return
    setLoading(true)

    const field = activeTab === 'buy' ? 'buyer_id' : 'seller_id'
    const { data } = await supabase
      .from('transactions')
      .select('*, books:book_id(title, image_url)')
      .eq(field, user.id)
      .order('created_at', { ascending: false })

    if (data) setTransactions(data as Transaction[])
    setLoading(false)
  }

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '进行中',
      completed: '已完成',
      cancelled: '已取消',
    }
    return map[status] || status
  }

  const getStatusStyle = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      pending: { bg: 'rgba(255,204,0,0.12)', color: '#C49A00' },
      completed: { bg: 'rgba(52,199,89,0.1)', color: '#34C759' },
      cancelled: { bg: 'rgba(0,0,0,0.04)', color: '#999' },
    }
    return map[status] || { bg: 'rgba(0,0,0,0.04)', color: '#999' }
  }

  if (userLoading || loading) {
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
            <h1 className="text-xl font-bold">交易记录</h1>
          </div>
        </div>
        <TransactionsSkeleton />
        <BottomNav activePage="my" />
      </div>
    )
  }

  if (!user) return null

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
            <CreditCard size={20} />
            <h1 className="text-xl font-bold">交易记录</h1>
          </div>
        </div>
      </div>

      <div
        className="mx-4 mt-3 flex rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <button
          onClick={() => setActiveTab('buy')}
          className="flex-1 py-3 text-center text-sm font-medium transition-all"
          style={{
            background: activeTab === 'buy' ? '#FFF0E6' : 'transparent',
            color: activeTab === 'buy' ? '#E8590C' : '#666',
          }}
        >
          买入
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className="flex-1 py-3 text-center text-sm font-medium transition-all"
          style={{
            background: activeTab === 'sell' ? '#FFF0E6' : 'transparent',
            color: activeTab === 'sell' ? '#E8590C' : '#666',
          }}
        >
          卖出
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.85)' }}
          >
            <Package size={32} color="#C4A882" />
          </div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#1a1a1a' }}>暂无交易记录</h2>
          <p className="text-sm mb-4" style={{ color: '#666' }}>
            {activeTab === 'buy' ? '去看看有没有需要的书籍' : '发布商品开始交易'}
          </p>
          <a href={activeTab === 'buy' ? '/' : '/publish'} className="btn-primary">
            {activeTab === 'buy' ? '去逛逛' : '去发布'}
          </a>
        </div>
      ) : (
        <div className="px-4 py-2">
          {transactions.map((trans) => {
            const statusStyle = getStatusStyle(trans.status)
            return (
              <a
                key={trans.id}
                href={`/detail?id=${trans.book_id}`}
                className="block rounded-2xl p-4 mb-3 animate-fade-in"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '0.5px solid rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-center gap-3">
                  {trans.books?.image_url ? (
                    <img src={trans.books.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F2F2F7' }}
                    >
                      <BookOpen size={24} color="#C4A882" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate" style={{ color: '#1a1a1a' }}>
                      {trans.books?.title || '商品已删除'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {getStatusText(trans.status)}
                      </span>
                      <span className="text-xs" style={{ color: '#999' }}>{getTimeAgo(trans.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold" style={{ color: '#E8590C' }}>¥{trans.price}</div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}

      <BottomNav activePage="my" />
    </div>
  )
}
