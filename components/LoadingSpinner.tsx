export default function SkeletonCard() {
  return (
    <div className="px-4 py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card mb-3 animate-pulse">
          <div className="flex overflow-hidden">
            <div className="w-[120px] h-[120px] rounded-lg skeleton-shimmer" style={{background: '#f0ebe4'}} />
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <div className="h-4 rounded-full w-3/4 mb-3 skeleton-shimmer" style={{background: '#f0ebe4'}} />
                <div className="h-3 rounded-full w-1/2 mb-2 skeleton-shimmer" style={{background: '#f0ebe4'}} />
                <div className="flex gap-2 mt-2">
                  <div className="h-5 rounded-full w-14 skeleton-shimmer" style={{background: '#f0ebe4'}} />
                  <div className="h-5 rounded-full w-12 skeleton-shimmer" style={{background: '#f0ebe4'}} />
                </div>
              </div>
              <div className="flex justify-between items-end mt-3">
                <div className="h-5 rounded-full w-16 skeleton-shimmer" style={{background: '#f0ebe4'}} />
                <div className="h-3 rounded-full w-12 skeleton-shimmer" style={{background: '#f0ebe4'}} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
