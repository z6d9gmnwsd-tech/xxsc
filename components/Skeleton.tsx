interface SkeletonProps {
  type?: 'card' | 'list' | 'text' | 'circle'
  count?: number
}

function SkeletonCard() {
  return (
    <div className="flex overflow-hidden mb-3 mx-6 mt-3 rounded-card bg-white shadow-card">
      <div className="w-[130px] h-[130px] bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm flex-shrink-0" />
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="h-4 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded w-3/4 mb-2" />
          <div className="h-3 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded w-1/2 mb-2" />
          <div className="flex gap-2">
            <div className="h-5 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded-full w-12" />
            <div className="h-5 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded-full w-16" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded w-16" />
          <div className="h-3 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded w-12" />
        </div>
      </div>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="px-6 py-3 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm" />
          <div className="flex-1">
            <div className="h-4 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded w-1/3 mb-1" />
            <div className="h-3 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonText() {
  return (
    <div className="px-6 py-3 space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-3 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  )
}

function SkeletonCircle() {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm mb-3" />
      <div className="h-4 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded w-24 mb-2" />
      <div className="h-3 bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 animate-pulse-warm rounded w-16" />
    </div>
  )
}

export default function Skeleton({ type = 'card', count = 3 }: SkeletonProps) {
  const Component = type === 'card' ? SkeletonCard
    : type === 'list' ? SkeletonList
    : type === 'text' ? SkeletonText
    : SkeletonCircle

  return (
    <div className="animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  )
}
