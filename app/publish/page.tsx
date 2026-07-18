import PublishForm from './PublishForm'
import BackButton from '@/components/BackButton'
import { BookOpen } from 'lucide-react'

export default function PublishPage() {
  return (
    <div style={{ background: '#F2F2F7', minHeight: '100vh' }}>
      <div
        className="header-glass px-4 py-6 text-white"
        style={{
          background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex items-center gap-2">
            <BookOpen size={20} />
            <h1 className="text-xl font-bold">发布商品</h1>
          </div>
        </div>
      </div>
      <PublishForm />
    </div>
  )
}
