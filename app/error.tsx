'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: '#F2F2F7',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: 16,
        padding: '40px 24px',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <AlertCircle size={36} color="#8B6914" />
        </div>
        <h2 style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#1a1a1a',
          margin: '0 0 12px',
        }}>
          页面出现异常
        </h2>
        {error?.message && (
          <p style={{
            fontSize: 13,
            color: '#666',
            margin: '0 0 24px',
            lineHeight: 1.5,
            wordBreak: 'break-all',
          }}>
            {error.message}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={reset}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            重试
          </button>
          <a
            href="/"
            style={{
              fontSize: 14,
              color: '#8B6914',
              textDecoration: 'none',
            }}
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
