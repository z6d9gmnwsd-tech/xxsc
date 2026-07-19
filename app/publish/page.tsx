'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen } from 'lucide-react';
import PublishForm from './PublishForm';
import BottomNav from '../../components/BottomNav';

export default function PublishPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F7', paddingBottom: 80 }}>
      <style>{`
        .publish-header {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          padding-top: calc(12px + env(safe-area-inset-top, 0px));
          background: linear-gradient(135deg, #5B8C5A, #4a7a49);
          backdrop-filter: blur(12px);
        }
        .publish-header .back-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .publish-header .title-area {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .publish-header .title-text {
          font-size: 17px;
          font-weight: 600;
          color: #fff;
        }
      `}</style>

      <header className="publish-header">
        <button className="back-btn" onClick={() => router.back()}>
          <ChevronLeft size={20} color="#fff" />
        </button>
        <div className="title-area">
          <BookOpen size={18} color="#fff" strokeWidth={1.5} />
          <span className="title-text">发布商品</span>
        </div>
      </header>

      <PublishForm />

      <BottomNav activePage="publish" />
    </div>
  );
}
