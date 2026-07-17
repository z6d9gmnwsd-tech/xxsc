'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'

export default function WantForm() {
  const { user } = usePhoneAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [category, setCategory] = useState('教材')
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-16">
        <span className="text-6xl mb-4">🔍</span>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">求购功能</h2>
        <p className="text-gray-500 mb-6 text-center">登录后发布你的求购需求</p>
        <a href="/auth/login" className="btn-primary">登录 / 注册</a>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!title) {
      setError('请填写书名')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('want_books').insert({
      user_id: user.id,
      title,
      description,
      max_price: maxPrice ? parseFloat(maxPrice) : null,
      category,
      grade,
      subject,
    })

    if (insertError) {
      setError('发布失败：' + insertError.message)
      setLoading(false)
      return
    }

    setSuccess('发布成功！')
    setTimeout(() => {
      router.push('/want')
      router.refresh()
    }, 1500)
  }

  return (
    <div className="p-4 pb-20">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-xl text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">书名 *</label>
          <input
            className="input"
            placeholder="请输入想要的书名"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">描述</label>
          <textarea
            className="input min-h-[80px]"
            placeholder="补充说明版本、出版社等信息"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">最高预算</label>
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="¥ 最高可接受价格"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-2">分类</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="教材">教材</option>
              <option value="考研">考研</option>
              <option value="考公">考公</option>
              <option value="技能证书">技能证书</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-2">年级</label>
            <select
              className="input"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="">请选择</option>
              <option value="大一">大一</option>
              <option value="大二">大二</option>
              <option value="大三">大三</option>
              <option value="大四">大四</option>
              <option value="研究生">研究生</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">科目</label>
          <input
            className="input"
            placeholder="如：高等数学、大学英语"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-6 disabled:opacity-50"
        >
          {loading ? '发布中...' : '发布求购'}
        </button>
      </form>
    </div>
  )
}
