import PublishForm from './PublishForm'
import BottomNav from '@/components/BottomNav'

export default function PublishPage() {
  return (
    <div>
      <div className="px-4 py-6 text-white" style={{background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 40%, #C4A882 100%)'}}>
        <h1 className="text-xl font-bold">发布商品</h1>
      </div>
      <PublishForm />
      <BottomNav activePage="publish" />
    </div>
  )
}
