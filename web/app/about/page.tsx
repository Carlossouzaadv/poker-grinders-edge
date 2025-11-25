'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/nova id visual/background1.jpg"
            alt="Background"
            fill
            className="object-cover opacity-20"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="font-montserrat text-5xl sm:text-6xl font-bold text-white mb-6">
            {t('pages.about.title')}
          </h1>
          <p className="font-open-sans text-xl text-[#E0E0E0] leading-relaxed">
            {t('pages.about.subtitle')}
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-montserrat text-4xl font-bold text-white mb-8">
            {t('pages.about.storyTitle')}
          </h2>
          <div className="space-y-6 font-open-sans text-lg text-[#E0E0E0] leading-relaxed">
            <p dangerouslySetInnerHTML={{ __html: t('pages.about.storyP1') }} />
            <p dangerouslySetInnerHTML={{ __html: t('pages.about.storyP2') }} />
            <p dangerouslySetInnerHTML={{ __html: t('pages.about.storyP3') }} />
            <p dangerouslySetInnerHTML={{ __html: t('pages.about.storyP4') }} />
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/nova id visual/background1.jpg"
            alt="Background Pattern"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/95" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-16 h-16 mb-6">
                <Image
                  src="/assets/images/nova id visual/icon-mission.png"
                  alt={t('pages.about.missionLabel')}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-white mb-4">
                {t('pages.about.missionLabel')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                {t('pages.about.missionText')}
              </p>
            </div>

            {/* Vision */}
            <div className="p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-16 h-16 mb-6">
                <Image
                  src="/assets/images/nova id visual/icon-vision.png"
                  alt={t('pages.about.visionLabel')}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-white mb-4">
                {t('pages.about.visionLabel')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                {t('pages.about.visionText')}
              </p>
            </div>

            {/* Values */}
            <div className="p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-16 h-16 mb-6">
                <Image
                  src="/assets/images/nova id visual/icon-values.png"
                  alt={t('pages.about.valuesLabel')}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-white mb-4">
                {t('pages.about.valuesLabel')}
              </h3>
              <ul className="font-open-sans text-[#E0E0E0] leading-relaxed space-y-2" dangerouslySetInnerHTML={{ __html: t('pages.about.valuesList') }} />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-montserrat text-4xl font-bold text-white mb-6">
            {t('pages.about.ctaTitle')}
          </h2>
          <p className="font-open-sans text-xl text-[#E0E0E0] mb-8">
            {t('pages.about.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="font-open-sans bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-[#00FF8C]/50 hover:scale-105 transform">
                {t('pages.navigation.createAccount')}
              </button>
            </Link>
            <Link href="/contact">
              <button className="font-open-sans bg-transparent border-2 border-[#00FF8C] text-[#00FF8C] hover:bg-[#00FF8C] hover:text-[#121212] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
                {t('pages.navigation.contactUs')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="py-8 px-4 text-center">
        <Link
          href="/"
          className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('pages.navigation.backToHome')}
        </Link>
      </div>
    </div>
  );
}
