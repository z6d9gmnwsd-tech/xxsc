'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [customQuestion, setCustomQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetStep, setResetStep] = useState(1)

  const fixedQuestions = [
    '你的学号是多少？',
    '你的学校名称是什么？',
    '你的专业是什么？',
    '你最喜欢的课程是什么？',
  ]

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
        window.location.href = '/'
      }, 1000)
    } else {
      setError(data?.message || '登录失败')
    }
  }

  const handleRegister = async () => {
    if (!phone || !password || !confirmPassword || !securityAnswer) {
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

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingUser) {
      setError('该手机号已被注册')
      setLoading(false)
      return
    }

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
        window.location.href = '/'
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

    const { data: userData } = await supabase
      .from('profiles')
      .select('security_question')
      .eq('phone', phone)
      .single()

    if (!userData) {
      setError('该手机号未注册')
      setLoading(false)
      return
    }

    const { data, error: funcError } = await supabase.rpc('verify_security_answer', {
      p_phone: phone,
      p_answer: securityAnswer
    })

    setLoading(false)

    if (funcError) {
      setError('验证失败：' + funcError.message)
      return
    }

    if (data && data.success) {
      setResetStep(2)
    } else {
      setError(data?.message || '密保答案错误')
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
        setShowForgotPassword(false)
        setResetStep(1)
        setSuccess('')
        setPassword('')
        setConfirmPassword('')
        setSecurityAnswer('')
      }, 2000)
    } else {
      setError(data?.message || '重置失败')
    }
  }

  return (
    <div className="min-h-screen" style={{background: '#FBF8F3'}}>
      <div className="px-4 py-8 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="text-center">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-2xl font-bold">新校书仓</h1>
          <p className="text-sm mt-2" style={{opacity: 0.8}}>校园二手教材交易平台</p>
        </div>
      </div>

      <div className="p-4">
        {!showForgotPassword ? (
          <div className="rounded-2xl p-6" style={{background: '#fff'}}>
            <h2 className="text-xl font-bold text-center mb-6" style={{color: '#333'}}>
              {isLogin ? '登录' : '注册'}
            </h2>

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

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{color: '#666'}}>手机号</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{color: '#666'}}>密码</label>
                <input
                  type="password"
                  className="input"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm mb-2" style={{color: '#666'}}>确认密码</label>
                    <input
                      type="password"
                      className="input"
                      placeholder="请再次输入密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{color: '#666'}}>密保问题</label>
                    <select
                      className="input mb-2"
                      value={securityQuestion}
                      onChange={(e) => { setSecurityQuestion(e.target.value); setCustomQuestion(''); }}
                    >
                      <option value="">选择或自定义问题</option>
                      {fixedQuestions.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                      <option value="custom">自定义问题</option>
                    </select>
                    {(securityQuestion === 'custom' || !fixedQuestions.includes(securityQuestion)) && (
                      <input
                        type="text"
                        className="input"
                        placeholder="请输入自定义问题"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{color: '#666'}}>密保答案</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="请输入密保答案"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button
                onClick={isLogin ? handleLogin : handleRegister}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? '处理中...' : isLogin ? '登录' : '注册'}
              </button>

              <div className="flex justify-between text-sm">
                <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} className="text-orange-500 hover:underline">
                  {isLogin ? '注册账号' : '已有账号？去登录'}
                </button>
                {isLogin && (
                  <button onClick={() => { setShowForgotPassword(true); setResetStep(1); setError(''); }} className="text-gray-500 hover:underline">
                    忘记密码？
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-6" style={{background: '#fff'}}>
            <h2 className="text-xl font-bold text-center mb-6" style={{color: '#333'}}>
              {resetStep === 1 ? '验证密保' : '重置密码'}
            </h2>

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

            {resetStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{color: '#666'}}>手机号</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="请输入注册时的手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{color: '#666'}}>密保答案</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="请输入密保答案"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleVerifyAnswer}
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? '验证中...' : '验证'}
                </button>

                <button onClick={() => { setShowForgotPassword(false); setResetStep(1); }} className="w-full text-center text-sm text-gray-500 hover:underline">
                  返回登录
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{color: '#666'}}>新密码</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="请输入新密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{color: '#666'}}>确认新密码</label>
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

                <button onClick={() => { setResetStep(1); setError(''); }} className="w-full text-center text-sm text-gray-500 hover:underline">
                  返回
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
