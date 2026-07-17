'use client'

import WantList from './WantList'
import { usePhoneAuth } from '@/hooks/usePhoneAuth'
import BackButton from '@/components/BackButton'

export default function WantPage() {
  const { user } = usePhoneAuth()

  return (
    <div className="pb-20">
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold">求购广场</h1>
            <p className="text-sm opacity-80 mt-1">发布你的需求，卖家主动联系你</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3 bg-white">
        <button className="flex-1 py-2 text-center text-sm font-medium text-orange-500 border-b-2 border-orange-500">全部求购</button>
        <button className="flex-1 py-2 text-center text-sm text-gray-500">我的求购</button>
      </div>

      <WantList />

      {user && (
        <a href="/want/post" className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-white text-2xl shadow-lg z-50">+</a>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 shadow-lg z-50">
        <div className="flex">
          <a href="/" className="flex-1 flex flex-col items-center py-2 text-gray-400"><span className="text-xl">🏠</span><span className="text-xs mt-1">首页</span></a>
          <a href="/publish" className="flex-1 flex flex-col items-center py-2 text-gray-400"><span className="text-xl">📖</span><span className="text-xs mt-1">卖书</span></a>
          <a href="/messages" className="flex-1 flex flex-col items-center py-2 text-gray-400"><span className="text-xl">💬</span><span className="text-xs mt-1">消息</span></a>
          <a href="/my" className="flex-1 flex flex-col items-center py-2 text-gray-400"><span className="text-xl">👤</span><span className="text-xs mt-1">我的</span></a>
        </div>
      </div>
    </div>
  )
}
