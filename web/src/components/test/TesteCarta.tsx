import React from 'react';
import Card from '../poker/Card';
import { Card as CardType } from '@/types/poker';

const TesteCarta: React.FC = () => {
  // 5 cartas diferentes para teste
  const testCards: CardType[] = [
    { rank: 'A', suit: 's' }, // Ace of Spades
    { rank: 'K', suit: 'h' }, // King of Hearts
    { rank: 'Q', suit: 'd' }, // Queen of Diamonds
    { rank: 'J', suit: 'c' }, // Jack of Clubs
    { rank: '2', suit: 's' }  // Two of Spades
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">🃏 Teste do Componente Carta</h1>
        <p className="text-green-200 text-lg">
          Validando renderização de cartas usando deck-sprite.png
        </p>
      </div>

      {/* Cartas em linha - diferentes tamanhos */}
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Tamanho Large */}
        <div className="bg-black/20 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Tamanho Large (70x97px)</h2>
          <div className="flex justify-center space-x-4">
            {testCards.map((card, index) => (
              <div key={`large-${index}`} className="text-center">
                <Card card={card} size="large" />
                <div className="text-white text-sm mt-2 font-mono">
                  {card.rank}{card.suit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tamanho Medium */}
        <div className="bg-black/20 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Tamanho Medium (50x70px)</h2>
          <div className="flex justify-center space-x-4">
            {testCards.map((card, index) => (
              <div key={`medium-${index}`} className="text-center">
                <Card card={card} size="medium" />
                <div className="text-white text-sm mt-2 font-mono">
                  {card.rank}{card.suit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tamanho Small */}
        <div className="bg-black/20 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Tamanho Small (35x49px)</h2>
          <div className="flex justify-center space-x-4">
            {testCards.map((card, index) => (
              <div key={`small-${index}`} className="text-center">
                <Card card={card} size="small" />
                <div className="text-white text-sm mt-2 font-mono">
                  {card.rank}{card.suit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cartas viradas para baixo */}
        <div className="bg-black/20 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Cartas Face Down</h2>
          <div className="flex justify-center space-x-4">
            {testCards.map((card, index) => (
              <div key={`facedown-${index}`} className="text-center">
                <Card card={card} size="medium" faceDown={true} />
                <div className="text-white text-sm mt-2 font-mono">
                  Face Down
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-yellow-500/20 border border-yellow-400 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-yellow-200 mb-3">📋 Checklist de Validação</h3>
          <div className="space-y-2 text-yellow-100">
            <div>✅ As cartas devem ter tamanhos diferentes (Small, Medium, Large)</div>
            <div>✅ Cada carta deve mostrar o rank e suit corretos</div>
            <div>✅ As cartas face down devem ter visual azul padrão</div>
            <div>✅ Hover effects devem funcionar (scale up ao passar mouse)</div>
            <div>✅ Não deve haver distorções na imagem</div>
            <div>✅ Background sprite deve estar alinhado corretamente</div>
          </div>
          <div className="mt-4 p-3 bg-black/30 rounded text-sm">
            <strong>⚠️ Nota sobre Sprites:</strong><br/>
            Se as cartas estão aparecendo apenas como texto ou com visual incorreto,
            verifique se o arquivo <code className="bg-black/50 px-1 rounded">/public/assets/images/deck-sprite.png</code>
            está presente e se o CSS para as classes <code className="bg-black/50 px-1 rounded">.playing-card</code>
            foi adicionado ao projeto.
          </div>
        </div>
      </div>

      {/* CSS necessário para sprites (embutido para teste) */}
      <style jsx global>{`
        .playing-card {
          background: url('/assets/images/deck-sprite.png') no-repeat;
          border: 1px solid #333;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        /* Posicionamento específico para cada carta no sprite */
        /* Spades */
        .card-2s { background-position: 0px 0px; }
        .card-3s { background-position: -70px 0px; }
        .card-4s { background-position: -140px 0px; }
        .card-5s { background-position: -210px 0px; }
        .card-6s { background-position: -280px 0px; }
        .card-7s { background-position: -350px 0px; }
        .card-8s { background-position: -420px 0px; }
        .card-9s { background-position: -490px 0px; }
        .card-Ts { background-position: -560px 0px; }
        .card-Js { background-position: -630px 0px; }
        .card-Qs { background-position: -700px 0px; }
        .card-Ks { background-position: -770px 0px; }
        .card-As { background-position: -840px 0px; }

        /* Hearts */
        .card-2h { background-position: 0px -97px; }
        .card-3h { background-position: -70px -97px; }
        .card-4h { background-position: -140px -97px; }
        .card-5h { background-position: -210px -97px; }
        .card-6h { background-position: -280px -97px; }
        .card-7h { background-position: -350px -97px; }
        .card-8h { background-position: -420px -97px; }
        .card-9h { background-position: -490px -97px; }
        .card-Th { background-position: -560px -97px; }
        .card-Jh { background-position: -630px -97px; }
        .card-Qh { background-position: -700px -97px; }
        .card-Kh { background-position: -770px -97px; }
        .card-Ah { background-position: -840px -97px; }

        /* Diamonds */
        .card-2d { background-position: 0px -194px; }
        .card-3d { background-position: -70px -194px; }
        .card-4d { background-position: -140px -194px; }
        .card-5d { background-position: -210px -194px; }
        .card-6d { background-position: -280px -194px; }
        .card-7d { background-position: -350px -194px; }
        .card-8d { background-position: -420px -194px; }
        .card-9d { background-position: -490px -194px; }
        .card-Td { background-position: -560px -194px; }
        .card-Jd { background-position: -630px -194px; }
        .card-Qd { background-position: -700px -194px; }
        .card-Kd { background-position: -770px -194px; }
        .card-Ad { background-position: -840px -194px; }

        /* Clubs */
        .card-2c { background-position: 0px -291px; }
        .card-3c { background-position: -70px -291px; }
        .card-4c { background-position: -140px -291px; }
        .card-5c { background-position: -210px -291px; }
        .card-6c { background-position: -280px -291px; }
        .card-7c { background-position: -350px -291px; }
        .card-8c { background-position: -420px -291px; }
        .card-9c { background-position: -490px -291px; }
        .card-Tc { background-position: -560px -291px; }
        .card-Jc { background-position: -630px -291px; }
        .card-Qc { background-position: -700px -291px; }
        .card-Kc { background-position: -770px -291px; }
        .card-Ac { background-position: -840px -291px; }
      `}</style>
    </div>
  );
};

export default TesteCarta;