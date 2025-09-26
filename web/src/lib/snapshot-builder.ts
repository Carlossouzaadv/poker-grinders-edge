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

      let currentStacks = { ...replayState.currentStacks };
      let communityCards: any[] = [];
      let currentStreet: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' = 'preflop';
      let folded = new Set<string>();
      let pendingContribs: Record<string, number> = {};
      let totalContribs: Record<string, number> = {};

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
        pendingContribs: {},
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
            currentStacks = { ...actionStep.stacksAfter };

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
          revealedHands: currentStreet === 'showdown' ? handHistory.players.reduce((acc, p) => {
            acc[p.name] = p.cards || null;
            return acc;
          }, {} as Record<string, any>) : undefined,
          winners: currentStreet === 'showdown' ? handHistory.showdown?.winners : undefined
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
}

// Re-exporta para manter compatibilidade
export { ReplayBuilder };