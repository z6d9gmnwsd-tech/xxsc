'use client'

import { useState } from 'react'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import BookList from './BookList'
import BottomNav from '@/components/BottomNav'
import AuthModal from '@/components/AuthModal'
import { Search, ArrowRightLeft, BookOpen } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = usePhoneAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [filterCategory, setFilterCategory] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const categories = ['教材', '考研', '考公', '技能证书', '其他']

  const handleAction = (action: string) => {
    if (!user) {
      if (confirm('该功能需要登录后才能使用，是否前往登录？')) {
        window.location.href = '/my'
      }
      return
    }
    if (action === 'publish') {
      window.location.href = '/publish'
    } else if (action === 'want') {
      window.location.href = '/want'
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="header-glass px-4 py-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background: 'rgba(255,255,255,0.2)'}}>
            <BookOpen size={20} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-wide">新校书仓</h1>
            <p className="text-xs" style={{opacity: 0.7}}>校园二手教材交易平台</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3" style={{background: '#fff'}}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color: '#bbb'}} />
            <input
              className="input pl-9"
              style={{paddingTop: '10px', paddingBottom: '10px'}}
              placeholder="搜索书名、ISBN、资料名"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchQuery((e.target as HTMLInputElement).value)}
            />
          </div>
          <button className="btn-primary px-5" onClick={() => setSearchQuery(searchQuery)}>搜索</button>
        </div>
      </div>

      <div className="flex gap-3 px-4 py-4">
        <div onClick={() => handleAction('want')} className="flex-1 flex items-center gap-3 p-4 rounded-2xl cursor-pointer card-interactive" style={{background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(224,213,200,0.5)'}}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)'}}>
            <ArrowRightLeft size={18} style={{color: '#8B6914'}} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{color: '#1a1a1a'}}>求购广场</div>
            <div className="text-[11px]" style={{color: '#999'}}>发布你的需求</div>
          </div>
        </div>
        <div onClick={() => handleAction('publish')} className="flex-1 flex items-center gap-3 p-4 rounded-2xl cursor-pointer card-interactive" style={{background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(224,213,200,0.5)'}}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #ffa06f, #E5D5BF)'}}>
            <BookOpen size={18} style={{color: '#fff'}} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{color: '#1a1a1a'}}>卖书</div>
            <div className="text-[11px]" style={{color: '#999'}}>一键发布闲置</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 mb-2" style={{background: '#fff'}}>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
          style={{
            background: filterCategory ? 'linear-gradient(135deg, #F5E6D0, #E0C9A8)' : '#f5f5f5',
            color: filterCategory ? '#fff' : '#666',
          }}
        >
          <Search size={12} /> 筛选
        </button>
        {['price_asc', 'price_desc', 'newest'].map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s as any)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
            style={{
              background: sortBy === s ? 'linear-gradient(135deg, #F5E6D0, #E0C9A8)' : '#f5f5f5',
              color: sortBy === s ? '#fff' : '#666',
            }}
          >
            {s === 'price_asc' ? '价格↑' : s === 'price_desc' ? '价格↓' : '最新'}
          </button>
        ))}
      </div>

      {showFilter && (
        <div className="px-4 py-3 border-b animate-slide-down" style={{background: '#fff', borderColor: '#f0f0f0'}}>
          <div className="text-[11px] mb-2 font-medium" style={{color: '#999'}}>选择分类</div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('')}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
              style={{
                background: !filterCategory ? 'linear-gradient(135deg, #F5E6D0, #E0C9A8)' : '#f5f5f5',
                color: !filterCategory ? '#fff' : '#666',
              }}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                style={{
                  background: filterCategory === cat ? 'linear-gradient(135deg, #F5E6D0, #E0C9A8)' : '#f5f5f5',
                  color: filterCategory === cat ? '#fff' : '#666',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pb-20">
        <BookList searchQuery={searchQuery} sortBy={sortBy} filterCategory={filterCategory} />
      </div>

      <BottomNav activePage="home" />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {}}
      />
    </div>
  )
}
