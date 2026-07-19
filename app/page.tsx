'use client'

import { useState, useCallback } from 'react'
import BookList from './BookList'
import BottomNav from '@/components/BottomNav'
import Toast from '@/components/Toast'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [filterCategory, setFilterCategory] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const categories = ['教材', '备考资料']

  const handleSearch = useCallback(() => {
    setSearchQuery(inputValue)
  }, [inputValue])

  const sortOptions = [
    { key: 'newest' as const, label: '最新' },
    { key: 'price_asc' as const, label: '价格↑' },
    { key: 'price_desc' as const, label: '价格↓' },
  ]

  return (
    <div className="pb-24 min-h-screen" style={{ backgroundColor: '#FEFCF9' }}>
      <Toast />

      {/* 顶部渐变头 */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(145deg, #FF8C5A 0%, #FF7A45 30%, #FF6B35 70%, #E5784A 100%)',
          }}
        />
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)' }}
        />

        <div className="relative px-4 py-6 text-white safe-area-top">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)' }}
            >
              <span className="text-2xl">📚</span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-wide">新校书仓</h1>
              <p className="text-sm opacity-80 mt-0.5">校园二手教材交易平台</p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="px-4 py-3 bg-white" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div className="flex gap-2.5">
          <div className="flex-1 relative">
            <input
              className="input pl-10"
              placeholder="搜索书名、ISBN、资料名"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ color: '#9CA3AF' }}
            >
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <button className="btn-primary px-5 ripple" onClick={handleSearch}>搜索</button>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="px-4 py-3">
        <a href="/publish" className="card flex items-center gap-3 p-4 active:scale-[0.98] transition-all duration-200">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF8C5A 0%, #FF6B35 100%)', boxShadow: '0 4px 12px rgba(255, 140, 90, 0.25)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold" style={{ color: '#1A1A1A' }}>卖书</div>
            <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>一键发布闲置教材</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: '#9CA3AF' }}>
            <path d="M7 5L12 10L7 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* 筛选与排序 */}
      <div className="flex items-center gap-2 px-4 py-2.5 mb-1">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: filterCategory ? '#FF8C5A' : '#FFFFFF',
            color: filterCategory ? '#FFFFFF' : '#6B7280',
            border: filterCategory ? 'none' : '1px solid #F0E6D8',
            boxShadow: filterCategory ? '0 2px 8px rgba(255, 140, 90, 0.25)' : 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 2H13M3 7H11M5 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          筛选
        </button>

        {sortOptions.map((item) => (
          <button
            key={item.key}
            onClick={() => setSortBy(item.key)}
            className="px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: sortBy === item.key ? '#FF8C5A' : '#FFFFFF',
              color: sortBy === item.key ? '#FFFFFF' : '#6B7280',
              border: sortBy === item.key ? 'none' : '1px solid #F0E6D8',
              boxShadow: sortBy === item.key ? '0 2px 8px rgba(255, 140, 90, 0.25)' : 'none',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 分类筛选展开 */}
      {showFilter && (
        <div className="px-4 py-3 bg-white animate-slide-down" style={{ borderBottom: '1px solid #F0E6D8' }}>
          <div className="text-xs mb-2.5 font-medium" style={{ color: '#9CA3AF' }}>选择分类</div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('')}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: !filterCategory ? '#FF8C5A' : '#FEFCF9',
                color: !filterCategory ? '#FFFFFF' : '#6B7280',
                border: !filterCategory ? 'none' : '1px solid #F0E6D8',
              }}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                style={{
                  backgroundColor: filterCategory === cat ? '#FF8C5A' : '#FEFCF9',
                  color: filterCategory === cat ? '#FFFFFF' : '#6B7280',
                  border: filterCategory === cat ? 'none' : '1px solid #F0E6D8',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 商品列表 */}
      <BookList searchQuery={searchQuery} sortBy={sortBy} filterCategory={filterCategory} />

      <BottomNav />
    </div>
  )
}
