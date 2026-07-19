'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BookSuggestion {
  id: string;
  title: string;
  author: string;
  price: number;
}

interface SearchSuggestionsProps {
  query: string;
  onSelect: (title: string) => void;
  visible: boolean;
}

export default function SearchSuggestions({ query, onSelect, visible }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('books')
          .select('id, title, author, price')
          .ilike('title', `%${query}%`)
          .eq('status', 'active')
          .limit(5);

        setSuggestions(data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, visible]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!visible || query.length < 2 || suggestions.length === 0) return null;

  return (
    <div ref={containerRef} style={styles.container}>
      {loading && <div style={styles.loading}>搜索中...</div>}
      {!loading && suggestions.map((item) => (
        <button
          key={item.id}
          style={styles.item}
          onClick={() => onSelect(item.title)}
        >
          <Search size={14} color="#999" style={{ flexShrink: 0 }} />
          <div style={styles.textGroup}>
            <span style={styles.bookTitle}>{item.title}</span>
            <span style={styles.bookMeta}>{item.author}</span>
          </div>
          <span style={styles.price}>¥{item.price}</span>
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 12,
    border: '1px solid rgba(224,201,168,0.2)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    zIndex: 100,
    overflow: 'hidden',
  },
  loading: {
    padding: '14px 16px',
    fontSize: 13,
    color: '#999',
    textAlign: 'center' as const,
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left' as const,
    borderBottom: '1px solid rgba(224,201,168,0.1)',
    transition: 'background 0.15s',
  },
  textGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    minWidth: 0,
  },
  bookTitle: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: 500,
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  bookMeta: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
  },
  price: {
    fontSize: 14,
    color: '#E8590C',
    fontWeight: 600,
    fontFamily: 'Inter, -apple-system, PingFang SC, sans-serif',
    flexShrink: 0,
  },
};
