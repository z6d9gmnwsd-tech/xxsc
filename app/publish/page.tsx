'use client'

import PublishForm from './PublishForm'

export default function PublishPage() {
  return (
    <div className="pb-20">
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <a href="/" className="touch-target text-white text-lg mr-1 active:scale-95 transition-transform">‹</a>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-wide">发布商品</h1>
            <p className="text-sm opacity-80">让你的闲置教材找到新主人</p>
          </div>
        </div>
      </div>
      <PublishForm />
    </div>
  )
}
