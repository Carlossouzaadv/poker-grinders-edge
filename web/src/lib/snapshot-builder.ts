// Compatibilidade para o sistema existente - converte ReplayState em Snapshots
import { ReplayBuilder } from './replay-builder';
import { HandHistory, Snapshot } from '@/types/poker';
import { ReplayState, ReplayStep } from '@/types/replay';

export class SnapshotBuilder {
  static buildSnapshots(handHistory: HandHistory): Snapshot[] {
    try {
      const replayState = ReplayBuilder.buildReplayFromHand(handHistory);

      if (!replayState || !replayState.steps) {
        console.warn('ReplayState is empty or has no steps');
        return [];
      }

      // Converter ReplayState steps em Snapshots
      const snapshots: Snapshot[] = [];
      let currentPot = 0;
      let currentStacks = { ...replayState.currentStacks };
      let communityCards: any[] = [];
      let currentStreet: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' = 'preflop';
      let folded = new Set<string>();
      let pendingContribs: Record<string, number> = {};

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

            // Calcular pending contributions baseado na ação
            if (actionStep.action === 'fold') {
              folded.add(actionStep.player);
            } else if (actionStep.amount && actionStep.amount > 0) {
              pendingContribs[actionStep.player] = (pendingContribs[actionStep.player] || 0) + actionStep.amount;
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

        const snapshot: Snapshot = {
          id: index,
          street: currentStreet,
          actionIndex: index,
          description,
          collectedPot: Math.max(0, currentPot - Object.values(pendingContribs).reduce((a, b) => a + b, 0)),
          pendingContribs: { ...pendingContribs },
          totalDisplayedPot: currentPot,
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