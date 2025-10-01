'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header/Navbar */}
      <header className="bg-[#0a0a0a] border-b border-[#4C5FD5]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="font-montserrat text-2xl font-bold text-white hover:text-[#00FF8C] transition-colors cursor-pointer">
                Poker Grinder's Edge
              </h1>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-transparent border border-[#4C5FD5]/30 hover:border-[#00FF8C] text-[#E0E0E0] hover:text-[#00FF8C] rounded-lg transition-all duration-300 font-open-sans text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="font-montserrat text-4xl font-bold text-white mb-2">
            Bem-vindo, {user.firstName}!
          </h2>
          <p className="font-open-sans text-lg text-[#E0E0E0]">
            Pronto para elevar seu jogo? Comece analisando suas mãos.
          </p>
        </div>

        {/* Quick Actions - Main Feature */}
        <div className="mb-12">
          <h3 className="font-montserrat text-2xl font-semibold text-white mb-6">
            Ferramentas Disponíveis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hand Analyzer Card - Active */}
            <Link href="/hand-analyzer/new">
              <div className="group rounded-2xl p-8 border-2 border-[#00FF8C] transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)', boxShadow: '0 0 20px rgba(0, 255, 140, 0.1)' }}>
                <div className="flex items-center mb-6">
                  <div className="relative w-16 h-16">
                    <Image
                      src="/assets/images/nova id visual/stats.jpg"
                      alt="Hand Replayer"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-montserrat text-2xl font-bold text-white mb-1">
                      Hand Replayer
                    </h4>
                    <span className="inline-block bg-[#00FF8C]/20 text-[#00FF8C] px-2 py-1 rounded-full font-montserrat text-xs font-bold">
                      DISPONÍVEL
                    </span>
                  </div>
                </div>
                <p className="font-open-sans text-[#E0E0E0] leading-relaxed mb-6">
                  Analise suas mãos de forma visual e interativa. Cole seu histórico de torneio e reveja cada decisão.
                </p>
                <div className="flex items-center text-[#00FF8C] font-open-sans font-semibold group-hover:translate-x-2 transition-transform">
                  Começar Análise
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Sessions History Card - Coming Soon */}
            <div className="rounded-2xl p-8 border-2 border-[#4C5FD5] opacity-75" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="flex items-center mb-6">
                <div className="relative w-16 h-16">
                  <Image
                    src="/assets/images/nova id visual/icon-session-history.png"
                    alt="Histórico de Sessões"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="font-montserrat text-2xl font-bold text-white mb-1">
                    Histórico de Sessões
                  </h4>
                  <span className="inline-block bg-[#4C5FD5]/20 text-[#4C5FD5] px-2 py-1 rounded-full font-montserrat text-xs font-bold">
                    EM BREVE
                  </span>
                </div>
              </div>
              <p className="font-open-sans text-[#9E9E9E] leading-relaxed">
                Veja suas sessões anteriores e análises salvas. Acompanhe sua evolução ao longo do tempo.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-montserrat text-2xl font-semibold text-white">
              O Futuro do Seu Jogo
            </h3>
            <span className="font-open-sans text-sm text-[#9E9E9E]">
              Funcionalidades em desenvolvimento
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bankroll */}
            <div className="rounded-xl p-6 border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Image
                  src="/assets/images/nova id visual/bankroll.png"
                  alt="Bankroll"
                  fill
                  className="object-contain"
                />
              </div>
              <h4 className="font-montserrat text-lg font-bold text-white text-center mb-2">
                Gestor de Bankroll
              </h4>
              <p className="font-open-sans text-xs text-[#9E9E9E] text-center">
                Controle total das suas finanças
              </p>
            </div>

            {/* GTO Lab */}
            <div className="rounded-xl p-6 border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Image
                  src="/assets/images/nova id visual/GTO.png"
                  alt="GTO"
                  fill
                  className="object-contain"
                />
              </div>
              <h4 className="font-montserrat text-lg font-bold text-white text-center mb-2">
                Laboratório GTO
              </h4>
              <p className="font-open-sans text-xs text-[#9E9E9E] text-center">
                Treine cenários e elimine leaks
              </p>
            </div>

            {/* Teams */}
            <div className="rounded-xl p-6 border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Image
                  src="/assets/images/nova id visual/gestao-de-times.png"
                  alt="Teams"
                  fill
                  className="object-contain"
                />
              </div>
              <h4 className="font-montserrat text-lg font-bold text-white text-center mb-2">
                Gestão de Times
              </h4>
              <p className="font-open-sans text-xs text-[#9E9E9E] text-center">
                Para coaches profissionais
              </p>
            </div>

            {/* Marketplace */}
            <div className="rounded-xl p-6 border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Image
                  src="/assets/images/nova id visual/marketplace.png"
                  alt="Marketplace"
                  fill
                  className="object-contain"
                />
              </div>
              <h4 className="font-montserrat text-lg font-bold text-white text-center mb-2">
                Marketplace
              </h4>
              <p className="font-open-sans text-xs text-[#9E9E9E] text-center">
                Encontre coaches de elite
              </p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl p-8 border border-[rgba(76,95,213,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
          <h3 className="font-montserrat text-2xl font-semibold text-white mb-6">
            Informações da Conta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl p-6 border border-[rgba(76,95,213,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <p className="font-open-sans text-sm text-[#9E9E9E] mb-2">Email</p>
              <p className="font-open-sans text-white font-semibold break-all">{user.email}</p>
            </div>
            {user.phone && (
              <div className="rounded-xl p-6 border border-[rgba(76,95,213,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
                <p className="font-open-sans text-sm text-[#9E9E9E] mb-2">Telefone</p>
                <p className="font-open-sans text-white font-semibold">{user.phone}</p>
              </div>
            )}
            <div className="rounded-xl p-6 border border-[rgba(76,95,213,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <p className="font-open-sans text-sm text-[#9E9E9E] mb-2">Plano</p>
              <p className="font-montserrat text-xl text-[#00FF8C] font-bold">{user.plan || 'FREE'}</p>
            </div>
            <div className="rounded-xl p-6 border border-[rgba(76,95,213,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <p className="font-open-sans text-sm text-[#9E9E9E] mb-2">Tipo</p>
              <p className="font-open-sans text-white font-semibold">{user.userType || 'PLAYER'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
