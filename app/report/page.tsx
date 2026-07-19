'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import BackButton from '@/components/BackButton'
import BottomNav from '@/components/BottomNav'
import { Flag, Send, Loader2, CheckCircle } from 'lucide-react'

export default function ReportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = usePhoneAuth()
  const bookId = searchParams.get('id')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const reasons = [
    '虚假商品',
    '违禁物品',
    '价格欺诈',
    '冒充品牌',
    '其他问题',
  ]

  const handleSubmit = async () => {
    if (!reason || !user || !bookId) return
    setSubmitting(true)

    await supabase.from('reports').insert({
      book_id: bookId,
      user_id: user.id,
      reason,
      description,
    })

    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => router.back(), 2000)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#F2F2F7' }}>
        <CheckCircle size={64} color="#34C759" />
        <h2 className="text-xl font-semibold mt-4" style={{ color: '#1a1a1a' }}>举报已提交</h2>
        <p className="text-sm mt-2" style={{ color: '#666' }}>我们会尽快处理</p>
      </div>
    )
  }

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
            <Flag size={20} />
            <h1 className="text-xl font-bold">举报商品</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <label className="block text-sm font-medium mb-3" style={{ color: '#1a1a1a' }}>举报原因</label>
          <div className="space-y-2">
            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: reason === r ? '#FFF0E6' : '#F2F2F7',
                  color: reason === r ? '#E8590C' : '#666',
                  border: `1px solid ${reason === r ? '#E8590C' : 'transparent'}`,
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>详细描述（选填）</label>
          <textarea
            className="input min-h-[100px]"
            placeholder="请描述具体问题..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!reason || submitting}
          className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <Send size={16} />
              提交举报
            </>
          )}
        </button>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}
