'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import BackButton from '@/components/BackButton'
import BottomNav from '@/components/BottomNav'
import {
  Pencil,
  Camera,
  X,
  Loader2,
  BookOpen,
  Save,
} from 'lucide-react'

interface BookDetail {
  id: string
  title: string
  description: string
  original_price: number | null
  price: number
  condition: string
  category: string
  grade: string
  subject: string
  image_url: string | null
  isbn: string | null
  author: string | null
  publisher: string | null
  status: string
}

function EditItemSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-20 skeleton rounded-lg" />
          <div className="h-12 w-full skeleton rounded-xl" />
        </div>
      ))}
    </div>
  )
}

function EditItemContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = usePhoneAuth()
  const id = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('九成新')
  const [category, setCategory] = useState('教材')
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [isbn, setIsbn] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [author, setAuthor] = useState('')
  const [publisher, setPublisher] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (id) loadBook(id)
  }, [id])

  const loadBook = async (bookId: string) => {
    const { data } = await supabase.from('books').select('*').eq('id', bookId).single()

    if (data) {
      if (data.user_id !== user?.id) {
        setError('无权编辑此商品')
        return
      }
      setTitle(data.title || '')
      setDescription(data.description || '')
      setOriginalPrice(data.original_price?.toString() || '')
      setPrice(data.price?.toString() || '')
      setCondition(data.condition || '九成新')
      setCategory(data.category || '教材')
      setGrade(data.grade || '')
      setSubject(data.subject || '')
      setIsbn(data.isbn || '')
      setImageUrl(data.image_url || '')
      setAuthor(data.author || '')
      setPublisher(data.publisher || '')
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB')
      return
    }

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${user!.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('book-images')
      .upload(fileName, file)

    if (uploadError) {
      setError('图片上传失败：' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('book-images').getPublicUrl(fileName)
    if (data) {
      setImageUrl(data.publicUrl)
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !user) return

    setSaving(true)
    setError('')

    if (!title || !price) {
      setError('请填写书名和价格')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('books')
      .update({
        title,
        description,
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        price: parseFloat(price),
        condition,
        category,
        grade,
        subject,
        isbn,
        author,
        publisher,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    setSaving(false)
    if (updateError) {
      setError('更新失败：' + updateError.message)
    } else {
      setSuccess('更新成功！')
      setTimeout(() => router.back(), 1500)
    }
  }

  if (loading) return <EditItemSkeleton />

  if (error && !title) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20" style={{ background: '#F2F2F7' }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(255,255,255,0.85)' }}
        >
          <X size={32} color="#FF3B30" />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#1a1a1a' }}>{error}</h2>
        <a href="/my/items" className="btn-primary mt-4">返回我的发布</a>
      </div>
    )
  }

  return (
    <div className="p-4 pb-20" style={{ background: '#F2F2F7', minHeight: 'calc(100vh - 80px)' }}>
      {error && (
        <div
          className="mb-4 p-3 rounded-2xl flex items-center gap-2 text-sm animate-fade-in"
          style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30' }}
        >
          <X size={16} />
          {error}
        </div>
      )}

      {success && (
        <div
          className="mb-4 p-3 rounded-2xl text-sm text-center animate-fade-in"
          style={{ background: 'rgba(52,199,89,0.08)', color: '#34C759' }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 图片 */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>图片</label>
          <div className="flex gap-3 items-start">
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="" className="w-24 h-24 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#FF3B30', color: '#fff' }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label
                className="w-24 h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer"
                style={{ border: '2px dashed #E0D5C8' }}
              >
                <span style={{ color: '#999' }}>
                  {uploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                </span>
                <span className="text-xs mt-1" style={{ color: '#999' }}>
                  {uploading ? '上传中' : '上传图片'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
          <div className="mt-2">
            <input
              className="input text-sm"
              placeholder="或输入图片链接 https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>

        {/* 书名 */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>
            书名 <span style={{ color: '#E8590C' }}>*</span>
          </label>
          <input className="input" placeholder="请输入书名" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        {/* 描述 */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>描述</label>
          <textarea className="input min-h-[80px]" placeholder="描述书籍状况、版本等信息" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* 价格 */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>原价</label>
              <input className="input" type="number" step="0.01" placeholder="¥ 原价" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>
                售价 <span style={{ color: '#E8590C' }}>*</span>
              </label>
              <input className="input" type="number" step="0.01" placeholder="¥ 售价" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* 成色 */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>成色</label>
          <div className="flex gap-2 flex-wrap">
            {['全新', '九成新', '八成新', '七成新', '六成新以下'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className="px-3 py-2 rounded-full text-sm transition-all"
                style={{
                  background: condition === c ? '#F5E6D0' : '#F2F2F7',
                  color: condition === c ? '#fff' : '#666',
                  border: `1px solid ${condition === c ? '#F5E6D0' : 'rgba(0,0,0,0.04)'}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 分类和年级 */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>分类</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="教材">教材</option>
                <option value="考研">考研</option>
                <option value="考公">考公</option>
                <option value="技能证书">技能证书</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>年级</label>
              <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="">请选择</option>
                <option value="大一">大一</option>
                <option value="大二">大二</option>
                <option value="大三">大三</option>
                <option value="大四">大四</option>
                <option value="研究生">研究生</option>
              </select>
            </div>
          </div>
        </div>

        {/* 科目 */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>科目</label>
          <input className="input" placeholder="如：高等数学、大学英语" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        {/* ISBN, 作者, 出版社 */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>ISBN（选填）</label>
              <input className="input" placeholder="ISBN编号" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>作者（选填）</label>
              <input className="input" placeholder="作者姓名" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>出版社（选填）</label>
              <input className="input" placeholder="出版社名称" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="btn-primary w-full mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save size={16} />
              保存修改
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default function EditItemPage() {
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
            <Pencil size={20} />
            <h1 className="text-xl font-bold">编辑商品</h1>
          </div>
        </div>
      </div>
      <Suspense fallback={<EditItemSkeleton />}>
        <EditItemContent />
      </Suspense>
      <BottomNav activeTab="profile" />
    </div>
  )
}
