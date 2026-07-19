'use client'

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 animate-fade-in">
      {/* 图标 */}
      <div className="relative mb-6">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #FEFCF9 0%, #F5E6D0 100%)',
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          <span className="text-5xl">{icon}</span>
        </div>
        {/* 装饰圆点 */}
        <div
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full"
          style={{
            backgroundColor: 'rgba(255, 140, 90, 0.2)',
            animation: 'pulseWarm 2s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full"
          style={{
            backgroundColor: 'rgba(255, 140, 90, 0.15)',
            animation: 'pulseWarm 2s ease-in-out infinite 0.5s',
          }}
        />
      </div>

      {/* 文字 */}
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>{title}</h3>
      {description && (
        <p className="text-sm text-center max-w-[240px] leading-relaxed" style={{ color: '#6B7280' }}>
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
