'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import BookList from './BookList';
import BottomNav from '../components/BottomNav';

type SortBy = 'newest' | 'price_asc' | 'price_desc';
type Category = '' | '教材' | '备考资料';

const CATEGORIES: { label: string; value: Category }[] = [
  { label: '全部', value: '' },
  { label: '教材', value: '教材' },
  { label: '备考资料', value: '备考资料' },
];

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: '最新', value: 'newest' },
  { label: '价格↑', value: 'price_asc' },
  { label: '价格↓', value: 'price_desc' },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleBookClick = useCallback((book: any) => {
    router.push(`/detail?id=${book.id}`);
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F7', paddingBottom: 80 }}>
      <style>{`
        .home-header {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 12px 16px;
          padding-top: calc(12px + env(safe-area-inset-top, 0px));
          background: rgba(242,242,247,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .home-header-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .home-logo {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #5B8C5A, #4a7a49);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .home-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
        }
        .search-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(0,0,0,0.04);
        }
        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 15px;
          color: #1a1a1a;
          outline: none;
          font-family: inherit;
        }
        .search-input::placeholder {
          color: #bbb;
        }
        .category-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 12px 0 4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
        .category-pill {
          padding: 7px 18px;
          border-radius: 20px;
          border: 1px solid transparent;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .category-pill-active {
          background: #5B8C5A;
          color: #fff;
          border-color: #5B8C5A;
        }
        .category-pill-inactive {
          background: #f0f2f5;
          color: #666;
          border-color: transparent;
        }
        .sort-row {
          display: flex;
          gap: 8px;
          padding: 8px 0;
        }
        .sort-pill {
          padding: 5px 12px;
          border-radius: 12px;
          border: 1px solid transparent;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sort-pill-active {
          background: rgba(91,140,90,0.1);
          color: #5B8C5A;
          border-color: rgba(91,140,90,0.2);
        }
        .sort-pill-inactive {
          background: transparent;
          color: #999;
          border-color: transparent;
        }
        .sort-pill-inactive:active {
          background: #f0f2f5;
        }
      `}</style>

      {/* Header */}
      <header className="home-header">
        <div className="home-header-top">
          <div className="home-logo">
            <BookOpen size={18} color="#fff" strokeWidth={1.5} />
          </div>
          <span className="home-title">新校书仓</span>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <Search size={18} color="#999" />
          <input
            className="search-input"
            placeholder="搜索书名、ISBN、科目..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="category-scroll">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className={`category-pill ${
                activeCategory === cat.value
                  ? 'category-pill-active'
                  : 'category-pill-inactive'
              }`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Row */}
        <div className="sort-row">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`sort-pill ${
                sortBy === opt.value ? 'sort-pill-active' : 'sort-pill-inactive'
              }`}
              onClick={() => setSortBy(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      {/* Book List */}
      <BookList
        searchQuery={searchQuery}
        sortBy={sortBy}
        filterCategory={activeCategory}
        onBookClick={handleBookClick}
      />

      {/* Bottom Nav */}
      <BottomNav activePage="home" />
    </div>
  );
}
