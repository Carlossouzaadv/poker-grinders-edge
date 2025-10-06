import React from 'react';
import { HandHistory, Snapshot, Street } from '@/types/poker';
import { CurrencyUtils } from '@/utils/currency-utils';

interface ActionLogProps {
  handHistory: HandHistory;
  currentSnapshot: Snapshot;
}

const ActionLog: React.FC<ActionLogProps> = ({ handHistory, currentSnapshot }) => {
  // Collect all actions up to current snapshot
  const collectActions = () => {
    const actions: { street: Street; description: string; isCurrentAction: boolean; index: number }[] = [];
    let actionCounter = 0;

    // Helper to add action
    const addAction = (street: Street, description: string, isCurrent: boolean = false) => {
      actions.push({ street, description, isCurrentAction: isCurrent, index: actionCounter++ });
    };

    // Add antes if they exist
    if (handHistory.antes && handHistory.antes.length > 0) {
      handHistory.antes.forEach(ante => {
        const desc = `${ante.player} posts ante ${CurrencyUtils.formatCurrency(ante.amount || 0)}`;
        const isCurrent = currentSnapshot.street === 'preflop' &&
                          currentSnapshot.actionIndex === actionCounter;
        addAction('preflop', desc, isCurrent);
      });
    }

    // Add blinds from preflop
    const sbAction = handHistory.preflop.find(a => a.action === 'small_blind');
    const bbAction = handHistory.preflop.find(a => a.action === 'big_blind');

    if (sbAction) {
      const desc = `${sbAction.player} posts SB ${CurrencyUtils.formatCurrency(sbAction.amount || 0)}`;
      const isCurrent = currentSnapshot.street === 'preflop' &&
                        currentSnapshot.actionIndex === actionCounter;
      addAction('preflop', desc, isCurrent);
    }

    if (bbAction) {
      const desc = `${bbAction.player} posts BB ${CurrencyUtils.formatCurrency(bbAction.amount || 0)}`;
      const isCurrent = currentSnapshot.street === 'preflop' &&
                        currentSnapshot.actionIndex === actionCounter;
      addAction('preflop', desc, isCurrent);
    }

    // Add preflop actions (excluding blinds/antes)
    handHistory.preflop
      .filter(a => a.action !== 'small_blind' && a.action !== 'big_blind' && a.action !== 'ante')
      .forEach(action => {
        let desc = `${action.player} ${action.action}s`;
        if (action.amount !== undefined && action.amount > 0) {
          desc += ` ${CurrencyUtils.formatCurrency(action.amount)}`;
        }
        const isCurrent = currentSnapshot.street === 'preflop' &&
                          currentSnapshot.actionIndex === actionCounter;
        addAction('preflop', desc, isCurrent);
      });

    // Add flop actions
    if (handHistory.flop.cards.length > 0) {
      addAction('flop', `*** FLOP *** [${handHistory.flop.cards.map(c => `${c.rank}${c.suit}`).join(' ')}]`);

      handHistory.flop.actions.forEach(action => {
        let desc = `${action.player} ${action.action}s`;
        if (action.amount !== undefined && action.amount > 0) {
          desc += ` ${CurrencyUtils.formatCurrency(action.amount)}`;
        }
        const isCurrent = currentSnapshot.street === 'flop' &&
                          currentSnapshot.actionIndex === actionCounter;
        addAction('flop', desc, isCurrent);
      });
    }

    // Add turn actions
    if (handHistory.turn.card) {
      addAction('turn', `*** TURN *** [${handHistory.turn.card.rank}${handHistory.turn.card.suit}]`);

      handHistory.turn.actions.forEach(action => {
        let desc = `${action.player} ${action.action}s`;
        if (action.amount !== undefined && action.amount > 0) {
          desc += ` ${CurrencyUtils.formatCurrency(action.amount)}`;
        }
        const isCurrent = currentSnapshot.street === 'turn' &&
                          currentSnapshot.actionIndex === actionCounter;
        addAction('turn', desc, isCurrent);
      });
    }

    // Add river actions
    if (handHistory.river.card) {
      addAction('river', `*** RIVER *** [${handHistory.river.card.rank}${handHistory.river.card.suit}]`);

      handHistory.river.actions.forEach(action => {
        let desc = `${action.player} ${action.action}s`;
        if (action.amount !== undefined && action.amount > 0) {
          desc += ` ${CurrencyUtils.formatCurrency(action.amount)}`;
        }
        const isCurrent = currentSnapshot.street === 'river' &&
                          currentSnapshot.actionIndex === actionCounter;
        addAction('river', desc, isCurrent);
      });
    }

    // Add showdown
    if (handHistory.showdown) {
      addAction('showdown', `*** SHOWDOWN ***`);
      addAction('showdown', handHistory.showdown.info);
    }

    // Only return actions up to current snapshot index
    return actions.filter(a => a.index <= currentSnapshot.actionIndex);
  };

  const actions = collectActions();

  // Group actions by street
  const groupedByStreet = actions.reduce((acc, action) => {
    if (!acc[action.street]) {
      acc[action.street] = [];
    }
    acc[action.street].push(action);
    return acc;
  }, {} as Record<Street, typeof actions>);

  const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];

  return (
    <div className="bg-gray-900/90 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 shadow-xl h-full overflow-y-auto">
      <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
        <span className="text-lg">📋</span>
        Action Log
      </h3>

      <div className="space-y-4">
        {streetOrder.map(street => {
          const streetActions = groupedByStreet[street];
          if (!streetActions || streetActions.length === 0) return null;

          return (
            <div key={street} className="space-y-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                {street}
              </div>
              {streetActions.map((action, index) => (
                <div
                  key={`${street}-${index}`}
                  className={`text-xs px-2 py-1.5 rounded transition-all ${
                    action.isCurrentAction
                      ? 'bg-yellow-500/20 border-l-2 border-yellow-400 text-yellow-200 font-semibold'
                      : action.description.startsWith('***')
                      ? 'text-blue-300 font-medium italic'
                      : 'text-gray-300'
                  }`}
                >
                  {action.description}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionLog;
