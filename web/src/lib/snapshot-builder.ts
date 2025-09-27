// Compatibilidade para o sistema existente - converte ReplayState em Snapshots
import { ReplayBuilder } from './replay-builder';
import { HandHistory, Snapshot, Pot } from '@/types/poker';
import { ReplayState, ReplayStep } from '@/types/replay';

export class SnapshotBuilder {
  // Algoritmo de cálculo de side-pots
  private static calculateSidePots(
    playerContributions: Record<string, number>,
    foldedPlayers: Set<string>
  ): Pot[] {
    // Filtra jogadores que ainda estão na mão (não foldaram)
    const activePlayers = Object.keys(playerContributions).filter(
      player => !foldedPlayers.has(player)
    );

    if (activePlayers.length === 0) {
      return [{ value: 0, eligiblePlayers: [], isPotSide: false }];
    }

    // Ordena jogadores por contribuição (menor para maior)
    const sortedContribs = activePlayers
      .map(player => ({ player, contribution: playerContributions[player] || 0 }))
      .sort((a, b) => a.contribution - b.contribution);

    const pots: Pot[] = [];
    let remainingPlayers = [...activePlayers];
    let lastLevel = 0;

    for (let i = 0; i < sortedContribs.length; i++) {
      const currentLevel = sortedContribs[i].contribution;
      const increment = currentLevel - lastLevel;

      if (increment > 0 && remainingPlayers.length > 0) {
        const potValue = increment * remainingPlayers.length;
        pots.push({
          value: potValue,
          eligiblePlayers: [...remainingPlayers],
          isPotSide: pots.length > 0
        });
      }

      // Remove jogadores que estão all-in (contribuição igual ao level atual)
      remainingPlayers = remainingPlayers.filter(player =>
        (playerContributions[player] || 0) > currentLevel
      );

      lastLevel = currentLevel;
    }

    // Se não há potes, cria um pote vazio
    if (pots.length === 0) {
      pots.push({
        value: 0,
        eligiblePlayers: activePlayers,
        isPotSide: false
      });
    }

    return pots;
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

      // Ajustar stacks iniciais subtraindo antes e blinds já colocados na mesa
      let currentStacks = { ...replayState.currentStacks };
      handHistory.players.forEach(player => {
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
        currentStacks[player.name] = Math.max(0, adjustedStack);
      });

      let communityCards: any[] = [];
      let currentStreet: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' = 'preflop';
      let folded = new Set<string>();
      let pendingContribs: Record<string, number> = {};
      let totalContribs: Record<string, number> = {};
      let revealedCards: Record<string, any> = {}; // Cartas reveladas durante a mão

      // Inicializar contribuições totais com antes, blinds
      handHistory.players.forEach(player => {
        totalContribs[player.name] = 0;

        // Adicionar antes se houver
        if (handHistory.ante && handHistory.ante > 0) {
          totalContribs[player.name] += handHistory.ante;
        }

        // Adicionar as blinds às contribuições iniciais
        if (player.position === 'SB') {
          totalContribs[player.name] += handHistory.smallBlind;
        } else if (player.position === 'BB') {
          totalContribs[player.name] += handHistory.bigBlind;
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

            // IMPORTANTE: Não sobrescrever currentStacks com stacksAfter do replay-builder
            // pois ele não considera antes/blinds já deduzidos
            // Apenas atualizar o stack do jogador que agiu
            if (actionStep.action === 'all-in') {
              // Para all-in, o stack deve ir para 0
              currentStacks[actionStep.player] = 0;
            } else if (actionStep.amount && actionStep.amount > 0) {
              currentStacks[actionStep.player] = Math.max(0,
                (currentStacks[actionStep.player] || 0) - actionStep.amount
              );
            }

            // Debug da action
            console.log(`📝 ACTION: ${actionStep.player} ${actionStep.action} ${actionStep.amount || 0}`);

            // Calcular pending contributions e contribuições totais
            if (actionStep.action === 'fold') {
              folded.add(actionStep.player);
            } else if (actionStep.action === 'uncalled_return') {
              // For uncalled bets, remove from total contributions (money returned to player)
              if (actionStep.amount) {
                totalContribs[actionStep.player] = (totalContribs[actionStep.player] || 0) - actionStep.amount;
              }
            } else if (actionStep.amount && actionStep.amount > 0) {
              pendingContribs[actionStep.player] = (pendingContribs[actionStep.player] || 0) + actionStep.amount;
              totalContribs[actionStep.player] = (totalContribs[actionStep.player] || 0) + actionStep.amount;
            }
            break;

          case 'STREET':
            const streetStep = step as any;
            currentStreet = streetStep.street;
            description = streetStep.description;
            communityCards = [...streetStep.cards];
            // Reset pending contributions at start of new street
            pendingContribs = {};
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

        // Detectar all-in situation com cartas expostas
        const activePlayers = handHistory.players.filter(p => !folded.has(p.name));

        // Verificar se há condições para revelar cartas após all-in
        let shouldRevealCards = false;

        // Detectar situação de all-in com 2 jogadores
        if (step.type === 'ACTION' && (step as any).action === 'all-in') {
          const remainingActivePlayers = activePlayers.length;

          // Debug para entender o estado
          console.log(`🎯 ALL-IN DEBUG: ${(step as any).player} all-in, ${remainingActivePlayers} jogadores ativos:`,
            activePlayers.map(p => p.name));

          // Revelar cartas se restam apenas 2 jogadores ativos
          if (remainingActivePlayers === 2) {
            shouldRevealCards = true;
            console.log(`✅ REVELANDO CARTAS: All-in com 2 jogadores`);

            // Adicionar cartas reveladas para todos os jogadores ativos
            activePlayers.forEach(activePlayer => {
              const playerData = handHistory.players.find(p => p.name === activePlayer.name);
              if (playerData && playerData.cards) {
                revealedCards[activePlayer.name] = playerData.cards;
                console.log(`🃏 REVELANDO: ${activePlayer.name} cartas:`, playerData.cards);
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
          playerStacksPostShowdown: currentStreet === 'showdown' ? this.calculateFinalStacks(handHistory, totalContribs) : undefined
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
   * Calcula payouts por jogador no showdown
   */
  private static calculatePayouts(handHistory: HandHistory, totalCommitted: Record<string, number>): Record<string, number> {
    const payouts: Record<string, number> = {};

    if (!handHistory.showdown?.winners) {
      return payouts;
    }

    // Se há apenas um vencedor, ele ganha o pot todo
    if (handHistory.showdown.winners.length === 1) {
      const winner = handHistory.showdown.winners[0];
      payouts[winner] = handHistory.showdown.potWon || 0;
    } else {
      // Multiple winners - split pot equally
      const totalPot = handHistory.showdown.potWon || 0;
      const perWinner = totalPot / handHistory.showdown.winners.length;
      handHistory.showdown.winners.forEach(winner => {
        payouts[winner] = perWinner;
      });
    }

    return payouts;
  }

  /**
   * Calcula stacks finais após showdown
   */
  private static calculateFinalStacks(handHistory: HandHistory, totalCommitted: Record<string, number>): Record<string, number> {
    const finalStacks: Record<string, number> = {};
    const payouts = this.calculatePayouts(handHistory, totalCommitted);

    handHistory.players.forEach(player => {
      const initialStack = player.stack;
      const committed = totalCommitted[player.name] || 0;
      const payout = payouts[player.name] || 0;

      finalStacks[player.name] = initialStack - committed + payout;
    });

    return finalStacks;
  }
}

// Re-exporta para manter compatibilidade
export { ReplayBuilder };