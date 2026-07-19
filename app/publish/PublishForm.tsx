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
  const [images, setImages] = useState<string[]>([])
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['全年级通用'])
  const [selectedMajors, setSelectedMajors] = useState<string[]>(['全专业通用'])
  const [examType, setExamType] = useState('')
  const [selectedExamSubjects, setSelectedExamSubjects] = useState<string[]>([])

  // === 草稿自动保存 ===
  const DRAFT_KEY = 'publish-draft'
  const [showDraftModal, setShowDraftModal] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) setShowDraftModal(true)
  }, [])

  const saveDraft = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const draft = { title, isbn, author, publisher, price, originalPrice, condition, category, wechat, phone, remark, selectedGrades, selectedMajors, examType, selectedExamSubjects }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }, 500)
  }, [title, isbn, author, publisher, price, originalPrice, condition, category, wechat, phone, remark, selectedGrades, selectedMajors, examType, selectedExamSubjects])

  useEffect(() => { saveDraft() }, [saveDraft])

  const restoreDraft = () => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      const d = JSON.parse(saved)
      if (d.title) setTitle(d.title)
      if (d.isbn) setIsbn(d.isbn)
      if (d.author) setAuthor(d.author)
      if (d.publisher) setPublisher(d.publisher)
      if (d.price) setPrice(d.price)
      if (d.originalPrice) setOriginalPrice(d.originalPrice)
      if (d.condition) setCondition(d.condition)
      if (d.category) setCategory(d.category)
      if (d.wechat) setWechat(d.wechat)
      if (d.phone) setPhone(d.phone)
      if (d.remark) setRemark(d.remark)
      if (d.selectedGrades) setSelectedGrades(d.selectedGrades)
      if (d.selectedMajors) setSelectedMajors(d.selectedMajors)
      if (d.examType) setExamType(d.examType)
      if (d.selectedExamSubjects) setSelectedExamSubjects(d.selectedExamSubjects)
    }
    setShowDraftModal(false)
  }

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setShowDraftModal(false)
  }

  // === 常量 ===
  const grades = ['全年级通用', '大一', '大二', '大三', '大四', '研一', '研二', '研三']

  const majorCategories = [
    { name: '哲学', majors: ['哲学', '逻辑学', '宗教学'] },
    { name: '经济学', majors: ['经济学', '经济统计学', '金融学', '国际经济与贸易', '会计学', '财务管理'] },
    { name: '法学', majors: ['法学', '社会学', '社会工作', '政治学与行政学'] },
    { name: '教育学', majors: ['教育学', '学前教育', '小学教育', '体育教育', '心理学'] },
    { name: '文学', majors: ['汉语言文学', '英语', '日语', '新闻学', '传播学'] },
    { name: '历史学', majors: ['历史学', '考古学'] },
    { name: '理学', majors: ['数学与应用数学', '物理学', '化学', '生物科学', '统计学'] },
    { name: '工学', majors: ['机械工程', '电气工程', '计算机科学', '软件工程', '土木工程', '建筑学'] },
    { name: '农学', majors: ['农学', '园艺', '动物科学', '林学'] },
    { name: '医学', majors: ['临床医学', '口腔医学', '中医学', '护理学', '药学'] },
    { name: '管理学', majors: ['工商管理', '市场营销', '会计学', '财务管理', '人力资源管理'] },
    { name: '艺术学', majors: ['艺术设计', '音乐学', '美术学', '动画'] },
  ]

  const examTypes = ['考研', '考公考编', '其他']

  const examSubjectsData: Record<string, Record<string, string[]>> = {
    '考研': {
      '公共课': ['政治', '英语一', '英语二', '数学一', '数学二', '数学三', '俄语', '日语'],
      '专业课（统考）': [
        '计算机学科专业基础(408)', '教育学专业基础(311)', '心理学专业基础(312)', '历史学基础(313)',
        '数学分析/高等代数', '西医综合(306)', '中医综合(307)', '法律硕士专业基础(398)',
        '法律硕士综合(498)', '管理类联考综合能力(199)', '经济类联考综合能力(396)'
      ],
      '专业课（非统考/自命题）': ['自命题专业课']
    },
    '考公考编': {
      '笔试科目': ['行政职业能力测验', '申论', '公共基础知识', '综合应用能力', '职业能力倾向测验'],
      '考试类型': ['国家公务员考试', '省公务员考试', '事业单位考试', '教师资格考试', '银行/国企招聘', '军队文职']
    }
  }

  // === 操作函数 ===
  const toggleGrade = (grade: string) => {
    if (grade === '全年级通用') { setSelectedGrades(['全年级通用']); return }
    let n = selectedGrades.filter(g => g !== '全年级通用')
    n = n.includes(grade) ? n.filter(g => g !== grade) : [...n, grade]
    setSelectedGrades(n.length === 0 ? ['全年级通用'] : n)
  }

  const toggleMajor = (major: string) => {
    if (major === '全专业通用') { setSelectedMajors(['全专业通用']); return }
    let n = selectedMajors.filter(m => m !== '全专业通用')
    n = n.includes(major) ? n.filter(m => m !== major) : [...n, major]
    setSelectedMajors(n.length === 0 ? ['全专业通用'] : n)
  }

  const toggleExamSubject = (subject: string) => {
    setSelectedExamSubjects(prev => prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const remaining = 5 - images.length
    const toUpload = Array.from(files).slice(0, remaining)
    if (toUpload.length === 0) { showToast('error', '最多只能上传5张图片'); return }
    setUploading(true)
    for (const file of toUpload) {
      if (file.size > 5 * 1024 * 1024) { showToast('error', '图片大小不能超过5MB'); setUploading(false); return }
      const ext = file.name.split('.').pop()
      const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('book-images').upload(fileName, file)
      if (error) { showToast('error', '图片上传失败'); setUploading(false); return }
      if (data) { const { data: url } = supabase.storage.from('book-images').getPublicUrl(fileName); if (url) setImages(prev => [...prev, url.publicUrl]) }
    }
    setUploading(false)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    if (currentImageIndex >= images.length - 1) setCurrentImageIndex(Math.max(0, images.length - 2))
  }

  const handleScanISBN = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      if ('BarcodeDetector' in window) {
        const bitmap = await createImageBitmap(file)
        const detector = new (window as any).BarcodeDetector({ formats: ['ean_13'] })
        const barcodes = await detector.detect(bitmap)
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue
          if (/^97[89]\d{10}$/.test(code)) { setIsbn(code); showToast('success', 'ISBN识别成功：' + code) }
          else { showToast('error', '识别到条形码：' + code + '，不是有效ISBN') }
        } else { showToast('error', '未识别到ISBN条形码，请手动输入') }
        bitmap.close()
      } else { showToast('error', '当前浏览器不支持条形码识别，请手动输入ISBN') }
    } catch { showToast('error', '识别失败，请手动输入') }
    setScanning(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!user) { showToast('error', '请先登录'); return }
    if (!title.trim()) { showToast('error', '请输入书名'); return }
    if (category === '教材' && !isbn.trim()) { showToast('error', '教材类商品请填写ISBN码'); return }
    if (!price || parseFloat(price) <= 0) { showToast('error', '请输入有效价格'); return }
    if (!wechat && !phone) { showToast('error', '请至少填写微信号或联系电话'); return }

    setLoading(true)
    try {
      const description = [wechat ? `微信号：${wechat}` : '', phone ? `联系电话：${phone}` : '', remark ? `备注：${remark}` : ''].filter(Boolean).join('\n')
      const insertData: any = {
        user_id: user.id, title: title.trim(), isbn: isbn.trim() || null, author: author.trim() || null,
        publisher: publisher.trim() || null, price: parseFloat(price), original_price: originalPrice ? parseFloat(originalPrice) : null,
        condition, category, images, image_url: images[0] || null, description: description || null,
      }
      if (category === '教材') { insertData.grade = selectedGrades.join(','); insertData.subject = selectedMajors.join(',') }
      else if (category === '备考资料') { insertData.exam_type = examType || null; insertData.exam_subjects = selectedExamSubjects.length > 0 ? selectedExamSubjects.join(',') : null }

      const { error } = await supabase.from('books').insert(insertData)
      if (error) { showToast('error', '发布失败：' + error.message); setLoading(false); return }

      localStorage.removeItem(DRAFT_KEY)
      showToast('success', '发布成功！')
      setTimeout(() => { router.push('/'); router.refresh() }, 1500)
    } catch { showToast('error', '发布失败，请重试') }
    setLoading(false)
  }

  // === 未登录 ===
  if (!user) {
    return (<>
      <Toast />
      <div className="flex flex-col items-center justify-center p-8 py-20" style={{ minHeight: '60vh' }}>
        <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center mb-4"><span className="text-4xl">📝</span></div>
        <h2 className="text-xl font-semibold mb-2 text-primary">发布功能</h2>
        <p className="mb-6 text-center text-gray-500">请先登录后再发布商品</p>
        <a href="/my" className="btn-primary">去登录</a>
      </div>
    </>)
  }

  // === 渲染 ===
  return (
    <div className="p-4 pb-20 space-y-4">
      <Toast />

      {showDraftModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
            <h3 className="text
