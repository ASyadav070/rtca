'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Username or email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      setAuth(response.user, response.jwt);
      router.push('/lobby');
    } catch (err: unknown) {
      const errorMessage = (err && typeof err === 'object' && 'message' in err) 
        ? (err as { message: string }).message 
        : 'Invalid credentials';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
        Login
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-bold uppercase text-black">
            Username or Email
          </label>
          <input
            {...register('identifier')}
            className={cn(
              "w-full px-4 py-2 mt-1 border-4 border-black focus:outline-none focus:ring-0 transition-colors",
              errors.identifier ? "border-red-600 bg-red-50" : "focus:bg-yellow-50"
            )}
          />
          {errors.identifier && (
            <p className="mt-1 text-xs font-bold text-red-600 uppercase">
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold uppercase text-black">
            Password
          </label>
          <input
            type="password"
            {...register('password')}
            className={cn(
              "w-full px-4 py-2 mt-1 border-4 border-black focus:outline-none focus:ring-0 transition-colors",
              errors.password ? "border-red-600 bg-red-50" : "focus:bg-yellow-50"
            )}
          />
          {errors.password && (
            <p className="mt-1 text-xs font-bold text-red-600 uppercase">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 font-bold text-white bg-red-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 text-xl font-black uppercase border-4 border-black bg-black text-white hover:bg-yellow-400 hover:text-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          <span className="relative z-10">
            {isLoading ? 'Decrypting...' : 'Enter the Void'}
          </span>
          <div className="absolute inset-0 bg-yellow-400 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </form>
    </div>
  );
}
