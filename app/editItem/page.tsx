'use client'

import { Suspense } from 'react'
import EditForm from './EditForm'

export default function EditItemPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-warm-200 border-t-accent rounded-full animate-spin mb-2" />
          <p className="text-sm text-gray-400">加载中...</p>
        </div>
      </div>
    }>
      <EditForm />
    </Suspense>
  )
}
