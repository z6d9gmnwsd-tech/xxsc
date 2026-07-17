'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import BackButton from '@/components/BackButton'
import LoadingSpinner from '@/components/LoadingSpinner'

function ReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = usePhoneAuth()
  const targetId = searchParams.get('id')
  const targetType = searchParams.get('type') || 'book'

  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const reasons = [
    { label: '违规内容（色情、暴力等）', value: 'illegal' },
    { label: '欺诈行为（虚假信息、骗子）', value: 'fraud' },
    { label: '虚假商品（盗版、假冒等）', value: 'fake' },
    { label: '发布广告/垃圾信息', value: 'spam' },
    { label: '其他问题', value: 'other' },
  ]

  const handleSubmit = async () => {
    if (!selectedReason || !user || !targetId) return
    setLoading(true)

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      target_id: targetId,
      target_type: targetType,
      reason: selectedReason,
      description,
    })

    setLoading(false)
    if (!error) {
      setSuccess('举报已提交，感谢反馈')
      setTimeout(() => router.back(), 1500)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <span className="text-6xl mb-4">⚠️</span>
        <h2 className="text-xl font-semibold mb-2" style={{color: '#333'}}>举报功能</h2>
        <p className="mb-6 text-center" style={{color: '#666'}}>请先登录后再举报</p>
        <a href="/my" className="btn-primary">登录 / 注册</a>
      </div>
    )
  }

  return (
    <div className="p-4 pb-20">
      {success && (
        <div className="mb-4 p-3 rounded-xl text-center text-sm" style={{background: '#e8f8f0', color: '#27ae60'}}>
          {success}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{color: '#333'}}>选择举报原因</h2>
        <div className="space-y-3">
          {reasons.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelectedReason(reason.value)}
              className="w-full p-4 rounded-xl text-left border transition-all"
              style={{
                background: selectedReason === reason.value ? '#FFF3E0' : '#fff',
                borderColor: selectedReason === reason.value ? '#ffa06f' : '#e0e0e0'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{
                  borderColor: selectedReason === reason.value ? '#ffa06f' : '#e0e0e0'
                }}>
                  {selectedReason === reason.value && (
                    <div className="w-3 h-3 rounded-full" style={{background: '#ffa06f'}} />
                  )}
                </div>
                <span style={{color: '#333'}}>{reason.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-2" style={{color: '#666'}}>补充说明（选填）</label>
        <textarea
          className="input min-h-[100px]"
          placeholder="请详细描述问题..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedReason || loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? '提交中...' : '提交举报'}
      </button>
    </div>
  )
}

export default function ReportPage() {
  return (
    <div>
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold">举报</h1>
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <ReportContent />
      </Suspense>
    </div>
  )
}
