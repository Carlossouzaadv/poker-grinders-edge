'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/lib/auth-api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      // Only send email and password to the API (backend doesn't accept rememberMe)
      const { email, password } = data;
      const response = await authApi.login({ email, password });

      login(
        {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
        },
        response.user
      );

      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Email ou senha incorretos. Tente novamente.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/nova id visual/Hero.jpg"
            alt="Background"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#121212] to-[#121212]/90" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          <Link href="/" className="mb-8">
            <h1 className="font-montserrat text-4xl font-bold text-white">
              Poker Grinder's Edge
            </h1>
          </Link>
          <h2 className="font-montserrat text-3xl font-bold text-white mb-4">
            O Futuro da Sua Performance.
          </h2>
          <p className="font-open-sans text-lg text-[#E0E0E0] leading-relaxed mb-8">
            Entre na sua conta e continue a jornada para transformar seus dados em domínio.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00FF8C]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-[#00FF8C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="font-open-sans text-[#E0E0E0]">
                Tome decisões com a precisão do GTO.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00FF8C]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-[#00FF8C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="font-open-sans text-[#E0E0E0]">
                Gerencie seu bankroll como um profissional de elite.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00FF8C]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-[#00FF8C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="font-open-sans text-[#E0E0E0]">
                Encontre seus leaks antes que eles custem dinheiro.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00FF8C]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-[#00FF8C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="font-open-sans text-[#E0E0E0]">
                Acesse a vantagem que os outros não veem.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <h1 className="font-montserrat text-3xl font-bold text-white">
                Poker Grinder's Edge
              </h1>
            </Link>
          </div>

          <div>
            <h2 className="font-montserrat text-3xl font-bold text-white">
              Entrar na sua conta
            </h2>
            <p className="mt-2 font-open-sans text-sm text-[#E0E0E0]">
              Ainda não tem conta?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#00FF8C] hover:text-[#00DD7A] transition-colors"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-lg bg-red-900/20 p-4 border border-red-500/50">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="font-open-sans text-sm text-red-200">{error}</div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block font-open-sans text-sm font-medium text-[#E0E0E0] mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#4C5FD5]/30 placeholder-[#9E9E9E] text-white bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all sm:text-sm"
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="mt-2 font-open-sans text-sm text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block font-open-sans text-sm font-medium text-[#E0E0E0] mb-2">
                  Senha
                </label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#4C5FD5]/30 placeholder-[#9E9E9E] text-white bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all sm:text-sm"
                  placeholder="Sua senha"
                />
                {errors.password && (
                  <p className="mt-2 font-open-sans text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="remember-me"
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 rounded border-[#4C5FD5]/30 bg-[#1a1a1a] text-[#00FF8C] focus:ring-[#00FF8C] focus:ring-offset-[#121212] cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block font-open-sans text-sm text-[#E0E0E0] cursor-pointer">
                  Manter-me conectado
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent font-open-sans text-sm font-semibold rounded-lg text-[#121212] bg-[#00FF8C] hover:bg-[#00DD7A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FF8C] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-[#00FF8C]/50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="font-open-sans text-sm text-[#E0E0E0] hover:text-[#00FF8C] transition-colors"
              >
                ← Voltar para a página inicial
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
