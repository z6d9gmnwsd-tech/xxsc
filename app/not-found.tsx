'use client'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream animate-fade-in">
      <div className="w-full max-w-[360px] text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">📖</span>
        </div>
        <h1 className="text-[22px] font-bold text-primary mb-3">页面不存在</h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">您访问的页面可能已移动或删除</p>
        <div className="flex flex-col gap-3 items-center">
          <a href="/" className="btn-primary inline-flex items-center justify-center w-[200px] h-11">
            返回首页
          </a>
          <button
            onClick={() => window.history.back()}
            className="text-sm text-warm-500 bg-transparent border-none cursor-pointer active:scale-95 transition-transform"
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  )
}
