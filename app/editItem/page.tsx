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
  images: string[] | null
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
  const [uploading, setUploading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
  const [images, setImages] = useState<string[]>([])
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
        // 处理多张图片
        const imageList = data.images || (data.image_url ? [data.image_url] : [])
        setImages(imageList)
        setDescription(data.description || '')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('加载商品失败')
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !user) return

    const remainingSlots = 5 - images.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) {
      setError('最多只能上传5张图片')
      return
    }

    setUploading(true)
    const newImages: string[] = []

    for (const file of filesToUpload) {
      if (file.size > 5 * 1024 * 1024) {
        setError('图片大小不能超过5MB')
        setUploading(false)
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('book-images')
        .upload(fileName, file)

      if (uploadError) {
        setError('图片上传失败：' + uploadError.message)
        setUploading(false)
        return
      }

      if (data) {
        const { data: urlData } = supabase.storage.from('book-images').getPublicUrl(fileName)
        if (urlData) {
          newImages.push(urlData.publicUrl)
        }
      }
    }

    setImages([...images, ...newImages])
    setUploading(false)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    if (currentImageIndex >= images.length - 1) {
      setCurrentImageIndex(Math.max(0, images.length - 2))
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
      images: images,
      image_url: images[0] || null,
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
          {/* 商品图片 - 轮播显示 */}
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <h3 className="font-bold mb-3" style={{color: '#333'}}>商品图片（{images.length}/5）</h3>
            
            {images.length > 0 ? (
              <div>
                {/* 轮播区域 */}
                <div className="relative mb-3">
                  <div className="w-full h-64 rounded-xl overflow-hidden" style={{background: '#f5f5f5'}}>
                    <img 
                      src={images[currentImageIndex]} 
                      alt="" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* 删除按钮 */}
                  <button
                    type="button"
                    onClick={() => removeImage(currentImageIndex)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{background: 'rgba(0,0,0,0.5)', color: '#fff'}}
                  >
                    ✕
                  </button>
                  {/* 图片计数 */}
                  <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs" style={{background: 'rgba(0,0,0,0.5)', color: '#fff'}}>
                    {currentImageIndex + 1}/{images.length}
                  </div>
                </div>

                {/* 缩略图列表 */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <div 
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className="relative flex-shrink-0 cursor-pointer"
                      style={{
                        border: index === currentImageIndex ? '3px solid #ffa06f' : '3px solid transparent',
                        borderRadius: '8px'
                      }}
                    >
                      <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      {index === currentImageIndex && (
                        <div className="absolute inset-0 border-2 rounded-lg" style={{borderColor: '#ffa06f'}} />
                      )}
                    </div>
                  ))}
                  {/* 添加图片按钮 */}
                  {images.length < 5 && (
                    <label className="flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center cursor-pointer" style={{border: '2px dashed #E0D5C8'}}>
                      <span className="text-xl" style={{color: '#999'}}>+</span>
                      <span className="text-xs" style={{color: '#999'}}>添加</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <label className="w-full h-48 rounded-xl flex flex-col items-center justify-center cursor-pointer" style={{border: '2px dashed #E0D5C8'}}>
                <span className="text-4xl" style={{color: '#999'}}>{uploading ? '⏳' : '📷'}</span>
                <span className="text-sm mt-2" style={{color: '#999'}}>{uploading ? '上传中...' : '点击上传图片（最多5张）'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
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
