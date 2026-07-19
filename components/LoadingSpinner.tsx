export default function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="px-4 py-8 text-center text-gray-400 animate-fade-in">
      <div className="inline-block w-8 h-8 border-2 border-warm-200 border-t-accent rounded-full animate-spin mb-2" />
      <p className="text-sm">{text}</p>
    </div>
  )
}
