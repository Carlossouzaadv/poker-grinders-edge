'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
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
            A Vantagem que os Outros Não Veem.
          </h1>
          <p className="font-open-sans text-lg sm:text-xl text-[#E0E0E0] mb-10 max-w-3xl mx-auto leading-relaxed">
            Analise seu histórico de mãos e transforme dados brutos em insights de nível elite. A análise profissional, agora acessível e gratuita.
          </p>
          <Link href="/register">
            <button className="font-open-sans bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)] hover:scale-105 transform">
              Começar Análise Gratuita
            </button>
          </Link>
          <p className="font-open-sans text-sm text-[#9E9E9E] mt-4">
            Acesso instantâneo ao Hand Replayer. Sem cartão de crédito.
          </p>
          <p className="font-open-sans text-sm text-[#9E9E9E] mt-6">
            Você é um <a href="#" className="text-[#E0E0E0] font-semibold hover:text-[#00FF8C] transition-colors duration-300">jogador individual</a>, <a href="#" className="text-[#E0E0E0] font-semibold hover:text-[#00FF8C] transition-colors duration-300">gerencia um time</a> ou é <a href="#" className="text-[#E0E0E0] font-semibold hover:text-[#00FF8C] transition-colors duration-300">coach</a>?
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
            Como Funciona
          </h2>
          <p className="font-open-sans text-lg text-[#E0E0E0] text-center mb-16 max-w-2xl mx-auto">
            Três passos simples para começar a analisar suas mãos como um profissional
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
                PASSO 1
              </div>
              <h3 className="font-montserrat text-2xl font-semibold text-white mb-3">
                Copie
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                Copie o histórico do seu torneio diretamente do PokerStars, GGPoker ou outro site.
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
                PASSO 2
              </div>
              <h3 className="font-montserrat text-2xl font-semibold text-white mb-3">
                Cole
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                Cole no Poker Grinder's Edge e veja a mágica acontecer em segundos.
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
                PASSO 3
              </div>
              <h3 className="font-montserrat text-2xl font-semibold text-white mb-3">
                Analise
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                Revise mãos, marque favoritas e compartilhe com seu time ou coach.
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
              Isso é só o começo.
            </h2>
            <p className="font-open-sans text-xl text-[#E0E0E0] max-w-3xl mx-auto">
              O Hand Replayer é apenas a porta de entrada. Estamos construindo o ecossistema completo para transformar seu jogo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Gestor de Bankroll */}
            <div className="group relative p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="absolute top-4 right-4">
                <span className="inline-block bg-[#4C5FD5] text-white text-xs font-open-sans font-semibold px-3 py-1.5 rounded-md">
                  EM BREVE
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
                Gestor de Bankroll Inteligente
              </h3>
              <p className="font-open-sans text-[#E0E0E0] text-center leading-relaxed">
                Saiba exatamente onde você ganha e perde dinheiro. Controle total do seu bankroll com análise automática.
              </p>
            </div>

            {/* Feature 2: Laboratório GTO */}
            <div className="group relative p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="absolute top-4 right-4">
                <span className="inline-block bg-[#4C5FD5] text-white text-xs font-open-sans font-semibold px-3 py-1.5 rounded-md">
                  EM BREVE
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
                Laboratório de Estudo GTO
              </h3>
              <p className="font-open-sans text-[#E0E0E0] text-center leading-relaxed">
                Treine cenários e elimine seus leaks de forma gamificada. Aprenda estratégia optimal jogando.
              </p>
            </div>

            {/* Feature 3: Gestão de Times */}
            <div className="group relative p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="absolute top-4 right-4">
                <span className="inline-block bg-[#4C5FD5] text-white text-xs font-open-sans font-semibold px-3 py-1.5 rounded-md">
                  EM BREVE
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
                Plataforma para Times e Coaches
              </h3>
              <p className="font-open-sans text-[#E0E0E0] text-center leading-relaxed">
                Gestão de atletas, análise de dados em massa e dashboards agregados para coaches profissionais.
              </p>
            </div>

            {/* Feature 4: Marketplace */}
            <div className="group relative p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-500 hover:border-[rgba(0,255,140,0.5)] hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,255,140,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="absolute top-4 right-4">
                <span className="inline-block bg-[#4C5FD5] text-white text-xs font-open-sans font-semibold px-3 py-1.5 rounded-md">
                  EM BREVE
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
                Marketplace de Coaches
              </h3>
              <p className="font-open-sans text-[#E0E0E0] text-center leading-relaxed">
                Encontre o instrutor perfeito para elevar seu nível. Conexão direta entre coaches e jogadores.
              </p>
            </div>
          </div>

          {/* CTA Secundário */}
          <div className="text-center mt-12">
            <p className="font-open-sans text-[#E0E0E0] mb-4">
              Quer ser notificado quando essas funcionalidades forem lançadas?
            </p>
            <Link href="/register">
              <button className="font-open-sans bg-transparent border-2 border-[#00FF8C] text-[#00FF8C] hover:bg-[rgba(0,255,140,0.1)] px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                Entrar na Lista de Espera do Beta
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Prova Social Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/nova id visual/background2.jpg"
            alt="Background Pattern"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/95" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="font-montserrat text-4xl sm:text-5xl font-bold text-white text-center mb-4">
            A Escolha dos Profissionais
          </h2>
          <p className="font-open-sans text-lg text-[#E0E0E0] text-center mb-16 max-w-2xl mx-auto">
            Jogadores sérios confiam no Poker Grinder's Edge para elevar seu jogo
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="mb-6">
                <Image
                  src="/assets/images/nova id visual/icon-quote.png"
                  alt="Quote"
                  width={40}
                  height={40}
                  className="opacity-50"
                />
              </div>
              <p className="font-open-sans text-[#E0E0E0] text-lg italic mb-6 leading-relaxed">
                "O Poker Grinder's Edge mudou completamente meu processo de estudo. É a ferramenta mais rápida e poderosa que já usei."
              </p>
              <div className="border-t border-[#00FF8C] pt-4">
                <p className="font-montserrat text-white font-semibold mb-1">João Silva</p>
                <p className="font-open-sans text-[#00FF8C] text-sm">Jogador Profissional de High Stakes</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="mb-6">
                <Image
                  src="/assets/images/nova id visual/icon-quote.png"
                  alt="Quote"
                  width={40}
                  height={40}
                  className="opacity-50"
                />
              </div>
              <p className="font-open-sans text-[#E0E0E0] text-lg italic mb-6 leading-relaxed">
                "Finalmente uma plataforma que entende as necessidades reais dos grinders. A detecção de leaks é simplesmente incrível."
              </p>
              <div className="border-t border-[#00FF8C] pt-4">
                <p className="font-montserrat text-white font-semibold mb-1">Maria Santos</p>
                <p className="font-open-sans text-[#00FF8C] text-sm">Coach Profissional e MTT Specialist</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="mb-6">
                <Image
                  src="/assets/images/nova id visual/icon-quote.png"
                  alt="Quote"
                  width={40}
                  height={40}
                  className="opacity-50"
                />
              </div>
              <p className="font-open-sans text-[#E0E0E0] text-lg italic mb-6 leading-relaxed">
                "Desde que comecei a usar, meu ROI aumentou 35%. A análise GTO me ajudou a encontrar spots que eu estava deixando dinheiro na mesa."
              </p>
              <div className="border-t border-[#00FF8C] pt-4">
                <p className="font-montserrat text-white font-semibold mb-1">Pedro Costa</p>
                <p className="font-open-sans text-[#00FF8C] text-sm">Grinder de Cash Game NL500</p>
              </div>
            </div>
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
            Comece agora. Evolua sempre.
          </h2>
          <p className="font-open-sans text-xl text-[#E0E0E0] mb-10 max-w-2xl mx-auto leading-relaxed">
            Use o Hand Replayer gratuitamente hoje e acompanhe a evolução do ecossistema completo que vai transformar seu poker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <button className="w-full sm:w-auto font-open-sans bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)] hover:scale-105 transform">
                Começar Grátis Agora
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full sm:w-auto font-open-sans bg-transparent border-2 border-[#00FF8C] text-[#00FF8C] hover:bg-[rgba(0,255,140,0.1)] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
                Já Tenho Conta
              </button>
            </Link>
          </div>
          <p className="font-open-sans text-sm text-[#9E9E9E] mt-6 font-light">
            A vantagem que os outros não veem.
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
                Poker Grinder's Edge
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed mb-4">
                A vantagem que os outros não veem. Ferramentas profissionais para jogadores sérios que buscam excelência.
              </p>
              <p className="font-open-sans text-[#9E9E9E] text-sm">
                Desenvolvido por grinders, para grinders.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-montserrat text-lg font-semibold text-white mb-4">Links Rápidos</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors duration-300">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors duration-300">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors duration-300">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors duration-300">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Newsletter & Social */}
            <div>
              <h4 className="font-montserrat text-lg font-semibold text-white mb-4">Fique Por Dentro</h4>
              <p className="font-open-sans text-[#E0E0E0] text-sm mb-4">
                Receba dicas e atualizações exclusivas.
              </p>
              <div className="relative mb-6">
                <input
                  type="email"
                  placeholder="Seu e-mail"
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
              © 2025 Poker Grinder's Edge. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
