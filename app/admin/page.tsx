'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string; phone: string; nickname: string; plaintext_password: string;
  security_question1: string; security_answer1: string;
  security_question2: string; security_answer2: string; created_at: string
}
interface Appeal {
  id: string; phone: string; evidence: string; images: string[];
  code_word: string; status: string; created_at: string
}
interface Feedback {
  id: string; user_id: string | null; phone: string | null;
  content: string; status: string; created_at: string
}
interface Book {
  id: string; title: string; price: number; status: string;
  image_url: string; created_at: string; user_id: string
}

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
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [userProducts, setUserProducts] = useState<Book[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const ADMIN_PASSWORD = 'xxsc2026'

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setAuthenticated(true) }
    else { alert('密码错误') }
  }

  useEffect(() => {
    if (authenticated) { loadAll() }
  }, [authenticated])

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
    if (!confirm('确定要删除该用户吗？这将删除该用户的所有数据，此操作不可撤销！')) return
    const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId })
    if (error) { alert('删除失败：' + error.message); return }
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleResetPassword = async (userId: string) => {
    if (!resetPassword || resetPassword.length < 6) { alert('新密码至少6个字符'); return }
    const { data, error } = await supabase.rpc('admin_reset_user_password', { p_user_id: userId, p_new_password: resetPassword })
    if (error) { alert('重置失败：' + error.message); return }
    if (data?.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plaintext_password: resetPassword } : u))
      alert('密码已重置'); setResetUserId(null); setResetPassword('')
    }
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

  const handleViewProducts = async (user: UserProfile) => {
    setSelectedUser(user)
    setShowProductsModal(true)
    setLoadingProducts(true)
    const { data } = await supabase.from('books').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setUserProducts(data || [])
    setLoadingProducts(false)
  }

  const handleDeleteProduct = async (bookId: string) => {
    if (!confirm('确定要删除该商品吗？此操作不可撤销！')) return
    const { error } = await supabase.from('books').delete().eq('id', bookId)
    if (!error) {
      setUserProducts(prev => prev.filter(b => b.id !== bookId))
      alert('商品已删除')
    }
  }

  const handleDelistProduct = async (bookId: string) => {
    if (!confirm('确定要下架该商品吗？')) return
    const { error } = await supabase.from('books').update({ status: '已下架' }).eq('id', bookId)
    if (!error) {
      setUserProducts(prev => prev.map(b => b.id === bookId ? { ...b, status: '已下架' } : b))
      alert('商品已下架')
    }
  }

  const parseAppealImages = (evidence: string): { text: string; images: string[] } => {
    const imageRegex = /\[图片[:\s]*(https?:\/\/[^\]]+)\]/g
    const images: string[] = []
    let match
    while ((match = imageRegex.exec(evidence)) !== null) {
      const urls = match[1].split(',').map(u => u.trim()).filter(u => u)
      images.push(...urls)
    }
    const text = evidence.replace(imageRegex, '').trim()
    return { text, images }
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
                <div className="flex justify-between"><span style={{ color: '#999' }}>登录密码</span><span className="font-mono font-bold" style={{ color: '#EF4444' }}>{u.plaintext_password || '未存储'}</span></div>
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
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleViewProducts(u)} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: '#6366F1' }}>查看商品</button>
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
      {tab === 'appeals' && !loading && appeals.map(a => {
        const { text, images } = parseAppealImages(a.evidence)
        return (
          <div key={a.id} className="bg-white rounded-xl p-4 mb-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium" style={{ color: '#333' }}>📱 {a.phone}</span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: a.status === 'pending' ? 'rgba(246,193,44,0.15)' : 'rgba(16,185,129,0.15)', color: a.status === 'pending' ? '#D4A517' : '#059669' }}>{a.status === 'pending' ? '待处理' : '已处理'}</span>
            </div>
            <p className="text-sm mb-2" style={{ color: '#666' }}><b>证据：</b>{text}</p>
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {images.map((img, idx) => (
                  <img key={idx} src={img} alt="证据图片" className="w-20 h-20 rounded-lg object-cover cursor-pointer active:scale-95 transition-transform" onClick={() => setImagePreview(img)} />
                ))}
              </div>
            )}
            <p className="text-sm mb-2" style={{ color: '#666' }}><b>暗号：</b>{a.code_word}</p>
            <p className="text-xs mb-2" style={{ color: '#999' }}>{new Date(a.created_at).toLocaleString('zh-CN')}</p>
            <button onClick={() => handleDeleteAppeal(a.id)} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: '#EF4444' }}>删除</button>
          </div>
        )
      })}

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

      {/* 图片预览弹窗 */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setImagePreview(null)}>
          <img src={imagePreview} alt="预览" className="max-w-full max-h-[80vh] rounded-lg" onClick={e => e.stopPropagation()} />
          <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setImagePreview(null)}>✕</button>
        </div>
      )}

      {/* 用户商品弹窗 */}
      {showProductsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProductsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#F3F4F6' }}>
              <div>
                <h3 className="font-bold" style={{ color: '#333' }}>{selectedUser.nickname} 的商品</h3>
                <p className="text-xs" style={{ color: '#999' }}>共 {userProducts.length} 件商品</p>
              </div>
              <button onClick={() => setShowProductsModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>✕</button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
              {loadingProducts ? (
                <div className="text-center py-8" style={{ color: '#999' }}>加载中...</div>
              ) : userProducts.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#999' }}>该用户暂无商品</div>
              ) : (
                <div className="space-y-3">
                  {userProducts.map(book => (
                    <div key={book.id} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F8F6F2' }}>
                      {book.image_url ? (
                        <img src={book.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E5E7EB' }}>📚</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" style={{ color: '#333' }}>{book.title}</div>
                        <div className="text-sm font-bold mt-1" style={{ color: '#FF8C5A' }}>¥{book.price}</div>
                        <div className="text-xs mt-1" style={{ color: book.status === '在售' ? '#10B981' : '#999' }}>{book.status}</div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {book.status === '在售' && (
                          <button onClick={() => handleDelistProduct(book.id)} className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: '#F6C12C' }}>下架</button>
                        )}
                        <button onClick={() => handleDeleteProduct(book.id)} className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: '#EF4444' }}>删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
