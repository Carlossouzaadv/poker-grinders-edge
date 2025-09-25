import React from 'react';
import { HandHistory, Card as CardType, Snapshot } from '@/types/poker';
import PlayerSeat from './PlayerSeat';
import Card from './Card';
import ChipStack from './ChipStack';
import DealerButton from './DealerButton';

interface PokerTableProps {
  handHistory: HandHistory;
  snapshot: Snapshot;
  showAllCards?: boolean;
}

const PokerTable: React.FC<PokerTableProps> = ({
  handHistory,
  snapshot,
  showAllCards = false
}) => {
  // Add null check
  if (!handHistory || !snapshot) {
    return <div>Loading...</div>;
  }

  // Simple snapshot-based state - no complex calculations needed!
  const activePlayer = snapshot.activePlayer;
  const potTotal = snapshot.totalDisplayedPot;
  const currentStacks = snapshot.playerStacks;
  const foldedPlayers = snapshot.folded;

  // Função de mapeamento Hero-cêntrico
  const calcularPosicoesVisuais = (players: any[], heroSeat: number) => {
    const totalSeats = players.length;

    // O deslocamento necessário para colocar o Hero no assento visual #1 (inferior central)
    const offset = heroSeat - 1;

    return players.map(player => {
      let visualSeat = player.seat - offset;
      if (visualSeat <= 0) {
        visualSeat += totalSeats; // Garante que o número seja positivo
      }

      // Adiciona propriedade para posicionamento CSS
      player.visualSeatClass = `player-seat-${visualSeat}`;
      player.visualSeat = visualSeat;
      return player;
    });
  };

  const getPositionStyle = (visualSeat: number, total: number) => {
    // Layouts otimizados para diferentes números de jogadores
    // Hero sempre na posição visual 1 (bottom center)

    switch (total) {
      case 2: // Heads-up
        const pos2 = [
          { left: '50%', bottom: '5%', transform: 'translateX(-50%)' }, // Hero
          { left: '50%', top: '5%', transform: 'translateX(-50%)' }    // Oponente
        ];
        return { position: 'absolute' as const, ...pos2[visualSeat - 1] };

      case 3: // 3-max
        const pos3 = [
          { left: '50%', bottom: '5%', transform: 'translateX(-50%)' }, // Hero
          { left: '15%', top: '35%', transform: 'none' },               // Left
          { right: '15%', top: '35%', transform: 'none' }               // Right
        ];
        return { position: 'absolute' as const, ...pos3[visualSeat - 1] };

      case 4: // 4-max
        const pos4 = [
          { left: '50%', bottom: '5%', transform: 'translateX(-50%)' }, // Hero
          { left: '12%', bottom: '35%', transform: 'none' },            // Bottom Left
          { left: '50%', top: '5%', transform: 'translateX(-50%)' },    // Top Center
          { right: '12%', bottom: '35%', transform: 'none' }            // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos4[visualSeat - 1] };

      case 5: // 5-max
        const pos5 = [
          { left: '50%', bottom: '5%', transform: 'translateX(-50%)' }, // Hero
          { left: '12%', bottom: '35%', transform: 'none' },            // Bottom Left
          { left: '12%', top: '35%', transform: 'none' },               // Top Left
          { right: '12%', top: '35%', transform: 'none' },              // Top Right
          { right: '12%', bottom: '35%', transform: 'none' }            // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos5[visualSeat - 1] };

      case 6: // 6-max (padrão)
        const pos6 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero
          { left: '9%', bottom: '28%', transform: 'none' },             // Bottom Left
          { left: '9%', top: '28%', transform: 'none' },                // Top Left
          { left: '50%', top: '3%', transform: 'translateX(-50%)' },    // Top Center
          { right: '9%', top: '28%', transform: 'none' },               // Top Right
          { right: '9%', bottom: '28%', transform: 'none' }             // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos6[visualSeat - 1] };

      case 7: // 7-max
        const pos7 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero
          { left: '8%', bottom: '25%', transform: 'none' },             // Bottom Left
          { left: '8%', top: '45%', transform: 'none' },                // Left Mid
          { left: '8%', top: '18%', transform: 'none' },                // Top Left
          { left: '50%', top: '3%', transform: 'translateX(-50%)' },    // Top Center
          { right: '8%', top: '18%', transform: 'none' },               // Top Right
          { right: '8%', bottom: '25%', transform: 'none' }             // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos7[visualSeat - 1] };

      case 8: // 8-max
        const pos8 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero
          { left: '8%', bottom: '22%', transform: 'none' },             // Bottom Left
          { left: '8%', bottom: '45%', transform: 'none' },             // Left Mid-Low
          { left: '8%', top: '30%', transform: 'none' },                // Left Mid-High
          { left: '50%', top: '3%', transform: 'translateX(-50%)' },    // Top Center
          { right: '8%', top: '30%', transform: 'none' },               // Right Mid-High
          { right: '8%', bottom: '45%', transform: 'none' },            // Right Mid-Low
          { right: '8%', bottom: '22%', transform: 'none' }             // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos8[visualSeat - 1] };

      case 9: // 9-max (full ring)
        const pos9 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero
          { left: '8%', bottom: '20%', transform: 'none' },             // Bottom Left
          { left: '8%', bottom: '40%', transform: 'none' },             // Left Mid-Low
          { left: '8%', top: '35%', transform: 'none' },                // Left Mid-High
          { left: '25%', top: '3%', transform: 'translateX(-50%)' },    // Top Left
          { right: '25%', top: '3%', transform: 'translateX(50%)' },    // Top Right
          { right: '8%', top: '35%', transform: 'none' },               // Right Mid-High
          { right: '8%', bottom: '40%', transform: 'none' },            // Right Mid-Low
          { right: '8%', bottom: '20%', transform: 'none' }             // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos9[visualSeat - 1] };

      case 10: // 10-max
        const pos10 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero
          { left: '8%', bottom: '18%', transform: 'none' },             // Bottom Left
          { left: '8%', bottom: '35%', transform: 'none' },             // Left Mid-Low
          { left: '8%', bottom: '52%', transform: 'none' },             // Left Mid
          { left: '8%', top: '32%', transform: 'none' },                // Left Mid-High
          { left: '25%', top: '3%', transform: 'translateX(-50%)' },    // Top Left
          { right: '25%', top: '3%', transform: 'translateX(50%)' },    // Top Right
          { right: '8%', top: '32%', transform: 'none' },               // Right Mid-High
          { right: '8%', bottom: '52%', transform: 'none' },            // Right Mid
          { right: '8%', bottom: '18%', transform: 'none' }             // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos10[visualSeat - 1] };

      default: // Fallback para mesas com mais de 10 jogadores (raro)
        const angle = ((visualSeat - 1) / total) * 2 * Math.PI - Math.PI / 2;
        const radiusX = 42;
        const radiusY = 28;
        const x = 50 + radiusX * Math.cos(angle);
        const y = 50 + radiusY * Math.sin(angle);
        return {
          position: 'absolute' as const,
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  // Community cards come directly from snapshot
  const communityCards = snapshot.communityCards;

  return (
    <div className="hand-replayer w-full max-w-[1125px] mx-auto" style={{
      aspectRatio: '1125 / 678',
      background: `url('/assets/images/mercury-default-background.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Replayer Table - responsive container */}
      <div className="replayer-table relative w-full h-full">
        {/* Mesa Oval - Estilo PokerStars */}
        <div
          className="absolute shadow-2xl"
          style={{
            width: '88.8%', // 800px / 900px = 88.8%
            height: '76.9%', // 500px / 650px = 76.9%
            left: '50%',
            top: '12.3%', // (650px - 500px) / 2 / 650px = 11.5%, adjusted for positioning
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
        {/* Inner felt surface com textura */}
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
          {/* Logo do Poker Grinder's Edge - mais visível */}
          <div className="replayer-table__logo absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="text-center select-none"
              style={{
                opacity: 0.35, // Aumentada de 0.15 para 0.35
                transform: 'rotate(-3deg)', // Rotação mais sutil
                zIndex: 1
              }}
            >
              {/* Logo principal com fallback text */}
              <div className="relative">
                {/* Imagem do logo se existir */}
                <img
                  src="/assets/images/poker-grinders-edge-logo.png"
                  alt="Poker Grinder's Edge"
                  className="max-w-[180px] max-h-[100px] opacity-80"
                  style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                  onError={(e) => {
                    // Fallback para texto se imagem não carregar
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.querySelector('.fallback-logo')?.classList.remove('hidden');
                    }
                  }}
                />

                {/* Fallback text logo */}
                <div className="fallback-logo hidden">
                  <div className="text-white font-bold text-3xl mb-1" style={{
                    fontFamily: 'Bebas Neue, Arial Black, sans-serif',
                    letterSpacing: '2px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                  }}>
                    POKER
                  </div>
                  <div className="text-green-400 font-bold text-xl mb-1" style={{
                    fontFamily: 'Bebas Neue, Arial Black, sans-serif',
                    letterSpacing: '2px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                  }}>
                    GRINDER'S
                  </div>
                  <div className="text-yellow-400 font-bold text-2xl" style={{
                    fontFamily: 'Bebas Neue, Arial Black, sans-serif',
                    letterSpacing: '1px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                  }}>
                    EDGE
                  </div>
                  <div className="text-gray-300 text-xs mt-1 font-medium" style={{
                    fontFamily: 'Arial, sans-serif',
                    letterSpacing: '1px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                  }}>
                    HAND REPLAYER
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da mão - posicionamento melhorado */}
          <div className="absolute top-2 right-2 text-white/60 text-xs text-right bg-black/20 backdrop-blur-sm px-2 py-1 rounded-md" style={{ zIndex: 10 }}>
            <div className="font-mono">#{handHistory.handId.slice(-8)}</div>
            <div className="font-semibold">{handHistory.stakes} {handHistory.gameType}</div>
          </div>

          {/* Centro da mesa - Pot e Community Cards */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 20 }}>
            {/* Pot Total - melhor lógica de exibição */}
            {potTotal > 0 && (
              <div className="bg-yellow-600/90 backdrop-blur-sm text-black font-bold px-4 py-2 rounded-full mb-4 shadow-lg">
                Pot: ${potTotal.toFixed(0)}
              </div>
            )}

            {/* Fichas coletadas no centro - exibir apenas quando há fichas coletadas */}
            {snapshot.collectedPot > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <ChipStack valor={snapshot.collectedPot} size="medium" showLabel={true} />
              </div>
            )}

            {/* Community Cards */}
            <div className="flex space-x-2 mb-2">
              {communityCards.length > 0 ? (
                communityCards.map((card, index) => (
                  <Card key={index} card={card} size="medium" />
                ))
              ) : (
                <div className="text-white text-center px-6 py-3 bg-black/20 rounded-lg backdrop-blur-sm">
                  <div className="text-lg font-bold mb-1">
                    {snapshot.street === 'preflop' ? 'Pre-flop' :
                     snapshot.street === 'flop' ? 'Flop' :
                     snapshot.street === 'turn' ? 'Turn' :
                     snapshot.street === 'river' ? 'River' : 'Showdown'}
                  </div>
                  {snapshot.street === 'preflop' && (
                    <div className="text-sm text-gray-300">Aguardando o flop...</div>
                  )}
                  {snapshot.street === 'showdown' && (
                    <div className="text-sm text-yellow-300">Revelando as cartas...</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dealer button - REMOVIDO para não atrapalhar visualização das streets */}
          {/*
          <div
            className="absolute w-8 h-8 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center text-xs font-bold z-10"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            D
          </div>
          */}
        </div>
      </div>

      {/* Jogadores - SISTEMA HERO-CÊNTRICO */}
      {(() => {
        // Encontrar Hero e seu seat original
        const heroPlayer = handHistory.players.find(p => p.isHero);
        if (!heroPlayer && handHistory.players.length > 0) {
          handHistory.players[0].isHero = true;
        }

        const heroSeat = heroPlayer?.seat || 1;
        console.log(`🎯 Hero encontrado: ${heroPlayer?.name} no Seat ${heroSeat} (${heroPlayer?.position})`);

        // Calcular posições visuais com Hero sempre na posição central inferior
        const playersWithVisualSeats = calcularPosicoesVisuais(handHistory.players, heroSeat);

        console.log('🔄 Posições visuais calculadas:', playersWithVisualSeats.map(p =>
          `${p.name} (Seat ${p.seat}) → Visual ${p.visualSeat} ${p.isHero ? '[HERO]' : ''}`
        ));

        return playersWithVisualSeats.map((player) => {
          const style = getPositionStyle(player.visualSeat, playersWithVisualSeats.length);
          const isPlayerActive = activePlayer === player.name;
          const hasPlayerFolded = foldedPlayers.has(player.name);
          const playerCurrentStack = currentStacks[player.name] || player.stack;

          console.log(`🎲 ${player.name}: Seat ${player.seat} → Visual ${player.visualSeat} ${player.isHero ? '[HERO]' : ''}`);
          console.log(`💰 ${player.name} stack: ${player.stack} → ${playerCurrentStack}`);

          // Calcular stack final considerando ganhos do showdown
          let finalStack = playerCurrentStack;
          if (snapshot.street === 'showdown' && handHistory.showdown?.winners.includes(player.name)) {
            const wonAmount = handHistory.showdown.potWon || potTotal;
            finalStack = playerCurrentStack + wonAmount;
            console.log(`🏆 ${player.name} stack final: ${playerCurrentStack} + ${wonAmount} = ${finalStack}`);
          }

          // Criar player dinâmico com stack atualizado
          const dynamicPlayer = {
            ...player,
            stack: finalStack
          };

          return (
            <div
              key={player.name}
              className={`absolute player-seat-${player.visualSeat} ${
                isPlayerActive ? 'is-acting' : ''
              } ${hasPlayerFolded ? 'is-folded' : ''}`}
              style={{
                ...style,
                zIndex: 10,
              }}
            >
              <PlayerSeat
                player={dynamicPlayer}
                isActive={isPlayerActive}
                showCards={showAllCards || player.isHero || snapshot.street === 'showdown' || snapshot.revealedHands?.[player.name]}
                currentBet={snapshot.pendingContribs[player.name] || 0}
                hasFolded={hasPlayerFolded}
              />

              {/* Dealer Button */}
              {(handHistory.buttonSeat === player.seat || handHistory.dealerSeat === player.seat) && (
                <div className="absolute z-40" style={{
                  left: '85%',
                  top: '15%'
                }}>
                  <DealerButton size="small" />
                </div>
              )}
              {/* Sistema de fichas melhorado baseado no snapshot */}
              {(() => {
                // Showdown - vencedor
                if (snapshot.street === 'showdown' && snapshot.winners?.includes(player.name)) {
                  const wonAmount = handHistory.showdown?.potWon || snapshot.collectedPot;
                  return (
                    <div className="absolute z-30 flex flex-col items-center" style={{
                      left: '50%',
                      top: '-30%',
                      transform: 'translateX(-50%)'
                    }}>
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-lg animate-pulse">
                        🏆 VENCEDOR
                      </div>
                      <ChipStack valor={wonAmount} size="medium" showLabel={true} />
                    </div>
                  );
                }

                // Fichas de aposta do jogador
                const betAmount = snapshot.pendingContribs[player.name] || 0;
                if (betAmount > 0) {
                  return (
                    <div className="absolute z-30 flex items-center justify-center" style={{
                      left: '50%',
                      top: '-20%',
                      transform: 'translateX(-50%)'
                    }}>
                      <ChipStack valor={betAmount} size="small" showLabel={true} />
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          );
        });
      })()}

      {/* Controles de navegação */}
      <div className="absolute text-white text-sm" style={{ bottom: '1%', right: '2%' }}>
        <div>Street: {snapshot.street}</div>
        <div>Snapshot: {snapshot.id + 1}</div>
      </div>

      {/* Blinds info */}
      <div className="absolute text-white text-sm" style={{ bottom: '1%', left: '2%' }}>
        <div>SB: ${handHistory.smallBlind}</div>
        <div>BB: ${handHistory.bigBlind}</div>
        {handHistory.ante && <div>Ante: ${handHistory.ante}</div>}
      </div>
      </div>
    </div>
  );
};

export default PokerTable;