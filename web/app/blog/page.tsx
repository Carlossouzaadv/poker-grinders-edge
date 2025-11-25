'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllBlogPosts } from '@/data/blogPosts';

export default function BlogPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Hero */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-montserrat text-5xl sm:text-6xl font-bold text-white mb-6">
            {t('pages.blog.title')}
          </h1>
          <p className="font-open-sans text-xl text-[#E0E0E0]">
            {t('pages.blog.subtitle')}
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {posts
            .filter((post) => !selectedCategory || post.category === selectedCategory)
            .map((post) => (
            <article
              key={post.id}
              className="p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)] group"
              style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="inline-block bg-[#00FF8C]/20 text-[#00FF8C] px-3 py-1 rounded-full font-montserrat text-xs font-bold">
                  {post.category}
                </span>
                <span className="font-open-sans text-sm text-[#9E9E9E]">
                  {new Date(post.date).toLocaleDateString('pt-BR')} • {post.readTime} de leitura
                </span>
              </div>

              <h2 className="font-montserrat text-2xl font-bold text-white mb-3 group-hover:text-[#00FF8C] transition-colors">
                {post.title}
              </h2>

              <p className="font-open-sans text-[#E0E0E0] leading-relaxed mb-6">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-4">
                <Link href={`/blog/${post.slug}`}>
                  <button className="text-[#00FF8C] hover:text-[#00DD7A] font-open-sans font-semibold transition-colors inline-flex items-center gap-2 group">
                    {t('pages.blog.readArticle')}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
              </div>
            </article>
          ))}

          {/* Coming Soon Message */}
          <div className="p-12 rounded-2xl border border-[rgba(76,95,213,0.2)] text-center transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
            <div className="relative w-16 h-16 mx-auto mb-6">
              <Image
                src="/assets/images/nova id visual/icon-idea.png"
                alt={t('pages.blog.comingSoonAlt')}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="font-montserrat text-2xl font-bold text-white mb-3">
              {t('pages.blog.comingSoonTitle')}
            </h3>
            <p className="font-open-sans text-[#E0E0E0] mb-6 max-w-2xl mx-auto">
              {t('pages.blog.comingSoonText')}
            </p>
            <Link href="/register">
              <button className="bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-8 py-3 rounded-lg font-open-sans font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)]">
                {t('pages.blog.notifyButton')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-montserrat text-3xl font-bold text-white text-center mb-4">
            {t('pages.blog.categoriesTitle')}
          </h2>
          <p className="font-open-sans text-[#9E9E9E] text-center mb-12">
            {t('pages.blog.categoriesSubtitle')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`p-4 rounded-lg border transition-all duration-300 font-open-sans ${
                selectedCategory === null
                  ? 'bg-[#00FF8C]/20 border-[#00FF8C] text-[#00FF8C]'
                  : 'border-[rgba(76,95,213,0.2)] text-[#E0E0E0] hover:border-[rgba(0,255,140,0.5)] hover:text-[#00FF8C]'
              }`}
              style={{ background: selectedCategory === null ? 'rgba(0, 255, 140, 0.2)' : 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}
            >
              {t('pages.blog.allCategories')}
            </button>
            {['Estratégia', 'GTO', 'Bankroll', 'Mindset', 'MTT', 'Cash Game', 'Hand Review'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-lg border transition-all duration-300 font-open-sans ${
                  selectedCategory === category
                    ? 'bg-[#00FF8C]/20 border-[#00FF8C] text-[#00FF8C]'
                    : 'border-[rgba(76,95,213,0.2)] text-[#E0E0E0] hover:border-[rgba(0,255,140,0.5)] hover:text-[#00FF8C]'
                }`}
                style={{ background: selectedCategory === category ? 'rgba(0, 255, 140, 0.2)' : 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-montserrat text-4xl font-bold text-white mb-6">
            {t('pages.blog.newsletterTitle')}
          </h2>
          <p className="font-open-sans text-lg text-[#E0E0E0] mb-8">
            {t('pages.blog.newsletterSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={t('pages.blog.emailPlaceholder')}
              className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#4C5FD5]/30 rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all"
            />
            <button className="bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-8 py-3 rounded-lg font-open-sans font-semibold transition-all duration-300 shadow-lg hover:shadow-[#00FF8C]/50 whitespace-nowrap">
              {t('pages.blog.subscribeButton')}
            </button>
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
