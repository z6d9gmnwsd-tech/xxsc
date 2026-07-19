'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

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
    setError('')
    setSuccess('')
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      resetForm()
      setStep('login')
      onClose()
    }, 300)
  }

  const validatePhone = (p: string) => /^1[3-9]\d{9}$/.test(p)

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('请输入手机号和密码')
      return
    }
    if (!validatePhone(phone)) {
      setError('请输入正确的手机号')
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
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1000)
    } else {
      setError(data?.message || '登录失败')
    }
  }

  const handleRegister = async () => {
    if (!phone || !password || !confirmPassword || !securityAnswer1 || !securityAnswer2) {
      setError('请填写所有必填项')
      return
    }
    if (!validatePhone(phone)) {
      setError('请输入正确的手机号')
      return
    }
    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    const question1 = customQuestion1 || securityQuestion1
    const question2 = customQuestion2 || securityQuestion2
    if (!question1 || !question2) {
      setError('请选择或输入两个密保问题')
      return
    }
    if (question1 === question2) {
      setError('两个密保问题不能相同')
      return
    }

    setLoading(true)
    setError('')

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
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
    } else {
      setError(data?.message || '注册失败')
    }
  }

  const handleVerifyAnswer = async () => {
    if (!phone) {
      setError('请输入手机号')
      return
    }
    if (!securityAnswer1) {
      setError('请输入密保答案')
      return
    }

    setLoading(true)
    setError('')

    const { data: data1 } = await supabase.rpc('verify_security_answer', {
      p_phone: phone,
      p_answer: securityAnswer1
    })

    if (data1 && data1.success) {
      setLoading(false)
      setStep('reset')
      return
    }

    setLoading(false)
    setError(data1?.message || '密保答案错误')
  }

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError('请输入新密码')
      return
    }
    if (password.length < 6) {
      setError('密码至少需要6个字符')
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
      setTimeout(() => {
        resetForm()
        setStep('login')
      }, 2000)
    } else {
      setError(data?.message || '重置失败')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* 背景遮罩 */}
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />

      {/* 模态框 */}
      <div
        className={`
          relative bg-white w-full max-w-md overflow-hidden rounded-2xl
          transition-all duration-300 ease-ios
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
        style={{ boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div
          className="relative px-6 py-5 text-white overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #FF8C5A 0%, #FF7A45 30%, #FF6B35 70%, #E5784A 100%)',
          }}
        >
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-white/10" />
          <div className="flex justify-between items-center relative">
            <h2 className="text-lg font-bold">
              {step === 'login' && '登录'}
              {step === 'register' && '注册'}
              {step === 'forgot' && '忘记密码'}
              {step === 'verify' && '验证密保'}
              {step === 'reset' && '重置密码'}
            </h2>
            <button
              onClick={handleClose}
              className="touch-target text-white/80 hover:text-white active:scale-90 transition-all duration-150 rounded-xl hover:bg-white/10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto scroll-container">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-center text-sm bg-red-50 text-red-600 animate-fade-in border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl text-center text-sm bg-emerald-50 text-emerald-600 animate-fade-in border border-emerald-100">
              {success}
            </div>
          )}

          {step === 'login' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">手机号</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">密码</label>
                <input
                  type="password"
                  className="input"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn-primary w-full ripple"
              >
                {loading ? '登录中...' : '登录'}
              </button>
              <div className="flex justify-between text-sm">
                <button
                  onClick={() => { resetForm(); setStep('register') }}
                  className="text-accent font-medium active:scale-95 transition-transform"
                >
                  注册账号
                </button>
                <button
                  onClick={() => { resetForm(); setStep('forgot') }}
                  className="text-tertiary active:scale-95 transition-transform"
                >
                  忘记密码？
                </button>
              </div>
            </div>
          )}

          {step === 'register' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">手机号 *</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">设置密码 *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="请输入密码（至少6位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs mt-1.5 text-accent">密码是您的唯一登录方式，请牢牢记住！</p>
              </div>
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">确认密码 *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">密保问题1 *</label>
                <select
                  className="input mb-2"
                  value={securityQuestion1}
                  onChange={(e) => { setSecurityQuestion1(e.target.value); setCustomQuestion1(''); }}
                >
                  <option value="">选择或自定义问题</option>
                  {fixedQuestions.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                  <option value="custom">自定义问题</option>
                </select>
                {(securityQuestion1 === 'custom' || !fixedQuestions.includes(securityQuestion1)) && (
                  <input
                    type="text"
                    className="input mb-2"
                    placeholder="请输入自定义问题"
                    value={customQuestion1}
                    onChange={(e) => setCustomQuestion1(e.target.value)}
                  />
                )}
                <input
                  type="text"
                  className="input"
                  placeholder="请输入密保答案"
                  value={securityAnswer1}
                  onChange={(e) => setSecurityAnswer1(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">密保问题2 *</label>
                <select
                  className="input mb-2"
                  value={securityQuestion2}
                  onChange={(e) => { setSecurityQuestion2(e.target.value); setCustomQuestion2(''); }}
                >
                  <option value="">选择或自定义问题</option>
                  {fixedQuestions.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                  <option value="custom">自定义问题</option>
                </select>
                {(securityQuestion2 === 'custom' || !fixedQuestions.includes(securityQuestion2)) && (
                  <input
                    type="text"
                    className="input mb-2"
                    placeholder="请输入自定义问题"
                    value={customQuestion2}
                    onChange={(e) => setCustomQuestion2(e.target.value)}
                  />
                )}
                <input
                  type="text"
                  className="input"
                  placeholder="请输入密保答案"
                  value={securityAnswer2}
                  onChange={(e) => setSecurityAnswer2(e.target.value)}
                />
              </div>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="btn-primary w-full ripple"
              >
                {loading ? '注册中...' : '注册'}
              </button>
              <button
                onClick={() => { resetForm(); setStep('login') }}
                className="w-full text-center text-sm text-tertiary active:scale-95 transition-transform"
              >
                已有账号？去登录
              </button>
            </div>
          )}

          {step === 'forgot' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-secondary">请输入注册时使用的手机号</p>
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">手机号</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  if (phone && validatePhone(phone)) setStep('verify')
                  else setError('请输入正确的手机号')
                }}
                className="btn-primary w-full ripple"
              >
                下一步
              </button>
              <button
                onClick={() => { resetForm(); setStep('login') }}
                className="w-full text-center text-sm text-tertiary active:scale-95 transition-transform"
              >
                返回登录
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-secondary">请回答您的密保问题</p>
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">密保答案</label>
                <input
                  type="text"
                  className="input"
                  placeholder="请输入密保答案"
                  value={securityAnswer1}
                  onChange={(e) => setSecurityAnswer1(e.target.value)}
                />
              </div>
              <button
                onClick={handleVerifyAnswer}
                disabled={loading}
                className="btn-primary w-full ripple"
              >
                {loading ? '验证中...' : '验证'}
              </button>
              <button
                onClick={() => { resetForm(); setStep('forgot') }}
                className="w-full text-center text-sm text-tertiary active:scale-95 transition-transform"
              >
                返回
              </button>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-secondary">请设置新密码</p>
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">新密码</label>
                <input
                  type="password"
                  className="input"
                  placeholder="请输入新密码（至少6位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-secondary font-medium">确认新密码</label>
                <input
                  type="password"
                  className="input"
                  placeholder="请再次输入新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="btn-primary w-full ripple"
              >
                {loading ? '重置中...' : '重置密码'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
