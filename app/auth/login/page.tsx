import AuthForm from './AuthForm'

export default function LoginPage() {
  return (
    <div>
      <div className="bg-gradient-primary px-4 py-12 text-white text-center">
        <div className="text-5xl mb-4">📚</div>
        <h1 className="text-2xl font-bold">新校书仓</h1>
        <p className="text-sm opacity-80 mt-2">校园二手教材交易平台</p>
      </div>
      <AuthForm />
    </div>
  )
}
