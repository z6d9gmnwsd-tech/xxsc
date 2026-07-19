'use client'

import { getTimeAgo, getConditionColor, getCategoryTag } from '@/lib/utils'
import { Book } from '@/types'
import { useState } from 'react'

interface BookCardProps {
  book: Book
  index?: number
}

export default function BookCard({ book, index = 0 }: BookCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <a
      href={`/detail?id=${book.id}`}
      className="card flex overflow-hidden mb-3 block stagger-item active:scale-[0.98] transition-all duration-200"
      style={{
        animationDelay: `${index * 50}ms`,
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: isPressed
          ? '0 1px 4px rgba(0, 0, 0, 0.06)'
          : '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
      }}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <div className="relative flex-shrink-0">
        {book.image_url ? (
          <>
            {!imageLoaded && (
              <div className="w-[130px] h-[130px] skeleton-shimmer" />
            )}
            <img
              src={book.image_url}
              alt={book.title}
              className="w-[130px] h-[130px] object-cover transition-opacity duration-300"
              style={{ opacity: imageLoaded ? 1 : 0 }}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div
            className="w-[130px] h-[130px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FEFCF9 0%, #F5E6D0 100%)' }}
          >
            <span className="text-5xl opacity-60">📚</span>
          </div>
        )}
        <div
          className="absolute top-2 left-2 text-white text-xs px-2 py-0.5 rounded-md font-medium"
          style={{
            fontSize: '0.625rem',
            backgroundColor: getConditionColorRaw(book.condition),
            backdropFilter: 'blur(4px)',
          }}
        >
          {book.condition}
        </div>
      </div>

      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
        <div>
          <h3
            className="font-semibold text-[15px] line-clamp-2 leading-snug"
            style={{ color: '#1A1A1A' }}
          >
            {book.title}
          </h3>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <span className={`tag ${getCategoryTag(book.category)}`}>
              {book.category}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end mt-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[13px] font-bold" style={{ color: '#FF8C5A' }}>¥</span>
            <span
              className="text-xl font-bold leading-none"
              style={{ color: '#FF8C5A' }}
            >
              {book.price}
            </span>
            {book.original_price && (
              <span
                className="text-xs line-through ml-1"
                style={{ color: '#9CA3AF' }}
              >
                ¥{book.original_price}
              </span>
            )}
          </div>
          <span className="text-xs" style={{ color: '#9CA3AF', fontSize: '0.625rem' }}>
            {getTimeAgo(book.created_at)}
          </span>
        </div>
      </div>
    </a>
  )
}

function getConditionColorRaw(condition: string): string {
  switch (condition) {
    case '全新': return '#3B82F6'
    case '九成新': return 'rgba(0, 0, 0, 0.6)'
    case '八成新': return '#10B981'
    case '七成新': return '#F59E0B'
    default: return '#6B7280'
  }
}
