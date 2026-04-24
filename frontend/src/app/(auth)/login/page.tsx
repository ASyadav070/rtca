import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 p-4">
      <div className="mb-8">
        <h1 className="text-6xl font-black uppercase tracking-tighter text-black transform -rotate-1 italic">
          RTC App
        </h1>
      </div>
      <LoginForm />
      <p className="mt-6 text-sm font-bold uppercase text-black">
        New here?{' '}
        <Link href="/register" className="underline hover:bg-black hover:text-white transition-colors p-1">
          Create an account
        </Link>
      </p>
    </div>
  );
}
