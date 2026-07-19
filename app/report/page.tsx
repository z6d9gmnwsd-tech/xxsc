'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { ChevronLeft, AlertTriangle, Send } from 'lucide-react'
import { SkeletonCard } from '@/components/LoadingSpinner'

const reportReasons = [
  '虚假信息',
  '违禁内容',
  '盗版资料',
  '诈骗信息',
  '重复发布',
  '其他',
]

function ReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = usePhoneAuth()
  const targetId = searchParams.get('id') || ''
  const targetType = searchParams.get('type') || 'book'
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!user) {
      alert('请先登录')
      router.push('/my')
      return
    }
    if (!reason) {
      alert('请选择举报原因')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      target_id: targetId,
      target_type: targetType,
      reason,
      description: description || undefined,
    })
    setLoading(false)
    if (error) {
      alert('举报失败：' + error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8" style={{ background: '#F2F2F7' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #5B8C5A, #40916C)' }}>
          <AlertTriangle size={32} color="#fff" />
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: '#333' }}>举报已提交</h2>
        <p className="text-sm text-center mb-6" style={{ color: '#999' }}>感谢您的反馈，我们会尽快处理</p>
        <button onClick={() => router.back()} className="btn-primary">返回</button>
      </div>
    )
  }

  return (
    <div className="pb-24 min-h-screen" style={{ background: '#F2F2F7' }}>
      <div className="header-glass px-4 py-5 text-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <ChevronLeft size={20} />
          </button>
          <AlertTriangle size={18} />
          <h1 className="text-lg font-bold">举报</h1>
        </div>
      </div>

      <div className="mx-4 mt-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#1a1a1a' }}>举报原因</h3>
        <div className="flex flex-wrap gap-2">
          {reportReasons.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                background: reason === r ? '#5B8C5A' : '#f0f2f5',
                color: reason === r ? '#fff' : '#666',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#1a1a1a' }}>详细描述（选填）</h3>
        <textarea
          className="input"
          rows={4}
          placeholder="请补充说明具体情况..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ resize: 'none' }}
        />
      </div>

      <div className="mx-4 mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading || !reason}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={16} />
          {loading ? '提交中...' : '提交举报'}
        </button>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <ReportContent />
    </Suspense>
  )
}
