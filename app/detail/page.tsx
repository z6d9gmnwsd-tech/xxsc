'use client'

import { Suspense } from 'react'
import DetailContent from './DetailContent'
import { BookOpen } from 'lucide-react'

function DetailSkeleton() {
  return (
    <div className="min-h-screen animate-fade-in" style={{ background: '#F2F2F7' }}>
      <div className="h-[300px] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-8 w-32 skeleton rounded-lg" />
        <div className="h-5 w-3/4 skeleton rounded-lg" />
        <div className="flex gap-2">
          <div className="h-6 w-16 skeleton rounded-full" />
          <div className="h-6 w-16 skeleton rounded-full" />
          <div className="h-6 w-20 skeleton rounded-full" />
        </div>
      </div>
      <div className="mx-4 mt-2 rounded-2xl p-4 space-y-2">
        <div className="h-5 w-24 skeleton rounded-lg" />
        <div className="h-4 w-full skeleton rounded-lg" />
        <div className="h-4 w-2/3 skeleton rounded-lg" />
      </div>
      <div className="mx-4 mt-2 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-20 skeleton rounded-lg" />
          <div className="h-3 w-16 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function DetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DetailContent />
    </Suspense>
  )
}
