'use client'

import { getTimeAgo, getConditionColor, getCategoryTag } from '@/lib/utils'

export interface Book {
  id: string
  title: string
  description: string
  original_price: number | null
  price: number
  condition: string
  category: string
  grade: string
  subject: string
  image_url: string | null
  isbn: string | null
  user_id: string
  created_at: string
}

interface BookCardProps {
  book: Book
  index?: number
}

export default function BookCard({ book, index = 0 }: BookCardProps) {
  return (
    <a
      href={`/detail?id=${book.id}`}
      className="card card-interactive block mb-3"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex overflow-hidden">
        <div className="relative flex-shrink-0">
          {book.image_url ? (
            <img
              src={book.image_url}
              alt={book.title}
              className="w-[120px] h-[120px] object-cover"
            />
          ) : (
            <div className="w-[120px] h-[120px] flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)'}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                <path d="M8 7h6"/>
                <path d="M8 11h8"/>
              </svg>
            </div>
          )}
          <div className={`absolute top-2 left-2 ${getConditionColor(book.condition)} text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm`}>
            {book.condition}
          </div>
        </div>
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2" style={{color: '#1a1a1a'}}>{book.title}</h3>
            <div className="flex gap-1 mt-2 flex-wrap">
              <span className={`tag ${getCategoryTag(book.category)}`}>{book.category}</span>
              {book.grade && <span className="tag tag-info">{book.grade}</span>}
              {book.subject && <span className="tag tag-success">{book.subject}</span>}
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold" style={{color: '#E8590C'}}>¥{book.price}</span>
              {book.original_price && (
                <span className="text-[11px] line-through" style={{color: '#bbb'}}>¥{book.original_price}</span>
              )}
            </div>
            <span className="text-[11px]" style={{color: '#bbb'}}>{getTimeAgo(book.created_at)}</span>
          </div>
        </div>
      </div>
    </a>
  )
}
