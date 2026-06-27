import LoginForm from '../components/modules/auth/LoginForm';

const Root = () => (
  <main className="flex min-h-dvh flex-col items-center justify-center bg-cream-50 px-4">
    <div className="mb-10 text-center">
      <p className="vc-wordmark text-xs tracking-[0.3em] text-gold-700">Vastriq Closet</p>
      <h1 className="mt-3 font-serif text-4xl text-primary-900">Admin Console</h1>
      <p className="mt-2 text-sm text-gray-400">Sign in to manage the marketplace</p>
    </div>

    <LoginForm className="w-96 rounded-lg border border-gold-200 bg-cream-25 p-8 shadow-sm" />

    <p className="mt-6 text-xs text-gray-400">© {new Date().getFullYear()} Vastriq Closet</p>
  </main>
);

export default Root;
