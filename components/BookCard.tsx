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
      className={`
        card flex overflow-hidden mb-3 block
        stagger-item
        active:scale-[0.98] transition-all duration-200 ease-ios
        ${isPressed ? 'shadow-card-active' : ''}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* 图片区域 */}
      <div className="relative flex-shrink-0">
        {book.image_url ? (
          <>
            {!imageLoaded && (
              <div className="w-[130px] h-[130px] skeleton-shimmer" />
            )}
            <img
              src={book.image_url}
              alt={book.title}
              className={`w-[130px] h-[130px] object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="w-[130px] h-[130px] bg-gradient-to-br from-cream-50 to-cream-200 flex items-center justify-center">
            <span className="text-5xl opacity-60">📚</span>
          </div>
        )}
        {/* 成色标签 */}
        <div className={`absolute top-2 left-2 ${getConditionColor(book.condition)} text-white text-2xs px-2 py-0.5 rounded-md font-medium backdrop-blur-sm`}>
          {book.condition}
        </div>
      </div>

      {/* 信息区域 */}
      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-primary text-[15px] line-clamp-2 leading-snug">
            {book.title}
          </h3>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <span className={`tag ${getCategoryTag(book.category)}`}>
              {book.category}
            </span>
            {book.grade && (
              <span className="tag tag-info">{book.grade}</span>
            )}
            {book.subject && (
              <span className="tag tag-success">{book.subject}</span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-end mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[13px] font-bold text-accent">¥</span>
            <span className="text-xl font-bold text-accent leading-none">
              {book.price}
            </span>
            {book.original_price && (
              <span className="text-xs text-tertiary line-through ml-1">
                ¥{book.original_price}
              </span>
            )}
          </div>
          <span className="text-2xs text-tertiary">
            {getTimeAgo(book.created_at)}
          </span>
        </div>
      </div>
    </a>
  )
}
