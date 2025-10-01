import { HandHistory } from '@/types/poker';
import { ReplayStep, ActionStep, StreetStep, ShowdownStep, ReplayState } from '@/types/replay';

export class ReplayBuilder {
  /**
   * Format value based on game context
   */
  private static formatValue(amount: number, isTournament: boolean): string {
    if (isTournament) {
      // Tournament: show as integer chips without $ sign
      return Math.round(amount).toString();
    } else {
      // Cash game: show as dollars with $ sign and 2 decimal places
      return `$${amount.toFixed(2)}`;
    }
  }

  /**
   * Generate action description based on game context
   */
  private static getActionDescription(action: any, isTournament: boolean): string {
    switch (action.action) {
      case 'fold':
        return `${action.player} folds`;
      case 'call':
        return action.amount ? `${action.player} calls ${this.formatValue(action.amount, isTournament)}` : `${action.player} calls`;
      case 'bet':
        return action.amount ? `${action.player} bets ${this.formatValue(action.amount, isTournament)}` : `${action.player} bets`;
      case 'raise':
        if (action.amount) {
          const totalBet = action.totalBet || action.amount;
          const raiseBy = action.raiseBy || action.amount;
          return `${action.player} raises ${this.formatValue(raiseBy, isTournament)} to ${this.formatValue(totalBet, isTournament)}`;
        }
        return `${action.player} raises`;
      case 'check':
        return `${action.player} checks`;
      case 'all-in':
        return action.amount ? `${action.player} goes all-in for ${this.formatValue(action.amount, isTournament)}` : `${action.player} goes all-in`;
      case 'uncalled_return':
        if (action.amount) {
          const valueStr = isTournament ? this.formatValue(action.amount, isTournament) : `(${this.formatValue(action.amount, isTournament)})`;
          return `Uncalled bet ${valueStr} returned to ${action.player}`;
        }
        return `Uncalled bet returned to ${action.player}`;
      default:
        return `${action.player} ${action.action}`;
    }
  }

