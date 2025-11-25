import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { HandHistory, Snapshot, Player } from '@/types/poker';
import PlayerSeat from './PlayerSeat';
import Card from './Card';
import ChipStack from './ChipStack';
import DealerButton from './DealerButton';
import { PokerHandEvaluator } from '@/lib/poker-hand-evaluator';
import { normalizeKey, getNormalized } from '@/lib/normalize-key';
import { PokerUtils } from '@/lib/poker/poker-utils';
import { PokerUIUtils } from '@/lib/poker/poker-ui-utils';
import { CurrencyUtils } from '@/utils/currency-utils';

interface PokerTableProps {
  handHistory: HandHistory;
  snapshot: Snapshot;
  showAllCards?: boolean;
  displayMode?: 'chips' | 'bb';
}

// Define interface for player with visual seat
interface PlayerWithVisualSeat extends Player {
  visualSeatClass?: string;
  visualSeat: number;
}

const PokerTable: React.FC<PokerTableProps> = React.memo(({
  handHistory,
  snapshot,
  showAllCards = false,
  displayMode = 'chips'
}) => {
  const { t } = useTranslation();

  // Helper para formatar valores baseado no modo de exibição
  const formatAmount = useCallback((amount: number | undefined): string | undefined => {
    if (amount === undefined) return undefined;

    if (displayMode === 'bb' && handHistory?.bigBlind) {
      const bbValue = amount / handHistory.bigBlind;
      // Mostra até 1 casa decimal se não for inteiro, ou 0 se for inteiro
      return `${Number.isInteger(bbValue) ? bbValue : bbValue.toFixed(1)} BB`;
    }

    // Fallback para formatação padrão de fichas
    return CurrencyUtils.formatValue(Math.round(amount), handHistory?.gameContext?.isTournament);
  }, [displayMode, handHistory?.bigBlind, handHistory?.gameContext?.isTournament]);

  // Helper para obter o valor numérico formatado para BB (para uso em ChipStack label)
  const getFormattedLabel = useCallback((amount: number): string => {
    if (displayMode === 'bb' && handHistory?.bigBlind) {
      const bbValue = amount / handHistory.bigBlind;
      return `${Number.isInteger(bbValue) ? bbValue : bbValue.toFixed(1)} BB`;
    }
    return `$${amount}`;
  }, [displayMode, handHistory?.bigBlind]);

  const getLabelForChipStack = useCallback((amount: number) => {
    if (displayMode === 'bb') {
      return getFormattedLabel(amount);
    }
    return undefined; // Let ChipStack handle it
  }, [displayMode, getFormattedLabel]);

  // Memoize hero-centric position calculation
  const calcularPosicoesVisuais = useCallback((players: Player[], heroSeat: number, maxPlayers: number): PlayerWithVisualSeat[] => {
    // Use maxPlayers (capacidade da mesa) e não players.length (jogadores ativos)
    // Isso garante que os assentos sejam distribuídos corretamente (ex: 7 jogadores em mesa 8-max)
    const totalSeats = maxPlayers;

    // O deslocamento necessário para colocar o Hero no assento visual #1 (inferior central)
    const offset = heroSeat - 1;

    return players.map(player => {
      const seat = player.seat || 0;
      let visualSeat = seat - offset;
      if (visualSeat <= 0) {
        visualSeat += totalSeats; // Garante que o número seja positivo
      }

      // Adiciona propriedade para posicionamento CSS
      return {
        ...player,
        visualSeatClass: `player-seat-${visualSeat}`,
        visualSeat: visualSeat
      };
    });
  }, []);

  // Memoize community cards calculation
  const communityCards = useMemo(() => {
    if (!handHistory || !snapshot) return [];
    return PokerUtils.getCommunityCardsForStreet(handHistory, snapshot.street);
  }, [handHistory, snapshot]);

  // Add null check AFTER hooks
  if (!handHistory || !snapshot) {
    return <div>Loading...</div>;
  }

  // Simple snapshot-based state - no complex calculations needed!
  const activePlayer = snapshot.activePlayer;
  const potTotal = snapshot.totalDisplayedPot;
  const currentStacks = snapshot.playerStacks;
  const foldedPlayers = snapshot.folded;

  // Function to get last action for a player from snapshot description
  const getLastActionForPlayer = (playerName: string): string | undefined => {
    if (!snapshot.description) return undefined;

    // Check if the current snapshot description mentions this player
    const normalizedName = normalizeKey(playerName);
    const normalizedActivePlayer = activePlayer ? normalizeKey(activePlayer) : null;

    // If this player is the active player, show their current action from description
    if (normalizedActivePlayer === normalizedName && snapshot.description) {
      // Extract action from description like "Player calls 400" -> "calls 400"
      const actionMatch = snapshot.description.match(new RegExp(`${playerName}\\s+(.+)`));
      if (actionMatch) {
        return actionMatch[1];
      }
    }

    return undefined;
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
            {/* Logo do PokerMastery - MUITO MAIS VISÍVEL */}
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
                    src="/assets/images/pokermastery-logo.png"
                    alt="PokerMastery"
                    className="max-w-[220px] max-h-[120px] mix-blend-screen"
                    style={{
                      filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.8)) brightness(1.2) contrast(1.2)',
                      objectFit: 'contain'
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
                    <div className="text-green-400 font-bold text-3xl mb-1" style={{
                      fontFamily: 'Bebas Neue, Arial Black, sans-serif',
                      letterSpacing: '3px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.9)', // SOMBRA MAIS FORTE
                      transform: 'scale(1.1)' // LIGEIRAMENTE MAIOR
                    }}>
                      MASTERY
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
              {/* Pote Total Consolidado - Empilhamento realista como PokerStars */}
              {potTotal > 0 && snapshot.street !== 'showdown' && (
                <div className="flex flex-col items-center mb-4">
                  <div style={{ transform: 'scale(0.625)', transformOrigin: 'center' }}>
                    <ChipStack
                      valor={potTotal}
                      size="medium"
                      showLabel={false}
                      enableRealisticStacking={true}
                    />
                  </div>
                  <div className="mt-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold px-4 py-2 rounded-full shadow-xl border-2 border-yellow-400">
                    <div className="text-sm">Pote Total: {formatAmount(potTotal)}</div>
                  </div>
                </div>
              )}

              {/* Community Cards */}
              <div className="flex space-x-2 mb-2">
                {communityCards.length > 0 ? (
                  communityCards.map((card, index) => (
                    <Card key={index} card={card} size="large" />
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
          </div>
        </div>

        {/* Jogadores - SISTEMA HERO-CÊNTRICO */}
        {(() => {
          // Encontrar Hero e seu seat original
          let heroPlayer = handHistory.players.find(p => p.isHero);
          if (!heroPlayer && handHistory.players.length > 0) {
            // Se não há hero definido, marca o primeiro jogador temporariamente
            heroPlayer = { ...handHistory.players[0], isHero: true };
          }

          const heroSeat = heroPlayer?.seat || 1;
          const maxPlayers = handHistory.maxPlayers || handHistory.players.length;

          // Calcular posições visuais com Hero sempre na posição central inferior
          const playersWithVisualSeats = calcularPosicoesVisuais([...handHistory.players], heroSeat, maxPlayers);

          return playersWithVisualSeats.map((player) => {
            const style = PokerUIUtils.getPlayerPosition(player.visualSeat, maxPlayers);
            const playerKey = normalizeKey(player.name);
            const isPlayerActive = activePlayer === player.name;
            const hasPlayerFolded = foldedPlayers.has(player.name);

            // Read stack from snapshot with normalized keys (prioritize snapshot over player.stack)
            const playerCurrentStack = currentStacks ? (getNormalized(currentStacks, playerKey) ?? player.stack) : player.stack;

            // Calcular stack final considerando ganhos do showdown (evitar double-count)
            let finalStack = playerCurrentStack;

            // 1) Se o snapshot já fornece stacks _após_showdown_, use direto (ideal).
            if (snapshot.playerStacksPostShowdown && getNormalized(snapshot.playerStacksPostShowdown, playerKey) != null) {
              finalStack = getNormalized(snapshot.playerStacksPostShowdown, playerKey)!;
            } else if (snapshot.street === 'showdown') {
              // 2) Caso contrário, calcule de forma determinística: initial - committed + payout
              const initialStack = player.stack ?? 0; // stack inicial vindo do handHistory
              // totalCommitted = total que o jogador colocou na mão (usando normalized keys)
              const totalCommitted = snapshot.totalCommitted ? getNormalized(snapshot.totalCommitted, playerKey) ?? 0 : 0;
              // CRITICAL FIX: payout from SUMMARY section if available
              let payout = 0;
              if (handHistory.showdown?.playerWinnings?.[player.name]) {
                payout = handHistory.showdown.playerWinnings[player.name];
              } else if (snapshot.payouts) {
                payout = getNormalized(snapshot.payouts, playerKey) ?? 0;
              }

              finalStack = initialStack - totalCommitted + payout;
            }


            // Criar player dinâmico com stack atualizado
            const dynamicPlayer = {
              ...player,
              stack: finalStack
            };

            return (
              <div
                key={player.name}
                className={`absolute player-seat-${player.visualSeat} ${isPlayerActive ? 'is-acting' : ''
                  } ${hasPlayerFolded ? 'is-folded' : ''}`}
                style={{
                  ...style,
                  zIndex: 10,
                }}
              >
                <PlayerSeat
                  player={dynamicPlayer}
                  isActive={isPlayerActive}
                  showCards={!!(showAllCards || player.isHero || snapshot.street === 'showdown' || (snapshot.revealedHands ? getNormalized(snapshot.revealedHands, playerKey) : false))}
                  currentBet={(snapshot.pendingContribs ? getNormalized(snapshot.pendingContribs, playerKey) : undefined) || 0}
                  hasFolded={hasPlayerFolded}
                  isWinner={snapshot.street === 'showdown' && snapshot.winners?.includes(player.name)}
                  isShowdown={snapshot.street === 'showdown'}
                  lastAction={getLastActionForPlayer(player.name)}
                  isTournament={handHistory.gameContext?.isTournament}
                  formattedStack={formatAmount(finalStack)}
                  formattedBounty={player.bounty ? formatAmount(player.bounty) : undefined}
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
          let heroPlayer = handHistory.players.find(p => p.isHero);
          if (!heroPlayer && handHistory.players.length > 0) {
            heroPlayer = { ...handHistory.players[0], isHero: true };
          }
          const heroSeat = heroPlayer?.seat || 1;
          const maxPlayers = handHistory.maxPlayers || handHistory.players.length;
          const playersWithVisualSeats = calcularPosicoesVisuais([...handHistory.players], heroSeat, maxPlayers);

          return playersWithVisualSeats.map((player) => {
            // Use pendingContribs from snapshot - these represent chips in front of player during current street
            // IMPORTANT: Use the EXACT same normalized key function as snapshot-builder
            const normalizeKey = (name: string): string => {
              if (!name) return '';
              return name
                .trim()
                .toLowerCase()
                .normalize('NFKD')
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
                .replace(/\s+/g, ' ') // SAME as normalize-key.ts - keep spaces!
                .trim();
            };

            const getNormalized = (obj: Record<string, number> | undefined, key: string): number => {
              if (!obj) return 0;
              const normalizedKey = normalizeKey(key);
              return obj[normalizedKey] ?? obj[key] ?? 0;
            };

            const betAmount = getNormalized(snapshot.pendingContribs, player.name);

            // pendingContribs automatically handles:
            // - Initial blinds (SB/BB) in preflop snapshots
            // - Bets/raises during current street
            // - Reset to 0 when street changes (chips move to pot)


            // CRITICAL FIX: Obter payout do jogador no showdown
            // Prioriza handHistory.showdown.playerWinnings (extraído da SUMMARY) sobre snapshot.payouts (calculado)
            let playerPayout = 0;
            if (snapshot.street === 'showdown') {
              const playerKey = normalizeKey(player.name);
              if (handHistory.showdown?.playerWinnings?.[player.name]) {
                // Use EXACT value from "and won (X)" in SUMMARY section
                playerPayout = handHistory.showdown.playerWinnings[player.name];
              } else if (snapshot.payouts) {
                // Fallback to calculated payouts
                playerPayout = getNormalized(snapshot.payouts, playerKey) ?? 0;
              }
            }

            // Render bet chips in action area (durante jogo) ou payout chips (no showdown)
            const chipsToShow = snapshot.street === 'showdown' ? playerPayout : betAmount;

            if (chipsToShow > 0) {
              const actionStyle = PokerUIUtils.getActionAreaPosition(player.visualSeat, maxPlayers);
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
                    <div style={{ transform: 'scale(0.625)', transformOrigin: 'center' }}>
                      <ChipStack
                        valor={chipsToShow}
                        size="medium"
                        showLabel={true}
                        enableRealisticStacking={true}
                        formattedValue={getLabelForChipStack(chipsToShow)}
                      />
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          });
        })()}

        {/* Sistema de Showdown - Improved winner info display */}
        {snapshot.street === 'showdown' && snapshot.winners && (
          <div className="absolute top-4 right-4 pointer-events-none" style={{ zIndex: 35 }}>
            {/* Winner info in top-right background */}
            <div className="flex flex-col items-end gap-2">
              {snapshot.winners.map((winner, idx) => {
                const winnerKey = normalizeKey(winner);
                // CRITICAL FIX: Use playerWinnings from SUMMARY section if available
                const totalWon = handHistory.showdown?.playerWinnings?.[winner]
                  ? handHistory.showdown.playerWinnings[winner]
                  : (snapshot.payouts ? getNormalized(snapshot.payouts, winnerKey) ?? 0 : 0);
                const winnerPlayer = handHistory.players.find(p => p.name === winner);
                const winningHandDescription = winnerPlayer?.cards && communityCards.length >= 3
                  ? PokerHandEvaluator.getBestHandDescription(winnerPlayer, communityCards)
                  : null;

                return (
                  <div key={idx} className="flex flex-col items-end gap-1">
                    <div className="bg-gradient-to-r from-yellow-400/90 via-yellow-500/90 to-yellow-600/90 text-black px-4 py-2 rounded-lg shadow-xl border-2 border-yellow-300/80 backdrop-blur-sm">
                      <div className="text-sm font-bold text-center">
                        🏆 {winner}
                      </div>
                      {totalWon > 0 && (
                        <div className="text-xs text-center mt-1">
                          Won: {formatAmount(totalWon)}
                        </div>
                      )}
                    </div>

                    {/* Winning hand description */}
                    {winningHandDescription && (
                      <div className="bg-black/80 text-white px-3 py-1.5 rounded-lg border border-yellow-400/30 backdrop-blur-sm">
                        <div className="text-right">
                          <div className="text-xs text-yellow-400 mb-0.5">Mão Vencedora</div>
                          <div className="text-xs font-medium">{winningHandDescription}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Controles de navegação */}
        <div className="absolute text-white text-sm" style={{ bottom: '1%', right: '2%' }}>
          <div>{t('replayer.street', { street: t(`streets.${snapshot.street}`) })}</div>
          <div>Snapshot: {snapshot.id + 1}</div>
        </div>

        {/* Hand info - canto superior esquerdo do background (mesmo layer que SB/BB) */}
        <div className="absolute text-white text-sm" style={{ top: '1%', left: '2%' }}>
          <div className="font-mono text-white/90">#{handHistory.handId.slice(-8)}</div>
          <div className="font-semibold text-white">{handHistory.stakes} {handHistory.gameType}</div>
        </div>

        {/* Blinds info */}
        <div className="absolute text-white text-sm" style={{ bottom: '1%', left: '2%' }}>
          <div>{t('table.sb', { amount: handHistory.smallBlind })}</div>
          <div>{t('table.bb', { amount: handHistory.bigBlind })}</div>
          {handHistory.ante && <div>{t('table.ante', { amount: handHistory.ante })}</div>}
        </div>
      </div>
    </div>
  );
});

PokerTable.displayName = 'PokerTable';

export default PokerTable;