// Compatibilidade para o sistema existente - converte ReplayState em Snapshots
import { ReplayBuilder } from './replay-builder';
import { HandHistory, Snapshot, Pot } from '@/types/poker';
import { ReplayState, ReplayStep } from '@/types/replay';
import { normalizeKey, setNormalized, getNormalized, incrementNormalized } from './normalize-key';

export class SnapshotBuilder {
  // Site configuration for reveal behavior
  private static siteConfig = {
    revealsOnAllIn: false // Default: only reveal at showdown
  };

  /**
   * Process all-in action with normalized keys and comprehensive tracking
   */
  private static processAllInAction(
    actionStep: any,
    snapshot: {
      playerStacks: Record<string, number>;
      totalCommitted: Record<string, number>;
      pendingContribs: Record<string, number>;
      isAllIn: Record<string, boolean>;
      revealedHands?: Record<string, any>;
    },
    handHistory: HandHistory
  ): void {
    const key = normalizeKey(actionStep.player);

    // Get stack before action
    const stackBefore = getNormalized(snapshot.playerStacks, key) ||
      handHistory.players.find(p => normalizeKey(p.name) === key)?.stack || 0;

    // Determine amount to commit
    const parsedAmount = actionStep.amount;
    const amountToCommit = parsedAmount ? Math.min(parsedAmount, stackBefore) : stackBefore;

    // Update tracking
    incrementNormalized(snapshot.totalCommitted, key, amountToCommit);
    incrementNormalized(snapshot.pendingContribs, key, amountToCommit);

    // Update stack (should be 0 for all-in)
    const newStack = Math.max(0, stackBefore - amountToCommit);
    setNormalized(snapshot.playerStacks, key, newStack);

    // Mark as all-in
    setNormalized(snapshot.isAllIn, key, true);

    // Handle card reveals
    if (actionStep.reveals || this.siteConfig.revealsOnAllIn || actionStep.revealedCards) {
      if (!snapshot.revealedHands) {
        snapshot.revealedHands = {};
      }
      const player = handHistory.players.find(p => normalizeKey(p.name) === key);
      if (player?.cards) {
        setNormalized(snapshot.revealedHands, key, player.cards);
        console.log(`✅ REVEAL (all-in): ${key} cards:`, player.cards);
      }
    }

    // Comprehensive logging
    console.log(`🧾 ALL-IN processed:`, {
      player: key,
      stackBefore,
      parsedAmount,
      amountToCommit,
      newStack,
      totalCommitted: getNormalized(snapshot.totalCommitted, key)
    });
  }

  /**
   * Deterministic side pot calculation with normalized keys
   */
  private static computeSidePots(totalCommittedMap: Record<string, number>): Array<{amount: number, eligible: string[]}> {
    // Transform to array and sort by contribution (ascending)
    const arr = Object.entries(totalCommittedMap)
      .map(([p, c]) => ({ player: p, committed: c }))
      .sort((a, b) => a.committed - b.committed);

    const pots: Array<{amount: number, eligible: string[]}> = [];
    let prev = 0;

    for (let i = 0; i < arr.length; i++) {
      const amount = arr[i].committed - prev;
      if (amount <= 0) {
        prev = arr[i].committed;
        continue;
      }

      // All players with committed >= arr[i].committed are eligible
      const eligible = arr.slice(i).map(x => x.player);
      pots.push({
        amount: amount * eligible.length,
        eligible
      });
      prev = arr[i].committed;
    }

    return pots;
  }

  /**
   * Legacy side-pots function (for compatibility)
   */
  private static calculateSidePots(
    playerContributions: Record<string, number>,
    foldedPlayers: Set<string>
  ): Pot[] {
    // Use new deterministic algorithm but convert to legacy format
    const activePlayers = Object.keys(playerContributions).filter(
      player => !foldedPlayers.has(normalizeKey(player))
    );

    if (activePlayers.length === 0) {
      return [{ value: 0, eligiblePlayers: [], isPotSide: false }];
    }

    const activeContribs: Record<string, number> = {};
    activePlayers.forEach(player => {
      activeContribs[player] = playerContributions[player] || 0;
    });

    const sidePots = this.computeSidePots(activeContribs);

    return sidePots.map((pot, index) => ({
      value: pot.amount,
      eligiblePlayers: pot.eligible,
      isPotSide: index > 0
    }));
  }

