import React from 'react';

interface ApostaVisualProps {
  valor: number;
  playerName?: string;
  isAnimating?: boolean;
  isMovingToPot?: boolean;
  playerPosition?: { x: number; y: number }; // Posição do jogador para calcular direção
}

const ApostaVisual: React.FC<ApostaVisualProps> = ({
  valor,
  playerName = '',
  isAnimating = false,
  isMovingToPot = false,
  playerPosition
}) => {
  const formatarValor = (valor: number): string => {
    if (valor >= 1000) {
      return `${(valor / 1000).toFixed(1)}K`;
    }
    return valor.toString();
  };

  // CSS-only chip colors based on value
  const getChipStyles = (valor: number) => {
    if (valor >= 1000) {
      return {
        background: 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
        border: '3px solid #A855F7',
        shadow: '0 4px 8px rgba(139, 92, 246, 0.3)'
      };
    } else if (valor >= 500) {
      return {
        background: 'linear-gradient(145deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
        border: '3px solid #FBBF24',
        shadow: '0 4px 8px rgba(245, 158, 11, 0.3)'
      };
    } else if (valor >= 100) {
      return {
        background: 'linear-gradient(145deg, #10B981 0%, #059669 50%, #047857 100%)',
        border: '3px solid #34D399',
        shadow: '0 4px 8px rgba(16, 185, 129, 0.3)'
      };
    } else if (valor >= 25) {
      return {
        background: 'linear-gradient(145deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
        border: '3px solid #60A5FA',
        shadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
      };
    } else if (valor >= 5) {
      return {
        background: 'linear-gradient(145deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
        border: '3px solid #F87171',
        shadow: '0 4px 8px rgba(239, 68, 68, 0.3)'
      };
    } else {
      return {
        background: 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 50%, #D1D5DB 100%)',
        border: '3px solid #FFFFFF',
        shadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      };
    }
  };

  const getChipStack = (valor: number) => {
    // Simular stack de fichas baseado no valor
    const stackHeight = Math.min(Math.floor(valor / 25), 5);
    return Array.from({ length: Math.max(1, stackHeight) }, (_, i) => i);
  };

  // Calcular direção para o centro da mesa
  const calculateDirection = () => {
    if (!playerPosition) return { x: 0, y: -100 };

    // Centro da mesa é aproximadamente no ponto (0, 0) relativo ao jogador
    // Queremos mover as fichas na direção oposta à posição do jogador
    const centerX = 0;
    const centerY = 0;

    // Calcular vetor direção (invertido porque queremos ir para o centro)
    const directionX = centerX - (playerPosition.x - 50); // 50% é centro
    const directionY = centerY - (playerPosition.y - 50);

    // Normalizar e amplificar o movimento
    const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
    const normalizedX = magnitude > 0 ? (directionX / magnitude) * 150 : 0;
    const normalizedY = magnitude > 0 ? (directionY / magnitude) * 150 : -100;

    return { x: normalizedX, y: normalizedY };
  };

  const direction = calculateDirection();

  return (
    <>
      {/* Keyframes CSS para animações */}
      <style jsx>{`
        @keyframes chipBounceIn {
          0% {
            transform: scale(0) rotate(180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(90deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes moveToPot {
          0% {
            transform: translateX(0) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(${direction.x}px) translateY(${direction.y}px) scale(0.6);
            opacity: 0.2;
          }
        }

        .chip-bounce-in {
          animation: chipBounceIn 0.8s ease-out forwards;
        }

        .move-to-pot {
          animation: moveToPot 1.8s ease-in-out forwards;
        }
      `}</style>

      <div className={`relative flex flex-col items-center ${
        isAnimating ? 'animate-pulse' : ''
      } ${isMovingToPot ? 'move-to-pot' : ''}`}>
        {/* Stack de Fichas - CSS-only design */}
        <div className="relative">
          {getChipStack(valor).map((_, index) => {
            const chipStyles = getChipStyles(valor);

            return (
              <div
                key={index}
                className={`absolute rounded-full cursor-pointer transform transition-all duration-300 ${
                  isAnimating ? 'animate-pulse' : ''
                } ${isAnimating ? 'chip-bounce-in' : ''}`}
                style={{
                  width: '40px',
                  height: '40px',
                  background: chipStyles.background,
                  border: chipStyles.border,
                  boxShadow: chipStyles.shadow,
                  zIndex: 10 - index,
                  top: `${-index * 3}px`,
                  left: `${index * 1.5}px`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Inner circle for chip detail */}
                <div
                  className="absolute inset-1 rounded-full opacity-30"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 70%)',
                  }}
                />

                {/* Chip edge detail */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `
                      repeating-conic-gradient(
                        from 0deg,
                        transparent 0deg 10deg,
                        rgba(255,255,255,0.1) 10deg 20deg
                      )
                    `,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Money Label - PokerStars style */}
        <div
          className="money-label px-3 py-1 bg-black text-white font-semibold rounded-md shadow-lg border border-gray-600"
          style={{
            marginTop: `${getChipStack(valor).length * 3 + 20}px`,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            letterSpacing: '0.5px',
            boxShadow: `
              0 4px 8px rgba(0,0,0,0.4),
              inset 0 1px 0 rgba(255,255,255,0.1),
              inset 0 -1px 0 rgba(0,0,0,0.3)
            `,
            textShadow: '0 1px 1px rgba(0,0,0,0.8)',
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            border: '1px solid #374151'
          }}
        >
          ${formatarValor(valor)}
        </div>

        {/* Nome do jogador (opcional) */}
        {playerName && (
          <div className="mt-2 text-xs text-gray-200 opacity-80" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 300 }}>
            {playerName}
          </div>
        )}
      </div>
    </>
  );
};

export default ApostaVisual;