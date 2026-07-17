'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'

interface Profile {
  nickname: string
  school: string
  major: string
  bio: string
  avatar_url: string
}

export default function EditProfilePage() {
  const { user, loading: userLoading } = usePhoneAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>({ nickname: '', school: '', major: '', bio: '', avatar_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login')
    }
    if (user) fetchProfile()
  }, [user, userLoading])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single()

    if (data) {
      setProfile({
        nickname: data.nickname || '',
        school: data.school || '',
        major: data.major || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || ''
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        nickname: profile.nickname,
        school: profile.school,
        major: profile.major,
        bio: profile.bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (!error) {
      setSuccess('保存成功！')
      setTimeout(() => {
        setSuccess('')
        router.back()
      }, 1500)
    }
    setSaving(false)
  }

  if (userLoading || loading) return <LoadingSpinner />
  if (!user) return null

  return (
    <div className="pb-20">
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold">编辑个人信息</h1>
        </div>
      </div>

      <div className="p-4">
        {success && (
          <div className="mb-4 p-3 rounded-xl text-center text-sm" style={{background: '#e8f8f0', color: '#27ae60'}}>
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{background: '#fff'}}>
            <div className="mb-3">
              <label className="block text-sm mb-2" style={{color: '#666'}}>昵称</label>
              <input
                type="text"
                className="input"
                placeholder="请输入昵称"
                value={profile.nickname}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-2" style={{color: '#666'}}>学校</label>
              <input
                type="text"
                className="input"
                placeholder="请输入学校名称"
                value={profile.school}
                onChange={(e) => setProfile({ ...profile, school: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-2" style={{color: '#666'}}>专业</label>
              <input
                type="text"
                className="input"
                placeholder="请输入专业名称"
                value={profile.major}
                onChange={(e) => setProfile({ ...profile, major: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{color: '#666'}}>个人简介</label>
              <textarea
                className="input min-h-[100px]"
                placeholder="介绍一下自己..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full mt-6 disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
