'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
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

      {/* Hero Section */}
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
          <p className="font-open-sans text-sm text-[#9E9E9E] mt-6">
            {t('home.hero.playerQuestion')} <a href="#" className="text-[#E0E0E0] font-semibold hover:text-[#00FF8C] transition-colors duration-300">{t('home.hero.playerIndividual')}</a>, <a href="#" className="text-[#E0E0E0] font-semibold hover:text-[#00FF8C] transition-colors duration-300">{t('home.hero.playerTeam')}</a> {t('home.hero.playerQuestion').toLowerCase().includes('you') ? 'or' : 'ou é'} <a href="#" className="text-[#E0E0E0] font-semibold hover:text-[#00FF8C] transition-colors duration-300">{t('home.hero.playerCoach')}</a>?
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

      {/* Como Funciona Section */}
      <section id="como-funciona" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/nova id visual/background1.jpg"
            alt="Background Pattern"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/95" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <h2 className="font-montserrat text-4xl sm:text-5xl font-bold text-white text-center mb-4">
            {t('home.howItWorks.title')}
          </h2>
          <p className="font-open-sans text-lg text-[#E0E0E0] text-center mb-16 max-w-2xl mx-auto">
            {t('home.howItWorks.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group p-8 rounded-2xl border border-[#4C5FD5]/20 bg-[#121212]/50 backdrop-blur-sm transition-all duration-300 ease-in-out hover:border-[#00FF8C]/50 hover:shadow-[0_8px_30px_rgba(0,255,140,0.1)] hover:-translate-y-1 text-center">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <Image
                  src="/assets/images/nova id visual/icon-copy.png"
                  alt="Ícone Copiar"
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
              <div className="font-open-sans font-semibold text-sm text-[#00FF8C] tracking-wide mb-4">
                {t('home.howItWorks.step1.badge')}
              </div>
              <h3 className="font-montserrat text-2xl font-semibold text-white mb-3">
                {t('home.howItWorks.step1.title')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                {t('home.howItWorks.step1.description')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="group p-8 rounded-2xl border border-[#4C5FD5]/20 bg-[#121212]/50 backdrop-blur-sm transition-all duration-300 ease-in-out hover:border-[#00FF8C]/50 hover:shadow-[0_8px_30px_rgba(0,255,140,0.1)] hover:-translate-y-1 text-center">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <Image
                  src="/assets/images/nova id visual/icon-paste.png"
                  alt="Ícone Colar"
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
              <div className="font-open-sans font-semibold text-sm text-[#00FF8C] tracking-wide mb-4">
                {t('home.howItWorks.step2.badge')}
              </div>
              <h3 className="font-montserrat text-2xl font-semibold text-white mb-3">
                {t('home.howItWorks.step2.title')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                {t('home.howItWorks.step2.description')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="group p-8 rounded-2xl border border-[#4C5FD5]/20 bg-[#121212]/50 backdrop-blur-sm transition-all duration-300 ease-in-out hover:border-[#00FF8C]/50 hover:shadow-[0_8px_30px_rgba(0,255,140,0.1)] hover:-translate-y-1 text-center">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <Image
                  src="/assets/images/nova id visual/icon-analyze.png"
                  alt="Ícone Analisar"
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
              <div className="font-open-sans font-semibold text-sm text-[#00FF8C] tracking-wide mb-4">
                {t('home.howItWorks.step3.badge')}
              </div>
              <h3 className="font-montserrat text-2xl font-semibold text-white mb-3">
                {t('home.howItWorks.step3.title')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                {t('home.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Teaser do Ecossistema - SEÇÃO CRÍTICA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0a0a0a] to-[#121212]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-4xl sm:text-5xl font-bold text-white mb-4">
              {t('home.ecosystem.title')}
            </h2>
            <p className="font-open-sans text-xl text-[#E0E0E0] max-w-3xl mx-auto">
              {t('home.ecosystem.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Gestor de Bankroll */}
            <div className="group relative p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="absolute top-4 right-4">
                <span className="inline-block bg-[#4C5FD5] text-white text-xs font-open-sans font-semibold px-3 py-1.5 rounded-md">
                  {t('home.ecosystem.feature1.badge')}
                </span>
              </div>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <Image
                  src="/assets/images/nova id visual/bankroll.png"
                  alt="Gestor de Bankroll"
                  fill
                  sizes="96px"
                  className="object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-white text-center mb-4">
                {t('home.ecosystem.feature1.title')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] text-center leading-relaxed">
                {t('home.ecosystem.feature1.description')}
              </p>
            </div>

            {/* Feature 2: Laboratório GTO */}
            <div className="group relative p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="absolute top-4 right-4">
                <span className="inline-block bg-[#4C5FD5] text-white text-xs font-open-sans font-semibold px-3 py-1.5 rounded-md">
                  {t('home.ecosystem.feature2.badge')}
                </span>
              </div>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <Image
                  src="/assets/images/nova id visual/GTO.png"
                  alt="Laboratório GTO"
                  fill
                  sizes="96px"
                  className="object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-white text-center mb-4">
                {t('home.ecosystem.feature2.title')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] text-center leading-relaxed">
                {t('home.ecosystem.feature2.description')}
              </p>
            </div>

            {/* Feature 3: Gestão de Times */}
            <div className="group relative p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="absolute top-4 right-4">
                <span className="inline-block bg-[#4C5FD5] text-white text-xs font-open-sans font-semibold px-3 py-1.5 rounded-md">
                  {t('home.ecosystem.feature3.badge')}
                </span>
              </div>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <Image
                  src="/assets/images/nova id visual/gestao-de-times.png"
                  alt="Gestão de Times"
                  fill
                  sizes="96px"
                  className="object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-white text-center mb-4">
                {t('home.ecosystem.feature3.title')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] text-center leading-relaxed">
                {t('home.ecosystem.feature3.description')}
              </p>
            </div>

            {/* Feature 4: Marketplace */}
            <div className="group relative p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="absolute top-4 right-4">
                <span className="inline-block bg-[#4C5FD5] text-white text-xs font-open-sans font-semibold px-3 py-1.5 rounded-md">
                  {t('home.ecosystem.feature4.badge')}
                </span>
              </div>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <Image
                  src="/assets/images/nova id visual/marketplace.png"
                  alt="Marketplace de Coaches"
                  fill
                  sizes="96px"
                  className="object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-white text-center mb-4">
                {t('home.ecosystem.feature4.title')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] text-center leading-relaxed">
                {t('home.ecosystem.feature4.description')}
              </p>
            </div>
          </div>

          {/* CTA Secundário */}
          <div className="text-center mt-12">
            <p className="font-open-sans text-[#E0E0E0] mb-4">
              {t('home.ecosystem.ctaText')}
            </p>
            <Link href="/register">
              <button className="font-open-sans bg-transparent border-2 border-[#00FF8C] text-[#00FF8C] hover:bg-[rgba(0,255,140,0.1)] px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                {t('home.ecosystem.ctaButton')}
              </button>
            </Link>
          </div>
        </div>
      </section>



      {/* Final CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0a0a0a] to-[#121212] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/assets/images/nova id visual/background1.jpg"
            alt="Background Pattern"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
          <div className="particle particle-6"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="font-montserrat text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8">
            {t('home.finalCta.title')}
          </h2>
          <p className="font-open-sans text-xl text-[#E0E0E0] mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('home.finalCta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <button className="w-full sm:w-auto font-open-sans bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)] hover:scale-105 transform">
                {t('home.finalCta.ctaPrimary')}
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full sm:w-auto font-open-sans bg-transparent border-2 border-[#00FF8C] text-[#00FF8C] hover:bg-[rgba(0,255,140,0.1)] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
                {t('home.finalCta.ctaSecondary')}
              </button>
            </Link>
          </div>
          <p className="font-open-sans text-sm text-[#9E9E9E] mt-6 font-light">
            {t('home.finalCta.tagline')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-[#4C5FD5]/20 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Column 1: Brand */}
            <div>
              <h3 className="font-montserrat text-2xl font-bold text-white mb-4">
                {t('home.footer.brandTitle')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed mb-4">
                {t('home.footer.brandDescription')}
              </p>
              <p className="font-open-sans text-[#9E9E9E] text-sm">
                {t('home.footer.brandTagline')}
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-montserrat text-lg font-semibold text-white mb-4">{t('home.footer.quickLinks')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors duration-300">
                    {t('home.footer.about')}
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors duration-300">
                    {t('home.footer.pricing')}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors duration-300">
                    {t('home.footer.contact')}
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors duration-300">
                    {t('home.footer.blog')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Newsletter & Social */}
            <div>
              <h4 className="font-montserrat text-lg font-semibold text-white mb-4">{t('home.footer.newsletter')}</h4>
              <p className="font-open-sans text-[#E0E0E0] text-sm mb-4">
                {t('home.footer.newsletterText')}
              </p>
              <div className="relative mb-6">
                <input
                  type="email"
                  placeholder={t('home.footer.emailPlaceholder')}
                  className="w-full bg-[#1a1a1a] border border-[rgba(76,95,213,0.3)] text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:border-[#00FF8C] focus:shadow-[0_0_0_3px_rgba(0,255,140,0.1)] transition-all duration-300 placeholder:text-[#9E9E9E]"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                  <Image
                    src="/assets/images/nova id visual/icon-arrow-right.png"
                    alt="Enviar"
                    width={24}
                    height={24}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
              <div className="flex gap-4">
                {/* Twitter/X */}
                <a href="#" className="text-[#9E9E9E] hover:text-[#00FF8C] transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="text-[#9E9E9E] hover:text-[#00FF8C] transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" className="text-[#9E9E9E] hover:text-[#00FF8C] transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-[#4C5FD5]/20 text-center">
            <p className="font-open-sans text-[#9E9E9E] text-sm">
              {t('home.footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
