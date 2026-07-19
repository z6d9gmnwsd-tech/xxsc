'use client'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  customIcon?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action, customIcon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 animate-fade-in">
      {/* 图标 */}
      <div className="relative mb-6">
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #FFF8F0 0%, #FFE8D4 100%)',
            boxShadow: '0 8px 24px rgba(255, 140, 90, 0.12)',
          }}
        >
          {customIcon || (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              {/* 书本图标 */}
              <rect x="12" y="8" width="32" height="40" rx="3" stroke="#FF8C5A" strokeWidth="2.5" fill="rgba(255, 140, 90, 0.08)"/>
              <path d="M28 8V48" stroke="#FF8C5A" strokeWidth="2" strokeDasharray="4 3"/>
              <path d="M18 16H24" stroke="#FF8C5A" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 22H22" stroke="#FF8C5A" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
              <path d="M32 16H38" stroke="#FF8C5A" strokeWidth="2" strokeLinecap="round"/>
              <path d="M32 22H36" stroke="#FF8C5A" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            </svg>
          )}
        </div>
        {/* 装饰圆点 */}
        <div
          className="absolute -top-2 -right-3 w-5 h-5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #FF8C5A 0%, #FF6B35 100%)',
            opacity: 0.4,
            animation: 'pulseWarm 2s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-1 -left-3 w-3.5 h-3.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #FFB088 0%, #FF8C5A 100%)',
            opacity: 0.3,
            animation: 'pulseWarm 2s ease-in-out infinite 0.5s',
          }}
        />
      </div>

      {/* 文字 */}
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>{title}</h3>
      {description && (
        <p className="text-sm text-center max-w-[260px] leading-relaxed" style={{ color: '#9CA3AF' }}>
          {description}
        </p>
      )}

      {/* 按钮 */}
      {action && (
        <a
          href={action.href}
          className="btn-primary mt-6 ripple"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
