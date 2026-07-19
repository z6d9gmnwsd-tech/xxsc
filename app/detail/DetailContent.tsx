'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MoreHorizontal,
  Share2,
  MessageCircle,
  Phone,
  Copy,
  Check,
  X,
  Edit3,
  Trash2,
  Archive,
  AlertCircle,
  BookOpen,
  Tag,
  Clock,
  User,
} from 'lucide-react';
import { SkeletonCard } from '../../components/LoadingSpinner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BookDetail {
  id: string;
  title: string;
  price: number;
  cover_url?: string;
  images?: string[];
  category?: string;
  condition?: string;
  isbn?: string;
  author?: string;
  publisher?: string;
  grades?: string[];
  majors?: string[];
  material_type?: string;
  exam_type?: string;
  exam_subjects?: string[];
  status?: string;
  user_id: string;
  created_at: string;
  [key: string]: any;
}

interface SellerInfo {
  id: string;
  nickname?: string;
  avatar_url?: string;
  wechat?: string;
  phone?: string;
}

interface DetailContentProps {
  bookId: string;
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

const conditionColorMap: Record<string, { bg: string; text: string }> = {
  '全新': { bg: '#e8f5e9', text: '#2e7d32' },
  '九成新': { bg: '#e3f2fd', text: '#1565c0' },
  '八成新': { bg: '#fff3e0', text: '#e65100' },
  '七成新': { bg: '#fce4ec', text: '#c62828' },
  '六成新及以下': { bg: '#f3e5f5', text: '#6a1b9a' },
};

export default function DetailContent({ bookId }: DetailContentProps) {
  const router = useRouter();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const allImages = book?.images?.length
    ? book.images
    : book?.cover_url
    ? [book.cover_url]
    : [];

  const fetchBookData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();
      if (bookError) throw bookError;
      setBook(bookData);

      if (bookData?.user_id) {
        const { data: sellerData } = await supabase
          .from('profiles')
          .select('id, nickname, avatar_url, wechat, phone')
          .eq('id', bookData.user_id)
          .single();
        setSeller(sellerData);

        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.id === bookData.user_id) {
          setIsOwner(true);
        }
      }

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userData.user.id)
          .eq('book_id', bookId)
          .maybeSingle();
        setIsFavorited(!!favData);
      }
    } catch (err) {
      console.error('Failed to load book:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBookData();
  }, [fetchBookData]);

  const toggleFavorite = async () => {
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 300);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert('请先登录');
      return;
    }

    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userData.user.id)
        .eq('book_id', bookId);
      setIsFavorited(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userData.user.id, book_id: bookId });
      setIsFavorited(true);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  const handleMarkSold = async () => {
    await supabase.from('books').update({ status: '已售出' }).eq('id', bookId);
    setShowMoreMenu(false);
    fetchBookData();
  };

  const handleDelist = async () => {
    await supabase.from('books').update({ status: '已下架' }).eq('id', bookId);
    setShowMoreMenu(false);
    fetchBookData();
  };

  const handleDelete = async () => {
    if (!confirm('确定删除此商品？')) return;
    await supabase.from('books').delete().eq('id', bookId);
    router.push('/');
  };

  const condStyle = book?.condition
    ? conditionColorMap[book.condition] || { bg: '#f5f5f5', text: '#666' }
    : null;

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <SkeletonCard />
        <SkeletonCard index={1} />
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
        <AlertCircle size={32} />
        <div style={{ marginTop: 12 }}>商品不存在或已删除</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F7', paddingBottom: 100 }}>
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .heart-btn {
          transition: transform 0.15s ease;
        }
        .heart-btn:active {
          transform: scale(0.9);
        }
        .heart-anim {
          animation: heartPop 0.3s ease-out;
        }
        .glass-fab {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .glass-fab:active {
          transform: scale(0.9);
        }
        .detail-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.04);
          padding: 16px;
          margin: 0 16px 12px;
        }
        .more-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 200;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 40px;
        }
        .more-sheet {
          background: #fff;
          border-radius: 20px 20px 0 0;
          padding: 8px 0;
          width: 100%;
          max-width: 400px;
          animation: sheetUp 0.25s ease-out;
        }
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .more-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          font-size: 15px;
          color: #1a1a1a;
          cursor: pointer;
          transition: background 0.15s;
        }
        .more-item:active {
          background: #f5f5f5;
        }
        .more-item.danger {
          color: #E8590C;
        }
        .image-viewer {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background: #000;
          border-radius: 0;
          overflow: hidden;
        }
        .image-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
        }
        .image-counter {
          position: absolute;
          bottom: 12px;
          right: 12px;
          padding: 4px 10px;
          border-radius: 12px;
          background: rgba(0,0,0,0.5);
          color: #fff;
          font-size: 12px;
          z-index: 10;
        }
      `}</style>

      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
          background: 'linear-gradient(135deg, #5B8C5A, #4a7a49)',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={20} color="#fff" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 600, color: '#fff', flex: 1 }}>
          {book.title}
        </span>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: book.title, url: window.location.href });
            }
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Share2 size={18} color="#fff" />
        </button>
      </header>

      {/* Image Viewer */}
      {allImages.length > 0 && (
        <div className="image-viewer">
          <img
            src={allImages[currentImageIndex]}
            alt={book.title}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          {allImages.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  className="image-nav"
                  style={{ left: 12 }}
                  onClick={() => setCurrentImageIndex(i => i - 1)}
                >
                  <ChevronLeft size={18} color="#333" />
                </button>
              )}
              {currentImageIndex < allImages.length - 1 && (
                <button
                  className="image-nav"
                  style={{ right: 12 }}
                  onClick={() => setCurrentImageIndex(i => i + 1)}
                >
                  <ChevronRight size={18} color="#333" />
                </button>
              )}
              <div className="image-counter">
                {currentImageIndex + 1}/{allImages.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Price + Tags */}
      <div className="detail-card" style={{ marginTop: allImages.length > 0 ? 0 : 16 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#E8590C', marginBottom: 10 }}>
          &yen;{book.price}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {book.category && (
            <span
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 12,
                background: '#5B8C5A',
                color: '#fff',
                fontWeight: 500,
              }}
            >
              {book.category}
            </span>
          )}
          {book.condition && condStyle && (
            <span
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 12,
                background: condStyle.bg,
                color: condStyle.text,
                fontWeight: 500,
              }}
            >
              {book.condition}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="detail-card">
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4 }}>
          {book.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#999' }}>
          <Clock size={12} />
          <span>{timeAgo(book.created_at)}</span>
        </div>
      </div>

      {/* Book Info */}
      <div className="detail-card">
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 }}>
          商品详情
        </div>
        {book.isbn && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 14, color: '#999' }}>ISBN</span>
            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{book.isbn}</span>
          </div>
        )}
        {book.author && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 14, color: '#999' }}>作者</span>
            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{book.author}</span>
          </div>
        )}
        {book.publisher && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 14, color: '#999' }}>出版社</span>
            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{book.publisher}</span>
          </div>
        )}
        {book.grades && book.grades.length > 0 && (
          <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 14, color: '#999', marginRight: 12 }}>适用年级</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {book.grades.map((g: string) => (
                <span key={g} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 8, background: '#f0f2f5', color: '#666' }}>
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}
        {book.majors && book.majors.length > 0 && (
          <div style={{ padding: '8px 0' }}>
            <span style={{ fontSize: 14, color: '#999', marginRight: 12 }}>适用专业</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {book.majors.map((m: string) => (
                <span key={m} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 8, background: '#F5E6D0', color: '#8B6914' }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
        {book.material_type && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 14, color: '#999' }}>资料类型</span>
            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{book.material_type}</span>
          </div>
        )}
        {book.exam_type && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 14, color: '#999' }}>适用考试</span>
            <span style={{ fontSize: 14, color: '#1a1a1a' }}>{book.exam_type}</span>
          </div>
        )}
        {book.exam_subjects && book.exam_subjects.length > 0 && (
          <div style={{ padding: '8px 0' }}>
            <span style={{ fontSize: 14, color: '#999', marginRight: 12 }}>考试科目</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {book.exam_subjects.map((s: string) => (
                <span key={s} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 8, background: '#f0f2f5', color: '#666' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seller Card */}
      {seller && (
        <div className="detail-card">
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 }}>
            卖家信息
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#f0f2f5',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {seller.avatar_url ? (
                <img src={seller.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#ccc" />
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>
                {seller.nickname || '匿名用户'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {seller.wechat && (
              <button
                onClick={() => handleCopy(seller.wechat!, 'wechat')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 0',
                  borderRadius: 12,
                  border: '1px solid rgba(91,140,90,0.2)',
                  background: 'rgba(91,140,90,0.05)',
                  color: '#5B8C5A',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {copiedField === 'wechat' ? <Check size={14} /> : <Copy size={14} />}
                {copiedField === 'wechat' ? '已复制' : '复制微信'}
              </button>
            )}
            {seller.phone && (
              <button
                onClick={() => handleCopy(seller.phone!, 'phone')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 0',
                  borderRadius: 12,
                  border: '1px solid rgba(91,140,90,0.2)',
                  background: 'rgba(91,140,90,0.05)',
                  color: '#5B8C5A',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {copiedField === 'phone' ? <Check size={14} /> : <Phone size={14} />}
                {copiedField === 'phone' ? '已复制' : '复制手机号'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Favorite Button */}
      <div
        style={{
          position: 'fixed',
          left: 16,
          bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          zIndex: 150,
        }}
      >
        <button
          className={`glass-fab heart-btn ${heartAnimating ? 'heart-anim' : ''}`}
          onClick={toggleFavorite}
        >
          <Heart
            size={24}
            color={isFavorited ? '#E8590C' : '#999'}
            fill={isFavorited ? '#E8590C' : 'none'}
            strokeWidth={isFavorited ? 0 : 1.5}
          />
        </button>
      </div>

      {/* Owner Floating Button */}
      {isOwner && (
        <div
          style={{
            position: 'fixed',
            right: 16,
            bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            zIndex: 150,
          }}
        >
          <button
            className="glass-fab"
            onClick={() => setShowMoreMenu(true)}
          >
            <MoreHorizontal size={22} color="#666" />
          </button>
        </div>
      )}

      {/* More Menu Sheet */}
      {showMoreMenu && (
        <div className="more-overlay" onClick={() => setShowMoreMenu(false)}>
          <div className="more-sheet" onClick={e => e.stopPropagation()}>
            {isOwner && (
              <>
                <div
                  className="more-item"
                  onClick={() => {
                    setShowMoreMenu(false);
                    router.push(`/publish?edit=${bookId}`);
                  }}
                >
                  <Edit3 size={18} color="#5B8C5A" />
                  编辑
                </div>
                <div className="more-item" onClick={handleMarkSold}>
                  <Tag size={18} color="#5B8C5A" />
                  标记已售出
                </div>
                <div className="more-item" onClick={handleDelist}>
                  <Archive size={18} color="#666" />
                  下架
                </div>
                <div className="more-item danger" onClick={handleDelete}>
                  <Trash2 size={18} color="#E8590C" />
                  删除
                </div>
              </>
            )}
            {!isOwner && (
              <div className="more-item" onClick={() => setShowMoreMenu(false)}>
                <X size={18} color="#666" />
                关闭
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
