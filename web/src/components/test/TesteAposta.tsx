import React from 'react';
import ApostaVisual from '../poker/ApostaVisual';

const TesteAposta: React.FC = () => {
  // 3 apostas com valores diferentes para testar cores de fichas
  const testBets = [
    { valor: 600, playerName: 'SmallFish' },
    { valor: 1800, playerName: 'MidStakes' },
    { valor: 5000, playerName: 'HighRoller' }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">🪙 Teste do Componente Aposta</h1>
        <p className="text-gray-200 text-lg">
          Validando renderização de fichas e labels usando chips-sprite.png
        </p>
      </div>

      {/* Apostas em linha - valores diferentes */}
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Apostas estáticas */}
        <div className="bg-black/20 p-8 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Apostas Estáticas</h2>
          <div className="flex justify-center items-end space-x-12">
            {testBets.map((bet, index) => (
              <div key={`static-${index}`} className="text-center">
                <ApostaVisual
                  valor={bet.valor}
                  playerName={bet.playerName}
                  isAnimating={false}
                  isMovingToPot={false}
                />
                <div className="mt-6 bg-black/50 p-3 rounded text-white text-sm">
                  <div><strong>Valor:</strong> ${bet.valor}</div>
                  <div><strong>Jogador:</strong> {bet.playerName}</div>
                  <div><strong>Stack:</strong> {Math.floor(bet.valor / 25)} fichas</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Apostas com animação */}
        <div className="bg-black/20 p-8 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Apostas Animadas</h2>
          <div className="flex justify-center items-end space-x-12">
            {testBets.map((bet, index) => (
              <div key={`animated-${index}`} className="text-center">
                <ApostaVisual
                  valor={bet.valor}
                  playerName={bet.playerName}
                  isAnimating={true}
                  isMovingToPot={false}
                />
                <div className="mt-6 bg-yellow-900/50 p-3 rounded text-white text-sm">
                  <div>✨ <strong>Animando...</strong></div>
                  <div>Pulse effect ativo</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teste de diferentes valores para cores de fichas */}
        <div className="bg-black/20 p-8 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Cores de Fichas por Valor</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { valor: 5, desc: 'Red Chip (5-24)' },
              { valor: 50, desc: 'Blue Chip (25-99)' },
              { valor: 250, desc: 'Green Chip (100-499)' },
              { valor: 750, desc: 'Orange Chip (500-999)' },
              { valor: 2500, desc: 'Purple Chip (1000+)' },
              { valor: 10000, desc: 'High Value' }
            ].map((test, index) => (
              <div key={index} className="text-center">
                <ApostaVisual
                  valor={test.valor}
                  playerName=""
                  isAnimating={false}
                  isMovingToPot={false}
                />
                <div className="mt-4 text-white text-sm">
                  <div className="font-bold">${test.valor}</div>
                  <div className="text-gray-300">{test.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instruções de validação */}
        <div className="bg-blue-600/20 border border-blue-400 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-blue-200 mb-4">📋 Checklist de Validação</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 text-blue-100">
              <div>✅ <strong>Fichas Visuais:</strong></div>
              <div className="ml-4">• Stack de fichas renderizado</div>
              <div className="ml-4">• Cores diferentes por valor</div>
              <div className="ml-4">• Sombras e profundidade</div>
              <div className="ml-4">• Sprite positioning correto</div>
            </div>
            <div className="space-y-2 text-blue-100">
              <div>✅ <strong>Money Labels:</strong></div>
              <div className="ml-4">• Valor formatado corretamente</div>
              <div className="ml-4">• Estilo PokerStars (preto)</div>
              <div className="ml-4">• Posicionamento abaixo das fichas</div>
              <div className="ml-4">• Valores acima de 1K em formato "1.5K"</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-black/30 rounded text-sm">
            <strong>🎯 Cores Esperadas por Valor:</strong><br/>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>$5-24: <span className="text-red-300">Red Chip</span></div>
              <div>$25-99: <span className="text-blue-300">Blue Chip</span></div>
              <div>$100-499: <span className="text-green-300">Green Chip</span></div>
              <div>$500-999: <span className="text-orange-300">Orange Chip</span></div>
              <div>$1000+: <span className="text-purple-300">Purple Chip</span></div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-900/30 rounded text-sm">
            <strong>⚠️ Troubleshooting:</strong><br/>
            Se as fichas não aparecem corretamente, verifique:<br/>
            • Arquivo <code className="bg-black/50 px-1 rounded">/public/assets/images/chips-sprite.png</code> existe<br/>
            • Background-position está calculado corretamente<br/>
            • Dimensões do sprite estão corretas (300x50px para 6 fichas)
          </div>
        </div>
      </div>
    </div>
  );
};

export default TesteAposta;