  static buildSnapshots(handHistory: HandHistory): Snapshot[] {
    try {
      const replayState = ReplayBuilder.buildReplayFromHand(handHistory);

      if (!replayState || !replayState.steps) {
        console.warn('ReplayState is empty or has no steps');
        return [];
      }

      // Converter ReplayState steps em Snapshots
      const snapshots: Snapshot[] = [];

      // Calculate initial pot including antes
      const totalAntes = handHistory.antes ?
        handHistory.antes.reduce((sum, ante) => sum + (ante.amount || 0), 0) : 0;
      let currentPot = handHistory.smallBlind + handHistory.bigBlind + totalAntes;

      // Ajustar stacks iniciais subtraindo antes e blinds já colocados na mesa (using normalized keys)
      const currentStacks: Record<string, number> = {};
      handHistory.players.forEach(player => {
        const key = normalizeKey(player.name);
        let adjustedStack = player.stack;

        // Subtrair ante se houver
        if (handHistory.ante && handHistory.ante > 0) {
          adjustedStack -= handHistory.ante;
        }

        // Subtrair blinds
        if (player.position === 'SB') {
          adjustedStack -= handHistory.smallBlind;
        } else if (player.position === 'BB') {
          adjustedStack -= handHistory.bigBlind;
        }

        // Atualizar stack (garantindo que não fique negativo)
        currentStacks[key] = Math.max(0, adjustedStack);
      });

      let communityCards: any[] = [];
      let currentStreet: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' = 'preflop';
      let folded = new Set<string>();
      let pendingContribs: Record<string, number> = {};
      let totalContribs: Record<string, number> = {};
      let isAllIn: Record<string, boolean> = {};
      let revealedCards: Record<string, any> = {}; // Cartas reveladas durante a mão

      // Inicializar contribuições totais com antes, blinds (using normalized keys)
      handHistory.players.forEach(player => {
        const key = normalizeKey(player.name);
        totalContribs[key] = 0;

        // Adicionar antes se houver
        if (handHistory.ante && handHistory.ante > 0) {
          totalContribs[key] += handHistory.ante;
        }

        // Adicionar as blinds às contribuições iniciais
        if (player.position === 'SB') {
          totalContribs[key] += handHistory.smallBlind;
        } else if (player.position === 'BB') {
          totalContribs[key] += handHistory.bigBlind;
        }
      });

      // Adicionar snapshot inicial para mostrar as blinds
      const initialPendingContribs: Record<string, number> = {};

      // Blinds devem aparecer como pending contributions inicialmente
      handHistory.players.forEach(player => {
        if (player.position === 'SB') {
          initialPendingContribs[player.name] = handHistory.smallBlind;
        } else if (player.position === 'BB') {
          initialPendingContribs[player.name] = handHistory.bigBlind;
        }
      });

      const initialPots = this.calculateSidePots(totalContribs, folded);
      const initialSnapshot: Snapshot = {
        id: 0,
        street: 'preflop',
        actionIndex: -1, // -1 indica snapshot inicial
        description: handHistory.ante ?
          `Antes $${handHistory.ante} - Small Blind $${handHistory.smallBlind} - Big Blind $${handHistory.bigBlind}` :
          `Small Blind $${handHistory.smallBlind} - Big Blind $${handHistory.bigBlind}`,
        pots: initialPots,
        collectedPot: 0,
        pendingContribs: initialPendingContribs,
        totalDisplayedPot: initialPots.reduce((sum, pot) => sum + pot.value, 0),
        playerStacks: { ...currentStacks },
        playersOrder: handHistory.players.map(p => p.name),
        folded: new Set(),
        activePlayer: undefined,
        communityCards: []
      };
      snapshots.push(initialSnapshot);

      replayState.steps.forEach((step: ReplayStep, index: number) => {
        let description = '';
        let activePlayer: string | undefined;

        switch (step.type) {
          case 'ACTION':
            const actionStep = step as any;
            description = actionStep.description;
            activePlayer = actionStep.player;
            currentPot = actionStep.potAfter;

            const playerKey = normalizeKey(actionStep.player);

            // Debug da action
            console.log(`📝 ACTION: ${actionStep.player} ${actionStep.action} ${actionStep.amount || 0}`);

            // Process different action types with normalized keys
            if (actionStep.action === 'all-in') {
              // Use specialized all-in processing
              this.processAllInAction(actionStep, {
                playerStacks: currentStacks,
                totalCommitted: totalContribs,
                pendingContribs,
                isAllIn,
                revealedHands: revealedCards
              }, handHistory);
            } else if (actionStep.action === 'fold') {
              folded.add(playerKey);
            } else if (actionStep.action === 'uncalled_return') {
              // For uncalled bets, remove from total contributions (money returned to player)
              if (actionStep.amount) {
                const currentTotal = getNormalized(totalContribs, playerKey) || 0;
                setNormalized(totalContribs, playerKey, currentTotal - actionStep.amount);
              }
            } else if (actionStep.amount && actionStep.amount > 0) {
              // Normal action processing
              incrementNormalized(pendingContribs, playerKey, actionStep.amount);
              incrementNormalized(totalContribs, playerKey, actionStep.amount);

              // Update stack
              const currentStack = getNormalized(currentStacks, playerKey) || 0;
              const newStack = Math.max(0, currentStack - actionStep.amount);
              setNormalized(currentStacks, playerKey, newStack);
            }
            break;

          case 'STREET':
            const streetStep = step as any;
            currentStreet = streetStep.street;
            description = streetStep.description;
            communityCards = [...streetStep.cards];
            // Reset pending contributions at start of new street
            Object.keys(pendingContribs).forEach(key => delete pendingContribs[key]);
            break;

          case 'SHOWDOWN':
            const showdownStep = step as any;
            currentStreet = 'showdown';
            description = showdownStep.description;
            break;
        }

        // Calcular o pot total simples: soma de todas as contribuições
        const totalPotValue = Object.values(totalContribs).reduce((sum, contrib) => sum + contrib, 0);

        // Calcular side-pots
        const pots = this.calculateSidePots(totalContribs, folded);

        // Detectar all-in situation com cartas expostas (using normalized keys)
        const activePlayers = handHistory.players.filter(p => !folded.has(normalizeKey(p.name)));

        // Verificar se há condições para revelar cartas após all-in
        // Heads-up reveal rule: quando há all-in e apenas 2 jogadores ativos
        if (step.type === 'ACTION' && (step as any).action === 'all-in') {
          const remainingActivePlayers = activePlayers.length;

          // Debug para entender o estado
          console.log(`🎯 ALL-IN DEBUG: ${(step as any).player} all-in, ${remainingActivePlayers} jogadores ativos:`,
            activePlayers.map(p => p.name));

          // Revelar cartas se restam apenas 2 jogadores ativos (heads-up rule)
          if (remainingActivePlayers === 2) {
            console.log(`✅ REVELANDO CARTAS: All-in com 2 jogadores`);

            // Adicionar cartas reveladas para todos os jogadores ativos
            activePlayers.forEach(activePlayer => {
              const key = normalizeKey(activePlayer.name);
              if (activePlayer.cards) {
                revealedCards[key] = activePlayer.cards;
                console.log(`🃏 REVELANDO: ${activePlayer.name} cartas:`, activePlayer.cards);
              }
            });
          }
        }

        const snapshot: Snapshot = {
          id: index + 1, // +1 porque temos o snapshot inicial
          street: currentStreet,
          actionIndex: index,
          description,
          pots: pots,
          collectedPot: 0, // DEPRECATED
          pendingContribs: { ...pendingContribs },
          totalDisplayedPot: totalPotValue, // Simplesmente a soma de todas as contribuições
          playerStacks: { ...currentStacks },
          playersOrder: handHistory.players.map(p => p.name),
          folded: new Set(folded),
          activePlayer,
          communityCards: [...communityCards],
          revealedHands: (currentStreet === 'showdown' || Object.keys(revealedCards).length > 0) ? {
            // Cartas do showdown ou cartas reveladas durante all-in
            ...(currentStreet === 'showdown' ? handHistory.players.reduce((acc, p) => {
              if (!folded.has(p.name)) {
                acc[p.name] = p.cards || null;
              }
              return acc;
            }, {} as Record<string, any>) : {}),
            // Cartas reveladas durante a mão (all-in)
            ...revealedCards
          } : undefined,
          winners: currentStreet === 'showdown' ? handHistory.showdown?.winners : undefined,

          // Campos adicionados para tracking preciso
          totalCommitted: { ...totalContribs },
          payouts: currentStreet === 'showdown' ? this.calculatePayouts(handHistory, totalContribs) : undefined,
          playerStacksPostShowdown: currentStreet === 'showdown' ? this.calculateFinalStacks(handHistory, totalContribs) : undefined,
          isAllIn: { ...isAllIn }
        };

        snapshots.push(snapshot);
      });

      console.log(`✅ SnapshotBuilder: Generated ${snapshots.length} snapshots`);
      return snapshots;

    } catch (error) {
      console.error('Error in SnapshotBuilder:', error);
      return [];
    }
  }

