'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'
import { showToast } from '@/components/Toast'

export default function EditForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = usePhoneAuth()
  const id = searchParams.get('id')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [isbn, setIsbn] = useState('')
  const [author, setAuthor] = useState('')
  const [publisher, setPublisher] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [condition, setCondition] = useState('九成新')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    loadBook()
  }, [id])

  const loadBook = async () => {
    if (!id) return
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      if (user && data.user_id !== user.id) {
        showToast('error', '无权编辑此商品')
        router.push('/')
        return
      }
      setTitle(data.title || '')
      setIsbn(data.isbn || '')
      setAuthor(data.author || '')
      setPublisher(data.publisher || '')
      setPrice(String(data.price || ''))
      setOriginalPrice(data.original_price ? String(data.original_price) : '')
      setCondition(data.condition || '九成新')
      setDescription(data.description || '')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!id || !user) return
    if (!title.trim()) {
      showToast('error', '请输入书名')
      return
    }
    if (!price || parseFloat(price) <= 0) {
      showToast('error', '请输入有效价格')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('books')
      .update({
        title: title.trim(),
        isbn: isbn.trim() || null,
        author: author.trim() || null,
        publisher: publisher.trim() || null,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        condition,
        description: description.trim() || null,
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      showToast('error', '保存失败：' + error.message)
      return
    }

    showToast('success', '修改成功')
    setTimeout(() => router.push(`/detail?id=${id}`), 1500)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="pb-20">
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-wide">编辑商品</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="rounded-card p-4 bg-white">
          <h3 className="font-bold mb-3 text-primary">基本信息</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm text-primary flex-shrink-0"><span className="text-red-500">*</span> 书名</span>
              <input className="flex-1 input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm text-primary flex-shrink-0">ISBN</span>
              <input className="flex-1 input" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm text-primary flex-shrink-0">作者</span>
              <input className="flex-1 input" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm text-primary flex-shrink-0">出版社</span>
              <input className="flex-1 input" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-card p-4 bg-white">
          <h3 className="font-bold mb-3 text-primary">价格与成色</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm text-primary flex-shrink-0"><span className="text-red-500">*</span> 售价</span>
              <input className="flex-1 input" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
              <span className="text-sm text-gray-500">元</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm text-primary flex-shrink-0">原价</span>
              <input className="flex-1 input" type="number" step="0.01" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
              <span className="text-sm text-gray-500">元</span>
            </div>
            <div>
              <div className="text-sm mb-2 text-primary">成色</div>
              <div className="flex flex-wrap gap-2">
                {['全新', '九成新', '八成新', '七成新', '六成新以下'].map(c => (
                  <div
                    key={c}
                    onClick={() => setCondition(c)}
                    className="px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-200 active:scale-95"
                    style={{
                      background: condition === c ? '#F5E6D0' : '#fff',
                      color: condition === c ? '#fff' : '#333',
                      border: `1px solid ${condition === c ? '#F5E6D0' : '#e0e0e0'}`
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-card p-4 bg-white">
          <h3 className="font-bold mb-3 text-primary">备注</h3>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="补充说明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full disabled:opacity-50">
          {saving ? '保存中...' : '保存修改'}
        </button>
      </div>
    </div>
  )
}
