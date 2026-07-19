'use client'

import { useState } from 'react'
import { BookOpen, Search } from 'lucide-react'
import BookList from './BookList'
import BottomNav from '@/components/BottomNav'
import AuthModal from '@/components/AuthModal'
import FooterDisclaimer from '@/components/FooterDisclaimer'

type SortBy = 'newest' | 'price_asc' | 'price_desc'
type Category = '' | '教材' | '备考资料'

const CATEGORIES: { label: string; value: Category }[] = [
  { label: '全部', value: '' },
  { label: '教材', value: '教材' },
  { label: '备考资料', value: '备考资料' },
]

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: '最新', value: 'newest' },
  { label: '价格↑', value: 'price_asc' },
  { label: '价格↓', value: 'price_desc' },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', background: '#F2F2F7', paddingBottom: 80 }}>
      {/* Header */}
      <div className="header-glass px-4 py-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)'}}>
            <BookOpen size={18} style={{color: '#8B6914'}} />
          </div>
          <span className="text-lg font-bold" style={{color: '#1a1a1a'}}>新校书仓</span>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.04)'}}>
          <Search size={16} style={{color: '#bbb'}} />
          <input
            className="flex-1 text-sm"
            style={{border: 'none', background: 'transparent', outline: 'none', color: '#1a1a1a', fontFamily: 'inherit'}}
            placeholder="搜索书名、ISBN、科目..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto mt-3 pb-1" style={{scrollbarWidth: 'none'}}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
              style={{
                background: activeCategory === cat.value ? 'linear-gradient(135deg, #F5E6D0, #E0C9A8)' : '#f0f2f5',
                color: activeCategory === cat.value ? '#5D4E37' : '#666',
                border: `1px solid ${activeCategory === cat.value ? '#E0C9A8' : 'transparent'}`,
              }}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Row */}
        <div className="flex gap-2 mt-2">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: sortBy === opt.value ? 'rgba(139,105,20,0.08)' : 'transparent',
                color: sortBy === opt.value ? '#8B6914' : '#999',
                border: `1px solid ${sortBy === opt.value ? 'rgba(139,105,20,0.15)' : 'transparent'}`,
              }}
              onClick={() => setSortBy(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Book List */}
      <div className="mt-2">
        <BookList
          searchQuery={searchQuery}
          sortBy={sortBy}
          filterCategory={activeCategory}
        />
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
