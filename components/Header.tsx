'use client'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
}

export default function Header({ title, subtitle, showBack }: HeaderProps) {
  return (
    <div className="bg-gradient-primary px-4 py-6 text-white">
      <div className="flex items-center gap-3">
        {showBack && (
          <a href="javascript:history.back()" className="text-white text-lg mr-1">‹</a>
        )}
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <span className="text-2xl">📚</span>
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-wide">{title}</h1>
          {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
