'use client';

import { useEffect, useState } from 'react';

interface SkeletonCardProps {
  index?: number;
}

export function SkeletonCard({ index = 0 }: SkeletonCardProps) {
  return (
    <div
      className="skeleton-card"
      style={{
        display: 'flex',
        gap: 10,
        padding: 10,
        marginBottom: 10,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,0.04)',
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{
          width: 120,
          height: 90,
          borderRadius: 8,
          flexShrink: 0,
          background: '#e8e8e8',
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        <div
          className="skeleton-shimmer"
          style={{
            width: '70%',
            height: 14,
            borderRadius: 4,
            background: '#e8e8e8',
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          <div
            className="skeleton-shimmer"
            style={{
              width: 40,
              height: 18,
              borderRadius: 9,
              background: '#e8e8e8',
            }}
          />
          <div
            className="skeleton-shimmer"
            style={{
              width: 32,
              height: 18,
              borderRadius: 9,
              background: '#e8e8e8',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            className="skeleton-shimmer"
            style={{
              width: 60,
              height: 18,
              borderRadius: 4,
              background: '#e8e8e8',
            }}
          />
          <div
            className="skeleton-shimmer"
            style={{
              width: 50,
              height: 10,
              borderRadius: 4,
              background: '#e8e8e8',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div style={{ padding: '0 16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  );
}

interface LoadingSpinnerProps {
  text?: string;
  size?: number;
}

export default function LoadingSpinner({ text, size = 32 }: LoadingSpinnerProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: 12,
      }}
    >
      <div
        className="spinner"
        style={{
          width: size,
          height: size,
          border: '3px solid rgba(91,140,90,0.15)',
          borderTopColor: '#5B8C5A',
          borderRadius: '50%',
        }}
      />
      {text && (
        <span style={{ fontSize: 13, color: '#999' }}>
          {text}{dots}
        </span>
      )}
      <style>{`
        .spinner {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
