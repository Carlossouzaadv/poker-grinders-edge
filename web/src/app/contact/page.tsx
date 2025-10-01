'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ContactPage() {
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
      setSubmitMessage('Mensagem enviada com sucesso! Entraremos em contato em breve.');
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
            Entre em Contato
          </h1>
          <p className="font-open-sans text-xl text-[#E0E0E0]">
            Tem alguma dúvida, sugestão ou feedback? Adoraríamos ouvir você.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] p-8 rounded-2xl border border-[#4C5FD5]/30">
            <h2 className="font-montserrat text-3xl font-bold text-white mb-6">
              Envie uma Mensagem
            </h2>

            {submitMessage && (
              <div className="mb-6 p-4 bg-[#00FF8C]/10 border border-[#00FF8C]/30 rounded-lg">
                <p className="font-open-sans text-[#00FF8C]">{submitMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block font-open-sans text-sm font-medium text-[#E0E0E0] mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#4C5FD5]/30 rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-open-sans text-sm font-medium text-[#E0E0E0] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#4C5FD5]/30 rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block font-open-sans text-sm font-medium text-[#E0E0E0] mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#4C5FD5]/30 rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all"
                  placeholder="Como podemos ajudar?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block font-open-sans text-sm font-medium text-[#E0E0E0] mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#4C5FD5]/30 rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all resize-none"
                  placeholder="Conte-nos mais detalhes..."
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
                    Enviando...
                  </span>
                ) : (
                  'Enviar Mensagem'
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-montserrat text-3xl font-bold text-white mb-6">
                Outras Formas de Contato
              </h2>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed mb-8">
                Prefere outro canal? Você pode nos encontrar nas redes sociais ou enviar um email direto.
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
                    <a href="mailto:contato@pokergrindersedge.com" className="font-open-sans text-[#00FF8C] hover:text-[#00DD7A] transition-colors">
                      contato@pokergrindersedge.com
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
                    <a href="#" className="font-open-sans text-[#00FF8C] hover:text-[#00DD7A] transition-colors">
                      @PokerGrindersEdge
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)] hover:shadow-[0_8px_24px_rgba(0,255,140,0.15)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src="/assets/images/nova id visual/icon-instagram.png"
                      alt="Instagram"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-montserrat font-bold text-white mb-1">Instagram</h3>
                    <a href="#" className="font-open-sans text-[#00FF8C] hover:text-[#00DD7A] transition-colors">
                      @pokergrindersedge
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] p-6 rounded-xl border border-[#4C5FD5]/30">
              <h3 className="font-montserrat text-xl font-bold text-white mb-2">
                Dúvidas Frequentes?
              </h3>
              <p className="font-open-sans text-[#E0E0E0] mb-4">
                Confira nossa página de preços para ver as perguntas mais comuns.
              </p>
              <Link href="/pricing">
                <button className="text-[#00FF8C] hover:text-[#00DD7A] font-open-sans font-semibold transition-colors inline-flex items-center gap-2">
                  Ver FAQ
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
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