  static buildReplayFromHand(handHistory: HandHistory): ReplayState {
    const steps: ReplayStep[] = [];
    let stepId = 0;

    // Validate handHistory
    if (!handHistory || !handHistory.players || !Array.isArray(handHistory.players)) {
      throw new Error('HandHistory inválido: players não encontrado');
    }

    // Check if it's a tournament for proper formatting
    const isTournament = handHistory.gameContext?.isTournament || false;

    // Stacks iniciais dos jogadores
    const initialStacks: Record<string, number> = {};
    handHistory.players.forEach(player => {
      initialStacks[player.name] = player.stack;
    });

    let currentStacks = { ...initialStacks };

    // Calculate initial pot including antes
    const totalAntes = handHistory.antes ?
      handHistory.antes.filter(a => a.action === 'ante').reduce((sum, ante) => sum + (ante.amount || 0), 0) : 0;
    let currentPot = handHistory.smallBlind + handHistory.bigBlind + totalAntes;

    // Processar ações do preflop
    for (const action of handHistory.preflop) {
      let potAfter = currentPot;
      let stacksAfter = { ...currentStacks };
      let description = '';

      // Generate description using helper function
      description = this.getActionDescription(action, isTournament);

      // Update pot and stacks based on action
      switch (action.action) {
        case 'call':
        case 'bet':
        case 'raise':
          if (action.amount) {
            potAfter += action.amount;
            stacksAfter[action.player] -= action.amount;
          }
          break;
        case 'all-in':
          if (action.amount) {
            potAfter += action.amount;
            stacksAfter[action.player] = 0;
          }
          break;
        case 'uncalled_return':
          if (action.amount) {
            // Uncalled bet is returned to player - subtract from pot, add to stack
            potAfter -= action.amount;
            stacksAfter[action.player] += action.amount;
          }
          break;
      }

      const actionStep: ActionStep = {
        id: stepId++,
        type: 'ACTION',
        timestamp: Date.now() + stepId * 1000,
        player: action.player,
        action: action.action,
        amount: action.amount,
        description,
        potAfter,
        stacksAfter
      };

      steps.push(actionStep);

      // Update state for next action
      currentPot = potAfter;
      currentStacks = stacksAfter;
    }

    // Processar flop (se existir)
    if (handHistory.flop) {
      const streetStep: StreetStep = {
        id: stepId++,
        type: 'STREET',
        timestamp: Date.now() + stepId * 1000,
        street: 'flop',
        cards: handHistory.flop.cards,
        description: `Flop: ${handHistory.flop.cards.map(c => `${c.rank}${c.suit}`).join(' ')}`,
        potBefore: currentPot
      };
      steps.push(streetStep);

      // Processar ações do flop
      for (const action of handHistory.flop.actions) {
        const actionStep = this.createActionStep(action, stepId++, currentPot, currentStacks, isTournament);
        steps.push(actionStep);
        currentPot = actionStep.potAfter;
        currentStacks = actionStep.stacksAfter;
      }
    }

    // Processar turn (se existir)
    if (handHistory.turn) {
      const streetStep: StreetStep = {
        id: stepId++,
        type: 'STREET',
        timestamp: Date.now() + stepId * 1000,
        street: 'turn',
        cards: [handHistory.turn.card],
        description: `Turn: ${handHistory.turn.card.rank}${handHistory.turn.card.suit}`,
        potBefore: currentPot
      };
      steps.push(streetStep);

      // Processar ações do turn
      for (const action of handHistory.turn.actions) {
        const actionStep = this.createActionStep(action, stepId++, currentPot, currentStacks, isTournament);
        steps.push(actionStep);
        currentPot = actionStep.potAfter;
        currentStacks = actionStep.stacksAfter;
      }
    }

    // Processar river (se existir)
    if (handHistory.river) {
      const streetStep: StreetStep = {
        id: stepId++,
        type: 'STREET',
        timestamp: Date.now() + stepId * 1000,
        street: 'river',
        cards: [handHistory.river.card],
        description: `River: ${handHistory.river.card.rank}${handHistory.river.card.suit}`,
        potBefore: currentPot
      };
      steps.push(streetStep);

      // Processar ações do river
      for (const action of handHistory.river.actions) {
        const actionStep = this.createActionStep(action, stepId++, currentPot, currentStacks, isTournament);
        steps.push(actionStep);
        currentPot = actionStep.potAfter;
        currentStacks = actionStep.stacksAfter;
      }
    }

    // Processar showdown (se existir)
    if (handHistory.showdown) {
      const showdownStep = {
        id: stepId++,
        type: 'SHOWDOWN' as const,
        timestamp: Date.now() + stepId * 1000,
        description: 'Showdown - Revealing hands',
        showdownInfo: handHistory.showdown.info,
        winners: handHistory.showdown.winners,
        potWon: handHistory.showdown.potWon
      };
      steps.push(showdownStep);

      console.log('🎯 ReplayBuilder: Showdown step adicionado:', showdownStep);
    }

    // Construir bookmarks das streets para navegação direta
    const streetBookmarks = this.buildStreetBookmarks(steps);

    // Construir estado inicial
    const replayState: ReplayState = {
      currentStep: -1, // Começa antes do primeiro step
      totalSteps: steps.length,
      isPlaying: false,
      playbackSpeed: 1500,
      steps,
      streetBookmarks,

      // Estado derivado inicial
      currentStreet: 'preflop',
      currentPot: handHistory.smallBlind + handHistory.bigBlind + totalAntes,
      currentStacks: initialStacks,
      activePlayer: null,
      communityCards: [],
      foldedPlayers: new Set()
    };

    return replayState;
  }

