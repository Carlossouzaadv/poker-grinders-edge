import React from 'react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '1',
      icon: '📝',
      title: 'COLE',
      description: 'Copie o histórico da sua mão do PokerStars ou GGPoker e cole no campo acima.',
      details: 'Suporte completo para os formatos mais populares'
    },
    {
      number: '2',
      icon: '👁️',
      title: 'VISUALIZE',
      description: 'Assista à sua jogada de forma interativa, passo a passo, do pré-flop ao river.',
      details: 'Mesa realista com animações e controles intuitivos'
    },
    {
      number: '3',
      icon: '📈',
      title: 'EVOLUA',
      description: 'Use a ferramenta para encontrar seus erros, estudar cenários e aprimorar seu jogo.',
      details: 'Análise profissional ao alcance de um clique'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Como Funciona?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transforme seu histórico de mãos em uma experiência visual e educativa em apenas 3 passos simples
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">

              {/* Connector Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-green-500 to-transparent -translate-x-4 z-0" />
              )}

              {/* Step Card */}
              <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center hover:border-green-500/50 transition-all hover:scale-105 hover:shadow-2xl group">

                {/* Step Number */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center text-black font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className="text-6xl mb-6 mt-6">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-green-400 mb-4 group-hover:text-green-300 transition-colors">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                  {step.description}
                </p>

                {/* Details */}
                <p className="text-gray-500 text-sm italic">
                  {step.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              Scroll para cima e cole sua primeira mão para análise. É gratuito e instantâneo!
            </p>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
            >
              ⬆️ Voltar ao Replayer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;