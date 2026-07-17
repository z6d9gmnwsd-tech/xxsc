'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getTimeAgo, getConditionColor } from '@/lib/utils'
import BackButton from '@/components/BackButton'

interface BookItem {
  id: string
  title: string
  price: number
  original_price: number | null
  condition: string
  image_url: string | null
  created_at: string
}

export default function IsbnCompareContent() {
  const searchParams = useSearchParams()
  const isbn = searchParams.get('isbn') || ''
  const [books, setBooks] = useState<BookItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(isbn)

  useEffect(() => {
    if (isbn) {
      fetchBooks(isbn)
    } else {
      setLoading(false)
    }
  }, [isbn])

  const fetchBooks = async (isbnValue: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('isbn', isbnValue)
      .eq('status', '在售')
      .order('price', { ascending: true })

    if (data) setBooks(data)
    setLoading(false)
  }

  const handleSearch = () => {
    if (searchInput.trim()) {
      window.location.href = `/isbn?isbn=${searchInput.trim()}`
    }
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold">ISBN 比价</h1>
            <p className="text-sm opacity-80 mt-1">同一ISBN，不同卖家不同价格</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-white">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="输入ISBN编号"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-primary px-4" onClick={handleSearch}>查询</button>
        </div>
      </div>

      {loading ? (
        <div className="px-4 py-8 text-center text-gray-400">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          加载中...
        </div>
      ) : !isbn ? (
        <div className="flex flex-col items-center justify-center p-8 py-20">
          <span className="text-6xl mb-4">🔍</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">输入ISBN开始比价</h2>
          <p className="text-gray-500 text-center">输入书籍的ISBN编号，查看所有在售商品</p>
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 py-20">
          <span className="text-6xl mb-4">📚</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">未找到该ISBN的商品</h2>
          <p className="text-gray-500">换个ISBN试试？</p>
        </div>
      ) : (
        <div className="px-4 py-3">
          <div className="text-sm text-gray-500 mb-3">找到 {books.length} 件商品，按价格从低到高排列</div>
          {books.map((book, index) => (
            <a key={book.id} href={`/detail?id=${book.id}`} className="card p-4 mb-3 animate-fade-in block">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{book.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${getConditionColor(book.condition)}`}></div>
                    <span className="text-xs text-gray-500">{book.condition}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-orange-500">¥{book.price}</div>
                  {book.original_price && (
                    <div className="text-xs text-gray-400 line-through">¥{book.original_price}</div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">{getTimeAgo(book.created_at)}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
