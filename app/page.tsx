'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import BookCard from '@/components/BookCard';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

const categories = ['全部', '教材', '备考资料', '考研', '四六级', '计算机', '文学'];

const sortOptions = [
  { id: 'latest', label: '最新' },
  { id: 'price_asc', label: '价格↑' },
  { id: 'price_desc', label: '价格↓' },
];

// Mock data
const mockBooks = [
  {
    id: '1',
    title: '高等数学（第七版）上册',
    price: 15.0,
    condition: '九成新',
    thumbnail: '',
    tags: ['教材', '考研'],
  },
  {
    id: '2',
    title: '大学英语综合教程4（第二版）',
    price: 12.5,
    condition: '八成新',
    thumbnail: '',
    tags: ['教材', '四六级'],
  },
  {
    id: '3',
    title: '数据结构（C语言版）清华大学出版社',
    price: 18.0,
    condition: '全新',
    thumbnail: '',
    tags: ['教材', '计算机'],
  },
  {
    id: '4',
    title: '线性代数及其应用（第五版）',
    price: 8.0,
    condition: '七成新及以下',
    thumbnail: '',
    tags: ['教材'],
  },
  {
    id: '5',
    title: '考研英语词汇闪过',
    price: 22.0,
    condition: '九成新',
    thumbnail: '',
    tags: ['备考资料', '考研'],
  },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeSort, setActiveSort] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === 'favorites') {
      window.location.href = '/favorites';
    } else if (tab === 'profile') {
      window.location.href = '/my';
    }
  };

  const handlePublish = () => {
    window.location.href = '/publish';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header-glass safe-area-top">
        <div className="px-4 pt-3 pb-3">
          {/* Brand + Title */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #5B8C5A, #40916C)',
              }}
            >
              <BookOpen size={18} color="#FFFFFF" strokeWidth={2} />
            </div>
            <h1 className="text-lg font-semibold" style={{ color: '#333333' }}>
              校书仓
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={18}
              color="#999999"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="搜索书名、ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{
                paddingLeft: 38,
                paddingRight: 14,
                height: 40,
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(242, 242, 247, 0.8)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(242, 242, 247, 0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div className="px-4 pt-3 pb-2">
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="tag whitespace-nowrap"
                style={{
                  background:
                    activeCategory === cat
                      ? 'var(--color-primary)'
                      : 'rgba(255, 255, 255, 0.8)',
                  color:
                    activeCategory === cat ? '#FFFFFF' : 'var(--color-text-secondary)',
                  padding: '5px 14px',
                  fontSize: 13,
                  fontWeight: activeCategory === cat ? 600 : 400,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Buttons */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} color="#999999" />
            <div className="flex gap-3">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setActiveSort(opt.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: 13,
                    color:
                      activeSort === opt.id
                        ? 'var(--color-primary)'
                        : 'var(--color-text-tertiary)',
                    fontWeight: activeSort === opt.id ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3">
        {loading ? (
          <LoadingSpinner />
        ) : mockBooks.length === 0 ? (
          <EmptyState
            icon="book"
            title="暂无书籍"
            description="还没有人发布书籍，快来发布第一本吧"
            action={{ label: '去发布', href: '/publish' }}
          />
        ) : (
          <div className="space-y-3">
            {mockBooks.map((book, index) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                price={book.price}
                condition={book.condition}
                thumbnail={book.thumbnail}
                tags={book.tags}
                index={index}
                onClick={() => (window.location.href = `/book/${book.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <BottomNav
        activeTab="home"
        onTabChange={handleTabChange}
        onPublish={handlePublish}
      />
    </div>
  );
}
