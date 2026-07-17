'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import { useRouter } from 'next/navigation'
import { getTimeAgo } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'
import BackButton from '@/components/BackButton'

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

  const getTimeAgoLocal = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  if (userLoading || loading) return <LoadingSpinner />

  if (!user) {
    return (
      <div className="pb-20">
        <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl font-bold">消息</h1>
          </div>
        </div>
        <EmptyState icon="💬" title="暂无消息" description="登录后查看消息" action={{ label: "登录 / 注册", href: "/my" }} />
        <BottomNav activePage="my" />
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold">消息</h1>
        </div>
      </div>

      {conversations.length === 0 ? (
        <EmptyState icon="💬" title="暂无消息" description="浏览商品时点击联系卖家开始聊天" />
      ) : (
        <div className="px-4 py-2">
          {conversations.map((conv) => (
            <a
              key={conv.otherUserId}
              href={`/chat?id=${conv.otherUserId}`}
              className="card flex items-center gap-3 mb-3 animate-fade-in block"
              style={{margin: '16px 0', padding: '28rpx'}}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{background: '#e0e0e0'}}>
                {conv.otherAvatar ? (
                  <img src={conv.otherAvatar} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-xl">👤</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium" style={{color: '#333'}}>{conv.otherNickname}</span>
                  <span className="text-xs" style={{color: '#999'}}>{getTimeAgoLocal(conv.lastTime)}</span>
                </div>
                <p className="text-sm mt-1 truncate" style={{color: '#666'}}>{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background: '#ffa06f', color: '#fff', fontSize: '10px'}}>
                  {conv.unread}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      <BottomNav activePage="my" />
    </div>
  )
}
