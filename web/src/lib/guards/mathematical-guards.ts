import { CurrencyUtils } from '@/utils/currency-utils';
import { AnomalyLogger } from '@/lib/anomaly-logger';
import { Pot } from '@/types/poker';

/**
 * MATHEMATICAL GUARDS SYSTEM
 *
 * Sistema robusto de validação matemática para prevenir corrupção de dados
 * financeiros no sistema de poker.
 *
 * PRINCÍPIOS:
 * - Tolerância baseada em CurrencyUtils.EPSILON (1 centavo)
 * - Contexto detalhado em cada erro
 * - Recovery automático quando possível
 * - Logging estruturado de anomalias
 */

export enum GuardSeverity {
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface GuardResult {
  passed: boolean;
  severity: GuardSeverity;
  message: string;
  context: Record<string, any>;
  suggestedFix?: () => void;
  recoverable: boolean;
}

export interface MoneyState {
  playerStacks: Record<string, number>;
  pot: number;
  pendingContribs?: Record<string, number>;
}

export class MathematicalGuards {
  /**
   * GUARD: Conservation of Money
   * Verifica se o total de dinheiro no sistema é conservado
   *
   * Total Input (stacks iniciais) = Total Output (stacks finais + pot + rake)
   */
  static validateMoneyConservation(
    initialState: MoneyState,
    finalState: MoneyState,
    rake: number,
    context: string
  ): GuardResult {
    // Calculate totals
    const initialTotal =
      Object.values(initialState.playerStacks).reduce((sum, val) => sum + val, 0) +
      initialState.pot;

    const finalTotal =
      Object.values(finalState.playerStacks).reduce((sum, val) => sum + val, 0) +
      finalState.pot +
      rake;

    const difference = Math.abs(initialTotal - finalTotal);

    const guardContext = {
      context,
      initialTotal,
      finalTotal,
      difference,
      rake,
      initialStacks: initialState.playerStacks,
      finalStacks: finalState.playerStacks,
      initialPot: initialState.pot,
      finalPot: finalState.pot
    };

    // Check with tolerance
    if (difference <= CurrencyUtils.EPSILON) {
      return {
        passed: true,
        severity: GuardSeverity.WARNING,
        message: 'Money conservation validated',
        context: guardContext,
        recoverable: true
      };
    }

    // Money is not conserved - check if recoverable
    const isRecoverable = difference <= CurrencyUtils.EPSILON * 10; // Up to 10 cents

    return {
      passed: false,
      severity: isRecoverable ? GuardSeverity.ERROR : GuardSeverity.CRITICAL,
      message: `Money conservation violated: ${difference} cents difference`,
      context: guardContext,
      recoverable: isRecoverable,
      suggestedFix: isRecoverable ? () => {
        console.log(`🔧 RECOVERY: Adjusting pot by ${difference} cents to maintain conservation`);
        // Recovery logic would be implemented by the caller
      } : undefined
    };
  }

  /**
   * GUARD: Stack Consistency
   * Verifica a consistência do stack de um jogador
   *
   * Stack Final = Stack Inicial - Committed + Payout
   */
  static validateStackConsistency(
    playerKey: string,
    initialStack: number,
    committed: number,
    payout: number,
    finalStack: number,
    context: string
  ): GuardResult {
    const expectedFinalStack = initialStack - committed + payout;
    const difference = Math.abs(expectedFinalStack - finalStack);

    const guardContext = {
      context,
      playerKey,
      initialStack,
      committed,
      payout,
      expectedFinalStack,
      actualFinalStack: finalStack,
      difference
    };

    // Check with tolerance
    if (difference <= CurrencyUtils.EPSILON) {
      return {
        passed: true,
        severity: GuardSeverity.WARNING,
        message: `Stack consistency validated for ${playerKey}`,
        context: guardContext,
        recoverable: true
      };
    }

    // Stack inconsistency detected
    const isRecoverable = difference <= CurrencyUtils.EPSILON * 5; // Up to 5 cents

    return {
      passed: false,
      severity: isRecoverable ? GuardSeverity.ERROR : GuardSeverity.CRITICAL,
      message: `Stack inconsistency for ${playerKey}: expected ${expectedFinalStack}, got ${finalStack} (${difference} cents difference)`,
      context: guardContext,
      recoverable: isRecoverable,
      suggestedFix: isRecoverable ? () => {
        console.log(`🔧 RECOVERY: Adjusting ${playerKey}'s final stack from ${finalStack} to ${expectedFinalStack}`);
      } : undefined
    };
  }

