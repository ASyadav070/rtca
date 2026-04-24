import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="mb-8">
        <h1 className="text-6xl font-black uppercase tracking-tighter text-black transform rotate-1 italic">
          Join Us
        </h1>
      </div>
      <RegisterForm />
      <p className="mt-6 text-sm font-bold uppercase text-black">
        Already have an account?{' '}
        <Link href="/login" className="underline hover:bg-black hover:text-white transition-colors p-1">
          Login instead
        </Link>
      </p>
    </div>
  );
}
