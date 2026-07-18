'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import { User, Save, Loader2, X } from 'lucide-react'

interface Profile {
  nickname: string
  school: string
  bio: string
  avatar_url: string
}

function ProfileSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 rounded-full skeleton" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-16 skeleton rounded-lg" />
          <div className="h-12 w-full skeleton rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export default function EditProfilePage() {
  const { user, loading: userLoading } = usePhoneAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>({ nickname: '', school: '', bio: '', avatar_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

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
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nickname: profile.nickname,
        school: profile.school,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id)

    if (updateError) {
      setError('保存失败：' + updateError.message)
    } else {
      setSuccess('保存成功！')
      setTimeout(() => router.push('/my'), 1500)
    }
    setSaving(false)
  }

  if (userLoading || loading) {
    return (
      <div style={{ background: '#F2F2F7', minHeight: '100vh' }}>
        <div
          className="header-glass px-4 py-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl font-bold">编辑个人信息</h1>
          </div>
        </div>
        <ProfileSkeleton />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="pb-20" style={{ background: '#F2F2F7', minHeight: '100vh' }}>
      <div
        className="header-glass px-4 py-6 text-white"
        style={{
          background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex items-center gap-2">
            <User size={20} />
            <h1 className="text-xl font-bold">编辑个人信息</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div
            className="p-3 rounded-2xl flex items-center gap-2 text-sm animate-fade-in"
            style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30' }}
          >
            <X size={16} />
            {error}
          </div>
        )}
        {success && (
          <div
            className="p-3 rounded-2xl text-sm text-center animate-fade-in"
            style={{ background: 'rgba(52,199,89,0.08)', color: '#34C759' }}
          >
            {success}
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden mb-2"
            style={{
              background: profile.avatar_url
                ? 'transparent'
                : 'linear-gradient(135deg, #F5E6D0, #E0C9A8)',
            }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={32} color="#fff" />
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>头像链接</label>
              <input
                className="input"
                placeholder="https://图片链接"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>昵称</label>
              <input
                className="input"
                placeholder="设置你的昵称"
                value={profile.nickname}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>学校</label>
              <input
                className="input"
                placeholder="你的学校名称"
                value={profile.school}
                onChange={(e) => setProfile({ ...profile, school: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>个人简介</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="简单介绍一下自己"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save size={16} />
              保存
            </>
          )}
        </button>
      </div>
    </div>
  )
}
