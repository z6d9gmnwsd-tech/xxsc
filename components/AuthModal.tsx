'use client'

import { useState } from 'react'
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

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
      setError('密码只能包含字母、数字和常见标点符号')
      return
    }

    const question = customQuestion || securityQuestion
    if (!question) {
      setError('请选择或输入密保问题')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: funcError } = await supabase.rpc('register_user', {
      p_phone: phone,
      p_password: password,
      p_security_question: question,
      p_security_answer: securityAnswer
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
    if (!phone || !securityAnswer) {
      setError('请输入手机号和密保答案')
      return
    }

    setLoading(true)
    setError('')

    // 尝试验证第一个密保答案
    const { data: data1, error: error1 } = await supabase.rpc('verify_security_answer', {
      p_phone: phone,
      p_answer: securityAnswer1
    })

    if (data1 && data1.success) {
      setLoading(false)
      setStep('reset')
      return
    }

    // 如果第一个失败，尝试验证第二个密保答案
    if (securityAnswer2) {
      const { data: data2, error: error2 } = await supabase.rpc('verify_security_answer', {
        p_phone: phone,
        p_answer: securityAnswer2
      })

      setLoading(false)

      if (data2 && data2.success) {
        setStep('reset')
      } else {
        setError('密保答案错误')
      }
    } else {
      setLoading(false)
      setError(data1?.message || '密保答案错误')
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

    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
      setError('密码只能包含字母、数字和常见标点符号')
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {step === 'login' && '登录'}
              {step === 'register' && '注册'}
              {step === 'forgot' && '忘记密码'}
              {step === 'verify' && '验证密保'}
              {step === 'reset' && '重置密码'}
            </h2>
            <button onClick={handleClose} className="text-white/80 hover:text-white text-xl">×</button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-xl text-center">
              {success}
            </div>
          )}

          {/* 登录表单 */}
          {step === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">手机号</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">密码</label>
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
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? '登录中...' : '登录'}
              </button>
              <div className="flex justify-between text-sm">
                <button onClick={() => { resetForm(); setStep('register') }} className="text-orange-500 hover:underline">
                  注册账号
                </button>
                <button onClick={() => { resetForm(); setStep('forgot') }} className="text-gray-500 hover:underline">
                  忘记密码？
                </button>
              </div>
            </div>
          )}

          {/* 注册表单 */}
          {step === 'register' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">手机号 *</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">设置密码 *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="请输入密码（字母、数字、标点符号）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-orange-500 mt-1">⚠️ 密码是您的唯一登录方式，请牢牢记住！</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">确认密码 *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">密保问题1 *</label>
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
                  placeholder="请输入密保答案1"
                  value={securityAnswer1}
                  onChange={(e) => setSecurityAnswer1(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">密保问题2 *</label>
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
                  placeholder="请输入密保答案2"
                  value={securityAnswer2}
                  onChange={(e) => setSecurityAnswer2(e.target.value)}
                />
              </div>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? '注册中...' : '注册'}
              </button>
              <button onClick={() => { resetForm(); setStep('login') }} className="w-full text-center text-sm text-gray-500 hover:underline">
                已有账号？去登录
              </button>
            </div>
          )}

          {/* 忘记密码 */}
          {step === 'forgot' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">请输入注册时使用的手机号</p>
              <div>
                <label className="block text-sm text-gray-600 mb-2">手机号</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button
                onClick={() => { if (phone) setStep('verify'); else setError('请输入手机号'); }}
                className="btn-primary w-full"
              >
                下一步
              </button>
              <button onClick={() => { resetForm(); setStep('login') }} className="w-full text-center text-sm text-gray-500 hover:underline">
                返回登录
              </button>
            </div>
          )}

          {/* 验证密保 */}
          {step === 'verify' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">请回答您的密保问题（回答任意一个即可）</p>
              <div>
                <label className="block text-sm text-gray-600 mb-2">密保答案</label>
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
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? '验证中...' : '验证'}
              </button>
              <button onClick={() => { resetForm(); setStep('forgot') }} className="w-full text-center text-sm text-gray-500 hover:underline">
                返回
              </button>
            </div>
          )}

          {/* 重置密码 */}
          {step === 'reset' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">请设置新密码</p>
              <div>
                <label className="block text-sm text-gray-600 mb-2">新密码</label>
                <input
                  type="password"
                  className="input"
                  placeholder="请输入新密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">确认新密码</label>
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
                className="btn-primary w-full disabled:opacity-50"
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
