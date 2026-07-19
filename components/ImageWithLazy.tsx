'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';

interface ImageWithLazyProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  width?: number;
  height?: number;
}

export default function ImageWithLazy({
  src,
  alt,
  className = '',
  style = {},
  width,
  height,
}: ImageWithLazyProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const bookSvg = (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h8" />
    </svg>
  );

  return (
    <div
      ref={imgRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: width || '100%',
        height: height || '100%',
        ...style,
      }}
    >
      {!loaded && !error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      )}

      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {bookSvg}
        </div>
      )}

      {inView && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </div>
  );
}
