'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'

export default function PostWantPage() {
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

  const categories = ['教材', '考研', '考公', '技能证书', '其他']
  const grades = ['大一', '大二', '大三', '大四', '研一', '研二', '研三']

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20" style={{minHeight: '60vh'}}>
        <span className="text-6xl mb-4">📝</span>
        <h2 className="text-xl font-semibold mb-2" style={{color: '#333'}}>发布求购</h2>
        <p className="mb-6 text-center" style={{color: '#666'}}>请先登录后再发布求购信息</p>
        <button onClick={() => {
          if (confirm('该功能需要登录后才能使用，是否前往登录？')) {
            window.location.href = '/my'
          }
        }} className="btn-primary">去登录</button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError('请输入求购书名')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('want_books').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      max_price: maxPrice ? parseFloat(maxPrice) : null,
      category,
      grade: grade || null,
      subject: subject.trim() || null,
      status: '求购中'
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
    <div className="pb-20">
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold">发布求购</h1>
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
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <h3 className="font-bold mb-3" style={{color: '#333'}}>求购信息</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}><span style={{color: '#ee0a24'}}>*</span> 书名</span>
                <input className="flex-1 input" placeholder="请输入想要购买的书名" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}>预算</span>
                <input className="flex-1 input" type="number" placeholder="最高预算（选填）" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                <span className="text-sm" style={{color: '#666'}}>元</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}>分类</span>
                <select className="flex-1 input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}>年级</span>
                <select className="flex-1 input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option value="">不限</option>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{color: '#333'}}>补充说明</label>
                <textarea
                  className="input min-h-[100px]"
                  placeholder="描述您需要的书籍版本、版本要求等"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? '发布中...' : '发布求购'}
          </button>
        </form>
      </div>
    </div>
  )
}
