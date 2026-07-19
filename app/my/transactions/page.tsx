'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import Skeleton from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import BackButton from '@/components/BackButton'
import { showToast } from '@/components/Toast'
import { getTimeAgo } from '@/lib/utils'

interface TransactionWithBook {
  id: string
  book_id: string
  buyer_id: string
  seller_id: string
  price: number
  status: string
  created_at: string
  books?: { title: string; image_url: string | null }
}

export default function TransactionsPage() {
  const { user } = usePhoneAuth()
  const router = useRouter()

  const fetcher = async () => {
    if (!user) return []
    const { data } = await supabase
      .from('transactions')
      .select('*, books(title, image_url)')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    return data || []
  }

  const { data: transactions, isLoading } = useSWR(
    user ? `transactions-${user.id}` : null,
    fetcher,
    { revalidateOnFocus: true }
  )

  useEffect(() => {
    if (!user) router.push('/my')
  }, [user])

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '进行中'
      case 'completed': return '已完成'
      case 'cancelled': return '已取消'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600'
      case 'completed': return 'text-green-600'
      case 'cancelled': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-wide">交易记录</h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton type="list" count={3} />
      ) : !transactions || transactions.length === 0 ? (
        <EmptyState icon="💰" title="暂无交易记录" description="完成你的第一笔交易吧" action={{ label: '去逛逛', href: '/' }} />
      ) : (
        <div className="px-4 py-2 space-y-3">
          {transactions.map((t: TransactionWithBook) => (
            <div key={t.id} className="p-4 bg-white rounded-card shadow-card animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-warm-50 flex-shrink-0">
                  {t.books?.image_url ? (
                    <img src={t.books.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">📚</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-primary truncate">{t.books?.title || '未知商品'}</div>
                  <div className="text-xs text-gray-400">{getTimeAgo(t.created_at)}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-accent">¥{t.price}</div>
                  <div className={`text-xs ${getStatusColor(t.status)}`}>{getStatusText(t.status)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
