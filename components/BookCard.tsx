'use client';

import { useMemo } from 'react';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    price: number;
    cover_url?: string;
    image_url?: string;
    category?: string;
    condition?: string;
    grade?: string;
    subject?: string;
    created_at: string;
    [key: string]: any;
  };
  index?: number;
  onClick?: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
  return `${Math.floor(diff / 2592000)}月前`;
}

const conditionStyles: Record<string, { bg: string; text: string }> = {
  '全新': { bg: 'rgba(45,106,79,0.1)', text: '#2D6A4F' },
  '九成新': { bg: 'rgba(139,105,20,0.1)', text: '#8B6914' },
  '八成新': { bg: 'rgba(212,160,23,0.1)', text: '#C49A00' },
  '七成新及以下': { bg: 'rgba(0,0,0,0.05)', text: '#999' },
};

export default function BookCard({ book, index = 0, onClick }: BookCardProps) {
  const condStyle = useMemo(() => {
    return conditionStyles[book.condition || ''] || { bg: '#f5f5f5', text: '#666' };
  }, [book.condition]);

  const thumbUrl = book.image_url || book.cover_url || '';

  return (
    <a
      href={`/detail?id=${book.id}`}
      className="card card-interactive"
      style={{
        display: 'flex',
        gap: 10,
        padding: 10,
        marginBottom: 10,
        textDecoration: 'none',
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 120, height: 90, borderRadius: 8, overflow: 'hidden', background: '#f0ebe4' }}>
          {thumbUrl ? (
            <img src={thumbUrl} alt={book.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                <path d="M8 7h6"/><path d="M8 11h8"/>
              </svg>
            </div>
          )}
        </div>
        {book.condition && (
          <span style={{
            position: 'absolute', top: 4, left: 4,
            fontSize: 10, padding: '2px 6px', borderRadius: 6,
            background: condStyle.bg, color: condStyle.text,
            fontWeight: 500, lineHeight: '14px',
          }}>
            {book.condition}
          </span>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
          {book.title}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflow: 'hidden' }}>
          {book.category && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: 'rgba(245,230,208,0.6)', color: '#8B6914', fontWeight: 500, flexShrink: 0, lineHeight: '14px' }}>
              {book.category}
            </span>
          )}
          {book.condition && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: 'rgba(224,201,168,0.3)', color: '#5D4E37', fontWeight: 500, flexShrink: 0, lineHeight: '14px' }}>
              {book.condition}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#E8590C', lineHeight: 1 }}>
            ¥{book.price}
          </span>
          <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>
            {timeAgo(book.created_at)}
          </span>
        </div>
      </div>
    </a>
  );
}