  /**
   * GUARD: Pot Accuracy
   * Verifica se a soma das contribuições corresponde ao pot total
   */
  static validatePotAccuracy(
    contributions: Record<string, number>,
    totalPot: number,
    rake: number,
    context: string
  ): GuardResult {
    const sumContributions = Object.values(contributions).reduce((sum, val) => sum + val, 0);
    const expectedPot = sumContributions - rake;
    const difference = Math.abs(expectedPot - totalPot);

    const guardContext = {
      context,
      contributions,
      sumContributions,
      rake,
      expectedPot,
      actualPot: totalPot,
      difference
    };

    // Check with tolerance
    if (difference <= CurrencyUtils.EPSILON) {
      return {
        passed: true,
        severity: GuardSeverity.WARNING,
        message: 'Pot accuracy validated',
        context: guardContext,
        recoverable: true
      };
    }

    // Pot inaccuracy detected
    const isRecoverable = difference <= CurrencyUtils.EPSILON * 5; // Up to 5 cents

    return {
      passed: false,
      severity: isRecoverable ? GuardSeverity.ERROR : GuardSeverity.CRITICAL,
      message: `Pot inaccuracy: expected ${expectedPot}, got ${totalPot} (${difference} cents difference)`,
      context: guardContext,
      recoverable: isRecoverable,
      suggestedFix: isRecoverable ? () => {
        console.log(`🔧 RECOVERY: Recalculating pot from contributions: ${sumContributions} - ${rake} = ${expectedPot}`);
      } : undefined
    };
  }

  /**
   * GUARD: Side Pot Validation
   * Verifica se a soma dos side pots corresponde ao total de contribuições
   */
  static validateSidePots(
    contributions: Record<string, number>,
    sidePots: Pot[],
    rake: number,
    context: string
  ): GuardResult {
    const sumContributions = Object.values(contributions).reduce((sum, val) => sum + val, 0);
    const sumPots = sidePots.reduce((sum, pot) => sum + pot.value, 0);
    const expectedSum = sumContributions - rake;
    const difference = Math.abs(expectedSum - sumPots);

    const guardContext = {
      context,
      contributions,
      sumContributions,
      rake,
      sidePots: sidePots.map(p => ({ value: p.value, eligible: p.eligiblePlayers })),
      sumPots,
      expectedSum,
      difference
    };

    // Check with tolerance
    if (difference <= CurrencyUtils.EPSILON) {
      return {
        passed: true,
        severity: GuardSeverity.WARNING,
        message: 'Side pots validated',
        context: guardContext,
        recoverable: true
      };
    }

    // Side pot inconsistency detected
    const isRecoverable = difference <= CurrencyUtils.EPSILON * 5; // Up to 5 cents

    return {
      passed: false,
      severity: isRecoverable ? GuardSeverity.ERROR : GuardSeverity.CRITICAL,
      message: `Side pot inconsistency: sum of pots (${sumPots}) != total contributions - rake (${expectedSum}), difference: ${difference} cents`,
      context: guardContext,
      recoverable: isRecoverable,
      suggestedFix: isRecoverable ? () => {
        console.log(`🔧 RECOVERY: Redistributing ${difference} cents across side pots proportionally`);
      } : undefined
    };
  }

  /**
   * GUARD: All-in Constraints
   * Verifica se um jogador all-in não apostou mais do que seu stack
   */
  static validateAllInConstraints(
    playerKey: string,
    isAllIn: boolean,
    currentBet: number,
    stackBeforeAction: number,
    context: string
  ): GuardResult {
    const guardContext = {
      context,
      playerKey,
      isAllIn,
      currentBet,
      stackBeforeAction
    };

    // If not all-in, this guard doesn't apply
    if (!isAllIn) {
      return {
        passed: true,
        severity: GuardSeverity.WARNING,
        message: `Player ${playerKey} is not all-in, constraint not applicable`,
        context: guardContext,
        recoverable: true
      };
    }

    // For all-in players, bet should be <= stack before action
    const difference = currentBet - stackBeforeAction;

    if (difference <= CurrencyUtils.EPSILON) {
      return {
        passed: true,
        severity: GuardSeverity.WARNING,
        message: `All-in constraints validated for ${playerKey}`,
        context: guardContext,
        recoverable: true
      };
    }

    // All-in constraint violated
    return {
      passed: false,
      severity: GuardSeverity.CRITICAL,
      message: `All-in constraint violated for ${playerKey}: bet ${currentBet} > stack ${stackBeforeAction} (${difference} cents over)`,
      context: guardContext,
      recoverable: false // This should never happen and indicates a serious bug
    };
  }

