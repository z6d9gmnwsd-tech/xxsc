'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import BackButton from '@/components/BackButton'

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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">举报功能</h2>
        <p className="text-gray-500 mb-6 text-center">请先登录后再举报</p>
        <a href="/auth/login" className="btn-primary">登录 / 注册</a>
      </div>
    )
  }

  return (
    <div className="p-4 pb-20">
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-xl text-center">
          {success}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">选择举报原因</h2>
        <div className="space-y-3">
          {reasons.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelectedReason(reason.value)}
              className={`w-full p-4 rounded-xl text-left border transition-all ${
                selectedReason === reason.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedReason === reason.value ? 'border-orange-500' : 'border-gray-300'
                }`}>
                  {selectedReason === reason.value && (
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                  )}
                </div>
                <span className="text-gray-700">{reason.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-600 mb-2">补充说明（选填）</label>
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
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold">举报</h1>
        </div>
      </div>
      <Suspense fallback={<div className="p-4 text-center text-gray-500">加载中...</div>}>
        <ReportContent />
      </Suspense>
    </div>
  )
}
