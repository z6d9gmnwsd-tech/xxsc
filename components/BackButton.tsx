'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  className?: string
}

export default function BackButton({ className = '' }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-lg hover:bg-white/30 transition-colors ${className}`}
    >
      ‹
    </button>
  )
}
