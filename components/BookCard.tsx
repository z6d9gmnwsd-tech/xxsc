'use client';

import { useMemo } from 'react';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    price: number;
    cover_url?: string;
    category?: string;
    condition?: string;
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
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}月前`;
  return `${Math.floor(diff / 31536000)}年前`;
}

const conditionColorMap: Record<string, { bg: string; text: string }> = {
  '全新': { bg: '#e8f5e9', text: '#2e7d32' },
  '九成新': { bg: '#e3f2fd', text: '#1565c0' },
  '八成新': { bg: '#fff3e0', text: '#e65100' },
  '七成新': { bg: '#fce4ec', text: '#c62828' },
  '六成新及以下': { bg: '#f3e5f5', text: '#6a1b9a' },
};

export default function BookCard({ book, index = 0, onClick }: BookCardProps) {
  const condStyle = useMemo(() => {
    return conditionColorMap[book.condition || ''] || { bg: '#f5f5f5', text: '#666' };
  }, [book.condition]);

  const animStyle = useMemo(() => ({
    animation: `bookCardIn 0.35s ease-out ${index * 60}ms both`,
  }), [index]);

  return (
    <>
      <style>{`
        @keyframes bookCardIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .book-card:active {
          transform: scale(0.97) !important;
        }
      `}</style>
      <div
        className="book-card"
        onClick={onClick}
        style={{
          display: 'flex',
          gap: 10,
          padding: 10,
          marginBottom: 10,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,0,0.04)',
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
          position: 'relative',
          ...animStyle,
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: 120,
              height: 90,
              borderRadius: 8,
              overflow: 'hidden',
              background: '#f0f2f5',
            }}
          >
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ccc',
                  fontSize: 24,
                }}
              >
                &#x1F4D6;
              </div>
            )}
          </div>
          {book.condition && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 6,
                background: condStyle.bg,
                color: condStyle.text,
                fontWeight: 500,
                lineHeight: '14px',
              }}
            >
              {book.condition}
            </span>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 6,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#1a1a1a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}
          >
            {book.title}
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflow: 'hidden' }}>
            {book.category && (
              <span
                className="tag tag-primary"
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 8,
                  background: '#5B8C5A',
                  color: '#fff',
                  flexShrink: 0,
                  lineHeight: '14px',
                }}
              >
                {book.category}
              </span>
            )}
            {book.condition && (
              <span
                className="tag tag-secondary"
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 8,
                  background: '#F5E6D0',
                  color: '#8B6914',
                  flexShrink: 0,
                  lineHeight: '14px',
                }}
              >
                {book.condition}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#E8590C',
                lineHeight: 1,
              }}
            >
              &yen;{book.price}
            </span>
            <span
              style={{
                fontSize: 11,
                color: '#bbb',
                flexShrink: 0,
              }}
            >
              {timeAgo(book.created_at)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
