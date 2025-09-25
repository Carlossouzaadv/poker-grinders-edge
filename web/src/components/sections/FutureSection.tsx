import React from 'react';
import { DashboardMockup, GTOMockup, MarketplaceMockup } from '../mockups/AppMockups';

interface FutureSectionProps {
  onShowLeadCapture: () => void;
}

const FutureSection: React.FC<FutureSectionProps> = ({ onShowLeadCapture }) => {
  const features = [
    {
      icon: '💰',
      title: 'Gestor de Bankroll',
      description: 'Controle financeiro completo com regras automáticas e análise de ROI'
    },
    {
      icon: '🧠',
      title: 'Consultor GTO de Bolso',
      description: 'Decisões matematicamente perfeitas na palma da sua mão, otimizado para celular'
    },
    {
      icon: '🔬',
      title: 'Laboratório de Estudo com IA',
      description: 'Análise inteligente das suas mãos com feedback personalizado e treinamento gamificado'
    },
    {
      icon: '👥',
      title: 'Plataforma Team Pro para Times',
      description: 'Gestão profissional de atletas com dashboard agregado e análise em massa'
    },
    {
      icon: '🎓',
      title: 'Marketplace de Coaches',
      description: 'Conecte-se com treinadores qualificados e acelere sua evolução no poker'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-black">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            O Replayer é só o <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Começo</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            O Hand Replayer é apenas uma <strong className="text-green-400">amostra grátis</strong> do ecossistema completo que estamos construindo.
          </p>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            O Poker Grinder's Edge será o seu centro de comando para a evolução no poker.
          </p>
        </div>

        {/* App Mockups - Visual Impact */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Visualize para Crer
          </h3>
          <p className="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Estas são as telas reais que você terá em breve. Não é apenas uma promessa - é o futuro do poker.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            <div className="text-center">
              <DashboardMockup />
              <div className="mt-4">
                <h4 className="text-white font-bold">Dashboard Pro</h4>
                <p className="text-gray-400 text-sm">Controle total do seu bankroll</p>
              </div>
            </div>

            <div className="text-center">
              <GTOMockup />
              <div className="mt-4">
                <h4 className="text-white font-bold">Consultor GTO</h4>
                <p className="text-gray-400 text-sm">Decisões perfeitas na palma da mão</p>
              </div>
            </div>

            <div className="text-center">
              <MarketplaceMockup />
              <div className="mt-4">
                <h4 className="text-white font-bold">Marketplace</h4>
                <p className="text-gray-400 text-sm">Os melhores coaches do Brasil</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-2xl group"
            >
              {/* Icon */}
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Coming Soon Badge */}
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-900/30 text-purple-300 border border-purple-500/30">
                  <span className="mr-1">⏳</span>
                  Em breve
                </span>
              </div>
            </div>
          ))}

          {/* Special Feature - Highlighted */}
          <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-2xl p-8 hover:border-yellow-400 transition-all hover:scale-105 hover:shadow-2xl group relative overflow-hidden">

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 group-hover:from-yellow-500/10 group-hover:to-orange-500/10 transition-all"></div>

            <div className="relative z-10">
              {/* Special Icon */}
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                🏆
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-yellow-400 mb-3">
                Ecossistema Completo
              </h3>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed mb-4">
                Todas as ferramentas integradas em uma única plataforma. Do estudo individual à gestão profissional de times.
              </p>

              {/* Premium Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-sm">
                <span className="mr-2">⭐</span>
                Experiência Premium
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-3xl p-12 text-center backdrop-blur-sm">

          <div className="text-5xl mb-6">📧</div>

          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Seja o Primeiro a Ter Acesso
          </h3>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Deixe seu e-mail e seja o primeiro a saber quando lançarmos o <strong className="text-purple-400">Poker Grinder's Edge</strong> completo.
            Tenha acesso VIP à revolução no estudo do poker.
          </p>

          {/* Benefits List */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="flex items-center justify-center space-x-3 text-green-400">
              <span className="text-xl">✓</span>
              <span className="font-medium">Acesso antecipado</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-green-400">
              <span className="text-xl">✓</span>
              <span className="font-medium">Desconto especial</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-green-400">
              <span className="text-xl">✓</span>
              <span className="font-medium">Conteúdo exclusivo</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onShowLeadCapture}
            className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
          >
            <span className="mr-3">🚀</span>
            Quero Ser o Primeiro a Saber!
          </button>

          {/* Trust Signals */}
          <div className="mt-8 flex items-center justify-center space-x-6 text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Dados seguros</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📧</span>
              <span>Sem spam</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Apenas novidades importantes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FutureSection;