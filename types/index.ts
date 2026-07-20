export interface User {
  id: string
  nickname: string
  phone: string
  avatar_url?: string | null
  school?: string | null
  bio?: string | null
}

export interface Book {
  id: string
  title: string
  description: string | null
  product_intro: string | null
  original_price: number | null
  price: number
  condition: string
  category: string
  grade: string | null
  subject: string | null
  image_url: string | null
  images: string[] | null
  isbn: string | null
  author: string | null
  publisher: string | null
  user_id: string
  status: string
  exam_type: string | null
  exam_subjects: string | null
  created_at: string
  updated_at: string
}

export interface BookWithProfile extends Book {
  profiles?: {
    nickname: string
    avatar_url: string | null
    school: string | null
    bio: string | null
  }
}

export interface Favorite {
  id: string
  user_id: string
  book_id: string
  created_at: string
}

export interface Transaction {
  id: string
  book_id: string
  buyer_id: string
  seller_id: string
  price: number
  status: string
  created_at: string
  books?: Book
}

export interface ToastProps {
  show: boolean
  type: 'success' | 'error' | 'info'
  message: string
}
