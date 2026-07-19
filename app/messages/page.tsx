'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import { MessageSquare, User } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'
import { SkeletonCard } from '@/components/LoadingSpinner'
import { ChevronLeft } from 'lucide-react'

interface Conversation {
  otherUserId: string
  otherNickname: string
  otherAvatar: string | null
  lastMessage: string
  lastTime: string
  unread: number
}

export default function MessagesPage() {
  const { user, loading: userLoading } = usePhoneAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && user) {
      fetchConversations()
    }
    if (!userLoading && !user) {
      setLoading(false)
    }
  }, [user, userLoading])

  const fetchConversations = async () => {
    if (!user) return

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!messages) {
      setLoading(false)
      return
    }

    const convMap = new Map<string, Conversation>()
    for (const msg of messages) {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          otherUserId: otherId,
          otherNickname: '',
          otherAvatar: null,
          lastMessage: msg.content,
          lastTime: msg.created_at,
          unread: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
        })
      } else {
        const conv = convMap.get(otherId)!
        if (msg.receiver_id === user.id && !msg.is_read) conv.unread++
      }
    }

    const convArray = Array.from(convMap.values())
    if (convArray.length > 0) {
      const ids = convArray.map(c => c.otherUserId)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .in('id', ids)

      if (profiles) {
        for (const conv of convArray) {
          const p = profiles.find(p => p.id === conv.otherUserId)
          if (p) {
            conv.otherNickname = p.nickname || '匿名用户'
            conv.otherAvatar = p.avatar_url
          }
        }
      }
    }

    setConversations(convArray)
    setLoading(false)
  }

  if (userLoading || loading) return <SkeletonCard />

  if (!user) {
    return (
      <div className="pb-24 min-h-screen" style={{ background: '#F2F2F7' }}>
        <div className="header-glass px-4 py-5 text-white">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'rgba(255,255,255,0.15)'}}>
              <ChevronLeft size={20} />
            </button>
            <MessageSquare size={20} />
            <h1 className="text-lg font-bold">消息</h1>
          </div>
        </div>
        <EmptyState
          icon={<MessageSquare size={32} style={{color: '#5B8C5A'}} />}
          title="暂无消息"
          description="登录后查看消息"
          action={{ label: "登录 / 注册", href: "/my" }}
        />
        <BottomNav activeTab="profile" />
      </div>
    )
  }

  return (
    <div className="pb-24 min-h-screen" style={{ background: '#F2F2F7' }}>
      <div className="header-glass px-4 py-5 text-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'rgba(255,255,255,0.15)'}}>
            <ChevronLeft size={20} />
          </button>
          <MessageSquare size={20} />
          <h1 className="text-lg font-bold">消息</h1>
        </div>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={32} style={{color: '#5B8C5A'}} />}
          title="暂无消息"
          description="浏览商品时点击联系卖家开始聊天"
        />
      ) : (
        <div className="px-4 py-2">
          {conversations.map((conv) => (
            <a
              key={conv.otherUserId}
              href={`/chat?id=${conv.otherUserId}`}
              className="card flex items-center gap-3 mb-3 block"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #5B8C5A, #40916C)'}}>
                {conv.otherAvatar ? (
                  <img src={conv.otherAvatar} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User size={20} color="#fff" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm" style={{color: '#1a1a1a'}}>{conv.otherNickname}</span>
                  <span className="text-[11px]" style={{color: '#bbb'}}>{conv.lastTime}</span>
                </div>
                <p className="text-xs mt-1 truncate" style={{color: '#666'}}>{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <div className="min-w-[20px] h-5 rounded-full flex items-center justify-center flex-shrink-0 px-1.5" style={{background: '#E8590C', color: '#fff', fontSize: '10px', fontWeight: 600}}>
                  {conv.unread}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      <BottomNav activeTab="profile" />
    </div>
  )
}
