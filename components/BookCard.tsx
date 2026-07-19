'use client'

import { getTimeAgo, getConditionColor, getCategoryTag } from '@/lib/utils'
import { Book } from '@/types'

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <a
      href={`/detail?id=${book.id}`}
      className="card flex overflow-hidden mb-3 animate-fade-in block active:scale-[0.98] transition-transform duration-150"
    >
      <div className="relative flex-shrink-0">
        {book.image_url ? (
          <img
            src={book.image_url}
            alt={book.title}
            className="w-[130px] h-[130px] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-[130px] h-[130px] bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
            <span className="text-5xl">📚</span>
          </div>
        )}
        <div className={`absolute top-2 left-2 ${getConditionColor(book.condition)} text-white text-xs px-2 py-1 rounded-md`}>
          {book.condition}
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{book.title}</h3>
          <div className="flex gap-1 mt-2 flex-wrap">
            <span className={`tag ${getCategoryTag(book.category)}`}>{book.category}</span>
            {book.grade && <span className="tag tag-info">{book.grade}</span>}
            {book.subject && <span className="tag tag-success">{book.subject}</span>}
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-accent">¥{book.price}</span>
            {book.original_price && (
              <span className="text-xs text-gray-400 line-through">¥{book.original_price}</span>
            )}
          </div>
          <span className="text-xs text-gray-400">{getTimeAgo(book.created_at)}</span>
        </div>
      </div>
    </a>
  )
}
