'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import BookList from './BookList'
import BottomNav from '@/components/BottomNav'
import Toast from '@/components/Toast'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [filterCategory, setFilterCategory] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<{ id: string; title: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searched, setSearched] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const categories = ['教材', '备考资料']

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false) }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try { const { data } = await supabase.from('books').select('id, title').ilike('title', `%${query}%`).eq('status', '在售').limit(5); setSuggestions(data || []) } catch { setSuggestions([]) }
    }, 300)
  }, [])

  const handleInputChange = (value: string) => { setInputValue(value); fetchSuggestions(value); setShowSuggestions(true) }
  const handleSearch = useCallback((query?: string) => { setSearchQuery(query || inputValue); setShowSuggestions(false); setSearched(true) }, [inputValue])
  const handleSelectSuggestion = (title: string) => { setInputValue(title); handleSearch(title) }

  const sortOptions = [
    { key: 'newest' as const, label: '最新' },
    { key: 'price_asc' as const, label: '价格↑' },
    { key: 'price_desc' as const, label: '价格↓' },
  ]

  return (
    <div className="pb-24 min-h-screen" style={{ backgroundColor: '#F8F6F2' }}>
      <Toast />

      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0DEBF 0%, #E8D0A8 40%, #D4B88A 100%)' }}>
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)' }} />
        <div className="relative px-4 py-6 text-white safe-area-top">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
              <span className="text-2xl">📚</span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-wide" style={{ color: '#333' }}>新校书仓</h1>
              <p className="text-sm mt-0.5" style={{ color: '#666' }}>校园二手教材交易平台</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-white" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }} ref={searchRef}>
        <div className="flex gap-2.5 relative">
          <div className="flex-1 relative">
            <input className="input pl-10" placeholder="搜索书名、ISBN、资料名" value={inputValue} onChange={e => handleInputChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }} />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#999' }}><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" /><path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl z-50" style={{ border: '1px solid #E5E5E5', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                {suggestions.map(s => <div key={s.id} className="px-4 py-3 text-sm cursor-pointer active:bg-gray-50 border-b border-gray-50 last:border-0 truncate" style={{ color: '#333' }} onClick={() => handleSelectSuggestion(s.title)}>{s.title}</div>)}
              </div>
            )}
          </div>
          <button className="btn-primary px-5" onClick={() => handleSearch()}>搜索</button>
        </div>
      </div>

      <div className="px-4 py-3">
        <a href="/publish" className="rounded-xl flex items-center gap-3 p-4 active:scale-[0.98] transition-all duration-200 bg-white" style={{ border: '1px solid #E5E5E5' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F6C12C 0%, #D4A517 100%)', boxShadow: '0 4px 12px rgba(246,193,44,0.25)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold" style={{ color: '#333' }}>卖书</div>
            <div className="text-xs mt-0.5" style={{ color: '#999' }}>一键发布闲置教材</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: '#999' }}><path d="M7 5L12 10L7 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 mb-1">
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
          style={{ backgroundColor: filterCategory ? '#F6C12C' : '#FFFFFF', color: filterCategory ? '#FFFFFF' : '#666666', border: filterCategory ? 'none' : '1px solid #E5E5E5' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 2H13M3 7H11M5 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>筛选
        </button>
        {sortOptions.map(item => (
          <button key={item.key} onClick={() => setSortBy(item.key)} className="px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
            style={{ backgroundColor: sortBy === item.key ? '#F6C12C' : '#FFFFFF', color: sortBy === item.key ? '#FFFFFF' : '#666666', border: sortBy === item.key ? 'none' : '1px solid #E5E5E5' }}>
            {item.label}
          </button>
        ))}
      </div>

      {showFilter && (
        <div className="px-4 py-3 bg-white animate-slide-down" style={{ borderBottom: '1px solid #E5E5E5' }}>
          <div className="text-xs mb-2.5 font-medium" style={{ color: '#999' }}>选择分类</div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilterCategory('')} className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
              style={{ backgroundColor: !filterCategory ? '#F6C12C' : '#F8F6F2', color: !filterCategory ? '#FFFFFF' : '#666', border: !filterCategory ? 'none' : '1px solid #E5E5E5' }}>全部</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)} className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                style={{ backgroundColor: filterCategory === cat ? '#F6C12C' : '#F8F6F2', color: filterCategory === cat ? '#FFFFFF' : '#666', border: filterCategory === cat ? 'none' : '1px solid #E5E5E5' }}>{cat}</button>
            ))}
          </div>
        </div>
      )}

      <BookList searchQuery={searchQuery} sortBy={sortBy} filterCategory={filterCategory} searched={searched} />
      <BottomNav />
    </div>
  )
}
