'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DetailContent from './DetailContent';

function DetailSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: '#F2F2F7' }}>
      <div className="h-[320px] skeleton-shimmer" style={{ background: '#e8e0d4' }} />
      <div className="px-4 py-4" style={{ background: '#fff' }}>
        <div className="h-8 rounded w-24 mb-2 skeleton-shimmer" style={{ background: '#f0ebe4' }} />
        <div className="h-5 rounded w-3/4 mb-3 skeleton-shimmer" style={{ background: '#f0ebe4' }} />
        <div className="flex gap-2">
          <div className="h-5 rounded-full w-14 skeleton-shimmer" style={{ background: '#f0ebe4' }} />
          <div className="h-5 rounded-full w-16 skeleton-shimmer" style={{ background: '#f0ebe4' }} />
        </div>
      </div>
      <div className="mt-2 px-4 py-4" style={{ background: '#fff' }}>
        <div className="h-4 rounded w-20 mb-3 skeleton-shimmer" style={{ background: '#f0ebe4' }} />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 rounded w-16 skeleton-shimmer" style={{ background: '#f0ebe4' }} />
              <div className="h-3 rounded w-24 skeleton-shimmer" style={{ background: '#f0ebe4' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailPageInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#F2F2F7' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #5B8C5A, #40916C)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: '#333' }}>商品不存在</h2>
        <a href="/" className="btn-primary mt-4">返回首页</a>
      </div>
    );
  }

  return <DetailContent bookId={id} />;
}

export default function DetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DetailPageInner />
    </Suspense>
  );
}
