'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'

export default function PublishForm() {
  const { user } = usePhoneAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

  const [type, setType] = useState<'textbook' | 'material'>('textbook')
  const [title, setTitle] = useState('')
  const [isbn, setIsbn] = useState('')
  const [author, setAuthor] = useState('')
  const [publisher, setPublisher] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [condition, setCondition] = useState('九成新')
  const [wechat, setWechat] = useState('')
  const [phone, setPhone] = useState('')
  const [remark, setRemark] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [grade, setGrade] = useState('全年级通用')
  const [major, setMajor] = useState('全专业通用')
  const [examType, setExamType] = useState('')
  const [examSubject, setExamSubject] = useState('')

  const grades = ['全年级通用', '大一', '大二', '大三', '大四', '研一', '研二', '研三']
  const majors = ['全专业通用', '计算机科学', '软件工程', '人工智能', '电子信息', '机械工程', '土木工程', '经济学', '金融学', '会计学', '法学', '教育学', '医学', '护理学', '其他']
  const examTypes = ['考研', '考公考编', '其他']
  const kaoyanSubjects = ['政治', '英语一', '英语二', '数学一', '数学二', '数学三', '专业课']
  const gongbianSubjects = ['行政职业能力测验', '申论', '公共基础知识', '综合应用能力']

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20" style={{minHeight: '60vh'}}>
        <span className="text-6xl mb-4">📝</span>
        <h2 className="text-xl font-semibold mb-2" style={{color: '#333'}}>发布功能</h2>
        <p className="mb-6 text-center" style={{color: '#666'}}>请先登录后再发布商品</p>
        <button onClick={() => {
          if (confirm('该功能需要登录后才能使用，是否前往登录？')) {
            window.location.href = '/my'
          }
        }} className="btn-primary">去登录</button>
      </div>
    )
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
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

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
    setLoading(true)
    setError('')
    setSuccess('')

    if (!title || !price) {
      setError('请填写书名和价格')
      setLoading(false)
      return
    }

    if (!wechat && !phone) {
      setError('请至少填写微信号或联系电话')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('books').insert({
      user_id: user.id,
      title,
      isbn: type === 'textbook' ? isbn : '',
      author: type === 'textbook' ? author : '',
      publisher: type === 'textbook' ? publisher : '',
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      condition,
      category: type === 'textbook' ? '教材' : '备考资料',
      grade: type === 'textbook' ? grade : '',
      subject: type === 'textbook' ? major : (examType ? `${examType}${examSubject ? '-' + examSubject : ''}` : ''),
      image_url: imageUrl,
      description: `微信号：${wechat || '无'}\n联系电话：${phone || '无'}\n备注：${remark || '无'}`,
    })

    if (insertError) {
      setError('发布失败：' + insertError.message)
      setLoading(false)
      return
    }

    setSuccess('发布成功！')
    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 1500)
  }

  return (
    <div className="p-4 pb-20">
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
        {/* 商品类型 */}
        <div className="rounded-2xl p-4" style={{background: '#fff'}}>
          <h3 className="font-bold mb-3" style={{color: '#333'}}>商品类型</h3>
          <div className="flex gap-4">
            <div
              onClick={() => setType('textbook')}
              className="flex-1 p-4 rounded-xl text-center cursor-pointer transition-all"
              style={{
                background: type === 'textbook' ? '#FFF8F0' : '#fff',
                border: `2px solid ${type === 'textbook' ? '#F5E6D0' : '#e0e0e0'}`,
                borderRadius: '16px'
              }}
            >
              <div className="text-3xl mb-2">📚</div>
              <div className="font-semibold" style={{color: '#333'}}>教材</div>
            </div>
            <div
              onClick={() => setType('material')}
              className="flex-1 p-4 rounded-xl text-center cursor-pointer transition-all"
              style={{
                background: type === 'material' ? '#FFF8F0' : '#fff',
                border: `2px solid ${type === 'material' ? '#F5E6D0' : '#e0e0e0'}`,
                borderRadius: '16px'
              }}
            >
              <div className="text-3xl mb-2">📝</div>
              <div className="font-semibold" style={{color: '#333'}}>备考资料</div>
            </div>
          </div>
        </div>

        {/* 商品图片 */}
        <div className="rounded-2xl p-4" style={{background: '#fff'}}>
          <h3 className="font-bold mb-3" style={{color: '#333'}}>商品图片（最多5张）</h3>
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
                <span className="text-2xl" style={{color: '#999'}}>{uploading ? '⏳' : '📷'}</span>
                <span className="text-xs mt-1" style={{color: '#999'}}>{uploading ? '上传中' : '上传图片'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* 基本信息 - 教材 */}
        {type === 'textbook' && (
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <h3 className="font-bold mb-3" style={{color: '#333'}}>基本信息</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}><span style={{color: '#ee0a24'}}>*</span> 书名</span>
                <input className="flex-1 input" placeholder="请输入书名或资料名称" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}><span style={{color: '#ee0a24'}}>*</span> ISBN</span>
                <input className="flex-1 input" placeholder="输入ISBN或扫条形码" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
                <button type="button" className="px-4 py-2 rounded-lg text-white text-sm" style={{background: '#27ae60'}}>扫码</button>
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
        )}

        {/* 基本信息 - 备考资料 */}
        {type === 'material' && (
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <h3 className="font-bold mb-3" style={{color: '#333'}}>基本信息</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-20 text-sm" style={{color: '#333'}}><span style={{color: '#ee0a24'}}>*</span> 书名</span>
                <input className="flex-1 input" placeholder="请输入书名或资料名称" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
            </div>
          </div>
        )}

        {/* 适用范围 - 教材 */}
        {type === 'textbook' && (
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <h3 className="font-bold mb-3" style={{color: '#333'}}>适用范围（必填）</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{color: '#333'}}>适用年级</span>
                <select className="input w-40 text-right" value={grade} onChange={(e) => setGrade(e.target.value)}>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{color: '#333'}}>适用专业</span>
                <select className="input w-40 text-right" value={major} onChange={(e) => setMajor(e.target.value)}>
                  {majors.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 考试类型 - 备考资料 */}
        {type === 'material' && (
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <h3 className="font-bold mb-3" style={{color: '#333'}}>考试类型（必选）</h3>
            <div className="flex gap-3">
              {examTypes.map(et => (
                <div
                  key={et}
                  onClick={() => setExamType(et)}
                  className="flex-1 p-3 rounded-xl text-center cursor-pointer"
                  style={{
                    background: examType === et ? '#FFF8F0' : '#fff',
                    border: `1px solid ${examType === et ? '#F5E6D0' : '#e0e0e0'}`,
                    color: '#333'
                  }}
                >
                  {et}
                </div>
              ))}
            </div>
            {examType === '考研' && (
              <div className="mt-3">
                <div className="text-sm mb-2" style={{color: '#666'}}>选择科目（可多选）</div>
                <div className="flex flex-wrap gap-2">
                  {kaoyanSubjects.map(s => (
                    <div
                      key={s}
                      onClick={() => setExamSubject(examSubject === s ? '' : s)}
                      className="px-3 py-1 rounded-full text-sm cursor-pointer"
                      style={{
                        background: examSubject === s ? '#F5E6D0' : '#f0f2f5',
                        color: examSubject === s ? '#fff' : '#636e72'
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {examType === '考公考编' && (
              <div className="mt-3">
                <div className="text-sm mb-2" style={{color: '#666'}}>选择科目（可多选）</div>
                <div className="flex flex-wrap gap-2">
                  {gongbianSubjects.map(s => (
                    <div
                      key={s}
                      onClick={() => setExamSubject(examSubject === s ? '' : s)}
                      className="px-3 py-1 rounded-full text-sm cursor-pointer"
                      style={{
                        background: examSubject === s ? '#F5E6D0' : '#f0f2f5',
                        color: examSubject === s ? '#fff' : '#636e72'
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
                {['全新', '九成新', '八成新', '七成新及以下'].map(c => (
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

        {/* 联系方式 */}
        <div className="rounded-2xl p-4" style={{background: '#fff'}}>
          <h3 className="font-bold mb-3" style={{color: '#333'}}>联系方式（选填）</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-20 text-sm" style={{color: '#333'}}>微信号</span>
              <input className="flex-1 input" placeholder="方便买家微信联系你" value={wechat} onChange={(e) => setWechat(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-sm" style={{color: '#333'}}>联系电话</span>
              <input className="flex-1 input" placeholder="方便买家电话联系你" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-sm" style={{color: '#333'}}>备注</span>
              <input className="flex-1 input" placeholder="补充说明" value={remark} onChange={(e) => setRemark(e.target.value)} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="btn-primary w-full mt-6 disabled:opacity-50"
        >
          {loading ? '发布中...' : uploading ? '图片上传中...' : '发布商品'}
        </button>
      </form>
    </div>
  )
}
