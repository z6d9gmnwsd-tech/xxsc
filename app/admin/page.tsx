'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Appeal { id: string; phone: string; evidence: string; code_word: string; status: string; admin_reply: string | null; created_at: string }
interface Feedback { id: string; user_id: string | null; phone: string | null; content: string; status: string; admin_reply: string | null; created_at: string }

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<'appeals' | 'feedbacks'>('appeals')
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)
  const [replyId, setReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const ADMIN_PASSWORD = 'xxsc2026'

  const handleLogin = () => { if (password === ADMIN_PASSWORD) setAuthenticated(true) }

  useEffect(() => { if (authenticated) { loadAppeals(); loadFeedbacks() } }, [authenticated])

  const loadAppeals = async () => { setLoading(true); const { data } = await supabase.from('appeals').select('*').order('created_at', { ascending: false }); setAppeals(data || []); setLoading(false) }
  const loadFeedbacks = async () => { setLoading(true); const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false }); setFeedbacks(data || []); setLoading(false) }

  const updateAppealStatus = async (id: string, status: string, reply?: string) => {
    await supabase.from('appeals').update({ status, admin_reply: reply || null }).eq('id', id)
    setAppeals(prev => prev.map(a => a.id === id ? { ...a, status, admin_reply: reply || a.admin_reply } : a))
    setReplyId(null); setReplyText('')
  }

  const updateFeedbackStatus = async (id: string, status: string, reply?: string) => {
    await supabase.from('feedbacks').update({ status, admin_reply: reply || null }).eq('id', id)
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status, admin_reply: reply || f.admin_reply } : f))
    setReplyId(null); setReplyText('')
  }

  const statusMap: Record<string, string> = { pending: '待处理', processing: '处理中', read: '已读', resolved: '已解决', replied: '已回复' }
  const statusColor: Record<string, string> = { pending: '#F6C12C', processing: '#2563EB', read: '#2563EB', resolved: '#059669', replied: '#059669' }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm" style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.08)' }}>
          <h1 className="text-xl font-bold text-center mb-6" style={{ color: '#333' }}>管理员登录</h1>
          <input type="password" className="input mb-4" placeholder="请输入管理密码" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="btn-primary w-full">进入</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto" style={{ backgroundColor: '#F8F6F2' }}>
      <h1 className="text-xl font-bold mb-4" style={{ color: '#333' }}>管理员后台</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('appeals')} className="px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-all" style={{ backgroundColor: tab === 'appeals' ? '#F6C12C' : 'white', color: tab === 'appeals' ? '#333' : '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>手机号申诉 ({appeals.length})</button>
        <button onClick={() => setTab('feedbacks')} className="px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-all" style={{ backgroundColor: tab === 'feedbacks' ? '#F6C12C' : 'white', color: tab === 'feedbacks' ? '#333' : '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>意见反馈 ({feedbacks.length})</button>
      </div>

      {loading && <div className="text-center py-8" style={{ color: '#999' }}>加载中...</div>}

      {tab === 'appeals' && !loading && appeals.map(a => (
        <div key={a.id} className="bg-white rounded-xl p-4 mb-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium" style={{ color: '#333' }}>📱 {a.phone}</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: statusColor[a.status] + '15', color: statusColor[a.status] }}>{statusMap[a.status]}</span>
          </div>
          <p className="text-sm mb-1" style={{ color: '#666' }}><b>证据：</b>{a.evidence}</p>
          <p className="text-sm mb-2" style={{ color: '#666' }}><b>暗号：</b>{a.code_word}</p>
          <p className="text-xs mb-2" style={{ color: '#999' }}>{new Date(a.created_at).toLocaleString('zh-CN')}</p>
          {a.admin_reply && <p className="text-sm p-2 rounded-lg mb-2" style={{ backgroundColor: '#F8F6F2', color: '#333' }}><b>管理员回复：</b>{a.admin_reply}</p>}
          {replyId === a.id ? (
            <div className="flex gap-2">
              <input className="input flex-1 text-sm" placeholder="输入回复内容" value={replyText} onChange={e => setReplyText(e.target.value)} />
              <button onClick={() => updateAppealStatus(a.id, 'resolved', replyText)} className="px-3 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#059669' }}>回复</button>
              <button onClick={() => setReplyId(null)} className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: '#F5F5F5' }}>取消</button>
            </div>
          ) : (
            <div className="flex gap-2">
              {a.status === 'pending' && <button onClick={() => updateAppealStatus(a.id, 'processing')} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: '#2563EB' }}>标记处理中</button>}
              <button onClick={() => { setReplyId(a.id); setReplyText('') }} className="px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#F5F5F5', color: '#666' }}>回复</button>
            </div>
          )}
        </div>
      ))}

      {tab === 'feedbacks' && !loading && feedbacks.map(f => (
        <div key={f.id} className="bg-white rounded-xl p-4 mb-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm" style={{ color: '#333' }}>💬 {f.phone || f.user_id?.slice(0, 8) || '匿名'}</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: statusColor[f.status] + '15', color: statusColor[f.status] }}>{statusMap[f.status]}</span>
          </div>
          <p className="text-sm mb-2" style={{ color: '#666' }}>{f.content}</p>
          <p className="text-xs mb-2" style={{ color: '#999' }}>{new Date(f.created_at).toLocaleString('zh-CN')}</p>
          {f.admin_reply && <p className="text-sm p-2 rounded-lg mb-2" style={{ backgroundColor: '#F8F6F2', color: '#333' }}><b>管理员回复：</b>{f.admin_reply}</p>}
          {replyId === f.id ? (
            <div className="flex gap-2">
              <input className="input flex-1 text-sm" placeholder="输入回复内容" value={replyText} onChange={e => setReplyText(e.target.value)} />
              <button onClick={() => updateFeedbackStatus(f.id, 'replied', replyText)} className="px-3 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#059669' }}>回复</button>
              <button onClick={() => setReplyId(null)} className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: '#F5F5F5' }}>取消</button>
            </div>
          ) : (
            <div className="flex gap-2">
              {f.status === 'pending' && <button onClick={() => updateFeedbackStatus(f.id, 'read')} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: '#2563EB' }}>标记已读</button>}
              <button onClick={() => { setReplyId(f.id); setReplyText('') }} className="px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#F5F5F5', color: '#666' }}>回复</button>
            </div>
          )}
        </div>
      ))}

      {!loading && tab === 'appeals' && appeals.length === 0 && <div className="text-center py-12" style={{ color: '#999' }}>暂无申诉记录</div>}
      {!loading && tab === 'feedbacks' && feedbacks.length === 0 && <div className="text-center py-12" style={{ color: '#999' }}>暂无反馈记录</div>}
    </div>
  )
}
