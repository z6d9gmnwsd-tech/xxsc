export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: '#F2F2F7',
    }} className="animate-fade-in">
      <div style={{
        width: '100%',
        maxWidth: 360,
        textAlign: 'center',
      }}>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F5E6D0, #E0C9A8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
          </svg>
        </div>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#1a1a1a',
          margin: '0 0 12px',
        }}>
          页面不存在
        </h1>
        <p style={{
          fontSize: 14,
          color: '#666',
          margin: '0 0 32px',
          lineHeight: 1.5,
        }}>
          您访问的页面可能已移动或删除
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <a
            href="/"
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 200,
              height: 44,
            }}
          >
            返回首页
          </a>
          <button
            onClick={() => window.history.back()}
            style={{
              fontSize: 14,
              color: '#8B6914',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
