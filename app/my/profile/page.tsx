'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import Toast, { showToast } from '@/components/Toast'

export default function ProfilePage() {
  const { user, loading } = usePhoneAuth()
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [school, setSchool] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/my'); return }
    loadProfile()
  }, [user, loading])

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase.from('profiles').select('nickname, school, bio').eq('id', user.id).single()
    if (data) { setNickname(data.nickname || ''); setSchool(data.school || ''); setBio(data.bio || '') }
    setLoadingData(false)
  }

  const handleSave = async () => {
    if (!user) return
    if (!nickname.trim()) { showToast('error', '昵称不能为空'); return }
    if (nickname.trim().length > 12) { showToast('error', '昵称不能超过12个字符'); return }
    if (school.trim().length > 10) { showToast('error', '学校名称不能超过10个字'); return }
    if (bio.trim().length > 50) { showToast('error', '简介不能超过50个字'); return }

    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ nickname: nickname.trim(), school: school.trim() || null, bio: bio.trim() || null }).eq('id', user.id)
      if (error) { showToast('error', '保存失败：' + error.message); setSaving(false); return }
      localStorage.setItem('nickname', nickname.trim())
      showToast('success', '编辑成功！')
      setTimeout(() => { window.location.href = '/my' }, 1000)
    } catch { showToast('error', '保存失败') }
    setSaving(false)
  }

  if (loading || loadingData) return (<div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}><div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent)' }} /></div>)

  return (
    <div className="pb-20 min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Toast />
      <div className="px-4 py-4 flex items-center gap-3" style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border-color)' }}>
        <BackButton />
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>编辑个人信息</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="rounded-xl p-4 bg-white" style={{ border: '1px solid var(--border-color)' }}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm flex-shrink-0" style={{ color: 'var(--text-primary)' }}><span className="text-red-500">*</span> 昵称</span>
              <input className="flex-1 input" placeholder="请输入昵称" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={12} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm flex-shrink-0" style={{ color: 'var(--text-primary)' }}>学校</span>
              <input className="flex-1 input" placeholder="选填（最多10个字）" value={school} onChange={e => setSchool(e.target.value)} maxLength={10} />
            </div>
            <div className="flex items-start gap-3">
              <span className="w-16 text-sm flex-shrink-0 pt-3" style={{ color: 'var(--text-primary)' }}>简介</span>
              <div className="flex-1">
                <textarea className="input min-h-[80px] resize-none" placeholder="选填（最多50字）" value={bio} onChange={e => setBio(e.target.value)} maxLength={50} />
                <div className="text-right text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{bio.length}/50</div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl text-white font-semibold active:scale-95 transition-transform disabled:opacity-50" style={{ backgroundColor: 'var(--accent)' }}>
          {saving ? '保存中...' : '保存修改'}
        </button>
      </div>
    </div>
  )
}
