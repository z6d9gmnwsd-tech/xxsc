interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; href: string }
}

export default function EmptyState({ icon = '📚', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 py-16 animate-fade-in">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)'}}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          <path d="M8 7h6"/>
          <path d="M8 11h8"/>
        </svg>
      </div>
      <h2 className="text-lg font-semibold mb-2" style={{color: '#333'}}>{title}</h2>
      {description && <p className="text-sm mb-6 text-center" style={{color: '#999'}}>{description}</p>}
      {action && (
        <a href={action.href} className="btn-primary">{action.label}</a>
      )}
    </div>
  )
}
