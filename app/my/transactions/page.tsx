'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import { getTimeAgo } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'
import AuthModal from '@/components/AuthModal'

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

export default function TransactionsPage() {
  const { user, loading: userLoading } = usePhoneAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!userLoading && !user) {
      if (confirm('该功能需要登录后才能使用，是否前往登录？')) {
        window.location.href = '/my'
      }
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

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: '#ff9800',
      completed: '#27ae60',
      cancelled: '#999',
    }
    return map[status] || '#999'
  }

  if (userLoading || loading) return <LoadingSpinner />
  if (!user) return null

  return (
    <div className="pb-20">
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold">交易记录</h1>
        </div>
      </div>

      <div className="flex" style={{background: '#fff', borderBottom: '1px solid #f0f0f0'}}>
        <button
          onClick={() => setActiveTab('buy')}
          className="flex-1 py-3 text-center text-sm font-medium"
          style={{
            color: activeTab === 'buy' ? '#ffa06f' : '#666',
            borderBottom: activeTab === 'buy' ? '2px solid #ffa06f' : '2px solid transparent'
          }}
        >
          买入
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className="flex-1 py-3 text-center text-sm font-medium"
          style={{
            color: activeTab === 'sell' ? '#ffa06f' : '#666',
            borderBottom: activeTab === 'sell' ? '2px solid #ffa06f' : '2px solid transparent'
          }}
        >
          卖出
        </button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon="📦"
          title="暂无交易记录"
          description={activeTab === 'buy' ? '去看看有没有需要的书籍' : '发布商品开始交易'}
          action={{ label: activeTab === 'buy' ? '去逛逛' : '去发布', href: activeTab === 'buy' ? '/' : '/publish' }}
        />
      ) : (
        <div className="px-4 py-2">
          {transactions.map((trans) => (
            <a
              key={trans.id}
              href={`/detail?id=${trans.book_id}`}
              className="card flex items-center gap-3 mb-3 animate-fade-in block"
              style={{margin: '16px 0', padding: '28rpx'}}
            >
              {trans.books?.image_url ? (
                <img src={trans.books.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: '#f0f0f0'}}>
                  <span className="text-2xl">📚</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate" style={{color: '#333'}}>{trans.books?.title || '商品已删除'}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{background: `${getStatusColor(trans.status)}20`, color: getStatusColor(trans.status)}}>
                    {getStatusText(trans.status)}
                  </span>
                  <span className="text-xs" style={{color: '#999'}}>{getTimeAgo(trans.created_at)}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold" style={{color: '#ffa06f'}}>¥{trans.price}</div>
              </div>
            </a>
          ))}
        </div>
      )}

      <BottomNav activePage="my" />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
