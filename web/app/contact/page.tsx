'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage(t('pages.contact.successMessage'));
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Hero */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-montserrat text-5xl sm:text-6xl font-bold text-white mb-6">
            {t('pages.contact.title')}
          </h1>
          <p className="font-open-sans text-xl text-[#E0E0E0]">
            {t('pages.contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] p-8 rounded-2xl border border-[#4C5FD5]/30">
            <h2 className="font-montserrat text-3xl font-bold text-white mb-6">
              {t('pages.contact.formTitle')}
            </h2>

            {submitMessage && (
              <div className="mb-6 p-4 bg-[#00FF8C]/10 border border-[#00FF8C]/30 rounded-lg">
                <p className="font-open-sans text-[#00FF8C]">{submitMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block font-open-sans text-sm font-medium text-[#E0E0E0] mb-2">
                  {t('pages.contact.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#4C5FD5]/30 rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all"
                  placeholder={t('pages.contact.namePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-open-sans text-sm font-medium text-[#E0E0E0] mb-2">
                  {t('pages.contact.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#4C5FD5]/30 rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all"
                  placeholder={t('pages.contact.emailPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block font-open-sans text-sm font-medium text-[#E0E0E0] mb-2">
                  {t('pages.contact.subject')}
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#4C5FD5]/30 rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all"
                  placeholder={t('pages.contact.subjectPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="message" className="block font-open-sans text-sm font-medium text-[#E0E0E0] mb-2">
                  {t('pages.contact.message')}
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#4C5FD5]/30 rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all resize-none"
                  placeholder={t('pages.contact.messagePlaceholder')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] py-3 rounded-lg font-open-sans font-semibold transition-all duration-300 shadow-lg hover:shadow-[#00FF8C]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  t('pages.contact.sendButton')
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-montserrat text-3xl font-bold text-white mb-6">
                {t('pages.contact.otherWays')}
              </h2>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed mb-8">
                {t('pages.contact.otherWaysDesc')}
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <div className="p-6 rounded-xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)] hover:shadow-[0_8px_24px_rgba(0,255,140,0.15)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src="/assets/images/nova id visual/icon-email.png"
                      alt="Email"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-montserrat font-bold text-white mb-1">Email</h3>
                    <a href="mailto:pokergrindersedge@gmail.com" className="font-open-sans text-[#00FF8C] hover:text-[#00DD7A] transition-colors">
                      pokergrindersedge@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)] hover:shadow-[0_8px_24px_rgba(0,255,140,0.15)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src="/assets/images/nova id visual/icon-x.png"
                      alt="X (Twitter)"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-montserrat font-bold text-white mb-1">X (Twitter)</h3>
                    <a href="https://x.com/PokerMasteryApp" target="_blank" rel="noopener noreferrer" className="font-open-sans text-[#00FF8C] hover:text-[#00DD7A] transition-colors">
                      @PokerMasteryApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)] hover:shadow-[0_8px_24px_rgba(0,255,140,0.15)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#00FF8C]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-montserrat font-bold text-white mb-1">Instagram</h3>
                    <a href="https://www.instagram.com/pokermasteryapp/" target="_blank" rel="noopener noreferrer" className="font-open-sans text-[#00FF8C] hover:text-[#00DD7A] transition-colors">
                      @pokermasteryapp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] p-6 rounded-xl border border-[#4C5FD5]/30">
              <h3 className="font-montserrat text-xl font-bold text-white mb-2">
                {t('pages.contact.faqTitle')}
              </h3>
              <p className="font-open-sans text-[#E0E0E0] mb-4">
                {t('pages.contact.faqDesc')}
              </p>
              <Link href="/pricing">
                <button className="text-[#00FF8C] hover:text-[#00DD7A] font-open-sans font-semibold transition-colors inline-flex items-center gap-2">
                  {t('pages.contact.faqButton')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
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
          {t('pages.contact.backToHome')}
        </Link>
      </div>
    </div>
  );
}
