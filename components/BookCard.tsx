'use client';

import { BookOpen } from 'lucide-react';

interface BookCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  condition: string;
  thumbnail?: string;
  tags?: string[];
  index?: number;
  onClick?: () => void;
}

const conditionMap: Record<string, { label: string; class: string }> = {
  '全新': { label: '全新', class: 'condition-badge-new' },
  '九成新': { label: '九成新', class: 'condition-badge-90' },
  '八成新': { label: '八成新', class: 'condition-badge-80' },
  '七成新': { label: '七成新及以下', class: 'condition-badge-low' },
  '七成新及以下': { label: '七成新及以下', class: 'condition-badge-low' },
};

const tagColors: Record<string, string> = {
  '教材': 'tag-primary',
  '备考资料': 'tag-info',
  '考研': 'tag-info',
  '四六级': 'tag-warning',
  '计算机': 'tag-success',
  '文学': 'tag-secondary',
  '工具书': 'tag-secondary',
};

export default function BookCard({
  title,
  price,
  condition,
  thumbnail,
  tags = [],
  index = 0,
  onClick,
}: BookCardProps) {
  const condInfo = conditionMap[condition] || { label: condition, class: 'condition-badge-low' };
  const displayTags = tags.slice(0, 2);

  return (
    <div
      className="card card-interactive"
      style={{
        padding: 10,
        animationDelay: `${index * 60}ms`,
      }}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="rounded-lg object-cover"
              style={{ width: 120, height: 90 }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 120,
                height: 90,
                background: 'linear-gradient(135deg, #5B8C5A, #40916C)',
              }}
            >
              <BookOpen size={28} color="#FFFFFF" strokeWidth={1.5} />
            </div>
          )}
          {/* Condition Badge */}
          <span className={`condition-badge ${condInfo.class}`}>
            {condInfo.label}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
          {/* Title */}
          <h3
            className="font-medium text-sm leading-snug truncate"
            style={{ color: '#333333', fontWeight: 500 }}
          >
            {title}
          </h3>

          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-1">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className={`tag ${tagColors[tag] || 'tag-secondary'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1 mt-1">
            <span className="price-tag price-tag-sm">
              <span className="currency">¥</span>
              <span className="amount">{price.toFixed(2)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