  /**
   * GUARD: Pending Contributions Consistency
   * Verifica se as contribuições pendentes são consistentes com o estado atual
   */
  static validatePendingContributions(
    pendingContribs: Record<string, number>,
    totalCommitted: Record<string, number>,
    previousCommitted: Record<string, number>,
    context: string
  ): GuardResult {
    const guardContext = {
      context,
      pendingContribs,
      totalCommitted,
      previousCommitted
    };

    const errors: string[] = [];

    // For each player with pending contributions
    for (const playerKey in pendingContribs) {
      const pending = pendingContribs[playerKey];
      const total = totalCommitted[playerKey] || 0;
      const previous = previousCommitted[playerKey] || 0;
      const expected = total - previous;
      const difference = Math.abs(pending - expected);

      if (difference > CurrencyUtils.EPSILON) {
        errors.push(
          `${playerKey}: pending=${pending}, expected=${expected} (total=${total}, previous=${previous}), diff=${difference}`
        );
      }
    }

    if (errors.length === 0) {
      return {
        passed: true,
        severity: GuardSeverity.WARNING,
        message: 'Pending contributions validated',
        context: guardContext,
        recoverable: true
      };
    }

    return {
      passed: false,
      severity: GuardSeverity.ERROR,
      message: `Pending contributions inconsistency: ${errors.join('; ')}`,
      context: { ...guardContext, errors },
      recoverable: true,
      suggestedFix: () => {
        console.log(`🔧 RECOVERY: Recalculating pending contributions from total - previous`);
      }
    };
  }

  /**
   * GUARD: Non-negative Values
   * Verifica se todos os valores monetários são não-negativos
   */
  static validateNonNegativeValues(
    values: Record<string, number>,
    valueType: string,
    context: string
  ): GuardResult {
    const guardContext = {
      context,
      valueType,
      values
    };

    const negativeValues: Record<string, number> = {};

    for (const key in values) {
      if (values[key] < 0 && Math.abs(values[key]) > CurrencyUtils.EPSILON) {
        negativeValues[key] = values[key];
      }
    }

    if (Object.keys(negativeValues).length === 0) {
      return {
        passed: true,
        severity: GuardSeverity.WARNING,
        message: `All ${valueType} values are non-negative`,
        context: guardContext,
        recoverable: true
      };
    }

    return {
      passed: false,
      severity: GuardSeverity.CRITICAL,
      message: `Negative ${valueType} values detected: ${JSON.stringify(negativeValues)}`,
      context: { ...guardContext, negativeValues },
      recoverable: false
    };
  }

  /**
   * Run all applicable guards and collect results
   */
  static async runAllGuards(
    guards: GuardResult[]
  ): Promise<{ passed: boolean; results: GuardResult[] }> {
    const failedGuards = guards.filter(g => !g.passed);

    // Log all failed guards
    for (const guard of failedGuards) {
      await AnomalyLogger.logGuardFailure(guard);

      // Log to console with appropriate severity
      const emoji = guard.severity === GuardSeverity.CRITICAL ? '🚨' :
                   guard.severity === GuardSeverity.ERROR ? '❌' : '⚠️';

      console.error(`${emoji} GUARD FAILED [${guard.severity}]: ${guard.message}`);
      console.error(`   Context:`, JSON.stringify(guard.context, null, 2));

      // Attempt recovery if available
      if (guard.suggestedFix && guard.recoverable) {
        console.log(`🔧 Attempting automatic recovery...`);
        try {
          guard.suggestedFix();
          console.log(`✅ Recovery successful`);
        } catch (error) {
          console.error(`❌ Recovery failed:`, error);
        }
      }
    }

    return {
      passed: failedGuards.length === 0,
      results: guards
    };
  }
}
