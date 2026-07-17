import WantForm from '../WantForm'
import BackButton from '@/components/BackButton'

export default function WantPostPage() {
  return (
    <div>
      <div className="bg-gradient-primary px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold">发布求购</h1>
        </div>
      </div>
      <WantForm />
    </div>
  )
}
