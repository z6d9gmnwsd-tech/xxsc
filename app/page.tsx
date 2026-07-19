'use client'

import { useState } from 'react'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import BookList from './BookList'
import BottomNav from '@/components/BottomNav'
import AuthModal from '@/components/AuthModal'
import FooterDisclaimer from '@/components/FooterDisclaimer'

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
    <div>
      {/* 头部 */}
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-wide">新校书仓</h1>
            <p className="text-sm opacity-80">校园二手教材交易平台</p>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="px-4 py-3 bg-white">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="搜索书名、ISBN、资料名"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchQuery((e.target as HTMLInputElement).value)}
          />
          <button className="btn-primary px-4" onClick={() => setSearchQuery(searchQuery)}>搜索</button>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="flex gap-3 px-4 py-3">
        <div onClick={() => handleAction('want')} className="flex-1 flex items-center gap-3 p-4 rounded-2xl cursor-pointer" style={{background: 'linear-gradient(135deg, #FBF8F3, #F5E6D0)', border: '1px solid #E0C9A8'}}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)'}}>
            <span className="text-xl">🔍</span>
          </div>
          <div>
            <div className="font-semibold" style={{color: '#2d3436'}}>求购广场</div>
            <div className="text-xs" style={{color: '#b2bec3'}}>发布你的需求</div>
          </div>
        </div>
        <div onClick={() => handleAction('publish')} className="flex-1 flex items-center gap-3 p-4 rounded-2xl cursor-pointer" style={{background: 'linear-gradient(135deg, #FBF8F3, #F5E6D0)', border: '1px solid #E0C9A8'}}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #ffa06f, #E5D5BF)'}}>
            <span className="text-xl">📖</span>
          </div>
          <div>
            <div className="font-semibold" style={{color: '#2d3436'}}>卖书</div>
            <div className="text-xs" style={{color: '#b2bec3'}}>一键发布闲置</div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-2 px-4 py-3 mb-2" style={{background: '#fff'}}>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-sm"
          style={{
            background: filterCategory ? '#F5E6D0' : '#f0f2f5',
            color: filterCategory ? '#fff' : '#636e72',
            border: `1px solid ${filterCategory ? '#F5E6D0' : '#e0e0e0'}`
          }}
        >
          <span>🔍</span> 筛选
        </button>
        <button
          onClick={() => setSortBy('price_asc')}
          className="px-3 py-2 rounded-full text-sm"
          style={{
            background: sortBy === 'price_asc' ? '#F5E6D0' : '#f0f2f5',
            color: sortBy === 'price_asc' ? '#fff' : '#636e72',
            border: `1px solid ${sortBy === 'price_asc' ? '#F5E6D0' : '#e0e0e0'}`
          }}
        >
          价格↑
        </button>
        <button
          onClick={() => setSortBy('price_desc')}
          className="px-3 py-2 rounded-full text-sm"
          style={{
            background: sortBy === 'price_desc' ? '#F5E6D0' : '#f0f2f5',
            color: sortBy === 'price_desc' ? '#fff' : '#636e72',
            border: `1px solid ${sortBy === 'price_desc' ? '#F5E6D0' : '#e0e0e0'}`
          }}
        >
          价格↓
        </button>
        {sortBy !== 'newest' && (
          <button
            onClick={() => setSortBy('newest')}
            className="px-3 py-2 rounded-full text-sm"
            style={{background: '#f0f2f5', color: '#636e72', border: '1px solid #e0e0e0'}}
          >
            最新
          </button>
        )}
      </div>

      {/* 分类筛选 */}
      {showFilter && (
        <div className="px-4 py-3 border-b" style={{background: '#fff', borderColor: '#f0f0f0'}}>
          <div className="text-xs mb-2" style={{color: '#999'}}>选择分类</div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('')}
              className="px-3 py-1.5 rounded-full text-xs"
              style={{
                background: !filterCategory ? '#F5E6D0' : '#f0f2f5',
                color: !filterCategory ? '#fff' : '#636e72',
                border: `1px solid ${!filterCategory ? '#F5E6D0' : '#e0e0e0'}`
              }}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{
                  background: filterCategory === cat ? '#F5E6D0' : '#f0f2f5',
                  color: filterCategory === cat ? '#fff' : '#636e72',
                  border: `1px solid ${filterCategory === cat ? '#F5E6D0' : '#e0e0e0'}`
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 商品列表 */}
      <div className="pb-20">
        <BookList searchQuery={searchQuery} sortBy={sortBy} filterCategory={filterCategory} />
      </div>

      <FooterDisclaimer />

      <BottomNav activeTab="home" />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {}}
      />
    </div>
  )
}
