'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import { showToast } from '@/components/Toast'

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
    if (!user) {
      router.push('/my')
      return
    }
    loadProfile()
  }, [user, loading])

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('nickname, school, bio')
      .eq('id', user.id)
      .single()

    if (data) {
      setNickname(data.nickname || '')
      setSchool(data.school || '')
      setBio(data.bio || '')
    }
    setLoadingData(false)
  }

  const handleSave = async () => {
    if (!user) return
    if (!nickname.trim()) {
      showToast('error', '昵称不能为空')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        nickname: nickname.trim(),
        school: school.trim() || null,
        bio: bio.trim() || null,
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      showToast('error', '保存失败：' + error.message)
      return
    }

    localStorage.setItem('nickname', nickname.trim())
    showToast('success', '保存成功')
    setTimeout(() => router.push('/my'), 1500)
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-2 border-warm-200 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-wide">编辑个人信息</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="rounded-card p-4 bg-white">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm text-primary flex-shrink-0"><span className="text-red-500">*</span> 昵称</span>
              <input className="flex-1 input" placeholder="请输入昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm text-primary flex-shrink-0">学校</span>
              <input className="flex-1 input" placeholder="选填" value={school} onChange={(e) => setSchool(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm text-primary flex-shrink-0">简介</span>
              <input className="flex-1 input" placeholder="选填" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full disabled:opacity-50">
          {saving ? '保存中...' : '保存修改'}
        </button>
      </div>
    </div>
  )
}
