'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UserProfile { id: string; phone: string; nickname: string; password_hash: string; security_question1: string; security_answer1: string; security_question2: string; security_answer2: string; created_at: string }
interface Appeal { id: string; phone: string; evidence: string; code_word: string; status: string; created_at: string }
interface Feedback { id: string; user_id: string | null; phone: string | null; content: string; status: string; created_at: string }

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<'users' | 'appeals' | 'feedbacks'>('users')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const ADMIN_PASSWORD = 'xxsc2026'

  const handleLogin = () => { if (password === ADMIN_PASSWORD) { setAuthenticated(true) } else { alert('密码错误') } }

  useEffect(() => { if (authenticated) { loadAll() } }, [authenticated])

  const loadAll = async () => {
    setLoading(true)
    const [u, a, f] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('appeals').select('*').order('created_at', { ascending: false }),
      supabase.from('feedbacks').select('*').order('created_at', { ascending: false }),
    ])
    setUsers(u.data || []); setAppeals(a.data || []); setFeedbacks(f.data || [])
    setLoading(false)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除该用户吗？这将删除该用户的所有数据（发布、收藏等），此操作不可撤销！')) return
    const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId })
    if (error) { alert('删除失败：' + error.message); return }
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleResetPassword = async (userId: string) => {
    if (!resetPassword || resetPassword.length < 6) { alert('新密码至少6个字符'); return }
    const { data, error } = await supabase.rpc('admin_reset_user_password', { p_user_id: userId, p_new_password: resetPassword })
    if (error) { alert('重置失败：' + error.message); return }
    if (data?.success) { alert('密码已重置'); setResetUserId(null); setResetPassword('') }
  }

  const handleDeleteAppeal = async (id: string) => {
    if (!confirm('确定要删除该申诉记录吗？')) return
    const { error } = await supabase.from('appeals').delete().eq('id', id)
    if (!error) setAppeals(prev => prev.filter(a => a.id !== id))
  }

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('确定要删除该反馈记录吗？')) return
    const { error } = await supabase.from('feedbacks').delete().eq('id', id)
    if (!error) setFeedbacks(prev => prev.filter(f => f.id !== id))
  }

  const filteredUsers = users.filter(u => !searchTerm || u.phone?.includes(searchTerm) || u.nickname?.includes(searchTerm))
  const pendingAppeals = appeals.filter(a => a.status === 'pending').length
  const pendingFeedbacks = feedbacks.filter(f => f.status === 'pending').length

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm" style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.08)' }}>
          <h1 className="text-xl font-bold text-center mb-2" style={{ color: '#333' }}>管理员登录</h1>
          <p className="text-center text-sm mb-6" style={{ color: '#999' }}>请输入管理密码</p>
          <input type="password" className="input mb-4" placeholder="请输入管理密码" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="btn-primary w-full">进入</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto" style={{ backgroundColor: '#F8F6F2' }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: '#333' }}>管理员后台</h1>
        <button onClick={loadAll} className="px-4 py-2 rounded-lg text-sm active:scale-95 transition-transform" style={{ backgroundColor: 'white', color: '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>刷新</button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'users' as const, label: `用户管理 (${users.length})`, color: '#6366F1' },
          { key: 'appeals' as const, label: `手机号申诉 (${pendingAppeals})`, color: '#F6C12C' },
          { key: 'feedbacks' as const, label: `意见反馈 (${pendingFeedbacks})`, color: '#10B981' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className="px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-all whitespace-nowrap"
            style={{ backgroundColor: tab === t.key ? t.color : 'white', color: tab === t.key ? 'white' : '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>{t.label}</button>
        ))}
      </div>

      {loading && <div className="text-center py-8" style={{ color: '#999' }}>加载中...</div>}

      {/* 用户管理 */}
      {tab === 'users' && !loading && (
        <>
          <div className="mb-3"><input className="input" placeholder="🔍 搜索手机号或昵称..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
          {filteredUsers.map(u => (
            <div key={u.id} className="bg-white rounded-xl p-4 mb-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#6366F1' }}>{u.nickname?.[0] || '?'}</div>
                  <div><div className="font-medium text-sm" style={{ color: '#333' }}>{u.nickname}</div><div className="text-xs" style={{ color: '#999' }}>注册于 {new Date(u.created_at).toLocaleDateString('zh-CN')}</div></div>
                </div>
              </div>
              <div className="space-y-1 text-xs p-3 rounded-lg mb-2" style={{ backgroundColor: '#F8F6F2' }}>
                <div className="flex justify-between"><span style={{ color: '#999' }}>手机号</span><span className="font-medium" style={{ color: '#333' }}>{u.phone}</span></div>
                <div className="flex justify-between"><span style={{ color: '#999' }}>密码(哈希)</span><span className="font-mono text-xs truncate max-w-[200px]" style={{ color: '#666' }}>{u.password_hash}</span></div>
                <div className="flex justify-between"><span style={{ color: '#999' }}>密保问题1</span><span style={{ color: '#333' }}>{u.security_question1 || '无'}</span></div>
                <div className="flex justify-between"><span style={{ color: '#999' }}>密保答案1</span><span style={{ color: '#333' }}>{u.security_answer1 || '无'}</span></div>
                <div className="flex justify-between"><span style={{ color: '#999' }}>密保问题2</span><span style={{ color: '#333' }}>{u.security_question2 || '无'}</span></div>
                <div className="flex justify-between"><span style={{ color: '#999' }}>密保答案2</span><span style={{ color: '#333' }}>{u.security_answer2 || '无'}</span></div>
              </div>
              {resetUserId === u.id ? (
                <div className="flex gap-2 items-center">
                  <input className="input flex-1 text-sm" placeholder="输入新密码（至少6位）" value={resetPassword} onChange={e => setResetPassword(e.target.value)} />
                  <button onClick={() => handleResetPassword(u.id)} className="px-3 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#F6C12C' }}>确认</button>
                  <button onClick={() => { setResetUserId(null); setResetPassword('') }} className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: '#F5F5F5' }}>取消</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setResetUserId(u.id); setResetPassword('') }} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: '#F6C12C' }}>重置密码</button>
                  <button onClick={() => handleDeleteUser(u.id)} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: '#EF4444' }}>删除用户</button>
                </div>
              )}
            </div>
          ))}
          {!loading && filteredUsers.length === 0 && <div className="text-center py-12" style={{ color: '#999' }}>暂无用户</div>}
        </>
      )}

      {/* 手机号申诉 */}
      {tab === 'appeals' && !loading && appeals.map(a => (
        <div key={a.id} className="bg-white rounded-xl p-4 mb-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium" style={{ color: '#333' }}>📱 {a.phone}</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: a.status === 'pending' ? 'rgba(246,193,44,0.15)' : 'rgba(16,185,129,0.15)', color: a.status === 'pending' ? '#D4A517' : '#059669' }}>{a.status === 'pending' ? '待处理' : '已处理'}</span>
          </div>
          <p className="text-sm mb-1" style={{ color: '#666' }}><b>证据：</b>{a.evidence}</p>
          <p className="text-sm mb-2" style={{ color: '#666' }}><b>暗号：</b>{a.code_word}</p>
          <p className="text-xs mb-2" style={{ color: '#999' }}>{new Date(a.created_at).toLocaleString('zh-CN')}</p>
          <button onClick={() => handleDeleteAppeal(a.id)} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: '#EF4444' }}>删除</button>
        </div>
      ))}

      {/* 意见反馈 */}
      {tab === 'feedbacks' && !loading && feedbacks.map(f => (
        <div key={f.id} className="bg-white rounded-xl p-4 mb-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm" style={{ color: '#333' }}>💬 {f.phone || f.user_id?.slice(0, 8) || '匿名'}</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: f.status === 'pending' ? 'rgba(246,193,44,0.15)' : 'rgba(16,185,129,0.15)', color: f.status === 'pending' ? '#D4A517' : '#059669' }}>{f.status === 'pending' ? '未读' : '已读'}</span>
          </div>
          <p className="text-sm mb-2" style={{ color: '#666' }}>{f.content}</p>
          <p className="text-xs mb-2" style={{ color: '#999' }}>{new Date(f.created_at).toLocaleString('zh-CN')}</p>
          <button onClick={() => handleDeleteFeedback(f.id)} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: '#EF4444' }}>删除</button>
        </div>
      ))}

      {!loading && tab === 'appeals' && appeals.length === 0 && <div className="text-center py-12" style={{ color: '#999' }}>暂无申诉记录</div>}
      {!loading && tab === 'feedbacks' && feedbacks.length === 0 && <div className="text-center py-12" style={{ color: '#999' }}>暂无反馈记录</div>}
    </div>
  )
}
