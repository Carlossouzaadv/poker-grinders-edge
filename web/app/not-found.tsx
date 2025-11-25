'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="font-montserrat text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF8C] to-[#4C5FD5] mb-4">
            404
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-[#00FF8C] to-[#4C5FD5] mx-auto mb-8 rounded-full" />
        </div>

        {/* Icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <Image
            src="/assets/images/nova id visual/icon-idea.png"
            alt="Página não encontrada"
            fill
            className="object-contain opacity-50"
          />
        </div>

        {/* Message */}
        <div className="mb-12">
          <h2 className="font-montserrat text-3xl font-bold text-white mb-4">
            Página Não Encontrada
          </h2>
          <p className="font-open-sans text-lg text-[#E0E0E0] mb-2">
            Parece que você tentou um bluff arriscado e acabou em um lugar que não existe.
          </p>
          <p className="font-open-sans text-[#9E9E9E]">
            Que tal voltar para uma jogada mais segura?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <button className="w-full sm:w-auto font-open-sans bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)] hover:scale-105 transform">
              {t('pages.navigation.backToHome')}
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full sm:w-auto font-open-sans bg-transparent border-2 border-[#00FF8C] text-[#00FF8C] hover:bg-[rgba(0,255,140,0.1)] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
              Ir para Dashboard
            </button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-16 p-8 rounded-2xl border border-[rgba(76,95,213,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
          <h3 className="font-montserrat text-xl font-semibold text-white mb-6">
            Links Úteis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/about" className="group">
              <div className="p-4 rounded-lg border border-[rgba(76,95,213,0.2)] hover:border-[rgba(0,255,140,0.5)] transition-all duration-300">
                <svg className="w-8 h-8 text-[#00FF8C] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-open-sans text-sm text-[#E0E0E0] group-hover:text-[#00FF8C] transition-colors">
                  {t('pages.navigation.about')}
                </p>
              </div>
            </Link>

            <Link href="/pricing" className="group">
              <div className="p-4 rounded-lg border border-[rgba(76,95,213,0.2)] hover:border-[rgba(0,255,140,0.5)] transition-all duration-300">
                <svg className="w-8 h-8 text-[#00FF8C] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-open-sans text-sm text-[#E0E0E0] group-hover:text-[#00FF8C] transition-colors">
                  {t('pages.navigation.pricing')}
                </p>
              </div>
            </Link>

            <Link href="/blog" className="group">
              <div className="p-4 rounded-lg border border-[rgba(76,95,213,0.2)] hover:border-[rgba(0,255,140,0.5)] transition-all duration-300">
                <svg className="w-8 h-8 text-[#00FF8C] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="font-open-sans text-sm text-[#E0E0E0] group-hover:text-[#00FF8C] transition-colors">
                  {t('pages.navigation.blog')}
                </p>
              </div>
            </Link>

            <Link href="/contact" className="group">
              <div className="p-4 rounded-lg border border-[rgba(76,95,213,0.2)] hover:border-[rgba(0,255,140,0.5)] transition-all duration-300">
                <svg className="w-8 h-8 text-[#00FF8C] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="font-open-sans text-sm text-[#E0E0E0] group-hover:text-[#00FF8C] transition-colors">
                  {t('pages.navigation.contact')}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8">
          <p className="font-open-sans text-sm text-[#4C5FD5] italic">
            "Até os melhores jogadores tomam bad beats. O importante é saber quando fazer fold e tentar de novo."
          </p>
        </div>
      </div>
    </div>
  );
}
