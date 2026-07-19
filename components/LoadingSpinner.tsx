export default function LoadingSpinner() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            padding: 10,
            animationDelay: `${i * 100}ms`,
          }}
        >
          <div className="flex gap-3">
            {/* Thumbnail placeholder */}
            <div
              className="skeleton-shimmer flex-shrink-0"
              style={{ width: 120, height: 90, borderRadius: 8 }}
            />

            {/* Content placeholder */}
            <div className="flex flex-1 flex-col justify-between py-1">
              {/* Title */}
              <div
                className="skeleton-shimmer"
                style={{
                  width: '85%',
                  height: 16,
                  borderRadius: 4,
                }}
              />

              {/* Tags */}
              <div className="flex gap-2 mt-2">
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: 48,
                    height: 20,
                    borderRadius: 50,
                  }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: 56,
                    height: 20,
                    borderRadius: 50,
                  }}
                />
              </div>

              {/* Price */}
              <div
                className="skeleton-shimmer mt-2"
                style={{
                  width: 64,
                  height: 20,
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
