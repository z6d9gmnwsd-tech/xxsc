'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type AuthMode = 'email' | 'phone'

function phoneToEmail(phone: string): string {
  return `${phone}@xinqucang.auth`
}

export default function AuthForm() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [authMode, setAuthMode] = useState<AuthMode>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      router.push('/')
      router.refresh()
    }
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('密码至少需要6位')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      setSuccess('注册成功！请查看邮箱确认链接，或直接登录')
      setIsLogin(true)
      setLoading(false)
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fakeEmail = phoneToEmail(phone)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password,
    })

    if (error) {
      setError('手机号或密码错误')
      setLoading(false)
      return
    }

    if (data.user) {
      router.push('/')
      router.refresh()
    }
  }

  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('密码至少需要6位')
      setLoading(false)
      return
    }

    const fakeEmail = phoneToEmail(phone)
    const { data, error } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', data.user.id)

      setSuccess('注册成功！请直接登录')
      setIsLogin(true)
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPhone('')
    setPassword('')
    setError('')
    setSuccess('')
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-center mb-6">
        {isLogin ? '登录' : '注册'}
      </h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setAuthMode('email'); resetForm() }}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
            authMode === 'email'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          邮箱
        </button>
        <button
          onClick={() => { setAuthMode('phone'); resetForm() }}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
            authMode === 'phone'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          手机号
        </button>
      </div>

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

      {authMode === 'email' ? (
        <form onSubmit={isLogin ? handleEmailLogin : handleEmailRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">邮箱</label>
            <input
              className="input"
              type="email"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">密码</label>
            <input
              className="input"
              type="password"
              placeholder={isLogin ? '请输入密码' : '设置密码（至少6位）'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4 disabled:opacity-50"
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>
      ) : (
        <form onSubmit={isLogin ? handlePhoneLogin : handlePhoneRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">手机号</label>
            <input
              className="input"
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">密码</label>
            <input
              className="input"
              type="password"
              placeholder={isLogin ? '请输入密码' : '设置密码（至少6位）'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4 disabled:opacity-50"
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>
      )}

      <button
        onClick={() => {
          setIsLogin(!isLogin)
          resetForm()
        }}
        className="w-full py-3 text-center text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 mt-4"
      >
        {isLogin ? '注册新账号' : '已有账号？去登录'}
      </button>
    </div>
  )
}
