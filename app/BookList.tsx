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
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <a href={`/detail?id=${book.id}`} className="card relative block mb-3 animate-fade-in" style={{margin: '0', padding: '0'}}>
      {/* 品质标签 - 整个卡片的右上角 */}
      <div 
        className="absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded-lg font-medium"
        style={{
          background: book.condition === '全新' ? '#5A8F5C' : 
                      book.condition === '九成新' ? '#7BAFD4' : 
                      book.condition === '八成新' ? '#F6C12C' : '#FF9800',
          color: '#fff',
          fontSize: '11px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {book.condition}
      </div>
      
      {/* 内容区域 */}
      <div className="flex overflow-hidden">
        {/* 图片区域 */}
        <div className="flex-shrink-0">
          {book.image_url ? (
            <img
              src={book.image_url}
              alt={book.title}
              className="w-[130px] h-[130px] object-cover"
            />
          ) : (
            <div className="w-[130px] h-[130px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-5xl">📚</span>
            </div>
          )}
        </div>
        
        {/* 商品信息 */}
        <div className="flex-1 p-4 flex flex-col justify-between">
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
              <span className="text-xl font-bold text-orange-500">¥{book.price}</span>
              {book.original_price && (
                <span className="text-xs text-gray-400 line-through">¥{book.original_price}</span>
              )}
            </div>
            <span className="text-xs text-gray-400">{getTimeAgo(book.created_at)}</span>
          </div>
        </div>
      </div>
    </a>
  )
}
