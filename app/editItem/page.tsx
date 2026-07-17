'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'

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
  user_id: string
  status: string
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
  const [isbn, setIsbn] = useState('')
  const [author, setAuthor] = useState('')
  const [publisher, setPublisher] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [condition, setCondition] = useState('九成新')
  const [category, setCategory] = useState('教材')
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')

  const conditions = ['全新', '九成新', '八成新', '七成新及以下']
  const categories = ['教材', '考研', '考公', '技能证书', '其他']

  useEffect(() => {
    if (id) {
      loadBook(id)
    } else {
      setLoading(false)
    }
  }, [id])

  const loadBook = async (bookId: string) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      if (error) {
        console.error('Error loading book:', error)
        setError('加载商品失败')
        setLoading(false)
        return
      }

      if (data) {
        if (user && data.user_id !== user.id) {
          setError('无权编辑此商品')
          setLoading(false)
          return
        }
        setTitle(data.title || '')
        setIsbn(data.isbn || '')
        setAuthor(data.author || '')
        setPublisher(data.publisher || '')
        setPrice(data.price?.toString() || '')
        setOriginalPrice(data.original_price?.toString() || '')
        setCondition(data.condition || '九成新')
        setCategory(data.category || '教材')
        setGrade(data.grade || '')
        setSubject(data.subject || '')
        setImageUrl(data.image_url || '')
        setDescription(data.description || '')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('加载商品失败')
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('book-images')
      .upload(fileName, file)

    if (error) {
      console.error('Upload error:', error)
      return
    }

    if (data) {
      const { data: urlData } = supabase.storage.from('book-images').getPublicUrl(fileName)
      if (urlData) {
        setImageUrl(urlData.publicUrl)
      }
    }
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

    const { error: updateError } = await supabase.from('books').update({
      title,
      isbn: isbn || null,
      author: author || null,
      publisher: publisher || null,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      condition,
      category,
      grade: grade || null,
      subject: subject || null,
      image_url: imageUrl || null,
      description: description || null,
      updated_at: new Date().toISOString()
    }).eq('id', id)

    if (updateError) {
      setError('更新失败：' + updateError.message)
      setSaving(false)
      return
    }

    setSuccess('更新成功！')
    setTimeout(() => {
      router.push(`/detail?id=${id}`)
    }, 1500)
  }

  if (loading) return <LoadingSpinner />

  if (error && !title) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <span className="text-6xl mb-4">❌</span>
        <h2 className="text-xl font-semibold mb-2" style={{color: '#333'}}>{error}</h2>
        <a href="/my/items" className="btn-primary mt-4">返回我的发布</a>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold">编辑商品</h1>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 rounded-xl text-center text-sm" style={{background: '#FFF0F0', color: '#ee0a24'}}>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl text-center text-sm" style={{background: '#e8f8f0', color: '#27ae60'}}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 商品图片 */}
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <h3 className="font-bold mb-3" style={{color: '#333'}}>商品图片</h3>
            <div className="flex gap-3 items-start">
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="" className="w-24 h-24 rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs flex items-center justify-center"
                    style={{background: '#ee0a24', color: '#fff'}}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer" style={{border: '2px dashed #E0D5C8'}}>
                  <span className="text-2xl" style={{color: '#999'}}>📷</span>
                  <span className="text-xs mt-1" style={{color: '#999'}}>上传图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* 基本信息 */}
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <h3 className="font-bold mb-3" style={{color: '#333'}}>基本信息</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}><span style={{color: '#ee0a24'}}>*</span> 书名</span>
                <input className="flex-1 input" placeholder="请输入书名" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}>ISBN</span>
                <input className="flex-1 input" placeholder="ISBN编号" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}>作者</span>
                <input className="flex-1 input" placeholder="请输入作者" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}>出版社</span>
                <input className="flex-1 input" placeholder="请输入出版社" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 价格与成色 */}
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <h3 className="font-bold mb-3" style={{color: '#333'}}>价格与成色</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}><span style={{color: '#ee0a24'}}>*</span> 售价</span>
                <input className="flex-1 input" type="number" placeholder="请输入售价" value={price} onChange={(e) => setPrice(e.target.value)} required />
                <span className="text-sm" style={{color: '#666'}}>元</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}>原价</span>
                <input className="flex-1 input" type="number" placeholder="选填" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
                <span className="text-sm" style={{color: '#666'}}>元</span>
              </div>
              <div>
                <div className="text-sm mb-2" style={{color: '#333'}}>成色</div>
                <div className="flex flex-wrap gap-2">
                  {conditions.map(c => (
                    <div
                      key={c}
                      onClick={() => setCondition(c)}
                      className="px-4 py-2 rounded-full text-sm cursor-pointer"
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

          {/* 描述 */}
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <h3 className="font-bold mb-3" style={{color: '#333'}}>商品描述</h3>
            <textarea
              className="input min-h-[100px]"
              placeholder="描述书籍状况、版本等信息"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function EditItemPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EditItemContent />
    </Suspense>
  )
}
