import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  variant?: 'detail' | 'publish' | 'footer';
  className?: string;
}

export default function Disclaimer({ variant = 'detail', className = '' }: DisclaimerProps) {
  if (variant === 'footer') {
    return (
      <div
        className={className}
        style={{
          padding: '12px 16px',
          textAlign: 'center',
        }}
      >
        <p style={{
          fontSize: 11,
          color: '#999',
          margin: 0,
          lineHeight: 1.6,
        }}>
          本平台仅提供信息撮合服务，不参与交易过程，不承担交易担保责任
        </p>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        margin: '12px 16px',
        padding: '14px 16px',
        background: 'rgba(245,230,208,0.3)',
        border: '1px solid rgba(139,105,20,0.1)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <AlertTriangle size={18} color="#8B6914" style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{
        fontSize: 13,
        color: '#5D4E37',
        margin: 0,
        lineHeight: 1.6,
      }}>
        {variant === 'detail'
          ? '本平台仅提供信息撮合服务，不涉及在线支付，请当面交易，谨防诈骗'
          : '本平台仅提供信息撮合服务，不涉及在线支付，请当面交易，谨防诈骗'
        }
      </p>
    </div>
  );
}
