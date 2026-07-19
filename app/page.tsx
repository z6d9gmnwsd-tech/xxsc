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

  return (
    <div className="pb-20">
      <Toast />

      {/* 顶部渐变头 */}
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-primary px-4" onClick={handleSearch}>
            搜索
          </button>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="px-4 py-3">
        <a
          href="/publish"
          className="flex items-center gap-3 p-4 rounded-card card active:scale-[0.98] transition-transform duration-150"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-accent to-accent-dark">
            <span className="text-xl text-white">📖</span>
          </div>
          <div>
            <div className="font-semibold text-primary">卖书</div>
            <div className="text-xs text-light">一键发布闲置教材</div>
          </div>
          <div className="ml-auto text-light">›</div>
        </a>
      </div>

      {/* 筛选与排序 */}
      <div className="flex items-center gap-2 px-4 py-3 mb-2 bg-white">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-sm transition-all duration-200 active:scale-95"
          style={{
            background: filterCategory ? '#F5E6D0' : '#f0f2f5',
            color: filterCategory ? '#fff' : '#636e72',
            border: `1px solid ${filterCategory ? '#F5E6D0' : '#e0e0e0'}`
          }}
        >
          <span>🔍</span> 筛选
        </button>
        {[
          { key: 'price_asc' as const, label: '价格↑' },
          { key: 'price_desc' as const, label: '价格↓' },
          { key: 'newest' as const, label: '最新' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setSortBy(item.key)}
            className="px-3 py-2 rounded-full text-sm transition-all duration-200 active:scale-95"
            style={{
              background: sortBy === item.key ? '#F5E6D0' : '#f0f2f5',
              color: sortBy === item.key ? '#fff' : '#636e72',
              border: `1px solid ${sortBy === item.key ? '#F5E6D0' : '#e0e0e0'}`
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 分类筛选展开 */}
      {showFilter && (
        <div className="px-4 py-3 border-b bg-white border-gray-100 animate-slide-down">
          <div className="text-xs mb-2 text-gray-400">选择分类</div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('')}
              className="px-3 py-1.5 rounded-full text-xs transition-all duration-200 active:scale-95"
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
                className="px-3 py-1.5 rounded-full text-xs transition-all duration-200 active:scale-95"
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
      <BookList searchQuery={searchQuery} sortBy={sortBy} filterCategory={filterCategory} />

      <BottomNav />
    </div>
  )
}
