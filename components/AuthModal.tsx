'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type Step = 'login' | 'register' | 'forgot' | 'verify' | 'reset' | 'appeal'

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<Step>('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityQuestion1, setSecurityQuestion1] = useState('')
  const [customQuestion1, setCustomQuestion1] = useState('')
  const [securityAnswer1, setSecurityAnswer1] = useState('')
  const [securityQuestion2, setSecurityQuestion2] = useState('')
  const [customQuestion2, setCustomQuestion2] = useState('')
  const [securityAnswer2, setSecurityAnswer2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  const [appealPhone, setAppealPhone] = useState('')
  const [appealEvidence, setAppealEvidence] = useState('')
  const [appealCodeWord, setAppealCodeWord] = useState('')
  const [appealImages, setAppealImages] = useState<string[]>([])
  const [appealUploading, setAppealUploading] = useState(false)
  const appealFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (isOpen) { requestAnimationFrame(() => setIsVisible(true)) } else { setIsVisible(false) } }, [isOpen])

  const fixedQuestions = ['你的学号是多少？', '你的学校名称是什么？', '你的专业是什么？', '你最喜欢的课程是什么？']

  const resetForm = () => {
    setPhone(''); setPassword(''); setConfirmPassword(''); setSecurityQuestion1(''); setCustomQuestion1('')
    setSecurityAnswer1(''); setSecurityQuestion2(''); setCustomQuestion2(''); setSecurityAnswer2('')
    setError(''); setSuccess(''); setAppealPhone(''); setAppealEvidence(''); setAppealCodeWord(''); setAppealImages([])
  }

  const handleClose = () => { setIsVisible(false); setTimeout(() => { resetForm(); setStep('login'); onClose() }, 300) }
  const validatePhone = (p: string) => /^1[3-9]\d{9}$/.test(p)
  const sanitizeInput = (input: string) => input.replace(/[<>]/g, '').trim()

  // 申诉图片上传
  const handleAppealImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const remaining = 3 - appealImages.length
    const toUpload = Array.from(files).slice(0, remaining)
    if (toUpload.length === 0) { setError('最多只能上传3张图片'); return }
    setAppealUploading(true)
    for (const file of toUpload) {
      if (file.size > 5 * 1024 * 1024) { setError('图片大小不能超过5MB'); setAppealUploading(false); return }
      const ext = file.name.split('.').pop()
      const fileName = `appeals/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('appeal-images').upload(fileName, file)
      if (error) { setError('图片上传失败'); setAppealUploading(false); return }
      if (data) { const { data: url } = supabase.storage.from('appeal-images').getPublicUrl(fileName); if (url) setAppealImages(prev => [...prev, url.publicUrl]) }
    }
    setAppealUploading(false)
    if (appealFileRef.current) appealFileRef.current.value = ''
  }

  const removeAppealImage = (index: number) => { setAppealImages(appealImages.filter((_, i) => i !== index)) }

  const handleLogin = async () => {
    if (!phone || !password) { setError('请输入手机号和密码'); return }
    if (!validatePhone(phone)) { setError('请输入正确的11位手机号'); return }
    if (password.length < 6) { setError('密码至少需要6个字符'); return }
    setLoading(true); setError('')
    try {
      const { data, error: funcError } = await supabase.rpc('login_user', { p_phone: phone, p_password: password })
      if (funcError) { setError('登录失败：' + funcError.message); setLoading(false); return }
      if (data?.success) {
        localStorage.setItem('user_id', data.user_id); localStorage.setItem('nickname', data.nickname); localStorage.setItem('phone', phone)
        setSuccess('登录成功！'); setTimeout(() => { onSuccess(); handleClose(); window.location.reload() }, 500)
      } else { setError(data?.message || '登录失败') }
    } catch { setError('网络错误，请检查网络后重试') }
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!phone || !password || !confirmPassword || !securityAnswer1 || !securityAnswer2) { setError('请填写所有必填项'); return }
    if (!validatePhone(phone)) { setError('请输入正确的11位手机号'); return }
    if (password.length < 6 || password.length > 50) { setError('密码需要6-50个字符'); return }
    if (password !== confirmPassword) { setError('两次输入的密码不一致'); return }
    const q1 = sanitizeInput(customQuestion1 || securityQuestion1)
    const q2 = sanitizeInput(customQuestion2 || securityQuestion2)
    if (!q1 || !q2) { setError('请选择或输入两个密保问题'); return }
    if (q1 === q2) { setError('两个密保问题不能相同'); return }
    if (sanitizeInput(securityAnswer1).length < 2 || sanitizeInput(securityAnswer2).length < 2) { setError('密保答案至少需要2个字符'); return }
    setLoading(true); setError('')
    try {
      const { data, error: funcError } = await supabase.rpc('register_user', { p_phone: phone, p_password: password, p_security_question1: q1, p_security_answer1: sanitizeInput(securityAnswer1), p_security_question2: q2, p_security_answer2: sanitizeInput(securityAnswer2) })
      if (funcError) { setError('注册失败：' + funcError.message); setLoading(false); return }
      if (data?.success) {
        localStorage.setItem('user_id', data.user_id); localStorage.setItem('nickname', data.nickname); localStorage.setItem('phone', phone)
        setSuccess('注册成功！您的用户名是：' + data.nickname); setTimeout(() => { onSuccess(); handleClose(); window.location.reload() }, 1500)
      } else { setError(data?.message || '注册失败') }
    } catch { setError('网络错误，请检查网络后重试') }
    setLoading(false)
  }

  const handleVerifyAnswer = async () => {
    if (!phone || !validatePhone(phone)) { setError('请输入正确的11位手机号'); return }
    if (!securityAnswer1 || sanitizeInput(securityAnswer1).length < 1) { setError('请输入密保答案'); return }
    setLoading(true); setError('')
    try {
      const { data, error: funcError } = await supabase.rpc('verify_security_answer', { p_phone: phone, p_answer: sanitizeInput(securityAnswer1) })
      if (funcError) { setError('验证失败：' + funcError.message); setLoading(false); return }
      if (data?.success) { setLoading(false); setStep('reset'); return }
      setLoading(false); setError(data?.message || '密保答案错误')
    } catch { setError('网络错误'); setLoading(false) }
  }

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) { setError('请输入新密码'); return }
    if (password.length < 6 || password.length > 50) { setError('密码需要6-50个字符'); return }
    if (password !== confirmPassword) { setError('两次输入的密码不一致'); return }
    setLoading(true); setError('')
    try {
      const { data, error: funcError } = await supabase.rpc('reset_password', { p_phone: phone, p_new_password: password })
      if (funcError) { setError('重置失败：' + funcError.message); setLoading(false); return }
      if (data?.success) { setSuccess('密码重置成功！请使用新密码登录'); setTimeout(() => { resetForm(); setStep('login') }, 2000) }
      else { setError(data?.message || '重置失败') }
    } catch { setError('网络错误'); setLoading(false) }
    setLoading(false)
  }

  const handleAppeal = async () => {
    if (!appealPhone || !validatePhone(appealPhone)) { setError('请输入正确的申诉手机号'); return }
    if (!appealEvidence || sanitizeInput(appealEvidence).length < 10) { setError('请详细描述证据（至少10个字符）'); return }
    if (!appealCodeWord || sanitizeInput(appealCodeWord).length < 2) { setError('请设置暗号（至少2个字符）'); return }
    setLoading(true); setError('')
    try {
      const evidenceText = appealImages.length > 0 ? sanitizeInput(appealEvidence) + '\n[图片：' + appealImages.join(', ') + ']' : sanitizeInput(appealEvidence)
      const { error } = await supabase.from('appeals').insert({ phone: appealPhone, evidence: evidenceText, code_word: sanitizeInput(appealCodeWord) })
      if (error) { setError('提交失败：' + error.message); setLoading(false); return }
      setSuccess('申诉已提交！客服将在1-3个工作日内电话联系您进行核实。')
      setTimeout(() => { resetForm(); setStep('login') }, 3000)
    } catch { setError('网络错误'); setLoading(false) }
    setLoading(false)
  }

  if (!isOpen) return null

  const titleMap: Record<Step, string> = { login: '登录', register: '注册', forgot: '忘记密码', verify: '验证密保', reset: '重置密码', appeal: '手机号申诉' }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
      <div className={`absolute inset-0 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
      <div className={`relative bg-white w-full max-w-md overflow-hidden rounded-2xl transition-all duration-300 ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
        <div className="relative px-6 py-5 text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0DEBF 0%, #E8D0A8 50%, #D4B88A 100%)' }}>
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-white/10" />
          <div className="flex justify-between items-center relative">
            <h2 className="text-lg font-bold" style={{ color: '#333' }}>{titleMap[step]}</h2>
            <button onClick={handleClose} disabled={loading} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="#666" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto scroll-container">
          {error && <div className="mb-4 p-3 rounded-lg text-center text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>}
          {success && <div className="mb-4 p-3 rounded-lg text-center text-sm" style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669' }}>{success}</div>}

          {/* 登录 */}
          {step === 'login' && (
            <div className="space-y-4 animate-fade-in">
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>手机号</label>
                <input type="tel" className="input" placeholder="请输入11位手机号" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} disabled={loading} maxLength={11} /></div>
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>密码</label>
                <input type="password" className="input" placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} maxLength={50} /></div>
              <button onClick={handleLogin} disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? '登录中...' : '登录'}</button>
              <div className="flex justify-between text-sm">
                <button onClick={() => { if (!loading) { resetForm(); setStep('register') } }} disabled={loading} style={{ color: '#D4A517' }} className="font-medium active:scale-95 transition-transform">注册账号</button>
                <button onClick={() => { if (!loading) { resetForm(); setStep('forgot') } }} disabled={loading} className="active:scale-95 transition-transform" style={{ color: '#999' }}>忘记密码？</button>
              </div>
              <div className="text-center">
                <button onClick={() => { if (!loading) { resetForm(); setStep('appeal') } }} disabled={loading} className="text-xs active:scale-95 transition-transform" style={{ color: '#D4A517' }}>手机号被占用？进行申诉</button>
              </div>
            </div>
          )}

          {/* 注册 */}
          {step === 'register' && (
            <div className="space-y-4 animate-fade-in">
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>手机号 *</label>
                <input type="tel" className="input" placeholder="请输入11位手机号" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} disabled={loading} maxLength={11} /></div>
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>设置密码 *</label>
                <input type="password" className="input" placeholder="请输入密码（至少6位）" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} maxLength={50} /></div>
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>确认密码 *</label>
                <input type="password" className="input" placeholder="请再次输入密码" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} maxLength={50} /></div>
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>密保问题1 *</label>
                <select className="input mb-2" value={securityQuestion1} onChange={e => { setSecurityQuestion1(e.target.value); setCustomQuestion1('') }} disabled={loading}>
                  <option value="">选择或自定义问题</option>
                  {fixedQuestions.map(q => <option key={q} value={q}>{q}</option>)}<option value="custom">自定义问题</option>
                </select>
                {(securityQuestion1 === 'custom' || !fixedQuestions.includes(securityQuestion1)) && <input type="text" className="input mb-2" placeholder="请输入自定义问题" value={customQuestion1} onChange={e => setCustomQuestion1(e.target.value)} disabled={loading} maxLength={100} />}
                <input type="text" className="input" placeholder="请输入密保答案" value={securityAnswer1} onChange={e => setSecurityAnswer1(e.target.value)} disabled={loading} maxLength={100} /></div>
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>密保问题2 *</label>
                <select className="input mb-2" value={securityQuestion2} onChange={e => { setSecurityQuestion2(e.target.value); setCustomQuestion2('') }} disabled={loading}>
                  <option value="">选择或自定义问题</option>
                  {fixedQuestions.map(q => <option key={q} value={q}>{q}</option>)}<option value="custom">自定义问题</option>
                </select>
                {(securityQuestion2 === 'custom' || !fixedQuestions.includes(securityQuestion2)) && <input type="text" className="input mb-2" placeholder="请输入自定义问题" value={customQuestion2} onChange={e => setCustomQuestion2(e.target.value)} disabled={loading} maxLength={100} />}
                <input type="text" className="input" placeholder="请输入密保答案" value={securityAnswer2} onChange={e => setSecurityAnswer2(e.target.value)} disabled={loading} maxLength={100} /></div>
              <button onClick={handleRegister} disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? '注册中...' : '注册'}</button>
              <button onClick={() => { if (!loading) { resetForm(); setStep('login') } }} disabled={loading} className="w-full text-center text-sm active:scale-95 transition-transform" style={{ color: '#999' }}>已有账号？去登录</button>
            </div>
          )}

          {/* 忘记密码 */}
          {step === 'forgot' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm" style={{ color: '#666' }}>请输入注册时使用的手机号</p>
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>手机号</label>
                <input type="tel" className="input" placeholder="请输入11位手机号" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} disabled={loading} maxLength={11} /></div>
              <button onClick={() => { if (phone && validatePhone(phone)) setStep('verify'); else setError('请输入正确的11位手机号') }} disabled={loading} className="btn-primary w-full disabled:opacity-50">下一步</button>
              <button onClick={() => { if (!loading) { resetForm(); setStep('login') } }} disabled={loading} className="w-full text-center text-sm active:scale-95 transition-transform" style={{ color: '#999' }}>返回登录</button>
            </div>
          )}

          {/* 验证密保 */}
          {step === 'verify' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm" style={{ color: '#666' }}>请回答您的密保问题</p>
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>密保答案</label>
                <input type="text" className="input" placeholder="请输入密保答案" value={securityAnswer1} onChange={e => setSecurityAnswer1(e.target.value)} disabled={loading} maxLength={100} /></div>
              <button onClick={handleVerifyAnswer} disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? '验证中...' : '验证'}</button>
              <button onClick={() => { if (!loading) { resetForm(); setStep('forgot') } }} disabled={loading} className="w-full text-center text-sm active:scale-95 transition-transform" style={{ color: '#999' }}>返回</button>
            </div>
          )}

          {/* 重置密码 */}
          {step === 'reset' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm" style={{ color: '#666' }}>请设置新密码</p>
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>新密码</label>
                <input type="password" className="input" placeholder="请输入新密码（至少6位）" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} maxLength={50} /></div>
              <div><label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>确认新密码</label>
                <input type="password" className="input" placeholder="请再次输入新密码" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} maxLength={50} /></div>
              <button onClick={handleResetPassword} disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? '重置中...' : '重置密码'}</button>
            </div>
          )}

          {/* 手机号申诉 */}
          {step === 'appeal' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(246,193,44,0.08)', color: '#92400E' }}>
                <p className="font-medium mb-1">手机号申诉须知</p>
                <p>如果您发现自己的手机号被他人注册，请提交申诉。客服将电话联系您进行核实。</p>
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>您申诉的手机号码 *</label>
                <input type="tel" className="input" placeholder="请输入被占用的手机号" value={appealPhone} onChange={e => setAppealPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} disabled={loading} maxLength={11} />
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>提供该手机号为本人的证据 *</label>
                <textarea className="input min-h-[80px] resize-none" placeholder="例如：手机营业厅App号码截图、缴费记录等，请详细描述" value={appealEvidence} onChange={e => setAppealEvidence(e.target.value)} disabled={loading || appealUploading} maxLength={500} />

                {/* 图片上传区域 */}
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {appealImages.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeAppealImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>✕</button>
                      </div>
                    ))}
                    {appealImages.length < 3 && (
                      <label className="w-20 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform" style={{ border: '2px dashed var(--border-color)', backgroundColor: 'var(--bg-page)' }}>
                        <span className="text-2xl" style={{ color: '#ccc' }}>{appealUploading ? '⏳' : '+'}</span>
                        <span className="text-xs" style={{ color: '#999' }}>{appealUploading ? '上传中' : '上传截图'}</span>
                        <input ref={appealFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAppealImageUpload} disabled={appealUploading || loading} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>可上传手机营业厅截图等证据（最多3张，每张不超过5MB）</p>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#666' }}>设置暗号 *</label>
                <input type="text" className="input" placeholder="例如：好好学习" value={appealCodeWord} onChange={e => setAppealCodeWord(e.target.value)} disabled={loading} maxLength={50} />
                <p className="text-xs mt-1" style={{ color: '#999' }}>后续客服拨打电话核实，您需说出此暗号确认身份</p>
              </div>

              <button onClick={handleAppeal} disabled={loading || appealUploading} className="btn-primary w-full disabled:opacity-50">{loading ? '提交中...' : '提交申诉'}</button>

              <div className="text-center">
                <button onClick={() => { if (!loading) { resetForm(); setStep('login') } }} disabled={loading} className="text-sm active:scale-95 transition-transform" style={{ color: '#999' }}>返回登录</button>
              </div>

              <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--bg-page)', color: '#999' }}>
                由于网站经费有限，暂不支持手机号码短信验证码功能，后续版本将完善此功能。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
