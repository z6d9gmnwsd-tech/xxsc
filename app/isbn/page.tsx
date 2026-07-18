'use client'

import { Suspense } from 'react'
import IsbnCompareContent from './IsbnContent'
import { BarChart3, Loader2 } from 'lucide-react'

function IsbnSkeleton() {
  return (
    <div className="min-h-screen animate-fade-in" style={{ background: '#F2F2F7' }}>
      <div
        className="header-glass px-4 py-6 text-white"
        style={{
          background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 size={20} />
          ISBN 比价
        </h1>
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-4 animate-fade-in"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl skeleton flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 skeleton rounded-lg" />
                <div className="h-5 w-20 skeleton rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function IsbnPage() {
  return (
    <Suspense fallback={<IsbnSkeleton />}>
      <IsbnCompareContent />
    </Suspense>
  )
}
