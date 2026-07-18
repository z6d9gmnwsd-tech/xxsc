'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type Step = 'login' | 'register' | 'forgot' | 'verify' | 'reset'

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

  const [realQuestion1, setRealQuestion1] = useState('')
  const [realQuestion2, setRealQuestion2] = useState('')
  const [verifyAnswer1, setVerifyAnswer1] = useState('')
  const [verifyAnswer2, setVerifyAnswer2] = useState('')

  const fixedQuestions = [
    '你的学号是多少？',
    '你的学校名称是什么？',
    '你的专业是什么？',
    '你最喜欢的课程是什么？',
  ]

  const resetForm = () => {
    setPhone('')
    setPassword('')
    setConfirmPassword('')
    setSecurityQuestion1('')
    setCustomQuestion1('')
    setSecurityAnswer1('')
    setSecurityQuestion2('')
    setCustomQuestion2('')
    setSecurityAnswer2('')
    setRealQuestion1('')
    setRealQuestion2('')
    setVerifyAnswer1('')
    setVerifyAnswer2('')
    setError('')
    setSuccess('')
  }

  const handleClose = () => {
    resetForm()
    setStep('login')
    onClose()
  }

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('请输入手机号和密码')
      return
    }
    setLoading(true)
    setError('')
    const { data, error: funcError } = await supabase.rpc('login_user', {
      p_phone: phone,
      p_password: password
    })
    setLoading(false)
    if (funcError) {
      setError('登录失败：' + funcError.message)
      return
    }
    if (data && data.success) {
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('nickname', data.nickname)
      localStorage.setItem('phone', phone)
      setSuccess('登录成功！')
      setTimeout(() => { onSuccess(); handleClose() }, 1000)
    } else {
      setError(data?.message || '登录失败')
    }
  }

  const handleRegister = async () => {
    if (!phone || !password || !confirmPassword || !securityAnswer1 || !securityAnswer2) {
      setError('请填写所有必填项')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    setLoading(true)
    setError('')
    const question1 = customQuestion1 || securityQuestion1
    const question2 = customQuestion2 || securityQuestion2
    if (!question1 || !question2) {
      setError('请选择或输入两个密保问题')
      return
    }
    const { data, error: funcError } = await supabase.rpc('register_user', {
      p_phone: phone,
      p_password: password,
      p_security_question1: question1,
      p_security_answer1: securityAnswer1,
      p_security_question2: question2,
      p_security_answer2: securityAnswer2
    })
    setLoading(false)
    if (funcError) {
      setError('注册失败：' + funcError.message)
      return
    }
    if (data && data.success) {
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('nickname', data.nickname)
      localStorage.setItem('phone', phone)
      setSuccess('注册成功！您的用户名是：' + data.nickname)
      setTimeout(() => { onSuccess(); handleClose() }, 2000)
    } else {
      setError(data?.message || '注册失败')
    }
  }

  const handleFetchQuestions = async () => {
    if (!phone) {
      setError('请输入手机号')
      return
    }
    setLoading(true)
    setError('')
    const { data, error: funcError } = await supabase.rpc('get_security_questions', {
      p_phone: phone
    })
    setLoading(false)
    if (funcError) {
      setError('获取密保问题失败：' + funcError.message)
      return
    }
    if (data && data.success) {
      setRealQuestion1(data.question1 || '')
      setRealQuestion2(data.question2 || '')
      setStep('verify')
    } else {
      setError(data?.message || '获取密保问题失败')
    }
  }

  const handleVerifyAnswer = async () => {
    if (!verifyAnswer1 && !verifyAnswer2) {
      setError('请至少输入一个密保答案')
      return
    }
    setLoading(true)
    setError('')
    if (verifyAnswer1) {
      const { data: data1 } = await supabase.rpc('verify_security_answer', {
        p_phone: phone,
        p_answer: verifyAnswer1
      })
      if (data1 && data1.success) {
        setLoading(false)
        setStep('reset')
        return
      }
    }
    if (verifyAnswer2) {
      const { data: data2 } = await supabase.rpc('verify_security_answer', {
        p_phone: phone,
        p_answer: verifyAnswer2
      })
      setLoading(false)
      if (data2 && data2.success) {
        setStep('reset')
      } else {
        setError('密保答案错误')
      }
    } else {
      setLoading(false)
      setError('密保答案错误')
    }
  }

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError('请输入新密码')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    setLoading(true)
    setError('')
    const { data, error: funcError } = await supabase.rpc('reset_password', {
      p_phone: phone,
      p_new_password: password
    })
    setLoading(false)
    if (funcError) {
      setError('重置失败：' + funcError.message)
      return
    }
    if (data && data.success) {
      setSuccess('密码重置成功！请使用新密码登录')
      setTimeout(() => { resetForm(); setStep('login') }, 2000)
    } else {
      setError(data?.message || '重置失败')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in" style={{background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)'}}>
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        <div className="px-6 py-4 text-white relative" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
          <h2 className="text-lg font-bold">
            {step === 'login' && '登录'}
            {step === 'register' && '注册'}
            {step === 'forgot' && '忘记密码'}
            {step === 'verify' && '验证密保'}
            {step === 'reset' && '重置密码'}
          </h2>
          <button onClick={handleClose} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'rgba(255,255,255,0.2)'}}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-2xl text-center text-sm animate-shake" style={{background: '#FFF0F0', color: '#ee0a24'}}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-2xl text-center text-sm animate-bounce-in" style={{background: '#e8f8f0', color: '#27ae60'}}>
              {success}
            </div>
          )}

          {step === 'login' && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>手机号</label>
                <input type="tel" className="input" placeholder="请输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>密码</label>
                <input type="password" className="input" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button onClick={handleLogin} disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? '登录中...' : '登录'}
              </button>
              <div className="flex justify-between text-sm">
                <button onClick={() => { resetForm(); setStep('register') }} className="font-medium" style={{color: '#8B6914'}}>注册账号</button>
                <button onClick={() => { resetForm(); setStep('forgot') }} style={{color: '#999'}}>忘记密码？</button>
              </div>
            </div>
          )}

          {step === 'register' && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>手机号 *</label>
                <input type="tel" className="input" placeholder="请输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>设置密码 *</label>
                <input type="password" className="input" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="text-[11px] mt-1.5" style={{color: '#E8590C'}}>密码是您的唯一登录方式，请牢牢记住！</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>确认密码 *</label>
                <input type="password" className="input" placeholder="请再次输入密码" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>密保问题1 *</label>
                <select className="input mb-2" value={securityQuestion1} onChange={(e) => { setSecurityQuestion1(e.target.value); setCustomQuestion1(''); }}>
                  <option value="">选择或自定义问题</option>
                  {fixedQuestions.map((q) => (<option key={q} value={q}>{q}</option>))}
                  <option value="custom">自定义问题</option>
                </select>
                {(securityQuestion1 === 'custom' || !fixedQuestions.includes(securityQuestion1)) && (
                  <input type="text" className="input mb-2" placeholder="请输入自定义问题" value={customQuestion1} onChange={(e) => setCustomQuestion1(e.target.value)} />
                )}
                <input type="text" className="input" placeholder="请输入密保答案" value={securityAnswer1} onChange={(e) => setSecurityAnswer1(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>密保问题2 *</label>
                <select className="input mb-2" value={securityQuestion2} onChange={(e) => { setSecurityQuestion2(e.target.value); setCustomQuestion2(''); }}>
                  <option value="">选择或自定义问题</option>
                  {fixedQuestions.map((q) => (<option key={q} value={q}>{q}</option>))}
                  <option value="custom">自定义问题</option>
                </select>
                {(securityQuestion2 === 'custom' || !fixedQuestions.includes(securityQuestion2)) && (
                  <input type="text" className="input mb-2" placeholder="请输入自定义问题" value={customQuestion2} onChange={(e) => setCustomQuestion2(e.target.value)} />
                )}
                <input type="text" className="input" placeholder="请输入密保答案" value={securityAnswer2} onChange={(e) => setSecurityAnswer2(e.target.value)} />
              </div>
              <button onClick={handleRegister} disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? '注册中...' : '注册'}
              </button>
              <button onClick={() => { resetForm(); setStep('login') }} className="w-full text-center text-sm" style={{color: '#999'}}>
                已有账号？去登录
              </button>
            </div>
          )}

          {step === 'forgot' && (
            <div className="space-y-4 animate-slide-up">
              <p className="text-sm" style={{color: '#666'}}>请输入注册时使用的手机号</p>
              <div>
                <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>手机号</label>
                <input type="tel" className="input" placeholder="请输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <button onClick={handleFetchQuestions} disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? '查询中...' : '下一步'}
              </button>
              <button onClick={() => { resetForm(); setStep('login') }} className="w-full text-center text-sm" style={{color: '#999'}}>返回登录</button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4 animate-slide-up">
              <p className="text-sm" style={{color: '#666'}}>请回答您的密保问题（回答任意一个即可）</p>
              {realQuestion1 && (
                <div className="p-3 rounded-2xl" style={{background: '#FFF8E1', border: '1px solid rgba(255,224,130,0.5)'}}>
                  <div className="text-[10px] font-medium mb-1" style={{color: '#E8590C'}}>密保问题 1</div>
                  <div className="text-sm font-medium" style={{color: '#333'}}>{realQuestion1}</div>
                </div>
              )}
              {realQuestion2 && (
                <div className="p-3 rounded-2xl" style={{background: '#FFF8E1', border: '1px solid rgba(255,224,130,0.5)'}}>
                  <div className="text-[10px] font-medium mb-1" style={{color: '#E8590C'}}>密保问题 2</div>
                  <div className="text-sm font-medium" style={{color: '#333'}}>{realQuestion2}</div>
                </div>
              )}
              {!realQuestion1 && !realQuestion2 && (
                <div className="p-3 rounded-2xl text-center" style={{background: '#f5f5f5', color: '#999'}}>
                  未找到密保问题，请联系管理员
                </div>
              )}
              {realQuestion1 && (
                <div>
                  <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>密保问题1 的答案</label>
                  <input type="text" className="input" placeholder={`请回答：${realQuestion1}`} value={verifyAnswer1} onChange={(e) => setVerifyAnswer1(e.target.value)} />
                </div>
              )}
              {realQuestion2 && (
                <div>
                  <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>密保问题2 的答案</label>
                  <input type="text" className="input" placeholder={`请回答：${realQuestion2}`} value={verifyAnswer2} onChange={(e) => setVerifyAnswer2(e.target.value)} />
                </div>
              )}
              <button onClick={handleVerifyAnswer} disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? '验证中...' : '验证'}
              </button>
              <button onClick={() => { resetForm(); setStep('forgot') }} className="w-full text-center text-sm" style={{color: '#999'}}>返回</button>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-4 animate-slide-up">
              <p className="text-sm" style={{color: '#666'}}>请设置新密码</p>
              <div>
                <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>新密码</label>
                <input type="password" className="input" placeholder="请输入新密码" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{color: '#666'}}>确认新密码</label>
                <input type="password" className="input" placeholder="请再次输入新密码" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <button onClick={handleResetPassword} disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? '重置中...' : '重置密码'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
