export function SkeletonCard({ index }: { index?: number }) {
  return (
    <div style={{ padding: '0 16px' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 120, height: 90, borderRadius: 8 }} className="skeleton-shimmer" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
              <div style={{ height: 14, borderRadius: 7, width: '70%' }} className="skeleton-shimmer" />
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ height: 18, borderRadius: 9, width: 50 }} className="skeleton-shimmer" />
                <div style={{ height: 18, borderRadius: 9, width: 60 }} className="skeleton-shimmer" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ height: 18, borderRadius: 9, width: 60 }} className="skeleton-shimmer" />
                <div style={{ height: 12, borderRadius: 6, width: 50 }} className="skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div style={{ padding: '0 16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 120, height: 90, borderRadius: 8 }} className="skeleton-shimmer" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
              <div style={{ height: 14, borderRadius: 7, width: '70%' }} className="skeleton-shimmer" />
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ height: 18, borderRadius: 9, width: 50 }} className="skeleton-shimmer" />
                <div style={{ height: 18, borderRadius: 9, width: 60 }} className="skeleton-shimmer" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ height: 18, borderRadius: 9, width: 60 }} className="skeleton-shimmer" />
                <div style={{ height: 12, borderRadius: 6, width: 50 }} className="skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div style={{ padding: '40px 16px', textAlign: 'center', color: '#bbb' }}>
      <div style={{ fontSize: 24, marginBottom: 8 }} className="animate-spin">⏳</div>
      {text}
    </div>
  );
}
