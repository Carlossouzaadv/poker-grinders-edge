'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function PricingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Hero */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-montserrat text-5xl sm:text-6xl font-bold text-white mb-6">
            Planos e Preços
          </h1>
          <p className="font-open-sans text-xl text-[#E0E0E0]">
            Comece gratuitamente com o Hand Replayer. Mais funcionalidades em breve.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Free Plan - Current */}
          <div className="relative p-8 rounded-2xl border-2 border-[#00FF8C] transition-all duration-500 hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#00FF8C] text-[#121212] px-4 py-1 rounded-full font-montserrat text-sm font-bold">
                DISPONÍVEL AGORA
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="font-montserrat text-2xl font-bold text-white mb-4">Free</h3>
              <div className="font-montserrat text-6xl font-bold text-white mb-2">R$ 0</div>
              <p className="font-open-sans text-[#9E9E9E]">Para sempre</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Hand Replayer completo</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Análise de mãos ilimitadas</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Histórico de sessões</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Compartilhamento de análises</span>
              </li>
            </ul>
            <Link href="/register">
              <button className="w-full bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] py-3 rounded-lg font-open-sans font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)]">
                Começar Grátis
              </button>
            </Link>
          </div>

          {/* Pro Plan - Coming Soon */}
          <div className="relative p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] opacity-75 transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
            <div className="text-center mb-6">
              <h3 className="font-montserrat text-2xl font-bold text-white mb-4">Pro</h3>
              <div className="font-montserrat text-6xl font-bold text-white mb-2">R$ 49</div>
              <p className="font-open-sans text-[#9E9E9E]">por mês</p>
            </div>
            <div className="mb-4">
              <span className="inline-block bg-[#4C5FD5] text-white px-3 py-1 rounded-full font-montserrat text-xs font-bold">
                EM BREVE
              </span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Tudo do Free +</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Gestor de Bankroll</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Laboratório GTO</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Detecção de Leaks por IA</span>
              </li>
            </ul>
            <button disabled className="w-full bg-[#4C5FD5]/30 text-[#9E9E9E] py-3 rounded-lg font-open-sans font-semibold cursor-not-allowed">
              Em Breve
            </button>
          </div>

          {/* Coach Plan - Coming Soon */}
          <div className="relative p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] opacity-75 transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
            <div className="text-center mb-6">
              <h3 className="font-montserrat text-2xl font-bold text-white mb-4">Coach</h3>
              <div className="font-montserrat text-6xl font-bold text-white mb-2">R$ 149</div>
              <p className="font-open-sans text-[#9E9E9E]">por mês</p>
            </div>
            <div className="mb-4">
              <span className="inline-block bg-[#4C5FD5] text-white px-3 py-1 rounded-full font-montserrat text-xs font-bold">
                EM BREVE
              </span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Tudo do Pro +</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Gestão de Times</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Dashboard agregado</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#00FF8C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-open-sans text-[#E0E0E0]">Perfil no Marketplace</span>
              </li>
            </ul>
            <button disabled className="w-full bg-[#4C5FD5]/30 text-[#9E9E9E] py-3 rounded-lg font-open-sans font-semibold cursor-not-allowed">
              Em Breve
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-montserrat text-4xl font-bold text-white text-center mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div
              className={`p-6 rounded-lg border transition-all duration-300 cursor-pointer ${
                openFaqIndex === 0 ? 'border-[#00FF8C]' : 'border-[rgba(76,95,213,0.2)]'
              }`}
              style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}
              onClick={() => toggleFaq(0)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-montserrat text-xl font-bold text-white pr-4">
                  O plano Free é realmente gratuito para sempre?
                </h3>
                <div className={`relative w-6 h-6 flex-shrink-0 transition-transform duration-300 ${openFaqIndex === 0 ? 'rotate-180' : ''}`}>
                  <Image
                    src="/assets/images/nova id visual/icon-chevron-faq.png"
                    alt="Expandir"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFaqIndex === 0 ? 'max-h-96 mt-4' : 'max-h-0'
                }`}
              >
                <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                  Sim! O Hand Replayer sempre será gratuito. Quando lançarmos as funcionalidades premium, você poderá continuar usando o Hand Replayer sem pagar nada.
                </p>
              </div>
            </div>

            {/* FAQ Item 2 */}
            <div
              className={`p-6 rounded-lg border transition-all duration-300 cursor-pointer ${
                openFaqIndex === 1 ? 'border-[#00FF8C]' : 'border-[rgba(76,95,213,0.2)]'
              }`}
              style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}
              onClick={() => toggleFaq(1)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-montserrat text-xl font-bold text-white pr-4">
                  Quando os planos pagos serão lançados?
                </h3>
                <div className={`relative w-6 h-6 flex-shrink-0 transition-transform duration-300 ${openFaqIndex === 1 ? 'rotate-180' : ''}`}>
                  <Image
                    src="/assets/images/nova id visual/icon-chevron-faq.png"
                    alt="Expandir"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFaqIndex === 1 ? 'max-h-96 mt-4' : 'max-h-0'
                }`}
              >
                <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                  Estamos trabalhando duro no ecossistema completo. Cadastre-se agora para ser notificado quando lançarmos e ter acesso antecipado com desconto especial.
                </p>
              </div>
            </div>

            {/* FAQ Item 3 */}
            <div
              className={`p-6 rounded-lg border transition-all duration-300 cursor-pointer ${
                openFaqIndex === 2 ? 'border-[#00FF8C]' : 'border-[rgba(76,95,213,0.2)]'
              }`}
              style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}
              onClick={() => toggleFaq(2)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-montserrat text-xl font-bold text-white pr-4">
                  Posso cancelar a qualquer momento?
                </h3>
                <div className={`relative w-6 h-6 flex-shrink-0 transition-transform duration-300 ${openFaqIndex === 2 ? 'rotate-180' : ''}`}>
                  <Image
                    src="/assets/images/nova id visual/icon-chevron-faq.png"
                    alt="Expandir"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFaqIndex === 2 ? 'max-h-96 mt-4' : 'max-h-0'
                }`}
              >
                <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                  Sim! Quando os planos pagos forem lançados, você poderá cancelar a qualquer momento sem multas ou taxas adicionais.
                </p>
              </div>
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
