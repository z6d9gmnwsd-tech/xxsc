'use client'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import AuthModal from '@/components/AuthModal'
import Toast, { showToast } from '@/components/Toast'

export default function MyPage() {
  const { user, loading, logout } = usePhoneAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackContent, setFeedbackContent] = useState('')
  const [feedbackPhone, setFeedbackPhone] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [profile, setProfile] = useState<{ school: string | null; bio: string | null } | null>(null)

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('school, bio').eq('id', user.id).single().then(({ data }) => { if (data) setProfile(data) })
    }
  }, [user])

  const handleLogout = () => { if (confirm('确定要退出登录吗？')) { logout(); window.location.reload() } }

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim() || feedbackContent.trim().length < 5) { showToast('error', '请详细描述您的意见（至少5个字符）'); return }
    setFeedbackSubmitting(true)
    try {
      const { error } = await supabase.from('feedbacks').insert({ user_id: user?.id || null, phone: feedbackPhone || null, content: feedbackContent.trim() })
      if (error) { showToast('error', '提交失败'); setFeedbackSubmitting(false); return }
      showToast('success', '感谢您的反馈！'); setFeedbackContent(''); setFeedbackPhone(''); setShowFeedbackModal(false)
    } catch { showToast('error', '网络错误') }
    setFeedbackSubmitting(false)
  }

  const menuItems = [
    { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#6366F1" strokeWidth="1.8"/><path d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/></svg>), label: '编辑个人信息', href: '/my/profile' },
    { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#F6C12C" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#F6C12C" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#F6C12C" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#F6C12C" strokeWidth="1.8"/></svg>), label: '我的发布', href: '/my/items' },
  ]

  const settingItems = [
    { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>), label: '联系客服', href: null, badge: '意见反馈' },
    { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="1.8"/><path d="M12 8V12M12 16H12.01" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round"/></svg>), label: '关于新校书仓', href: null, badge: 'v1.0.0' },
  ]

  return (
    <div className="pb-24 min-h-screen" style={{ backgroundColor: '#F8F6F2' }}>
      <Toast />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #F0DEBF 0%, #E8D0A8 40%, #D4B88A 100%)' }} />
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)' }} />
        <div className="relative px-5 py-8 safe-area-top">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)' }}>
              {user ? <span className="text-2xl font-bold" style={{ color: '#333' }}>{user.nickname?.[0] || '用'}</span>
                : <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#666" strokeWidth="2"/><path d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20" stroke="#666" strokeWidth="2" strokeLinecap="round"/></svg>}
            </div>
            <div className="flex-1">
              {loading ? <div className="space-y-2"><div className="h-5 w-24 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} /><div className="h-4 w-32 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} /></div>
                : user ? (<>
                  <div className="text-xl font-bold" style={{ color: '#333' }}>{user.nickname}</div>
                  <div className="text-sm" style={{ color: '#666' }}>{user.phone}</div>
                  {profile?.school && <div className="text-xs mt-0.5" style={{ color: '#8B7355' }}>🏫 {profile.school}</div>}
                  {profile?.bio && <div className="text-xs mt-0.5 truncate max-w-[200px]" style={{ color: '#8B7355' }}>📝 {profile.bio}</div>}
                </>)
                : (<><button onClick={() => setShowAuthModal(true)} className="text-xl font-bold active:scale-95 transition-transform" style={{ color: '#333' }}>登录 / 注册</button><div className="text-sm mt-0.5" style={{ color: '#666' }}>登录后查看更多功能</div></>)}
            </div>
            {user && <button onClick={handleLogout} className="text-sm px-4 py-2 rounded-full active:scale-95 transition-all" style={{ background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)', color: '#666' }}>退出</button>}
          </div>
        </div>
      </div>

      {user ? (
        <div className="px-4 -mt-6 relative z-10 space-y-3">
          <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #E5E5E5' }}>
            {menuItems.map((item, index) => (
              <a key={item.label} href={item.href} className="flex items-center justify-between px-4 py-4 active:scale-[0.98] transition-all" style={{ borderBottom: index < menuItems.length - 1 ? '1px solid #E5E5E5' : 'none' }}>
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F8F6F2' }}>{item.icon}</div><span className="font-medium" style={{ color: '#333' }}>{item.label}</span></div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#D1D5DB' }}><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            ))}
          </div>
          <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #E5E5E5' }}>
            {settingItems.map((item, index) => (
              <div key={item.label}>
                {item.href ? (
                  <a href={item.href} className="flex items-center justify-between px-4 py-4 active:scale-[0.98] transition-all" style={{ borderBottom: index < settingItems.length - 1 ? '1px solid #E5E5E5' : 'none' }}>
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F8F6F2' }}>{item.icon}</div><span className="font-medium" style={{ color: '#333' }}>{item.label}</span></div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#D1D5DB' }}><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                ) : (
                  <div onClick={() => { if (item.badge === '意见反馈') setShowFeedbackModal(true) }} className="flex items-center justify-between px-4 py-4 active:scale-[0.98] transition-all cursor-pointer" style={{ borderBottom: index < settingItems.length - 1 ? '1px solid #E5E5E5' : 'none' }}>
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F8F6F2' }}>{item.icon}</div><span className="font-medium" style={{ color: '#333' }}>{item.label}</span></div>
                    <span className="text-sm" style={{ color: '#999' }}>{item.badge}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-8" style={{ minHeight: '50vh' }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #F0DEBF 0%, #E8D0A8 100%)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#666" strokeWidth="2"/><path d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20" stroke="#666" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <p className="text-center mb-6" style={{ color: '#999' }}>登录后查看个人信息</p>
          <button onClick={() => setShowAuthModal(true)} className="btn-primary text-lg px-12 py-3">登录 / 注册</button>
        </div>
      )}

      {showFeedbackModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in" style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#333' }}>联系客服 · 意见反馈</h3>
            <div className="space-y-3">
              <div><label className="block text-sm mb-1 font-medium" style={{ color: '#666' }}>您的联系方式（选填）</label><input type="text" className="input" placeholder="手机号或微信号" value={feedbackPhone} onChange={e => setFeedbackPhone(e.target.value)} maxLength={50} /></div>
              <div><label className="block text-sm mb-1 font-medium" style={{ color: '#666' }}>您的意见或建议 *</label><textarea className="input min-h-[100px] resize-none" placeholder="请详细描述..." value={feedbackContent} onChange={e => setFeedbackContent(e.target.value)} maxLength={1000} /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowFeedbackModal(false); setFeedbackContent(''); setFeedbackPhone('') }} className="flex-1 py-3 rounded-xl font-medium active:scale-95 transition-transform" style={{ backgroundColor: '#F5F5F5', color: '#666' }}>取消</button>
              <button onClick={handleSubmitFeedback} disabled={feedbackSubmitting} className="flex-1 py-3 rounded-xl text-white font-medium active:scale-95 transition-transform disabled:opacity-50" style={{ backgroundColor: '#F6C12C' }}>{feedbackSubmitting ? '提交中...' : '提交'}</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => { setShowAuthModal(false); window.location.reload() }} />
    </div>
  )
}
