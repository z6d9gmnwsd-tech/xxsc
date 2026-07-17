interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; href: string }
}

export default function EmptyState({ icon = '📚', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 py-20">
      <span className="text-6xl mb-4">{icon}</span>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      {description && <p className="text-gray-500 mb-6 text-center">{description}</p>}
      {action && (
        <a href={action.href} className="btn-primary">{action.label}</a>
      )}
    </div>
  )
}
