'use client'

import { Suspense } from 'react'
import IsbnCompareContent from './IsbnContent'

export default function IsbnPage() {
  return (
    <Suspense fallback={
      <div className="px-4 py-8 text-center text-gray-400">
        <div className="animate-spin text-2xl mb-2">⏳</div>
        加载中...
      </div>
    }>
      <IsbnCompareContent />
    </Suspense>
  )
}
