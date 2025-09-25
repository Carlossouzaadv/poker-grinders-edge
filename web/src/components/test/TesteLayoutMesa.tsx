import React from 'react';

const TesteLayoutMesa: React.FC = () => {
  // Posições para 6 jogadores - layout PokerStars
  const getPositionStyle = (visualSeat: number) => {
    const positions = [
      { left: '50%', bottom: '3%', transform: 'translateX(-50%)', color: '#FF6B6B' }, // Seat 1: Bottom Center (Hero)
      { left: '9%', bottom: '28%', transform: 'none', color: '#4ECDC4' }, // Seat 2: Bottom Left
      { left: '9%', top: '28%', transform: 'none', color: '#45B7D1' }, // Seat 3: Top Left
      { left: '50%', top: '3%', transform: 'translateX(-50%)', color: '#96CEB4' }, // Seat 4: Top Center
      { right: '9%', top: '28%', transform: 'none', color: '#FFEAA7' }, // Seat 5: Top Right
      { right: '9%', bottom: '28%', transform: 'none', color: '#DDA0DD' } // Seat 6: Bottom Right
    ];

    const pos = positions[visualSeat - 1];
    return {
      position: 'absolute' as const,
      left: pos.left,
      right: pos.right,
      top: pos.top,
      bottom: pos.bottom,
      transform: pos.transform,
      backgroundColor: pos.color,
      width: '120px',
      height: '80px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'white',
      textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      border: '3px solid #ffffff',
      zIndex: 10
    };
  };

  return (
    <div className="w-full max-w-[1125px] mx-auto" style={{
      aspectRatio: '1125 / 678',
      background: `url('/assets/images/mercury-default-background.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Container da mesa */}
      <div className="relative w-full h-full">
        {/* Mesa Oval - igual ao PokerTable original */}
        <div
          className="absolute shadow-2xl"
          style={{
            width: '88.8%',
            height: '76.9%',
            left: '50%',
            top: '12.3%',
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            background: `
              radial-gradient(ellipse at center,
                #2D5016 0%,
                #1F3B0E 25%,
                #1A3309 50%,
                #132505 75%,
                #0D1703 100%
              )
            `,
            border: '12px solid #8B4513',
            boxShadow: `
              inset 0 0 60px rgba(0,0,0,0.4),
              inset 0 0 120px rgba(0,0,0,0.2),
              0 25px 50px rgba(0,0,0,0.5),
              0 0 0 2px #CD853F
            `
          }}
        >
          {/* Inner felt surface */}
          <div
            className="absolute inset-6"
            style={{
              borderRadius: '50%',
              background: `
                radial-gradient(ellipse at center,
                  #357B1F 0%,
                  #2D6418 30%,
                  #254D12 60%,
                  #1A350B 100%
                ),
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 1px,
                  rgba(255,255,255,0.02) 1px,
                  rgba(255,255,255,0.02) 2px
                )
              `,
              boxShadow: `
                inset 0 0 40px rgba(0,0,0,0.3),
                inset 0 0 80px rgba(0,0,0,0.1)
              `
            }}
          >
            {/* Logo central */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="text-center select-none"
                style={{
                  opacity: 0.15,
                  transform: 'rotate(-5deg)',
                  zIndex: 1
                }}
              >
                <div className="text-white font-bold text-4xl mb-1" style={{
                  fontFamily: 'Bebas Neue, Arial Black, sans-serif',
                  letterSpacing: '2px',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  TESTE
                </div>
                <div className="text-green-400 font-bold text-2xl mb-1" style={{
                  fontFamily: 'Bebas Neue, Arial Black, sans-serif',
                  letterSpacing: '3px'
                }}>
                  LAYOUT
                </div>
                <div className="text-yellow-400 font-bold text-3xl" style={{
                  fontFamily: 'Bebas Neue, Arial Black, sans-serif',
                  letterSpacing: '1px'
                }}>
                  MESA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Divs coloridos posicionados */}
        {[1, 2, 3, 4, 5, 6].map(seat => (
          <div key={seat} style={getPositionStyle(seat)}>
            Player {seat}
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Seat {seat}
            </div>
          </div>
        ))}

        {/* Instruções no canto */}
        <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg text-sm">
          <div className="font-bold mb-2">🎯 Teste Layout da Mesa</div>
          <div>✅ 6 Players posicionados</div>
          <div>✅ Sem sobreposições</div>
          <div>✅ Layout oval PokerStars</div>
          <div className="mt-2 text-xs text-gray-300">
            Se todos os players estão visíveis<br/>
            e bem posicionados, o layout<br/>
            está funcionando corretamente!
          </div>
        </div>
      </div>
    </div>
  );
};

export default TesteLayoutMesa;