interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; href: string }
}

export default function EmptyState({ icon = '📚', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 py-20 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center mb-4">
        <span className="text-4xl">{icon}</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      {description && <p className="text-gray-500 mb-6 text-center text-sm">{description}</p>}
      {action && (
        <a href={action.href} className="btn-primary">
          {action.label}
        </a>
      )}
    </div>
  )
}
