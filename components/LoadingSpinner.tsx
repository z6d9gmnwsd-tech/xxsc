export default function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="px-4 py-8 text-center text-gray-400">
      <div className="animate-spin text-2xl mb-2">⏳</div>
      {text}
    </div>
  )
}
