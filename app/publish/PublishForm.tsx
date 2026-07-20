'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import Toast, { showToast } from '@/components/Toast'

export default function PublishForm() {
  const { user } = usePhoneAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [scanning, setScanning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [isbn, setIsbn] = useState('')
  const [author, setAuthor] = useState('')
  const [publisher, setPublisher] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [condition, setCondition] = useState('九成新')
  const [category, setCategory] = useState('教材')
  const [wechat, setWechat] = useState('')
  const [phone, setPhone] = useState('')
  const [remark, setRemark] = useState('')
  const [productIntro, setProductIntro] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['全年级通用'])
  const [selectedMajor, setSelectedMajor] = useState('全专业通用')
  const [examType, setExamType] = useState('')
  const [selectedExamSubjects, setSelectedExamSubjects] = useState<string[]>([])

  // === 草稿 ===
  const DRAFT_KEY = 'publish-draft'
  const [showDraftModal, setShowDraftModal] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { const saved = localStorage.getItem(DRAFT_KEY); if (saved) setShowDraftModal(true) }, [])

  const saveDraft = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, isbn, author, publisher, price, originalPrice, condition, category, wechat, phone, remark, productIntro, selectedGrades, selectedMajor, examType, selectedExamSubjects }))
    }, 500)
  }, [title, isbn, author, publisher, price, originalPrice, condition, category, wechat, phone, remark, productIntro, selectedGrades, selectedMajor, examType, selectedExamSubjects])

  useEffect(() => { saveDraft() }, [saveDraft])

  const restoreDraft = () => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      const d = JSON.parse(saved)
      if (d.title !== undefined) setTitle(d.title)
      if (d.isbn !== undefined) setIsbn(d.isbn)
      if (d.author !== undefined) setAuthor(d.author)
      if (d.publisher !== undefined) setPublisher(d.publisher)
      if (d.price !== undefined) setPrice(d.price)
      if (d.originalPrice !== undefined) setOriginalPrice(d.originalPrice)
      if (d.condition !== undefined) setCondition(d.condition)
      if (d.category !== undefined) setCategory(d.category)
      if (d.wechat !== undefined) setWechat(d.wechat)
      if (d.phone !== undefined) setPhone(d.phone)
      if (d.remark !== undefined) setRemark(d.remark)
      if (d.productIntro !== undefined) setProductIntro(d.productIntro)
      if (d.selectedGrades !== undefined) setSelectedGrades(d.selectedGrades)
      if (d.selectedMajor !== undefined) setSelectedMajor(d.selectedMajor)
      if (d.examType !== undefined) setExamType(d.examType)
      if (d.selectedExamSubjects !== undefined) setSelectedExamSubjects(d.selectedExamSubjects)
    }
    setShowDraftModal(false)
  }

  const clearDraft = () => { localStorage.removeItem(DRAFT_KEY); setShowDraftModal(false) }

  // === 常量 ===
  const grades = ['全年级通用', '大一', '大二', '大三', '大四', '研一', '研二', '研三']
  const majorCategories = ['全专业通用', '哲学', '经济学', '法学', '教育学', '文学', '历史学', '理学', '工学', '农学', '医学', '管理学', '艺术学', '军事学']
  const examTypes = ['考研', '考公考编', '其他']
  const examSubjectsData: Record<string, Record<string, string[]>> = {
    '考研': { '公共课': ['政治', '英语一', '英语二', '数学一', '数学二', '数学三', '俄语', '日语'], '专业课（统考）': ['计算机学科专业基础(408)', '教育学专业基础(311)', '心理学专业基础(312)', '历史学基础(313)', '数学分析/高等代数', '西医综合(306)', '中医综合(307)', '法律硕士专业基础(398)', '法律硕士综合(498)', '管理类联考综合能力(199)', '经济类联考综合能力(396)'], '专业课（非统考/自命题）': ['自命题专业课'] },
    '考公考编': { '笔试科目': ['行政职业能力测验', '申论', '公共基础知识', '综合应用能力', '职业能力倾向测验'], '考试类型': ['国家公务员考试', '省公务员考试', '事业单位考试', '教师资格考试', '银行/国企招聘', '军队文职'] }
  }

  // === AI识别 ===
  const [recognizing, setRecognizing] = useState(false)

  const handleAIRecognize = async () => {
    if (images.length === 0) { showToast('error', '请先上传图片'); return }
    setRecognizing(true); showToast('info', '正在识别中，请稍候...')
    try {
      const response = await fetch('https://api.ocr.space/parse/imageurl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ url: images[currentImageIndex], apikey: 'K85289605588957', language: 'chs', isOverlayRequired: 'false' })
      })
      const result = await response.json()
      if (result.ParsedResults && result.ParsedResults.length > 0) {
        const text = result.ParsedResults[0].ParsedText || ''
        const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l)
        let foundIsbn = '', foundTitle = '', foundAuthor = '', foundPublisher = ''
        for (const line of lines) {
          const isbnMatch = line.match(/(?:ISBN[:：]?\s*)?(\d{10,13})/)
          if (isbnMatch && !foundIsbn) foundIsbn = isbnMatch[1]
          if (!foundTitle && line.length >= 2 && line.length <= 60 && !line.match(/^\d/) && !line.match(/ISBN|定价|￥|出版社|作者/)) foundTitle = line
          const authorMatch = line.match(/(?:著|编|作者|主编)[:：]?\s*(.+)/)
          if (authorMatch && !foundAuthor) foundAuthor = authorMatch[1].trim()
          const publisherMatch = line.match(/(出版社|出版)/)
          if (publisherMatch && !foundPublisher) { const idx = lines.indexOf(line); if (idx > 0) foundPublisher = lines[idx - 1] || lines[idx].replace(/出版社|出版/g, '').trim() }
        }
        if (foundIsbn) setIsbn(foundIsbn)
        if (foundTitle) setTitle(foundTitle)
        if (foundAuthor) setAuthor(foundAuthor)
        if (foundPublisher) setPublisher(foundPublisher)
        const filled = [foundTitle && '书名', foundIsbn && 'ISBN', foundAuthor && '作者', foundPublisher && '出版社'].filter(Boolean)
        if (filled.length > 0) { showToast('success', '已识别：' + filled.join('、')) }
        else { showToast('error', '未能识别出有效信息，请确保图片清晰') }
      } else { showToast('error', '识别失败，请确保图片清晰') }
    } catch { showToast('error', '识别服务暂时不可用') }
    setRecognizing(false)
  }

  // === 操作函数 ===
  const toggleGrade = (grade: string) => {
    if (grade === '全年级通用') { setSelectedGrades(['全年级通用']); return }
    let n = selectedGrades.filter(g => g !== '全年级通用')
    n = n.includes(grade) ? n.filter(g => g !== grade) : [...n, grade]
    setSelectedGrades(n.length === 0 ? ['全年级通用'] : n)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return
    const remaining = 5 - images.length; const toUpload = Array.from(files).slice(0, remaining)
    if (toUpload.length === 0) { showToast('error', '最多只能上传5张图片'); return }
    setUploading(true)
    for (const file of toUpload) {
      if (file.size > 5 * 1024 * 1024) { showToast('error', '图片大小不能超过5MB'); setUploading(false); return }
      const ext = file.name.split('.').pop(); const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('book-images').upload(fileName, file)
      if (error) { showToast('error', '图片上传失败'); setUploading(false); return }
      if (data) { const { data: url } = supabase.storage.from('book-images').getPublicUrl(fileName); if (url) setImages(prev => [...prev, url.publicUrl]) }
    }
    setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => { setImages(images.filter((_, i) => i !== index)); if (currentImageIndex >= images.length - 1) setCurrentImageIndex(Math.max(0, images.length - 2)) }

  const handleScanISBN = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setScanning(true)
    try {
      if ('BarcodeDetector' in window) { const bitmap = await createImageBitmap(file); const detector = new (window as any).BarcodeDetector({ formats: ['ean_13'] }); const barcodes = await detector.detect(bitmap); if (barcodes.length > 0) { const code = barcodes[0].rawValue; if (/^97[89]\d{10}$/.test(code)) { setIsbn(code); showToast('success', 'ISBN识别成功：' + code) } else { showToast('error', '识别到条形码：' + code + '，不是有效ISBN') } } else { showToast('error', '未识别到ISBN条形码') } bitmap.close() } else { showToast('error', '当前浏览器不支持条形码识别') }
    } catch { showToast('error', '识别失败') }
    setScanning(false); if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!user) { showToast('error', '请先登录'); return }
    if (!title.trim()) { showToast('error', '请输入书名'); return }
    if (category === '教材' && !isbn.trim()) { showToast('error', '教材类商品请填写ISBN码'); return }
    if (!price || parseFloat(price) <= 0) { showToast('error', '请输入有效价格'); return }
    if (!wechat && !phone) { showToast('error', '请至少填写微信号或联系电话'); return }
    setLoading(true)
    try {
      const contactInfo = [wechat ? `微信号：${wechat}` : '', phone ? `联系电话：${phone}` : '', remark ? `备注：${remark}` : ''].filter(Boolean).join('\n')
      const insertData: any = { user_id: user.id, title: title.trim(), isbn: isbn.trim() || null, author: author.trim() || null, publisher: publisher.trim() || null, price: parseFloat(price), original_price: originalPrice ? parseFloat(originalPrice) : null, condition, category, images, image_url: images[0] || null, description: contactInfo || null, product_intro: productIntro.trim() || null }
      if (category === '教材') { insertData.grade = selectedGrades.join(','); insertData.subject = selectedMajor }
      else if (category === '备考资料') { insertData.exam_type = examType || null; insertData.exam_subjects = selectedExamSubjects.length > 0 ? selectedExamSubjects.join(',') : null }
      const { error } = await supabase.from('books').insert(insertData)
      if (error) { showToast('error', '发布失败：' + error.message); setLoading(false); return }
      localStorage.removeItem(DRAFT_KEY); showToast('success', '发布成功！'); setTimeout(() => { router.push('/'); router.refresh() }, 1500)
    } catch { showToast('error', '发布失败，请重试') }
    setLoading(false)
  }

  if (!user) return (<><Toast /><div className="flex flex-col items-center justify-center p-8 py-20" style={{ minHeight: '60vh' }}><div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#F0DEBF' }}><span className="text-4xl">📝</span></div><h2 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>发布功能</h2><p className="mb-6 text-center" style={{ color: '#999' }}>请先登录后再发布商品</p><a href="/my" className="btn-primary">去登录</a></div></>)

  return (
    <div className="p-4 pb-20 space-y-4">
      <Toast />
      {showDraftModal && (<div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in" style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#333' }}>检测到未完成的发布</h3>
          <p className="text-sm mb-6" style={{ color: '#666' }}>是否恢复上次填写的内容？</p>
          <div className="flex gap-3"><button onClick={clearDraft} className="flex-1 py-3 rounded-xl font-medium active:scale-95 transition-transform" style={{ backgroundColor: '#F5F5F5', color: '#666' }}>不恢复</button><button onClick={restoreDraft} className="flex-1 py-3 rounded-xl text-white font-medium active:scale-95 transition-transform" style={{ backgroundColor: '#F6C12C' }}>恢复草稿</button></div>
        </div>
      </div>)}

      <div className="rounded-xl p-4 bg-white" style={{ border: '1px solid #E5E5E5' }}>
        <h3 className="font-bold mb-3" style={{ color: '#333' }}>商品类型</h3>
        <div className="flex gap-4">
          {[{ key: '教材', icon: '📚', label: '教材' }, { key: '备考资料', icon: '📝', label: '备考资料' }].map(item => (
            <div key={item.key} onClick={() => { setCategory(item.key); setExamType(''); setSelectedExamSubjects([]); setIsbn('') }} className="flex-1 p-4 rounded-xl text-center cursor-pointer transition-all duration-200 active:scale-95" style={{ background: category === item.key ? 'rgba(246,193,44,0.08)' : '#F8F6F2', border: `2px solid ${category === item.key ? '#F6C12C' : '#E5E5E5'}` }}>
              <div className="text-3xl mb-2">{item.icon}</div><div className="font-semibold" style={{ color: '#333' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4 bg-white" style={{ border: '1px solid #E5E5E5' }}>
        <h3 className="font-bold mb-3" style={{ color: '#333' }}>商品图片（{images.length}/5）</h3>
        {images.length > 0 ? (<div>
          <div className="relative mb-3"><div className="w-full h-64 rounded-xl overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}><img src={images[currentImageIndex]} alt="" className="w-full h-full object-contain" /></div>
            <button type="button" onClick={() => removeImage(currentImageIndex)} className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white touch-target active:scale-95 transition-transform" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>✕</button>
            <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>{currentImageIndex + 1}/{images.length}</div></div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (<div key={i} onClick={() => setCurrentImageIndex(i)} className="relative flex-shrink-0 cursor-pointer active:scale-95 transition-transform" style={{ border: i === currentImageIndex ? '3px solid #F6C12C' : '3px solid transparent', borderRadius: '8px' }}><img src={img} alt="" className="w-16 h-16 rounded-lg object-cover" /></div>))}
            {images.length < 5 && (<label className="flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform" style={{ border: '2px dashed #E5E5E5', backgroundColor: '#F8F6F2' }}><span className="text-xl" style={{ color: '#ccc' }}>+</span><span className="text-xs" style={{ color: '#999' }}>添加</span><input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} /></label>)}
          </div>
          {category === '教材' && images.length > 0 && (<div className="mt-2"><button onClick={handleAIRecognize} disabled={recognizing} className="w-full py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-transform disabled:opacity-50" style={{ backgroundColor: 'rgba(246,193,44,0.1)', color: '#D4A517', border: '1px solid rgba(246,193,44,0.2)' }}>{recognizing ? '⏳ 识别中...' : '🤖 一键获取书本信息（请上传清晰的书本正面和背面图片）'}</button></div>)}
        </div>) : (<label className="w-full h-48 rounded-xl flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-transform" style={{ border: '2px dashed #E5E5E5', backgroundColor: '#F8F6F2' }}>
          <span className="text-4xl" style={{ color: '#ccc' }}>{uploading ? '⏳' : '📷'}</span><span className="text-sm mt-2" style={{ color: '#999' }}>{uploading ? '上传中...' : '点击上传图片（最多5张）'}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>)}
      </div>

      <div className="rounded-xl p-4 bg-white" style={{ border: '1px solid #E5E5E5' }}>
        <h3 className="font-bold mb-3" style={{ color: '#333' }}>基本信息</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3"><span className="w-20 text-sm flex-shrink-0" style={{ color: '#333' }}><span className="text-red-500">*</span> 书名</span><input className="flex-1 input" placeholder="请输入书名或资料名称" value={title} onChange={e => setTitle(e.target.value)} /></div>
          {category === '教材' && (<>
            <div className="flex items-center gap-3"><span className="w-20 text-sm flex-shrink-0" style={{ color: '#333' }}><span className="text-red-500">*</span> ISBN码</span><input className="flex-1 input" placeholder="请输入ISBN码" value={isbn} onChange={e => setIsbn(e.target.value)} />
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScanISBN} disabled={scanning} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={scanning} className="px-3 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform whitespace-nowrap" style={{ backgroundColor: 'rgba(59,130,246,0.08)', color: '#2563EB', border: '1px solid rgba(59,130,246,0.15)' }}>{scanning ? '识别中...' : '📷 扫描'}</button></div>
            <div className="flex items-center gap-3"><span className="w-20 text-sm flex-shrink-0" style={{ color: '#333' }}>作者</span><input className="flex-1 input" placeholder="选填" value={author} onChange={e => setAuthor(e.target.value)} /></div>
            <div className="flex items-center gap-3"><span className="w-20 text-sm flex-shrink-0" style={{ color: '#333' }}>出版社</span><input className="flex-1 input" placeholder="选填" value={publisher} onChange={e => setPublisher(e.target.value)} /></div>
          </>)}
        </div>
      </div>

      <div className="rounded-xl p-4 bg-white" style={{ border: '1px solid #E5E5E5' }}>
        <h3 className="font-bold mb-3" style={{ color: '#333' }}>商品介绍</h3>
        <textarea className="input min-h-[80px] resize-none" placeholder="请输入商品介绍，例如：书本使用情况、是否有笔记等（选填，最多300字）" value={productIntro} onChange={e => setProductIntro(e.target.value)} maxLength={300} />
        <div className="text-right text-xs mt-1" style={{ color: '#999' }}>{productIntro.length}/300</div>
      </div>

      {category === '教材' && (<div className="rounded-xl p-4 bg-white" style={{ border: '1px solid #E5E5E5' }}>
        <h3 className="font-bold mb-3" style={{ color: '#333' }}>适用范围</h3>
        <div className="mb-4">
          <div className="text-sm mb-2" style={{ color: '#666' }}>适用年级（可多选）</div>
          <div className="flex flex-wrap gap-2">{grades.map(g => (<div key={g} onClick={() => toggleGrade(g)} className="px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-200 active:scale-95" style={{ background: selectedGrades.includes(g) ? '#F6C12C' : '#F8F6F2', color: selectedGrades.includes(g) ? '#fff' : '#666', border: `1px solid ${selectedGrades.includes(g) ? '#F6C12C' : '#E5E5E5'}` }}>{g}</div>))}</div>
        </div>
        <div>
          <div className="text-sm mb-2" style={{ color: '#666' }}>适用专业</div>
          <div className="flex flex-wrap gap-2">{majorCategories.map(m => (<div key={m} onClick={() => setSelectedMajor(m)} className="px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-200 active:scale-95" style={{ background: selectedMajor === m ? '#F6C12C' : '#F8F6F2', color: selectedMajor === m ? '#fff' : '#666', border: `1px solid ${selectedMajor === m ? '#F6C12C' : '#E5E5E5'}` }}>{m}</div>))}</div>
        </div>
      </div>)}

      {category === '备考资料' && (<div className="rounded-xl p-4 bg-white" style={{ border: '1px solid #E5E5E5' }}>
        <h3 className="font-bold mb-3" style={{ color: '#333' }}>备考范围</h3>
        <div className="mb-4"><div className="text-sm mb-2" style={{ color: '#666' }}>考试类型</div>
          <div className="flex flex-wrap gap-2">{examTypes.map(t => (<div key={t} onClick={() => { setExamType(t); setSelectedExamSubjects([]) }} className="px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-200 active:scale-95" style={{ background: examType === t ? '#F6C12C' : '#F8F6F2', color: examType === t ? '#fff' : '#333', border: `1px solid ${examType === t ? '#F6C12C' : '#E5E5E5'}` }}>{t}</div>))}</div></div>
        {examType && examSubjectsData[examType] && (<div className="max-h-80 overflow-y-auto">{Object.entries(examSubjectsData[examType]).map(([group, subjects]) => (<div key={group} className="mb-4"><div className="text-sm font-semibold mb-2" style={{ color: '#333' }}>{group}（可多选）</div><div className="flex flex-wrap gap-2">{subjects.map(s => (<div key={s} onClick={() => { setSelectedExamSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]) }} className="px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-200 active:scale-95" style={{ background: selectedExamSubjects.includes(s) ? '#F6C12C' : '#F8F6F2', color: selectedExamSubjects.includes(s) ? '#fff' : '#666', border: `1px solid ${selectedExamSubjects.includes(s) ? '#F6C12C' : '#E5E5E5'}` }}>{s}</div>))}</div></div>))}</div>)}
      </div>)}

      <div className="rounded-xl p-4 bg-white" style={{ border: '1px solid #E5E5E5' }}>
        <h3 className="font-bold mb-3" style={{ color: '#333' }}>价格与成色</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3"><span className="w-16 text-sm flex-shrink-0" style={{ color: '#333' }}><span className="text-red-500">*</span> 售价</span><input className="flex-1 input" type="number" step="0.01" min="0" placeholder="请输入售价" value={price} onChange={e => setPrice(e.target.value)} /><span className="text-sm" style={{ color: '#999' }}>元</span></div>
          <div className="flex items-center gap-3"><span className="w-16 text-sm flex-shrink-0" style={{ color: '#333' }}>原价</span><input className="flex-1 input" type="number" step="0.01" min="0" placeholder="选填" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} /><span className="text-sm" style={{ color: '#999' }}>元</span></div>
          <div><div className="text-sm mb-2" style={{ color: '#666' }}>成色</div>
            <div className="flex flex-wrap gap-2">{['全新', '九成新', '八成新', '七成新', '六成新以下'].map(c => (<div key={c} onClick={() => setCondition(c)} className="px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-200 active:scale-95" style={{ background: condition === c ? '#F6C12C' : '#F8F6F2', color: condition === c ? '#fff' : '#333', border: `1px solid ${condition === c ? '#F6C12C' : '#E5E5E5'}` }}>{c}</div>))}</div></div>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-white" style={{ border: '1px solid #E5E5E5' }}>
        <h3 className="font-bold mb-3" style={{ color: '#333' }}>联系方式</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3"><span className="w-16 text-sm flex-shrink-0" style={{ color: '#333' }}>微信号</span><input className="flex-1 input" placeholder="方便买家联系你" value={wechat} onChange={e => setWechat(e.target.value)} /></div>
          <div className="flex items-center gap-3"><span className="w-16 text-sm flex-shrink-0" style={{ color: '#333' }}>联系电话</span><input className="flex-1 input" type="tel" placeholder="方便买家电话联系" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div className="flex items-center gap-3"><span className="w-16 text-sm flex-shrink-0" style={{ color: '#333' }}>备注</span><input className="flex-1 input" placeholder="补充说明" value={remark} onChange={e => setRemark(e.target.value)} /></div>
        </div>
      </div>

      <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(246,193,44,0.06)', borderLeft: '3px solid #F6C12C' }}>
        <div className="flex items-start gap-2"><span className="text-lg">⚠️</span><p className="text-sm" style={{ color: '#92400E' }}>本平台仅提供信息撮合服务，不涉及在线支付，请当面交易，谨防诈骗</p></div>
      </div>

      <button type="button" onClick={handleSubmit} disabled={loading || uploading || recognizing} className="w-full py-3 rounded-xl text-white font-semibold active:scale-95 transition-transform disabled:opacity-50" style={{ backgroundColor: '#F6C12C' }}>
        {loading ? '发布中...' : uploading ? '图片上传中...' : recognizing ? '识别中...' : '发布商品'}
      </button>
    </div>
  )
}
