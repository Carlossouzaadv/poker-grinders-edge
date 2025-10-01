// Compatibilidade para o sistema existente - converte ReplayState em Snapshots
import { ReplayBuilder } from './replay-builder';
import { HandHistory, Snapshot, Pot } from '@/types/poker';
import { ReplayState, ReplayStep } from '@/types/replay';
import { normalizeKey, setNormalized, getNormalized, incrementNormalized } from './normalize-key';
import { HandParser } from './hand-parser';
import { isAnomalyFallbackAllowed } from '../config/sidepot-config';
import { AnomalyLogger } from './anomaly-logger';

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

    // Get stack before action (in cents)
    const stackBefore = getNormalized(snapshot.playerStacks, key) ||
      HandParser.convertValueWithContext(handHistory.players.find(p => normalizeKey(p.name) === key)?.stack || 0, handHistory.gameContext!);

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
   * Advanced side pot calculation with eligibility rules and detailed logging
   * @param totalCommittedMap - Map of player commitments in cents
   * @param playerStatusAtShowdown - Map of player statuses (folded, all-in, active)
   */
  private static async computeSidePots(
    totalCommittedMap: Record<string, number>,
    playerStatusAtShowdown: Record<string, 'folded' | 'all-in' | 'active'> = {}
  ): Promise<Array<{amount: number, eligible: string[], sourceLevel: number}>> {

    console.log('🔍 TOTAL_COMMITTED BEFORE POTS (cents):', totalCommittedMap);
    console.log('🔍 PLAYER_STATUS AT SHOWDOWN:', playerStatusAtShowdown);

    // Convert commitments to array and sort by contribution (ascending)
    const commitmentLevels = Object.entries(totalCommittedMap)
      .map(([player, committed]) => ({ player, committed }))
      .sort((a, b) => a.committed - b.committed);

    const pots: Array<{amount: number, eligible: string[], sourceLevel: number}> = [];
    let prev = 0;

    // Process each distinct commitment level
    for (let i = 0; i < commitmentLevels.length; i++) {
      const currentLevel = commitmentLevels[i].committed;

      // Skip duplicate levels
      if (currentLevel === prev) continue;

      const levelContribution = currentLevel - prev;
      if (levelContribution <= 0) {
        prev = currentLevel;
        continue;
      }

      // Determine eligible players for this pot level
      // Eligible = players who contributed >= currentLevel AND were not folded before showdown
      const eligible = commitmentLevels
        .filter(entry => entry.committed >= currentLevel)
        .filter(entry => {
          const status = playerStatusAtShowdown[entry.player];
          // Player is eligible if they were active, all-in, or status unknown (assume active)
          return !status || status === 'active' || status === 'all-in';
        })
        .map(entry => entry.player);

      // Calculate pot amount: level contribution × number of remaining players at this level
      const remainingPlayersCount = commitmentLevels.length - i;
      const potAmount = levelContribution * remainingPlayersCount;

      pots.push({
        amount: potAmount,
        eligible,
        sourceLevel: currentLevel
      });

      console.log(`🔍 POT LEVEL ${currentLevel} cents: amount=${potAmount}, eligible=[${eligible.join(', ')}], players_at_level=${remainingPlayersCount}`);

      prev = currentLevel;
    }

    // CRITICAL GUARD: Verify mathematical consistency
    const sumPots = pots.reduce((sum, pot) => sum + pot.amount, 0);
    const sumCommitted = Object.values(totalCommittedMap).reduce((sum, val) => sum + val, 0);

    console.log(`🔍 SUM_POTS = ${sumPots} cents — sum(totalCommitted) = ${sumCommitted} cents`);

    if (Math.abs(sumPots - sumCommitted) > 0) {
      console.error(`❌ CRITICAL MATHEMATICAL ERROR: SUM_POTS (${sumPots}) !== sum(totalCommitted) (${sumCommitted}), difference: ${sumPots - sumCommitted} cents`);
      console.error(`❌ DEBUG DUMP - totalCommittedMap:`, totalCommittedMap);
      console.error(`❌ DEBUG DUMP - computed pots:`, pots);
      console.error(`❌ DEBUG DUMP - commitmentLevels:`, commitmentLevels);

      // Log mathematical inconsistency
      const incidentId = await AnomalyLogger.logMathematicalInconsistency(
        sumCommitted,
        sumPots,
        'pot calculation',
        totalCommittedMap
      );

      throw new Error(`CRITICAL: Incident ${incidentId} - Mathematical inconsistency in pot calculation: ${sumPots} !== ${sumCommitted}`);
    }

    // GUARD: Ensure no empty eligible arrays (should not happen in normal operation)
    for (let i = 0; i < pots.length; i++) {
      if (pots[i].eligible.length === 0) {
        console.error(`❌ CRITICAL ANOMALY: POT ${i} has empty eligible array`);
        console.error(`❌ DEBUG DUMP - pot:`, pots[i]);
        console.error(`❌ DEBUG DUMP - totalCommittedMap:`, totalCommittedMap);
        console.error(`❌ DEBUG DUMP - playerStatusAtShowdown:`, playerStatusAtShowdown);

        // This indicates a serious bug in eligibility logic
        throw new Error(`CRITICAL ANOMALY: Pot ${i} at level ${pots[i].sourceLevel} has no eligible players - this should not happen`);
      }
    }

    console.log('🔍 COMPUTED POTS:', pots);
    return pots;
  }

  /**
   * Legacy side-pots function (for compatibility)
   */
  private static async calculateSidePots(
    playerContributions: Record<string, number>,
    foldedPlayers: Set<string>
  ): Promise<Pot[]> {
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

    const sidePots = await this.computeSidePots(activeContribs);

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
        console.warn('ReplayState is empty or has no steps');
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
      handHistory.players.forEach(player => {
        const key = normalizeKey(player.name);
        let adjustedStack = HandParser.convertValueWithContext(player.stack, handHistory.gameContext!);

        // Subtrair ante se houver
        if (handHistory.ante && handHistory.ante > 0) {
          adjustedStack -= HandParser.convertValueWithContext(handHistory.ante, handHistory.gameContext!);
        }

        // Subtrair blinds
        if (player.position === 'SB') {
          adjustedStack -= HandParser.convertValueWithContext(handHistory.smallBlind, handHistory.gameContext!);
        } else if (player.position === 'BB') {
          adjustedStack -= HandParser.convertValueWithContext(handHistory.bigBlind, handHistory.gameContext!);
        }

        // Atualizar stack (garantindo que não fique negativo)
        currentStacks[key] = Math.max(0, adjustedStack);
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

      // Adicionar snapshot inicial para mostrar as blinds
      const initialPendingContribs: Record<string, number> = {};

      // Blinds devem aparecer como pending contributions inicialmente (using game context)
      handHistory.players.forEach(player => {
        const normalizedKey = normalizeKey(player.name);
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

      // Inicializar pendingContribs com os blinds para os snapshots subsequentes
      Object.keys(initialPendingContribs).forEach(key => {
        pendingContribs[key] = initialPendingContribs[key];
      });

      const initialPots = await this.calculateSidePots(totalContribs, folded);
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
              const currentStack = getNormalized(currentStacks, playerKey) || 0;
              const newStack = Math.max(0, currentStack - amountCents);
              setNormalized(currentStacks, playerKey, newStack);
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

        // Calcular side-pots
        const pots = await this.calculateSidePots(totalContribs, folded);

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
          winners: currentStreet === 'showdown' ? handHistory.showdown?.winners : undefined,

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

        snapshots.push(snapshot);
      }

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

    // CRITICAL: Deduzir rake do total committed antes de calcular os pots
    const rakeCents = handHistory.rake ? HandParser.convertValueWithContext(handHistory.rake, handHistory.gameContext!) : 0;
    const totalCommittedAfterRake = { ...totalCommitted };

    if (rakeCents > 0) {
      console.log(`💰 RAKE DEDUCTION: ${rakeCents} cents from total pot`);

      // Deduzir rake proporcionalmente de todos os jogadores que contribuíram
      const totalCommittedSum = Object.values(totalCommitted).reduce((sum, val) => sum + val, 0);

      if (totalCommittedSum > 0) {
        Object.keys(totalCommittedAfterRake).forEach(player => {
          const playerContribution = totalCommitted[player];
          const playerRakeShare = Math.floor((playerContribution / totalCommittedSum) * rakeCents);
          totalCommittedAfterRake[player] = playerContribution - playerRakeShare;
          console.log(`  ${player}: ${playerContribution} - ${playerRakeShare} = ${totalCommittedAfterRake[player]}`);
        });
      }
    }

    // Use side pot calculation for deterministic payouts (after rake deduction)
    const pots = await this.computeSidePots(totalCommittedAfterRake, playerStatusAtShowdown);

    // CRITICAL GUARD: Verify mathematical consistency before distribution
    const sumPots = pots.reduce((sum, pot) => sum + pot.amount, 0);
    const sumCommittedAfterRakeCalc = Object.values(totalCommittedAfterRake).reduce((sum, val) => sum + val, 0);
    const sumCommittedOriginal = Object.values(totalCommitted).reduce((sum, val) => sum + val, 0);

    if (Math.abs(sumPots - sumCommittedAfterRakeCalc) > 0) {
      console.error(`❌ CRITICAL ERROR: SUM_POTS (${sumPots}) !== sum(totalCommittedAfterRake) (${sumCommittedAfterRakeCalc})`);
      console.error(`❌ DEBUG DUMP - totalCommitted:`, totalCommitted);
      console.error(`❌ DEBUG DUMP - totalCommittedAfterRake:`, totalCommittedAfterRake);
      console.error(`❌ DEBUG DUMP - computed pots:`, pots);
      throw new Error(`Mathematical inconsistency detected: ${sumPots} !== ${sumCommittedAfterRakeCalc}`);
    }

    console.log(`💰 POT VERIFICATION: Total committed = ${sumCommittedOriginal} cents, Rake = ${rakeCents} cents, Pots after rake = ${sumPots} cents`);

    const globalWinners = handHistory.showdown.winners.map(w => normalizeKey(w));
    console.log(`🔍 GLOBAL SHOWDOWN WINNERS: [${globalWinners.join(', ')}]`);

    // Distribute each pot following poker rules
    for (let index = 0; index < pots.length; index++) {
      const pot = pots[index];
      console.log(`🔍 PROCESSING POT ${index}: amount=${pot.amount} cents, eligible=[${pot.eligible.join(', ')}]`);

      if (pot.eligible.length === 1) {
        // POKER RULE: Single eligible player automatically wins the pot
        const soleWinner = pot.eligible[0];
        payouts[soleWinner] = (payouts[soleWinner] || 0) + pot.amount;
        console.log(`🏆 SINGLE-ELIGIBLE POT: POT ${index} (${pot.amount} cents) → ${soleWinner} (automatic win)`);

      } else if (pot.eligible.length > 1) {
        // POKER RULE: Determine winners ONLY among eligible players
        const eligibleWinners = this.determineWinnersAmongEligible(pot.eligible, globalWinners);

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

    // Verify mathematical consistency after distribution
    const sumPayouts = Object.values(payouts).reduce((sum, val) => sum + val, 0);
    console.log('🔍 PAYOUTS AFTER DISTR (cents):', payouts, `SUM_PAYOUTS = ${sumPayouts} cents`);
    console.log(`🔍 PAYOUT VERIFICATION: SUM_PAYOUTS = ${sumPayouts}, SUM_POTS = ${sumPots}`);

    if (Math.abs(sumPayouts - sumPots) > 0) {
      console.error(`❌ PAYOUT ERROR: SUM_PAYOUTS (${sumPayouts}) !== SUM_POTS (${sumPots}), difference: ${sumPayouts - sumPots} cents`);
      throw new Error(`Payout distribution error: ${sumPayouts} !== ${sumPots}`);
    }

    return payouts;
  }

  /**
   * Determine winners among eligible players only (poker rule)
   */
  private static determineWinnersAmongEligible(eligible: string[], globalWinners: string[]): string[] {
    const eligibleNormalized = eligible.map(p => normalizeKey(p));
    const globalWinnersNormalized = globalWinners.map(w => normalizeKey(w));

    // Find intersection: eligible players who also won at showdown
    const winnersAmongEligible = eligibleNormalized.filter(player =>
      globalWinnersNormalized.includes(player)
    );

    console.log(`🔍 ELIGIBLE: [${eligibleNormalized.join(', ')}] vs GLOBAL_WINNERS: [${globalWinnersNormalized.join(', ')}] → WINNERS_AMONG_ELIGIBLE: [${winnersAmongEligible.join(', ')}]`);

    return winnersAmongEligible;
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
        finalStackValue = HandParser.centsToDollars(expectedFinalCents); // Convert cents to dollars
      }
      finalStacks[key] = finalStackValue;

      // Log for reconciliation (context-aware display)
      const displayUnit = handHistory.gameContext!.isTournament ? 'chips' : 'dollars';
      const displayInitial = handHistory.gameContext!.isTournament ? initialStackCents : HandParser.centsToDollars(initialStackCents);
      const displayCommitted = handHistory.gameContext!.isTournament ? committedCents : HandParser.centsToDollars(committedCents);
      const displayPayout = handHistory.gameContext!.isTournament ? payoutCents : HandParser.centsToDollars(payoutCents);
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