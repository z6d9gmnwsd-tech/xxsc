'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'green' | 'transparent';
}

export default function Header({
  title,
  showBack = false,
  rightAction,
  variant = 'default',
}: HeaderProps) {
  const router = useRouter();

  const bgStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
    },
    green: {
      background: 'linear-gradient(135deg, rgba(91,140,90,0.95), rgba(64,145,108,0.95))',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(91,140,90,0.2)',
    },
    transparent: {
      background: 'transparent',
    },
  };

  const textColor = variant === 'green' ? '#FFFFFF' : '#333333';

  return (
    <header
      className="sticky top-0 z-50 safe-area-top"
      style={{
        ...bgStyles[variant],
        padding: '12px 16px',
      }}
    >
      <div className="flex items-center justify-between" style={{ height: 44 }}>
        {/* Left */}
        <div className="flex items-center gap-2" style={{ minWidth: 80 }}>
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: variant === 'green' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="返回"
            >
              <ChevronLeft size={20} color={textColor} />
            </button>
          )}
        </div>

        {/* Center Title */}
        {title && (
          <h1
            className="text-base font-semibold absolute left-1/2 -translate-x-1/2"
            style={{
              color: textColor,
              fontWeight: 600,
            }}
          >
            {title}
          </h1>
        )}

        {/* Right */}
        <div className="flex items-center justify-end" style={{ minWidth: 80 }}>
          {rightAction}
        </div>
      </div>
    </header>
  );
}
