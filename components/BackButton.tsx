'use client'

import { useRouter } from 'next/navigation'

export default function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg hover:bg-white/30 active:scale-95 transition-all duration-150 touch-target ${className}`}
    >
      ‹
    </button>
  )
}
