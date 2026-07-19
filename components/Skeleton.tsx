'use client'

interface SkeletonProps {
  type?: 'card' | 'text' | 'avatar' | 'image'
  count?: number
}

export default function Skeleton({ type = 'card', count = 3 }: SkeletonProps) {
  if (type === 'card') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="card flex overflow-hidden animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* 图片骨架 */}
            <div className="w-[130px] h-[130px] skeleton-shimmer flex-shrink-0" />

            {/* 内容骨架 */}
            <div className="flex-1 p-3.5 space-y-3">
              {/* 标题 */}
              <div className="space-y-2">
                <div className="h-4 bg-cream-100 rounded-lg w-4/5 skeleton-shimmer" />
                <div className="h-4 bg-cream-100 rounded-lg w-3/5 skeleton-shimmer" style={{ animationDelay: '0.1s' }} />
              </div>

              {/* 标签 */}
              <div className="flex gap-1.5">
                <div className="h-5 bg-cream-100 rounded-md w-12 skeleton-shimmer" style={{ animationDelay: '0.2s' }} />
                <div className="h-5 bg-cream-100 rounded-md w-10 skeleton-shimmer" style={{ animationDelay: '0.3s' }} />
              </div>

              {/* 价格 */}
              <div className="flex justify-between items-end">
                <div className="h-6 bg-cream-100 rounded-lg w-16 skeleton-shimmer" style={{ animationDelay: '0.4s' }} />
                <div className="h-3 bg-cream-100 rounded-lg w-12 skeleton-shimmer" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="h-4 bg-cream-100 rounded-lg skeleton-shimmer"
            style={{
              width: `${Math.random() * 40 + 60}%`,
              animationDelay: `${index * 100}ms`,
            }}
          />
        ))}
      </div>
    )
  }

  if (type === 'avatar') {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-cream-100 skeleton-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-cream-100 rounded-lg w-1/3 skeleton-shimmer" />
          <div className="h-3 bg-cream-100 rounded-lg w-1/2 skeleton-shimmer" style={{ animationDelay: '0.1s' }} />
        </div>
      </div>
    )
  }

  if (type === 'image') {
    return (
      <div className="w-full h-48 bg-cream-100 rounded-card skeleton-shimmer" />
    )
  }

  return null
}
