'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'
import AuthModal from '@/components/AuthModal'

interface Profile {
  nickname: string
  school: string
  bio: string
  avatar_url: string
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

  if (userLoading || loading) return <LoadingSpinner />
  if (!user) return null

  return (
    <div className="pb-20">
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold">编辑个人信息</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl text-center">{success}</div>
        )}

        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">头像链接</label>
          <input
            className="input"
            placeholder="https://图片链接"
            value={profile.avatar_url}
            onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">昵称</label>
          <input
            className="input"
            placeholder="设置你的昵称"
            value={profile.nickname}
            onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">学校</label>
          <input
            className="input"
            placeholder="你的学校名称"
            value={profile.school}
            onChange={(e) => setProfile({ ...profile, school: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">个人简介</label>
          <textarea
            className="input min-h-[80px]"
            placeholder="简单介绍一下自己"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
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
