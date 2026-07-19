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
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cream-50 to-cream-200 flex items-center justify-center float-animation">
          <span className="text-5xl">{icon}</span>
        </div>
        {/* 装饰圆点 */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent/20 animate-pulse-warm" />
        <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-accent/15 animate-pulse-warm" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* 文字 */}
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-secondary text-center max-w-[240px] leading-relaxed">
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