  /**
   * Detecta se as cartas devem ser reveladas após um all-in
   * Regra: quando há all-in e apenas 2 jogadores ativos restantes
   */
  private static shouldRevealCardsAfterAllIn(
    step: any,
    activePlayers: any[],
    currentStacks: Record<string, number>
  ): boolean {
    // Só aplicar se for uma ação de all-in
    if (step.type !== 'ACTION' || !step.action || step.action.action !== 'all-in') {
      return false;
    }

    // Deve haver exatamente 2 jogadores ativos
    if (activePlayers.length !== 2) {
      return false;
    }

    // Pelo menos um deve estar all-in (stack = 0)
    const playersAllIn = activePlayers.filter(p => currentStacks[p.name] === 0);

    console.log(`🎯 ALL-IN CHECK: ${activePlayers.length} ativos, ${playersAllIn.length} all-in, stacks:`,
      activePlayers.map(p => `${p.name}:${currentStacks[p.name]}`));

    return playersAllIn.length >= 1;
  }

  /**
   * Calculate payouts deterministically using side pots
   */
  private static calculatePayouts(handHistory: HandHistory, totalCommitted: Record<string, number>): Record<string, number> {
    const payouts: Record<string, number> = {};

    if (!handHistory.showdown?.winners) {
      return payouts;
    }

    // Use side pot calculation for deterministic payouts
    const pots = this.computeSidePots(totalCommitted);
    const winners = handHistory.showdown.winners.map(w => normalizeKey(w));

    // Distribute each pot among eligible winners
    pots.forEach(pot => {
      const eligibleWinners = pot.eligible.filter(player => winners.includes(normalizeKey(player)));

      if (eligibleWinners.length > 0) {
        const perWinner = pot.amount / eligibleWinners.length;
        eligibleWinners.forEach(winner => {
          const key = normalizeKey(winner);
          payouts[key] = (payouts[key] || 0) + perWinner;
        });
      }
    });

    return payouts;
  }

  /**
   * Calculate final stacks after showdown with reconciliation
   */
  private static calculateFinalStacks(handHistory: HandHistory, totalCommitted: Record<string, number>): Record<string, number> {
    const finalStacks: Record<string, number> = {};
    const payouts = this.calculatePayouts(handHistory, totalCommitted);

    handHistory.players.forEach(player => {
      const key = normalizeKey(player.name);
      const initialStack = player.stack;
      const committed = totalCommitted[key] || 0;
      const payout = payouts[key] || 0;

      const expectedFinal = initialStack - committed + payout;
      finalStacks[key] = expectedFinal;

      // Log for reconciliation (if there's a mismatch, we prefer expectedFinal)
      console.log(`🧮 Final stack calc for ${key}: ${initialStack} - ${committed} + ${payout} = ${expectedFinal}`);
    });

    return finalStacks;
  }
}

// Re-exporta para manter compatibilidade
export { ReplayBuilder };