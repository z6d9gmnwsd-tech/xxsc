import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: '新校书仓 - 校园二手教材交易平台',
  description: '校园二手教材与考研资料交易平台，低价买书、轻松卖书',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F5E6D0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="新校书仓" />
      </head>
      <body className="bg-cream">
        <div className="mx-auto max-w-[480px] min-h-screen bg-cream relative">
          {children}
        </div>
      </body>
    </html>
  )
}
