import { BookOpen, Search, Inbox, ShoppingCart, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon | string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const iconMap: Record<string, LucideIcon> = {
  search: Search,
  inbox: Inbox,
  cart: ShoppingCart,
  book: BookOpen,
  file: FileText,
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  let IconComponent: LucideIcon | null = null;

  if (typeof icon === 'string') {
    IconComponent = iconMap[icon] || BookOpen;
  } else if (icon) {
    IconComponent = icon;
  } else {
    IconComponent = BookOpen;
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 animate-fade-in">
      {/* Icon Circle */}
      <div
        className="flex items-center justify-center rounded-full mb-5"
        style={{
          width: 80,
          height: 80,
          background: 'linear-gradient(135deg, rgba(91,140,90,0.15), rgba(64,145,108,0.08))',
        }}
      >
        <IconComponent
          size={36}
          color="#5B8C5A"
          strokeWidth={1.5}
        />
      </div>

      {/* Title */}
      <h3
        className="text-base font-medium mb-2"
        style={{ color: '#333333' }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="text-sm text-center leading-relaxed mb-6"
          style={{ color: '#999999', maxWidth: 240 }}
        >
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="btn-primary"
            style={{ fontSize: 14, padding: '8px 20px' }}
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="btn-primary"
            style={{ fontSize: 14, padding: '8px 20px' }}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
