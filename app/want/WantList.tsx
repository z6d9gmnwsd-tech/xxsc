'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface WantBook {
  id: string
  title: string
  description: string
  max_price: number | null
  category: string
  grade: string
  subject: string
  status: string
  created_at: string
}

export default function WantList() {
  const [wants, setWants] = useState<WantBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWants()
  }, [])

  const fetchWants = async () => {
    const { data, error } = await supabase
      .from('want_books')
      .select('*')
      .eq('status', '求购中')
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setWants(data)
    }
    setLoading(false)
  }

  const getTimeAgo = (dateStr: string) => {
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

  const getCategoryTag = (category: string) => {
    switch (category) {
      case '教材': return 'tag-primary'
      case '考研': return 'tag-warning'
      case '考公': return 'tag-info'
      default: return 'tag-primary'
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-8 text-center text-gray-400">
        <div className="animate-spin text-2xl mb-2">⏳</div>
        加载中...
      </div>
    )
  }

  if (wants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-16">
        <span className="text-6xl mb-4">🔍</span>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">暂无求购信息</h2>
        <p className="text-gray-500 mb-6 text-center">登录后发布你的求购需求</p>
        <a href="/auth/login" className="btn-primary">登录 / 注册</a>
      </div>
    )
  }

  return (
    <div className="px-4 py-2">
      {wants.map((want) => (
        <div key={want.id} className="card p-4 mb-3 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{want.title}</h3>
              {want.description && (
                <p className="text-sm text-gray-500 mt-1">{want.description}</p>
              )}
              <div className="flex gap-1 mt-2 flex-wrap">
                <span className={`tag ${getCategoryTag(want.category)}`}>{want.category}</span>
                {want.grade && <span className="tag tag-info">{want.grade}</span>}
                {want.subject && <span className="tag tag-success">{want.subject}</span>}
              </div>
            </div>
            {want.max_price && (
              <div className="text-right ml-4">
                <div className="text-xs text-gray-400">预算</div>
                <div className="text-lg font-bold text-orange-500">¥{want.max_price}</div>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
            <span className="text-xs text-gray-400">{getTimeAgo(want.created_at)}</span>
            <span className="text-xs text-orange-500">💬 联系</span>
          </div>
        </div>
      ))}
    </div>
  )
}
