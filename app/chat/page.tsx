'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { getTimeAgo } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import AuthModal from '@/components/AuthModal'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface Profile {
  nickname: string
  avatar_url: string | null
}

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: userLoading } = usePhoneAuth()
  const targetId = searchParams.get('id')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userLoading && !user) {
      setShowAuthModal(true)
    }
    if (user && targetId) {
      loadMessages()
      loadProfile()
      markAsRead()
    }
  }, [user, userLoading, targetId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${user!.id})`)
      .order('created_at', { ascending: true })
      .limit(100)
    if (data) setMessages(data)
    setLoading(false)
  }

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', targetId).single()
    setOtherProfile(data)
  }

  const markAsRead = async () => {
    await supabase.from('messages').update({ is_read: true }).eq('sender_id', targetId).eq('receiver_id', user!.id).eq('is_read', false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      sender_id: user!.id, receiver_id: targetId, content: newMessage.trim(),
    })
    if (!error) {
      setMessages([...messages, {
        id: Date.now().toString(), sender_id: user!.id, receiver_id: targetId!,
        content: newMessage.trim(), is_read: false, created_at: new Date().toISOString(),
      }])
      setNewMessage('')
    }
    setSending(false)
  }

  if (userLoading || loading) return <LoadingSpinner />
  if (!user || !targetId) return null

  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 py-4 text-white flex items-center gap-3 flex-shrink-0" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <button onClick={() => router.back()} className="text-white text-xl">‹</button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden" style={{background: 'rgba(255,255,255,0.2)'}}>
          {otherProfile?.avatar_url ? <img src={otherProfile.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-sm">👤</span>}
        </div>
        <span className="font-medium">{otherProfile?.nickname || '匿名用户'}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{background: '#f5f5f5'}}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm" style={{
              background: msg.sender_id === user.id ? '#ffa06f' : '#fff',
              color: msg.sender_id === user.id ? '#fff' : '#333',
              borderRadius: msg.sender_id === user.id ? '24rpx 24rpx 8rpx 24rpx' : '24rpx 24rpx 24rpx 8rpx',
              boxShadow: '0 2rpx 16rpx rgba(0, 0, 0, 0.04)'
            }}>
              <p>{msg.content}</p>
              <div className="text-xs mt-1" style={{color: msg.sender_id === user.id ? 'rgba(255,255,255,0.7)' : '#999'}}>{getTimeAgo(msg.created_at)}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 p-3 flex gap-2" style={{background: 'rgba(255, 255, 255, 0.95)', borderTop: '1px solid #e0e0e0'}}>
        <input className="flex-1 input" placeholder="输入消息..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
        <button onClick={sendMessage} disabled={!newMessage.trim() || sending} className="btn-primary px-5 disabled:opacity-50">发送</button>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ChatContent />
    </Suspense>
  )
}