  static getStateAtStep(replayState: ReplayState, stepIndex: number): ReplayState {
    if (stepIndex < 0 || stepIndex >= replayState.totalSteps) {
      return replayState;
    }

    const step = replayState.steps[stepIndex];
    const newState = { ...replayState, currentStep: stepIndex };

    switch (step.type) {
      case 'ACTION':
        const actionStep = step as ActionStep;
        newState.currentPot = actionStep.potAfter;
        newState.currentStacks = { ...actionStep.stacksAfter };

        // Determinar próximo jogador ativo
        if (stepIndex + 1 < replayState.totalSteps) {
          const nextStep = replayState.steps[stepIndex + 1];
          if (nextStep.type === 'ACTION') {
            newState.activePlayer = (nextStep as ActionStep).player;
          }
        } else {
          newState.activePlayer = null;
        }

        // Atualizar foldedPlayers
        if (actionStep.action === 'fold') {
          newState.foldedPlayers = new Set(replayState.foldedPlayers);
          newState.foldedPlayers.add(actionStep.player);
        }
        break;

      case 'STREET':
        const streetStep = step as StreetStep;
        newState.currentStreet = streetStep.street;
        newState.communityCards = [...streetStep.cards];
        newState.activePlayer = null; // Reset para nova street
        break;

      case 'SHOWDOWN':
        newState.currentStreet = 'showdown';
        newState.activePlayer = null;
        // Atualizar o pot com o valor ganho do showdown
        const showdownStep = step as ShowdownStep;
        if (showdownStep.potWon) {
          newState.currentPot = showdownStep.potWon;
        }
        break;
    }

    return newState;
  }

  static canGoNext(replayState: ReplayState): boolean {
    return replayState.currentStep < replayState.totalSteps - 1;
  }

  static canGoPrevious(replayState: ReplayState): boolean {
    return replayState.currentStep > -1;
  }

  static getCurrentDescription(replayState: ReplayState): string {
    if (replayState.currentStep < 0) {
      return "Início da mão";
    }
    if (replayState.currentStep >= replayState.totalSteps) {
      return "Fim da mão";
    }

    const step = replayState.steps[replayState.currentStep];
    return step.description;
  }

  private static createActionStep(
    action: any,
    stepId: number,
    currentPot: number,
    currentStacks: Record<string, number>,
    isTournament: boolean = false
  ): ActionStep {
    let potAfter = currentPot;
    let stacksAfter = { ...currentStacks };

    // Generate description using helper function
    const description = this.getActionDescription(action, isTournament);

    // Update pot and stacks based on action
    switch (action.action) {
      case 'call':
      case 'bet':
      case 'raise':
        if (action.amount) {
          potAfter += action.amount;
          stacksAfter[action.player] -= action.amount;
        }
        break;
      case 'all-in':
        if (action.amount) {
          potAfter += action.amount;
          stacksAfter[action.player] = 0;
        }
        break;
      case 'uncalled_return':
        if (action.amount) {
          // Uncalled bet is returned to player - subtract from pot, add to stack
          potAfter -= action.amount;
          stacksAfter[action.player] += action.amount;
        }
        break;
    }

    return {
      id: stepId,
      type: 'ACTION',
      timestamp: Date.now() + stepId * 1000,
      player: action.player,
      action: action.action,
      amount: action.amount,
      description,
      potAfter,
      stacksAfter
    };
  }

  static buildStreetBookmarks(steps: ReplayStep[]): Record<string, number> {
    const bookmarks: Record<string, number> = {
      preflop: 0 // Preflop sempre começa no índice 0
    };

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.type === 'STREET') {
        const streetStep = step as StreetStep;
        bookmarks[streetStep.street] = i;
        console.log(`🔖 Bookmark criado: ${streetStep.street} -> índice ${i}`);
      }
    }

    console.log('🔖 Street bookmarks completos:', bookmarks);
    return bookmarks;
  }

  static jumpToStreet(replayState: ReplayState, street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'): ReplayState {
    if (!replayState.streetBookmarks) {
      console.warn('⚠️ Street bookmarks não disponíveis');
      return replayState;
    }

    let targetIndex: number;

    if (street === 'preflop') {
      targetIndex = 0; // Primeira ação do preflop
    } else if (street === 'showdown') {
      // Procurar o step de showdown
      const showdownStep = replayState.steps.findIndex(step => step.type === 'SHOWDOWN');
      targetIndex = showdownStep !== -1 ? showdownStep : replayState.totalSteps - 1;
    } else {
      const bookmarkIndex = replayState.streetBookmarks[street];
      if (bookmarkIndex === undefined) {
        console.warn(`⚠️ Street '${street}' não encontrada nos bookmarks`);
        return replayState;
      }
      targetIndex = bookmarkIndex;
    }

    console.log(`🎯 Saltando para street '${street}' no índice ${targetIndex}`);
    return this.getStateAtStep(replayState, targetIndex);
  }
}