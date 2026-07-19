'use client';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="w-full max-w-[360px] bg-white/85 backdrop-blur-sm rounded-card p-10 text-center shadow-card animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-lg font-semibold text-primary mb-3">页面出现异常</h2>
        {error?.message && (
          <p className="text-sm text-gray-500 mb-6 leading-relaxed break-all">{error.message}</p>
        )}
        <div className="flex flex-col gap-3">
          <button onClick={reset} className="btn-primary w-full">重试</button>
          <a href="/" className="text-sm text-warm-500 no-underline">返回首页</a>
        </div>
      </div>
    </div>
  );
}
