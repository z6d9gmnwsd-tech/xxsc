'use client'

import { Suspense } from 'react'
import SellerContent from './SellerContent'

export default function SellerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#E5E5E5', borderTopColor: '#F6C12C' }} />
      </div>
    }>
      <SellerContent />
    </Suspense>
  )
}
