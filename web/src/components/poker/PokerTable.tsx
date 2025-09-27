import React from 'react';
import { useTranslation } from 'react-i18next';
import { HandHistory, Card as CardType, Snapshot } from '@/types/poker';
import PlayerSeat from './PlayerSeat';
import Card from './Card';
import ChipStack from './ChipStack';
import DealerButton from './DealerButton';
import { PokerHandEvaluator } from '@/lib/poker-hand-evaluator';

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
  const { t } = useTranslation();

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

      case 8: // 8-max - Final positioning adjustments
        const pos8 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero
          { left: '15%', bottom: '15%', transform: 'none' },            // Bottom Left - closer to center and down
          { left: '3%', bottom: '42%', transform: 'none' },             // Left Mid-Low - down to table curve
          { left: '20%', top: '8%', transform: 'none' },                // Left Mid-High - higher up
          { left: '50%', top: '3%', transform: 'translateX(-50%)' },    // Top Center
          { right: '20%', top: '8%', transform: 'none' },               // Right Mid-High - higher up
          { right: '3%', bottom: '42%', transform: 'none' },            // Right Mid-Low - down to table curve
          { right: '15%', bottom: '15%', transform: 'none' }            // Bottom Right - closer to center and down
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

  // Build persistent community cards based on street and hand history
  const buildCommunityCards = () => {
    const cards: CardType[] = [];

    // Add flop cards if we're at flop or later
    if (['flop', 'turn', 'river', 'showdown'].includes(snapshot.street) && handHistory.flop) {
      cards.push(...handHistory.flop.cards);
    }

    // Add turn card if we're at turn or later
    if (['turn', 'river', 'showdown'].includes(snapshot.street) && handHistory.turn) {
      cards.push(handHistory.turn.card);
    }

    // Add river card if we're at river or showdown
    if (['river', 'showdown'].includes(snapshot.street) && handHistory.river) {
      cards.push(handHistory.river.card);
    }

    return cards;
  };

  const communityCards = buildCommunityCards();

  // Função para calcular posição da "área de ação" (fichas de aposta)
  const getActionAreaPosition = (visualSeat: number, totalPlayers: number) => {
    // Posições específicas para cada asiento visual para evitar sobreposição
    switch (totalPlayers) {
      case 8: // 8-max - Final bet positions matching adjusted player positions
        const pos8 = [
          { left: '50%', bottom: '25%', transform: 'translateX(-50%)' }, // Hero - frente do centro
          { left: '28%', bottom: '30%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '18%', bottom: '45%', transform: 'translateX(-50%)' }, // Left Mid-Low - adjusted for curve
          { left: '34%', top: '25%', transform: 'translateX(-50%)' },   // Left Mid-High - adjusted higher
          { left: '50%', top: '25%', transform: 'translateX(-50%)' },   // Top Center
          { right: '34%', top: '25%', transform: 'translateX(50%)' },   // Right Mid-High - adjusted higher
          { right: '18%', bottom: '45%', transform: 'translateX(50%)' }, // Right Mid-Low - adjusted for curve
          { right: '28%', bottom: '30%', transform: 'translateX(50%)' } // Bottom Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos8[visualSeat - 1] };

      case 6: // 6-max
        const pos6 = [
          { left: '50%', bottom: '25%', transform: 'translateX(-50%)' }, // Hero - frente do centro
          { left: '25%', bottom: '40%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '25%', top: '40%', transform: 'translateX(-50%)' },   // Top Left
          { left: '50%', top: '25%', transform: 'translateX(-50%)' },   // Top Center
          { right: '25%', top: '40%', transform: 'translateX(50%)' },   // Top Right
          { right: '25%', bottom: '40%', transform: 'translateX(50%)' } // Bottom Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos6[visualSeat - 1] };

      case 5: // 5-max
        const pos5 = [
          { left: '50%', bottom: '25%', transform: 'translateX(-50%)' },
          { left: '25%', bottom: '40%', transform: 'translateX(-50%)' },
          { left: '20%', top: '35%', transform: 'translateX(-50%)' },
          { right: '20%', top: '35%', transform: 'translateX(50%)' },
          { right: '25%', bottom: '40%', transform: 'translateX(50%)' }
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos5[visualSeat - 1] };

      case 4: // 4-max
        const pos4 = [
          { left: '50%', bottom: '25%', transform: 'translateX(-50%)' },
          { left: '25%', bottom: '50%', transform: 'translateX(-50%)' },
          { left: '50%', top: '25%', transform: 'translateX(-50%)' },
          { right: '25%', bottom: '50%', transform: 'translateX(50%)' }
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos4[visualSeat - 1] };

      default:
        // Fallback para outros números
        const angle = ((visualSeat - 1) / totalPlayers) * 2 * Math.PI - Math.PI / 2;
        const radiusX = 22;
        const radiusY = 16;
        const x = 50 + radiusX * Math.cos(angle);
        const y = 50 + radiusY * Math.sin(angle);
        return {
          position: 'absolute' as const,
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 25
        };
    }
  };

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
          {/* Logo do Poker Grinder's Edge - MUITO MAIS VISÍVEL */}
          <div className="replayer-table__logo absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="text-center select-none"
              style={{
                opacity: 0.85, // AUMENTADO SIGNIFICATIVAMENTE para visibilidade
                transform: 'rotate(-2deg)', // Rotação ainda mais sutil
                zIndex: 1
              }}
            >
              {/* Logo principal com fallback text */}
              <div className="relative">
                {/* Imagem do logo se existir */}
                <img
                  src="/assets/images/poker-grinders-edge-logo.png"
                  alt="Poker Grinder's Edge"
                  className="max-w-[220px] max-h-[120px]" // TAMANHO MAIOR
                  style={{
                    filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.8)) brightness(1.1) contrast(1.1)', // SOMBRA MAIS FORTE E MAIOR CONTRASTE
                    opacity: 1 // OPACIDADE MÁXIMA NA IMAGEM
                  }}
                  onError={(e) => {
                    // Fallback para texto se imagem não carregar
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.querySelector('.fallback-logo')?.classList.remove('hidden');
                    }
                  }}
                />

                {/* Fallback text logo - MAIS VISÍVEL */}
                <div className="fallback-logo hidden">
                  <div className="text-white font-bold text-4xl mb-1" style={{
                    fontFamily: 'Bebas Neue, Arial Black, sans-serif',
                    letterSpacing: '3px',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.9)', // SOMBRA MAIS FORTE
                    transform: 'scale(1.1)' // LIGEIRAMENTE MAIOR
                  }}>
                    POKER
                  </div>
                  <div className="text-green-400 font-bold text-2xl mb-1" style={{
                    fontFamily: 'Bebas Neue, Arial Black, sans-serif',
                    letterSpacing: '3px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9)', // SOMBRA MAIS FORTE
                    transform: 'scale(1.1)' // LIGEIRAMENTE MAIOR
                  }}>
                    GRINDER'S
                  </div>
                  <div className="text-yellow-400 font-bold text-3xl" style={{
                    fontFamily: 'Bebas Neue, Arial Black, sans-serif',
                    letterSpacing: '2px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9)', // SOMBRA MAIS FORTE
                    transform: 'scale(1.1)' // LIGEIRAMENTE MAIOR
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


          {/* Centro da mesa - Pot e Community Cards */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 20 }}>
            {/* Pote Total Consolidado - Uma única representação visual limpa */}
            {potTotal > 0 && (
              <div className="flex flex-col items-center mb-4">
                <ChipStack valor={potTotal} size="medium" showLabel={false} />
                <div className="mt-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold px-4 py-2 rounded-full shadow-xl border-2 border-yellow-400">
                  <div className="text-sm">Pote Total: ${potTotal.toFixed(0)}</div>
                </div>
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
                    {t(`streets.${snapshot.street}`)}
                  </div>
                  {snapshot.street === 'preflop' && (
                    <div className="text-sm text-gray-300">{t('table.waitingFlop')}</div>
                  )}
                  {snapshot.street === 'showdown' && (
                    <div className="text-sm text-yellow-300">{t('table.revealingCards')}</div>
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
                isWinner={snapshot.street === 'showdown' && snapshot.winners?.includes(player.name)}
                isShowdown={snapshot.street === 'showdown'}
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
            </div>
          );
        });
      })()}

      {/* Sistema de Área de Ação - Fichas de Aposta Centralizadas */}
      {(() => {
        const heroPlayer = handHistory.players.find(p => p.isHero);
        if (!heroPlayer && handHistory.players.length > 0) {
          handHistory.players[0].isHero = true;
        }
        const heroSeat = heroPlayer?.seat || 1;
        const playersWithVisualSeats = calcularPosicoesVisuais(handHistory.players, heroSeat);

        return playersWithVisualSeats.map((player) => {
          let betAmount = snapshot.pendingContribs[player.name] || 0;

          // No snapshot inicial (id = 0), mostrar as blinds
          if (snapshot.id === 0) {
            if (player.position === 'SB') {
              betAmount = handHistory.smallBlind;
            } else if (player.position === 'BB') {
              betAmount = handHistory.bigBlind;
            }
          }


          // Render bet chips in action area
          if (betAmount > 0 && snapshot.street !== 'showdown') {
            const actionStyle = getActionAreaPosition(player.visualSeat, playersWithVisualSeats.length);
            return (
              <div key={`action-${player.name}`} style={{
                ...actionStyle,
                background: 'transparent !important',
                backgroundColor: 'transparent !important'
              }}>
                <div className="relative" style={{
                  background: 'transparent !important',
                  backgroundColor: 'transparent !important'
                }}>
                  {/* Professional chip display without connecting lines like PokerStars */}
                  <ChipStack
                    valor={betAmount}
                    size="medium"
                    showLabel={true}
                    enableRealisticStacking={true}
                  />

                  {/* Nome do jogador na aposta */}
                  <div className="text-white text-xs text-center mt-1 bg-black/40 rounded px-1">
                    {player.name}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        });
      })()}

      {/* Sistema de Showdown Melhorado */}
      {snapshot.street === 'showdown' && snapshot.winners && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 35 }}>
          {/* Sem overlay escuro - mantém mesa visível para estudo */}

          {/* Resultado do showdown - movido para cima para não tampar board/pot */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-xl shadow-2xl border-4 border-yellow-300 mb-4">
              <div className="text-xl font-bold text-center">
                {snapshot.winners.length === 1
                  ? `${snapshot.winners[0]} ${t('replayer.winner')}`
                  : `${snapshot.winners.join(', ')} ${t('replayer.winner')}`
                }
              </div>
              {handHistory.showdown?.potWon && (
                <div className="text-md text-center mt-1">
                  Pote: ${handHistory.showdown.potWon}
                </div>
              )}
            </div>

            {/* Combinação vencedora */}
            {(() => {
              if (!snapshot.winners || snapshot.winners.length === 0) return null;

              const winner = handHistory.players.find(p => p.name === snapshot.winners[0]);
              if (!winner?.cards || communityCards.length < 3) return null;

              const winningHandDescription = PokerHandEvaluator.getBestHandDescription(winner, communityCards);

              return (
                <div className="bg-black/90 text-white px-4 py-2 rounded-lg border border-yellow-400/30">
                  <div className="text-center">
                    <div className="text-xs text-yellow-400 mb-1">Mão Vencedora</div>
                    <div className="text-sm font-medium">{winningHandDescription}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Controles de navegação */}
      <div className="absolute text-white text-sm" style={{ bottom: '1%', right: '2%' }}>
        <div>{t('replayer.street', { street: t(`streets.${snapshot.street}`) })}</div>
        <div>Snapshot: {snapshot.id + 1}</div>
      </div>

      {/* Blinds info */}
      <div className="absolute text-white text-sm" style={{ bottom: '1%', left: '2%' }}>
        <div>{t('table.sb', { amount: handHistory.smallBlind })}</div>
        <div>{t('table.bb', { amount: handHistory.bigBlind })}</div>
        {handHistory.ante && <div>{t('table.ante', { amount: handHistory.ante })}</div>}
      </div>
      </div>

      {/* Informações da mão - canto superior esquerdo do background */}
      <div className="absolute top-2 left-2 text-white/70 text-xs text-left bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20" style={{ zIndex: 50 }}>
        <div className="font-mono text-white/90">#{handHistory.handId.slice(-8)}</div>
        <div className="font-semibold text-white">{handHistory.stakes} {handHistory.gameType}</div>
      </div>
    </div>
  );
};

export default PokerTable;