'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function PageContent() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Language Switcher - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* Hero Section - RESTO DO CONTEÚDO IGUAL */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/nova id visual/Hero.jpg"
            alt="Background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(18,18,18,0.6)] via-[rgba(18,18,18,0.8)] to-[rgba(10,10,10,1)]" />
        </div>

        {/* Hero Content */}
        <div className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="font-montserrat text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ textShadow: '0 0 20px rgba(0, 255, 140, 0.2)' }}>
            {t('home.hero.title')}
          </h1>
          <p className="font-open-sans text-lg sm:text-xl text-[#E0E0E0] mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('home.hero.subtitle')}
          </p>
          <Link href="/register">
            <button className="font-open-sans bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)] hover:scale-105 transform">
              {t('home.hero.cta')}
            </button>
          </Link>
          <p className="font-open-sans text-sm text-[#9E9E9E] mt-4">
            {t('home.hero.instantAccess')}
          </p>
        </div>

        {/* Scroll Indicator */}
        <Link href="#como-funciona" className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-pulse-slow cursor-pointer">
          <Image
            src="/assets/images/nova id visual/chevron-down.png"
            alt="Scroll down"
            width={48}
            height={48}
            className="w-12 h-12 animate-bounce-slow"
          />
        </Link>
      </section>

      {/* NOTA: Resto do conteúdo será adicionado depois que confirmarmos que funciona */}
    </div>
  );
}
