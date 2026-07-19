'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SearchX } from 'lucide-react';
import BookCard from '../components/BookCard';
import { SkeletonList } from '../components/LoadingSpinner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Book {
  id: string;
  title: string;
  price: number;
  cover_url?: string;
  category?: string;
  condition?: string;
  created_at: string;
  [key: string]: any;
}

interface BookListProps {
  searchQuery: string;
  sortBy: 'newest' | 'price_asc' | 'price_desc';
  filterCategory: string;
  onBookClick?: (book: Book) => void;
}

export default function BookList({ searchQuery, sortBy, filterCategory, onBookClick }: BookListProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef('');

  const LIMIT = 20;

  const fetchBooks = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    const offset = (currentPage - 1) * LIMIT;

    let query = supabase
      .from('books')
      .select('*')
      .eq('status', '在售');

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      query = query.or(
        `title.ilike.%${q}%,subject.ilike.%${q}%,isbn.ilike.%${q}%`
      );
    }

    if (filterCategory) {
      query = query.eq('category', filterCategory);
    }

    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + LIMIT - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch books:', error);
      return;
    }

    if (reset) {
      setBooks(data || []);
      setPage(2);
    } else {
      setBooks(prev => [...prev, ...(data || [])]);
      setPage(currentPage + 1);
    }

    setHasMore((data || []).length === LIMIT);
  }, [searchQuery, sortBy, filterCategory, page]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const queryKey = `${searchQuery}|${sortBy}|${filterCategory}`;
      if (queryKey !== lastQueryRef.current) {
        lastQueryRef.current = queryKey;
        setLoading(true);
        fetchBooks(true).finally(() => setLoading(false));
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, sortBy, filterCategory]);

  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true);
          fetchBooks(false).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, fetchBooks]);

  if (loading) {
    return <SkeletonList count={3} />;
  }

  if (books.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          gap: 12,
        }}
      >
        <SearchX size={48} color="#ccc" strokeWidth={1.5} />
        <span style={{ fontSize: 15, color: '#999' }}>暂无相关书籍</span>
        <span style={{ fontSize: 12, color: '#bbb' }}>换个关键词试试</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {books.map((book, index) => (
        <BookCard
          key={book.id}
          book={book}
          index={index}
          onClick={() => onBookClick?.(book)}
        />
      ))}
      {loadingMore && (
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: '#999' }}>加载中...</span>
        </div>
      )}
      {hasMore && <div ref={observerRef} style={{ height: 1 }} />}
    </div>
  );
}
