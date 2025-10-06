// Compatibilidade para o sistema existente - converte ReplayState em Snapshots
import { ReplayBuilder } from './replay-builder';
import { HandHistory, Snapshot, Pot, Card } from '@/types/poker';
import { ReplayState, ReplayStep } from '@/types/replay';
import { normalizeKey, setNormalized, getNormalized, incrementNormalized } from './normalize-key';
import { HandParser } from './hand-parser';
import { isAnomalyFallbackAllowed } from '../config/sidepot-config';
import { AnomalyLogger } from './anomaly-logger';
import { HandEvaluator } from './hand-evaluator';
import { CurrencyUtils } from '@/utils/currency-utils';
import { MathematicalGuards, GuardSeverity } from './guards/mathematical-guards';
import { ErrorHandler } from './error-handling/error-handler';
import { ErrorCode, ErrorSeverity } from '@/types/errors';
import { DataValidator } from '@/utils/validation';

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

    // CRITICAL FIX: Get stack before action from playerStacks (already adjusted for antes/blinds)
    // Use ?? instead of || to properly handle 0 values
    const stackBefore = getNormalized(snapshot.playerStacks, key) ??
      HandParser.convertValueWithContext(handHistory.players.find(p => normalizeKey(p.name) === key)?.stack || 0, handHistory.gameContext!);

    console.log(`🔍 ALL-IN DEBUG [${key}]: stackBefore=${stackBefore}, playerStacks[${key}]=${getNormalized(snapshot.playerStacks, key)}`);

    // Determine amount to commit (convert using game context)
    const parsedAmount = actionStep.amount ? HandParser.convertValueWithContext(actionStep.amount, handHistory.gameContext!) : 0;
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
   * DEFINITIVE side pot calculation for multiple all-in scenarios
   * REFACTORED: Now uses SidePotCalculator for 100% robustness
   * @param totalCommittedMap - Map of player commitments in cents
   * @param playerStatusAtShowdown - Map of player statuses (folded, all-in, active)
   * @param rake - Rake amount in cents (deducted from total pot)
   */
  private static async computeSidePots(
    totalCommittedMap: Record<string, number>,
    playerStatusAtShowdown: Record<string, 'folded' | 'all-in' | 'active'> = {},
    rake: number = 0
  ): Promise<Array<{amount: number, eligible: string[], sourceLevel: number}>> {

    // Delegate to production-ready SidePotCalculator
    const { SidePotCalculator } = await import('./poker/side-pot-calculator');
    return SidePotCalculator.calculate(totalCommittedMap, playerStatusAtShowdown, rake);
  }

  /**
   * Run mathematical guards on snapshot state
   */
  private static async runMathematicalGuards(
    snapshot: Snapshot,
    handHistory: HandHistory,
    initialStacks: Record<string, number>
  ): Promise<void> {
    const guards = [];

    // 1. Validate pot accuracy
    if (snapshot.totalCommitted) {
      // CRITICAL: Rake is only applied at showdown, not during intermediate streets
      const rakeCents = snapshot.street === 'showdown' && handHistory.rake
        ? HandParser.convertValueWithContext(handHistory.rake, handHistory.gameContext!)
        : 0;

      guards.push(
        MathematicalGuards.validatePotAccuracy(
          snapshot.totalCommitted,
          snapshot.totalDisplayedPot,
          rakeCents,
          `Snapshot ${snapshot.id} - ${snapshot.street}`
        )
      );

      // 2. Validate side pots
      guards.push(
        MathematicalGuards.validateSidePots(
          snapshot.totalCommitted,
          snapshot.pots,
          rakeCents,
          `Snapshot ${snapshot.id} - ${snapshot.street}`
        )
      );
    }

    // 3. Validate non-negative stacks
    guards.push(
      MathematicalGuards.validateNonNegativeValues(
        snapshot.playerStacks,
        'playerStacks',
        `Snapshot ${snapshot.id} - ${snapshot.street}`
      )
    );

    // 4. Validate all-in constraints
    if (snapshot.isAllIn) {
      for (const playerKey in snapshot.isAllIn) {
        if (snapshot.isAllIn[playerKey]) {
          const committed = snapshot.totalCommitted?.[playerKey] || 0;
          const initialStack = initialStacks[playerKey] || 0;

          // CRITICAL: The guard should receive the initial stack (before any deductions)
          // because totalCommitted already includes antes, blinds, and all actions
          guards.push(
            MathematicalGuards.validateAllInConstraints(
              playerKey,
              true,
              committed,
              initialStack,
              `Snapshot ${snapshot.id} - ${snapshot.street}`
            )
          );
        }
      }
    }

    // 5. Validate stack consistency at showdown
    if (snapshot.street === 'showdown' && snapshot.payouts && snapshot.playerStacksPostShowdown) {
      for (const playerKey in snapshot.playerStacksPostShowdown) {
        const initialStack = initialStacks[playerKey] || 0;
        const committed = snapshot.totalCommitted?.[playerKey] || 0;
        const payout = snapshot.payouts[playerKey] || 0;
        const finalStack = snapshot.playerStacksPostShowdown[playerKey];

        guards.push(
          MathematicalGuards.validateStackConsistency(
            playerKey,
            initialStack,
            committed,
            payout,
            finalStack,
            `Snapshot ${snapshot.id} - showdown`
          )
        );
      }
    }

    // Run all guards and handle results
    const { passed, results } = await MathematicalGuards.runAllGuards(guards);

    if (!passed) {
      const criticalFailures = results.filter(r => !r.passed && r.severity === GuardSeverity.CRITICAL);

      if (criticalFailures.length > 0) {
        const errorMessages = criticalFailures.map(f => f.message).join('; ');
        throw new Error(`CRITICAL GUARD FAILURES: ${errorMessages}`);
      }

      // For non-critical failures, log but continue
      const nonCriticalFailures = results.filter(r => !r.passed && r.severity !== GuardSeverity.CRITICAL);
      if (nonCriticalFailures.length > 0) {
        console.warn(`⚠️ ${nonCriticalFailures.length} non-critical guard failures detected`);
      }
    }
  }

  /**
   * Legacy side-pots function (for compatibility)
   */
  private static async calculateSidePots(
    playerContributions: Record<string, number>,
    foldedPlayers: Set<string>,
    rake: number = 0
  ): Promise<Pot[]> {
    console.log(`[calculateSidePots] INPUT - playerContributions:`, playerContributions, `foldedPlayers:`, Array.from(foldedPlayers));

    // Build playerStatusAtShowdown map from foldedPlayers
    const playerStatusAtShowdown: Record<string, 'folded' | 'active'> = {};
    Object.keys(playerContributions).forEach(player => {
      const normalizedPlayer = normalizeKey(player);
      playerStatusAtShowdown[normalizedPlayer] = foldedPlayers.has(normalizedPlayer) ? 'folded' : 'active';
    });

    console.log(`[calculateSidePots] playerStatusAtShowdown:`, playerStatusAtShowdown);

    // Check if all players folded
    const hasActivePlayer = Object.values(playerStatusAtShowdown).some(status => status === 'active');
    if (!hasActivePlayer) {
      return [{ value: 0, eligiblePlayers: [], isPotSide: false }];
    }

    // Pass ALL contributions (including folded players) to computeSidePots
    // The SidePotCalculator will handle eligibility based on playerStatusAtShowdown
    const sidePots = await this.computeSidePots(playerContributions, playerStatusAtShowdown, rake);

    return sidePots.map((pot, index) => ({
      value: pot.amount,
      eligiblePlayers: pot.eligible,
      isPotSide: index > 0
    }));
  }

  static async buildSnapshots(handHistory: HandHistory): Promise<Snapshot[]> {
    try {
      const replayState = ReplayBuilder.buildReplayFromHand(handHistory);

      if (!replayState || !replayState.steps) {
        const error = ErrorHandler.createSnapshotError(
          ErrorCode.SNAPSHOT_INVALID_ACTION,
          'ReplayState is empty or has no steps',
          {
            context: 'SnapshotBuilder.buildSnapshots',
            severity: ErrorSeverity.ERROR,
            isRecoverable: false
          }
        );
        ErrorHandler.log(error.toAppError());
        return [];
      }

      // Converter ReplayState steps em Snapshots
      const snapshots: Snapshot[] = [];

      // Calculate initial pot including antes (using game context)
      const totalAntes = handHistory.antes ?
        handHistory.antes.reduce((sum, ante) => sum + HandParser.convertValueWithContext(ante.amount || 0, handHistory.gameContext!), 0) : 0;
      let currentPot = HandParser.convertValueWithContext(handHistory.smallBlind, handHistory.gameContext!) +
                      HandParser.convertValueWithContext(handHistory.bigBlind, handHistory.gameContext!) + totalAntes;

      // Ajustar stacks iniciais subtraindo antes e blinds já colocados na mesa (using normalized keys)
      const currentStacks: Record<string, number> = {};
      const initialStacks: Record<string, number> = {}; // Track initial stacks for guards
      console.log(`📊 STACK INITIALIZATION - ante=${handHistory.ante}, SB=${handHistory.smallBlind}, BB=${handHistory.bigBlind}`);

      handHistory.players.forEach(player => {
        const key = normalizeKey(player.name);
        let adjustedStack = HandParser.convertValueWithContext(player.stack, handHistory.gameContext!);

        // Store initial stack before adjustments
        initialStacks[key] = adjustedStack;
        console.log(`  👤 ${player.name} (${key}): initial stack = ${adjustedStack}`);

        let deductions = 0;

        // Subtrair ante se houver
        if (handHistory.ante && handHistory.ante > 0) {
          const anteAmount = HandParser.convertValueWithContext(handHistory.ante, handHistory.gameContext!);
          adjustedStack -= anteAmount;
          deductions += anteAmount;
          console.log(`     - Ante: ${anteAmount} → stack now ${adjustedStack}`);
        }

        // Subtrair blinds
        if (player.position === 'SB') {
          const sbAmount = HandParser.convertValueWithContext(handHistory.smallBlind, handHistory.gameContext!);
          adjustedStack -= sbAmount;
          deductions += sbAmount;
          console.log(`     - SB: ${sbAmount} → stack now ${adjustedStack}`);
        } else if (player.position === 'BB') {
          const bbAmount = HandParser.convertValueWithContext(handHistory.bigBlind, handHistory.gameContext!);
          adjustedStack -= bbAmount;
          deductions += bbAmount;
          console.log(`     - BB: ${bbAmount} → stack now ${adjustedStack}`);
        }

        // Atualizar stack (garantindo que não fique negativo)
        currentStacks[key] = Math.max(0, adjustedStack);
        console.log(`  ✅ ${player.name} (${key}): final stack = ${currentStacks[key]} (deducted ${deductions})`);
      });

      let communityCards: any[] = [];
      let currentStreet: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' = 'preflop';
      const folded = new Set<string>();
      const pendingContribs: Record<string, number> = {};
      const totalContribs: Record<string, number> = {};
      const isAllIn: Record<string, boolean> = {};
      const revealedCards: Record<string, any> = {}; // Cartas reveladas durante a mão

      // Inicializar contribuições totais com antes, blinds (using normalized keys)
      handHistory.players.forEach(player => {
        const key = normalizeKey(player.name);
        totalContribs[key] = 0;

        // Adicionar antes se houver
        if (handHistory.ante && handHistory.ante > 0) {
          totalContribs[key] += HandParser.convertValueWithContext(handHistory.ante, handHistory.gameContext!);
        }

        // Adicionar as blinds às contribuições iniciais
        if (player.position === 'SB') {
          totalContribs[key] += HandParser.convertValueWithContext(handHistory.smallBlind, handHistory.gameContext!);
        } else if (player.position === 'BB') {
          totalContribs[key] += HandParser.convertValueWithContext(handHistory.bigBlind, handHistory.gameContext!);
        }
      });

      // Adicionar snapshot inicial para mostrar APENAS blinds (antes vão direto pro pot)
      const initialPendingContribs: Record<string, number> = {};

      // VISUAL IMPROVEMENT: Antes vão direto para o pot central (não ficam ao lado dos jogadores)
      // Apenas blinds ficam visíveis como pending contributions
      handHistory.players.forEach(player => {
        const normalizedKey = normalizeKey(player.name);

        // Add blinds ONLY to pending contribs (antes já estão no totalContribs e serão mostrados no pot central)
        if (player.position === 'SB') {
          const blindAmount = HandParser.convertValueWithContext(handHistory.smallBlind, handHistory.gameContext!);
          setNormalized(initialPendingContribs, normalizedKey, blindAmount);
          console.log(`🎯 INITIAL SB: ${player.name} (${normalizedKey}) = ${blindAmount}`);
        } else if (player.position === 'BB') {
          const blindAmount = HandParser.convertValueWithContext(handHistory.bigBlind, handHistory.gameContext!);
          setNormalized(initialPendingContribs, normalizedKey, blindAmount);
          console.log(`🎯 INITIAL BB: ${player.name} (${normalizedKey}) = ${blindAmount}`);
        }
      });

      console.log(`💡 ANTES (${totalAntes}) vão direto para o pot central, apenas blinds ficam visíveis`);

      // Inicializar pendingContribs com os blinds para os snapshots subsequentes
      Object.keys(initialPendingContribs).forEach(key => {
        pendingContribs[key] = initialPendingContribs[key];
      });

      // NOTE: Rake is only applied at showdown, not during intermediate streets
      // So we pass rake=0 for all snapshots except the final showdown snapshot
      const initialPots = await this.calculateSidePots(totalContribs, folded, 0);
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

      // DEBUG: Log initial snapshot
      console.log(`📸 INITIAL SNAPSHOT (${initialSnapshot.street}): ${initialSnapshot.description}`);
      console.log(`   pendingContribs:`, JSON.stringify(initialSnapshot.pendingContribs, null, 2));
      console.log(`   totalDisplayedPot: ${initialSnapshot.totalDisplayedPot}`);

      snapshots.push(initialSnapshot);

      for (let index = 0; index < replayState.steps.length; index++) {
        const step = replayState.steps[index];
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
                const amountCents = HandParser.convertValueWithContext(actionStep.amount, handHistory.gameContext!);
                setNormalized(totalContribs, playerKey, currentTotal - amountCents);
              }
            } else if (actionStep.amount && actionStep.amount > 0) {
              // Normal action processing
              const amountCents = HandParser.convertValueWithContext(actionStep.amount, handHistory.gameContext!);
              incrementNormalized(pendingContribs, playerKey, amountCents);
              incrementNormalized(totalContribs, playerKey, amountCents);

              // Update stack
              const currentStack = getNormalized(currentStacks, playerKey) ?? 0;
              const newStack = Math.max(0, currentStack - amountCents);
              setNormalized(currentStacks, playerKey, newStack);

              console.log(`💰 NORMAL ACTION [${playerKey}]: ${actionStep.action} ${amountCents} → stack ${currentStack} → ${newStack}`);
            }
            break;

          case 'STREET':
            const streetStep = step as any;

            // Resetar pendingContribs para a nova street (fichas vão diretamente para o meio)
            Object.keys(pendingContribs).forEach(key => delete pendingContribs[key]);

            // Atualizar para nova street
            currentStreet = streetStep.street;
            description = streetStep.description;

            // Community cards should accumulate through streets
            if (streetStep.cards && Array.isArray(streetStep.cards)) {
              // For flop (3 cards) or other multi-card streets, replace the array
              if (streetStep.cards.length > 1) {
                communityCards = [...streetStep.cards];
              } else {
                // For turn/river (1 card), add to existing cards
                communityCards = [...communityCards, ...streetStep.cards];
              }
            }
            break;

          case 'SHOWDOWN':
            const showdownStep = step as any;
            currentStreet = 'showdown';
            description = showdownStep.description;
            break;
        }

        // Calcular o pot total simples: soma de todas as contribuições
        const totalPotValue = Object.values(totalContribs).reduce((sum, contrib) => sum + contrib, 0);

        // CORREÇÃO CRÍTICA: Side pots SÓ devem ser calculados quando há all-in
        // Durante betting rounds normais: apenas Main Pot
        let pots: Pot[] = [];
        const hasAllIn = Object.values(isAllIn).some(allIn => allIn);

        if (hasAllIn || currentStreet === 'showdown') {
          // Calcular side pots apenas se há all-in ou no showdown
          pots = await this.calculateSidePots(totalContribs, folded, 0);
        } else {
          // Betting round normal: apenas Main Pot
          pots = [{
            value: totalPotValue,
            eligiblePlayers: handHistory.players
              .filter(p => !folded.has(normalizeKey(p.name)))
              .map(p => p.name)
          }];
        }

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
              const key = normalizeKey(p.name);
              // Incluir jogadores que não foldaram OU que têm cartas definidas (muckadas reveladas)
              if (!folded.has(key) || (p.cards && p.cards.length > 0)) {
                acc[p.name] = p.cards || null;
                if (p.cards && p.cards.length > 0) {
                  console.log(`🃏 SNAPSHOT SHOWDOWN: Incluindo cartas de ${p.name}:`, p.cards);
                }
              }
              return acc;
            }, {} as Record<string, any>) : {}),
            // Cartas reveladas durante a mão (all-in)
            ...revealedCards
          } : undefined,
          winners: currentStreet === 'showdown' && handHistory.showdown?.winners ? [...handHistory.showdown.winners] : undefined,

          // Campos adicionados para tracking preciso
          totalCommitted: { ...totalContribs },
          payouts: currentStreet === 'showdown' ? await this.calculatePayouts(handHistory, totalContribs, this.determinePlayerStatusAtShowdown(handHistory, folded, isAllIn)) : undefined,
          playerStacksPostShowdown: currentStreet === 'showdown' ? await this.calculateFinalStacks(handHistory, totalContribs, this.determinePlayerStatusAtShowdown(handHistory, folded, isAllIn)) : undefined,
          isAllIn: { ...isAllIn }
        };

        // DEBUG: Log snapshot creation
        console.log(`📸 SNAPSHOT ${snapshot.id} (${snapshot.street}): ${snapshot.description}`);
        console.log(`   pendingContribs:`, JSON.stringify(snapshot.pendingContribs, null, 2));
        console.log(`   totalDisplayedPot: ${snapshot.totalDisplayedPot}, activePlayer: ${snapshot.activePlayer}`);

        // Run mathematical guards on this snapshot
        await this.runMathematicalGuards(snapshot, handHistory, initialStacks);

        // Validate snapshot
        const validationErrors = DataValidator.validateSnapshot(snapshot);
        if (validationErrors.length > 0) {
          const criticalErrors = validationErrors.filter(e => e.severity === ErrorSeverity.CRITICAL);

          validationErrors.forEach(err => {
            console.warn(`⚠️ Snapshot ${snapshot.id} Validation ${err.severity}: ${err.message}`, err.details);
          });

          // For critical errors in snapshots, log but continue (don't break the entire flow)
          if (criticalErrors.length > 0) {
            criticalErrors.forEach(err => ErrorHandler.log(err));
          }
        }

        snapshots.push(snapshot);
      }

      console.log(`✅ SnapshotBuilder: Generated ${snapshots.length} snapshots`);
      return snapshots;

    } catch (error) {
      const appError = ErrorHandler.handle(
        error,
        'SnapshotBuilder.buildSnapshots',
        { handHistory },
        { logToConsole: true, logToFile: true }
      );

      // For critical errors, throw to propagate
      if (appError.severity === ErrorSeverity.CRITICAL) {
        throw ErrorHandler.createSnapshotError(
          appError.code,
          appError.message,
          {
            context: 'SnapshotBuilder.buildSnapshots',
            details: appError.details,
            severity: ErrorSeverity.CRITICAL,
            isRecoverable: false
          }
        );
      }

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
  /**
   * Calculate payouts following strict poker rules for side pot distribution
   * CRITICAL: Deducts rake from total pot before distribution
   */
  private static async calculatePayouts(
    handHistory: HandHistory,
    totalCommitted: Record<string, number>,
    playerStatusAtShowdown: Record<string, 'folded' | 'all-in' | 'active'> = {}
  ): Promise<Record<string, number>> {

    const payouts: Record<string, number> = {};
    console.log('🔍 PAYOUTS BEFORE DISTR:', payouts);

    if (!handHistory.showdown?.winners) {
      return payouts;
    }

    // CRITICAL: Calculate rake and pass to SidePotCalculator (centralized approach)
    const rakeCents = handHistory.rake ? HandParser.convertValueWithContext(handHistory.rake, handHistory.gameContext!) : 0;

    if (rakeCents > 0) {
      console.log(`💰 RAKE: ${rakeCents} cents will be deducted from total pot`);
    }

    // Use side pot calculation for deterministic payouts (passing original totalCommitted and rake)
    const pots = await this.computeSidePots(totalCommitted, playerStatusAtShowdown, rakeCents);

    // CRITICAL GUARD: Verify mathematical consistency before distribution with EPSILON tolerance
    const sumPots = pots.reduce((sum, pot) => sum + pot.amount, 0);
    const sumCommittedOriginal = Object.values(totalCommitted).reduce((sum, val) => sum + val, 0);
    const expectedSumForGuard = sumCommittedOriginal - rakeCents;

    if (CurrencyUtils.hasDifference(sumPots, expectedSumForGuard)) {
      console.error(`❌ CRITICAL ERROR: SUM_POTS (${sumPots}) !== (sum(totalCommitted) - rake) (${expectedSumForGuard})`);
      console.error(`❌ DEBUG DUMP - totalCommitted:`, totalCommitted);
      console.error(`❌ DEBUG DUMP - rakeCents:`, rakeCents);
      console.error(`❌ DEBUG DUMP - computed pots:`, pots);
      throw new Error(`Mathematical inconsistency detected: ${sumPots} !== ${expectedSumForGuard}`);
    }

    console.log(`💰 POT VERIFICATION: Total committed = ${sumCommittedOriginal} cents, Rake = ${rakeCents} cents, Pots after rake = ${sumPots} cents`);

    const globalWinners = handHistory.showdown.winners.map(w => normalizeKey(w));
    console.log(`🔍 GLOBAL SHOWDOWN WINNERS RAW: [${handHistory.showdown.winners.join(', ')}]`);
    console.log(`🔍 GLOBAL SHOWDOWN WINNERS NORMALIZED: [${globalWinners.join(', ')}]`);

    // Collect all community cards for hand evaluation
    const communityCards: Card[] = [];
    if (handHistory.flop.cards.length > 0) {
      communityCards.push(...handHistory.flop.cards);
    }
    if (handHistory.turn.card) {
      communityCards.push(handHistory.turn.card);
    }
    if (handHistory.river.card) {
      communityCards.push(handHistory.river.card);
    }
    console.log(`🃏 COMMUNITY CARDS: [${communityCards.map(c => c.rank + c.suit).join(', ')}]`);

    // Distribute each pot following poker rules
    for (let index = 0; index < pots.length; index++) {
      const pot = pots[index];
      console.log(`🔍 PROCESSING POT ${index}: amount=${pot.amount} cents, eligible=[${pot.eligible.join(', ')}]`);
      console.log(`🔍 POT ${index} ELIGIBLE (already normalized): [${pot.eligible.join(', ')}]`);

      if (pot.eligible.length === 1) {
        // POKER RULE: Single eligible player automatically wins the pot
        const soleWinner = pot.eligible[0];
        payouts[soleWinner] = (payouts[soleWinner] || 0) + pot.amount;
        console.log(`🏆 SINGLE-ELIGIBLE POT: POT ${index} (${pot.amount} cents) → ${soleWinner} (automatic win)`);

      } else if (pot.eligible.length > 1) {
        // POKER RULE: Determine winners ONLY among eligible players using hand evaluation
        const eligibleWinners = this.determineWinnersAmongEligible(pot.eligible, globalWinners, handHistory, communityCards);

        if (eligibleWinners.length > 0) {
          // Standard distribution: divide pot among eligible winners
          const perWinner = Math.floor(pot.amount / eligibleWinners.length);
          const remainder = pot.amount % eligibleWinners.length;

          eligibleWinners.forEach((winner, winnerIndex) => {
            const key = normalizeKey(winner);
            let allocation = perWinner;

            // Distribute remainder to winners with lowest seat indices (deterministic)
            if (winnerIndex < remainder) {
              allocation += 1;
            }

            payouts[key] = (payouts[key] || 0) + allocation;
          });

          console.log(`🏆 MULTI-ELIGIBLE POT: POT ${index} (${pot.amount} cents) split among [${eligibleWinners.join(', ')}] (${perWinner} each + ${remainder} remainder)`);

        } else {
          // CRITICAL ANOMALY: No eligible players won at showdown
          console.error(`❌ CRITICAL ANOMALY: POT ${index} has eligible players [${pot.eligible.join(', ')}] but none won at showdown`);
          console.error(`❌ DEBUG DUMP - pot:`, pot);
          console.error(`❌ DEBUG DUMP - globalWinners:`, globalWinners);
          console.error(`❌ DEBUG DUMP - playerStatus:`, playerStatusAtShowdown);
          console.error(`❌ DEBUG DUMP - handHistory showdown:`, handHistory.showdown);

          // Log the anomaly with structured logging
          const handId = `hand_${Date.now()}`; // Simple hand ID for tracking

          // Check ALLOW_FALLBACK_ON_ANOMALY config flag
          if (isAnomalyFallbackAllowed()) {
            // FALLBACK: Award to earliest eligible contributor with anomaly logging
            const fallbackWinner = pot.eligible.sort()[0];
            payouts[fallbackWinner] = (payouts[fallbackWinner] || 0) + pot.amount;
            console.log(`🔄 FALLBACK ALLOCATION: POT ${index} (${pot.amount} cents) → ${fallbackWinner} (earliest eligible, ANOMALY LOGGED)`);

            // Log to structured anomaly log file
            const incidentId = await AnomalyLogger.logNoEligibleWinners(
              index,
              pot.amount,
              pot.eligible,
              totalCommitted,
              playerStatusAtShowdown,
              handId,
              fallbackWinner
            );
            console.warn(`⚠️ ANOMALY FALLBACK APPLIED: Incident ${incidentId} - Pot ${index} had eligible players but no showdown winners`);
          } else {
            // Log anomaly and fail-fast (default mode)
            const incidentId = await AnomalyLogger.logNoEligibleWinners(
              index,
              pot.amount,
              pot.eligible,
              totalCommitted,
              playerStatusAtShowdown,
              handId
            );
            throw new Error(`CRITICAL ANOMALY: Incident ${incidentId} - Pot ${index} has eligible players [${pot.eligible.join(', ')}] but none won at showdown. This indicates a bug in eligibility logic or hand parsing. Set ALLOW_FALLBACK_ON_ANOMALY=true to enable fallback allocation.`);
          }
        }

      } else {
        // This case should never happen due to guards in computeSidePots
        throw new Error(`IMPOSSIBLE: Pot ${index} has pot.eligible.length = ${pot.eligible.length}, should be caught by computeSidePots guards`);
      }
    }

    // Verify mathematical consistency after distribution with EPSILON tolerance
    const sumPayouts = Object.values(payouts).reduce((sum, val) => sum + val, 0);
    console.log('🔍 PAYOUTS AFTER DISTR (cents):', payouts, `SUM_PAYOUTS = ${sumPayouts} cents`);
    console.log(`🔍 PAYOUT VERIFICATION: SUM_PAYOUTS = ${sumPayouts}, SUM_POTS = ${sumPots}`);

    if (CurrencyUtils.hasDifference(sumPayouts, sumPots)) {
      console.error(`❌ PAYOUT ERROR: SUM_PAYOUTS (${sumPayouts}) !== SUM_POTS (${sumPots}), difference: ${sumPayouts - sumPots} cents`);
      throw new Error(`Payout distribution error: ${sumPayouts} !== ${sumPots}`);
    }

    return payouts;
  }

  /**
   * Determine winners among eligible players using hand evaluation
   * This is the DEFINITIVE solution that compares actual hand strengths
   */
  private static determineWinnersAmongEligible(
    eligible: string[],
    globalWinners: string[],
    handHistory: HandHistory,
    communityCards: Card[]
  ): string[] {
    const eligibleNormalized = eligible.map(p => normalizeKey(p));
    const globalWinnersNormalized = globalWinners.map(w => normalizeKey(w));

    // First, try to use global winners if they match eligible players
    const winnersAmongEligible = eligibleNormalized.filter(player =>
      globalWinnersNormalized.includes(player)
    );

    console.log(`🔍 ELIGIBLE: [${eligibleNormalized.join(', ')}] vs GLOBAL_WINNERS: [${globalWinnersNormalized.join(', ')}] → INTERSECTION: [${winnersAmongEligible.join(', ')}]`);

    // If we have a clear match, use it
    if (winnersAmongEligible.length > 0) {
      return winnersAmongEligible;
    }

    // CRITICAL: No intersection - this is a side pot scenario or the global winners
    // are not eligible for this specific pot. We MUST evaluate hands ourselves.
    console.log(`🎯 NO INTERSECTION - Using hand evaluator to determine winner among eligible players`);

    // Collect hole cards and community cards for each eligible player
    const playerHands: Array<{ playerKey: string, holeCards: Card[], communityCards: Card[] }> = [];

    for (const eligiblePlayerKey of eligibleNormalized) {
      // Find the player in handHistory
      const player = handHistory.players.find(p => normalizeKey(p.name) === eligiblePlayerKey);

      if (!player) {
        console.error(`❌ ERROR: Eligible player ${eligiblePlayerKey} not found in handHistory.players`);
        continue;
      }

      if (!player.cards || player.cards.length !== 2) {
        console.error(`❌ ERROR: Eligible player ${eligiblePlayerKey} has no hole cards or invalid cards:`, player.cards);
        continue;
      }

      playerHands.push({
        playerKey: eligiblePlayerKey,
        holeCards: [...player.cards],
        communityCards: communityCards
      });

      console.log(`🃏 EVALUATING: ${eligiblePlayerKey} with hole cards [${player.cards.map(c => c.rank + c.suit).join(', ')}]`);
    }

    if (playerHands.length === 0) {
      console.error(`❌ CRITICAL ERROR: No valid hands to evaluate among eligible players`);
      // Fallback: return all eligible players (split pot)
      return eligibleNormalized;
    }

    // Use HandEvaluator to determine winners
    const winnerIndices = HandEvaluator.determineWinners(
      playerHands.map(ph => ({ holeCards: ph.holeCards, communityCards: ph.communityCards }))
    );

    const winners = winnerIndices.map(idx => playerHands[idx].playerKey);

    console.log(`🏆 HAND EVALUATION RESULT: Winners = [${winners.join(', ')}]`);

    // Log hand evaluations for transparency
    for (let i = 0; i < playerHands.length; i++) {
      const ph = playerHands[i];
      const evaluation = HandEvaluator.evaluateHand(ph.holeCards, ph.communityCards);
      const isWinner = winnerIndices.includes(i);
      console.log(`   ${isWinner ? '🏆' : '  '} ${ph.playerKey}: ${evaluation.description} (rank=${evaluation.rankName}, values=[${evaluation.values.join(', ')}])`);
    }

    return winners;
  }

  /**
   * Calculate final stacks after showdown with reconciliation
   */
  private static async calculateFinalStacks(
    handHistory: HandHistory,
    totalCommitted: Record<string, number>,
    playerStatusAtShowdown: Record<string, 'folded' | 'all-in' | 'active'> = {}
  ): Promise<Record<string, number>> {

    const finalStacks: Record<string, number> = {};
    const payouts = await this.calculatePayouts(handHistory, totalCommitted, playerStatusAtShowdown);

    handHistory.players.forEach(player => {
      const key = normalizeKey(player.name);
      const initialStackCents = HandParser.convertValueWithContext(player.stack, handHistory.gameContext!);
      const committedCents = totalCommitted[key] || 0;
      const payoutCents = payouts[key] || 0;

      const expectedFinalCents = initialStackCents - committedCents + payoutCents;

      // For tournaments: keep values as chips, for cash games: convert cents back to dollars
      let finalStackValue: number;
      if (handHistory.gameContext!.isTournament) {
        finalStackValue = expectedFinalCents; // Already in chips, no conversion needed
      } else {
        finalStackValue = CurrencyUtils.centsToDollars(expectedFinalCents); // Convert cents to dollars
      }
      finalStacks[key] = finalStackValue;

      // Log for reconciliation (context-aware display)
      const displayUnit = handHistory.gameContext!.isTournament ? 'chips' : 'dollars';
      const displayInitial = handHistory.gameContext!.isTournament ? initialStackCents : CurrencyUtils.centsToDollars(initialStackCents);
      const displayCommitted = handHistory.gameContext!.isTournament ? committedCents : CurrencyUtils.centsToDollars(committedCents);
      const displayPayout = handHistory.gameContext!.isTournament ? payoutCents : CurrencyUtils.centsToDollars(payoutCents);
      console.log(`🧮 Final stack calc for ${key}: ${displayInitial} - ${displayCommitted} + ${displayPayout} = ${finalStackValue} ${displayUnit}`);
    });

    return finalStacks;
  }

  /**
   * Determine player status at showdown for pot eligibility
   */
  private static determinePlayerStatusAtShowdown(
    handHistory: HandHistory,
    foldedPlayers: Set<string>,
    isAllIn: Record<string, boolean>
  ): Record<string, 'folded' | 'all-in' | 'active'> {

    const playerStatus: Record<string, 'folded' | 'all-in' | 'active'> = {};

    handHistory.players.forEach(player => {
      const key = normalizeKey(player.name);

      if (foldedPlayers.has(key)) {
        playerStatus[key] = 'folded';
      } else if (isAllIn[key]) {
        playerStatus[key] = 'all-in';
      } else {
        playerStatus[key] = 'active';
      }
    });

    return playerStatus;
  }
}

// Re-exporta para manter compatibilidade
export { ReplayBuilder };