'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
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
            Sobre Nós
          </h1>
          <p className="font-open-sans text-xl text-[#E0E0E0] leading-relaxed">
            Nascemos da necessidade de jogadores e managers que buscavam uma forma mais inteligente de estudar e gerir o jogo.
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-montserrat text-4xl font-bold text-white mb-8">
            Nossa História
          </h2>
          <div className="space-y-6 font-open-sans text-lg text-[#E0E0E0] leading-relaxed">
            <p>
              O <strong className="text-white">PokerMastery</strong> foi criado por jogadores profissionais que entendiam na pele as dificuldades de evoluir no poker moderno. Horas analisando mãos manualmente, dificuldade em identificar padrões, ferramentas caras e complexas que não entregavam o que prometiam.
            </p>
            <p>
              Começamos com uma pergunta simples: <em className="text-[#00FF8C]">"E se existisse uma ferramenta que realmente entendesse as necessidades de um grinder?"</em>
            </p>
            <p>
              A resposta foi o Hand Replayer — nossa primeira ferramenta, gratuita e poderosa. Uma forma simples e visual de revisar suas mãos, entender suas decisões e compartilhar análises com coaches e times.
            </p>
            <p>
              Mas não paramos por aí. O Hand Replayer é apenas a <strong className="text-white">porta de entrada</strong> para um ecossistema completo que estamos construindo: gestão de bankroll inteligente, laboratório GTO gamificado, plataforma para coaches e um marketplace que conecta jogadores aos melhores profissionais do mercado.
            </p>
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
            {/* Missão */}
            <div className="p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-16 h-16 mb-6">
                <Image
                  src="/assets/images/nova id visual/icon-mission.png"
                  alt="Missão"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-white mb-4">
                Missão
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                Fornecer ferramentas e recursos avançados para jogadores de poker que buscam aprimorar suas habilidades e alcançar resultados superiores através de dados e tecnologia.
              </p>
            </div>

            {/* Visão */}
            <div className="p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-16 h-16 mb-6">
                <Image
                  src="/assets/images/nova id visual/icon-vision.png"
                  alt="Visão"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-white mb-4">
                Visão
              </h3>
              <p className="font-open-sans text-[#E0E0E0] leading-relaxed">
                Ser a plataforma líder e indispensável em análise e estudo de poker, reconhecida pela inovação, precisão e por ser a arma secreta dos jogadores mais dedicados.
              </p>
            </div>

            {/* Valores */}
            <div className="p-8 rounded-2xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-16 h-16 mb-6">
                <Image
                  src="/assets/images/nova id visual/icon-values.png"
                  alt="Valores"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-white mb-4">
                Valores
              </h3>
              <ul className="font-open-sans text-[#E0E0E0] leading-relaxed space-y-2">
                <li>• Precisão Analítica</li>
                <li>• Inovação Contínua</li>
                <li>• Foco no Desempenho</li>
                <li>• Design Excepcional</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-montserrat text-4xl font-bold text-white mb-6">
            Faça Parte da Nossa História
          </h2>
          <p className="font-open-sans text-xl text-[#E0E0E0] mb-8">
            Estamos apenas começando. Junte-se a nós e tenha acesso antecipado a tudo que estamos construindo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="font-open-sans bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-[#00FF8C]/50 hover:scale-105 transform">
                Criar Conta Gratuita
              </button>
            </Link>
            <Link href="/contact">
              <button className="font-open-sans bg-transparent border-2 border-[#00FF8C] text-[#00FF8C] hover:bg-[#00FF8C] hover:text-[#121212] px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
                Fale Conosco
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
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
