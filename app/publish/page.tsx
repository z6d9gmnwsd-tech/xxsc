import PublishForm from './PublishForm'
import BackButton from '@/components/BackButton'

export default function PublishPage() {
  return (
    <div>
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold">发布商品</h1>
        </div>
      </div>
      <PublishForm />
    </div>
  )
}
