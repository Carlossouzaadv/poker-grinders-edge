/**
 * DEFINITIVE Side Pot Calculator
 *
 * Calculates poker side pots with 100% mathematical correctness
 * for production use (2-10 players, multiple all-ins).
 *
 * ALGORITHM:
 * 1. Separate active (can win) vs folded (contribute but can't win) players
 * 2. Sort active players by contribution level (ascending)
 * 3. For each unique contribution level, create a pot:
 *    - Pot includes money from ALL players (active + folded) up to that level
 *    - Only active players with contribution >= level are eligible
 * 4. Validate: sum(pots) = sum(all contributions)
 */

import { CurrencyUtils } from '@/utils/currency-utils';
import { AnomalyLogger } from '../anomaly-logger';

export interface SidePot {
  amount: number;           // Pot size in cents
  eligible: string[];       // Players eligible to win (normalized keys)
  sourceLevel: number;      // Contribution level that created this pot
}

export interface PlayerStatus {
  player: string;           // Player key (normalized)
  committed: number;        // Total committed in cents
  status: 'folded' | 'all-in' | 'active';
}

/**
 * Input validation result
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class SidePotCalculator {
  /**
   * MAIN ENTRY POINT: Calculate side pots from player commitments
   *
   * @param totalCommittedMap - Map of player commitments in cents
   * @param playerStatusAtShowdown - Map of player statuses (folded, all-in, active)
   * @param rake - Rake amount in cents (deducted from total pot)
   * @returns Array of side pots with eligibility
   * @throws Error if mathematical consistency fails
   */
  static async calculate(
    totalCommittedMap: Record<string, number>,
    playerStatusAtShowdown: Record<string, 'folded' | 'all-in' | 'active'> = {},
    rake: number = 0
  ): Promise<SidePot[]> {

    const sumOriginalCommitted = Object.values(totalCommittedMap).reduce((sum, committed) => sum + committed, 0);
    console.log(`[SidePotCalculator.calculate] START - Original totalCommittedMap:`, totalCommittedMap, `Sum: ${sumOriginalCommitted}, Rake: ${rake}`);

    // STEP 1: Validate inputs
    const validation = this.validateInputs(totalCommittedMap, playerStatusAtShowdown);
    if (!validation.valid) {
      throw new Error(`Side pot calculation failed: ${validation.error}`);
    }

    // DEFENSIVE: Handle zero-commitment scenario (all players committed 0)
    const hasAnyCommitment = Object.values(totalCommittedMap).some(c => c > 0);
    if (!hasAnyCommitment) {
      console.log(`ℹ️ [SidePotCalculator] No commitments - returning single empty pot for active players`);
      // Return a single pot of 0 with all active players eligible
      const activePlayers = Object.keys(playerStatusAtShowdown).filter(
        p => playerStatusAtShowdown[p] !== 'folded'
      );
      return [{
        amount: 0,
        eligible: activePlayers,
        sourceLevel: 0
      }];
    }

    // STEP 2: Separate active and folded contributions
    const { activeContributions, foldedContributions } = this.separateContributions(
      totalCommittedMap,
      playerStatusAtShowdown
    );

    const sumActive = activeContributions.reduce((sum, p) => sum + p.committed, 0);
    const sumFolded = foldedContributions.reduce((sum, p) => sum + p.committed, 0);
    console.log(`[SidePotCalculator.calculate] After separateContributions - Active sum: ${sumActive}, Folded sum: ${sumFolded}, Total: ${sumActive + sumFolded}`);

    // EDGE CASE: No active players (all folded)
    if (activeContributions.length === 0) {
      console.warn('⚠️ No active players - all folded, returning empty pots');
      return [];
    }

    // EDGE CASE: Single active player (winner takes all)
    if (activeContributions.length === 1) {
      const singlePlayer = activeContributions[0];
      const totalPot = this.calculateTotalPot(totalCommittedMap);

      console.log(`✅ SINGLE ACTIVE PLAYER: ${singlePlayer.player} wins ${totalPot} cents`);

      return [{
        amount: totalPot,
        eligible: [singlePlayer.player],
        sourceLevel: singlePlayer.committed
      }];
    }

    // STEP 3: Sort active players by contribution (stable sort)
    const sortedActive = this.sortByContribution(activeContributions);

    // STEP 4: Build pots level by level
    const pots = this.buildPots(sortedActive, foldedContributions);

    const sumPotsBeforeRakeDeduction = pots.reduce((sum, pot) => sum + pot.amount, 0);
    console.log(`[SidePotCalculator.calculate] After buildPots (before rake deduction) - Pots:`, pots, `Sum: ${sumPotsBeforeRakeDeduction}`);

    // STEP 4.5: Deduct rake proportionally from pots
    if (rake > 0 && pots.length > 0) {
      const totalAmountInPotsBeforeRake = pots.reduce((sum, pot) => sum + pot.amount, 0);

      // Ensure we don't deduct more rake than available in pots
      const actualRakeToDeduct = Math.min(rake, totalAmountInPotsBeforeRake);

      if (actualRakeToDeduct > 0) {
        console.log(`💰 DEDUCTING RAKE: ${actualRakeToDeduct} cents from ${pots.length} pots (total before rake: ${totalAmountInPotsBeforeRake} cents)`);

        let remainingRakeToDeduct = actualRakeToDeduct;

        // Deduct rake proportionally from each pot
        for (let i = 0; i < pots.length; i++) {
          const pot = pots[i];
          if (pot.amount > 0) { // Only deduct from pots with actual money
            const potRakeShare = Math.floor((pot.amount / totalAmountInPotsBeforeRake) * actualRakeToDeduct);
            const amountBeforeRake = pot.amount;
            pot.amount -= potRakeShare;
            remainingRakeToDeduct -= potRakeShare;

            console.log(`  POT ${i}: ${amountBeforeRake} - ${potRakeShare} rake = ${pot.amount} cents`);
          }
        }

        // Distribute any remaining rake (due to Math.floor) to the last pot
        if (remainingRakeToDeduct > 0 && pots.length > 0) {
          const lastPot = pots[pots.length - 1];
          const finalDeduction = Math.min(remainingRakeToDeduct, lastPot.amount);
          lastPot.amount -= finalDeduction;

          console.log(`  REMAINDER: Deducting ${finalDeduction} cents from last pot (new amount: ${lastPot.amount} cents)`);

          // Ensure pot amount doesn't go negative
          if (lastPot.amount < 0) {
            lastPot.amount = 0;
          }
        }

        console.log(`✅ RAKE DEDUCTED: Total pots after rake = ${pots.reduce((sum, pot) => sum + pot.amount, 0)} cents`);
      }
    }

    const sumPotsAfterRakeDeduction = pots.reduce((sum, pot) => sum + pot.amount, 0);
    console.log(`[SidePotCalculator.calculate] After rake deduction - Pots:`, pots, `Sum: ${sumPotsAfterRakeDeduction}`);

    // STEP 5: CRITICAL - Validate mathematical consistency
    await this.validatePotMath(pots, totalCommittedMap, rake);

    console.log('🔍 SidePotCalculator.calculate() COMPLETE');
    console.log('  pots:', pots);

    return pots;
  }

  /**
   * VALIDATION: Ensure inputs are valid and consistent
   */
  private static validateInputs(
    totalCommittedMap: Record<string, number>,
    playerStatusAtShowdown: Record<string, 'folded' | 'all-in' | 'active'>
  ): ValidationResult {

    // Check for empty inputs
    if (!totalCommittedMap || Object.keys(totalCommittedMap).length === 0) {
      return { valid: false, error: 'totalCommittedMap is empty or undefined' };
    }

    // Validate all commitments are non-negative numbers
    for (const [player, committed] of Object.entries(totalCommittedMap)) {
      if (typeof committed !== 'number') {
        return { valid: false, error: `Player ${player} has non-numeric contribution: ${committed}` };
      }

      if (committed < 0) {
        return { valid: false, error: `Player ${player} has negative contribution: ${committed}` };
      }

      if (!Number.isFinite(committed)) {
        return { valid: false, error: `Player ${player} has invalid contribution: ${committed}` };
      }
    }

    // Validate playerStatus consistency (all players in commitments should have status)
    for (const player of Object.keys(totalCommittedMap)) {
      if (!playerStatusAtShowdown[player]) {
        // Default to 'active' if status not provided
        console.warn(`⚠️ Player ${player} missing status, defaulting to 'active'`);
        playerStatusAtShowdown[player] = 'active';
      }
    }

    // DEFENSIVE: Allow zero-commitment scenarios (e.g., everyone folded preflop)
    // We'll handle this gracefully by returning an empty pot array
    const hasAnyCommitment = Object.values(totalCommittedMap).some(c => c > 0);
    if (!hasAnyCommitment) {
      // This is valid - just means no pot to distribute
      console.log(`ℹ️ [SidePotCalculator] No commitments detected - will return empty pot`);
    }

    return { valid: true };
  }

  /**
   * Separate active players (can win) from folded players (contribute but can't win)
   */
  private static separateContributions(
    totalCommittedMap: Record<string, number>,
    playerStatusAtShowdown: Record<string, 'folded' | 'all-in' | 'active'>
  ): {
    activeContributions: Array<{ player: string; committed: number }>;
    foldedContributions: Array<{ player: string; committed: number }>;
  } {

    const activeContributions: Array<{ player: string; committed: number }> = [];
    const foldedContributions: Array<{ player: string; committed: number }> = [];

    for (const [player, committed] of Object.entries(totalCommittedMap)) {
      // Only include players who actually committed chips
      if (committed > 0) {
        const entry = { player, committed };

        if (playerStatusAtShowdown[player] === 'folded') {
          foldedContributions.push(entry);
        } else {
          activeContributions.push(entry);
        }
      }
    }

    return { activeContributions, foldedContributions };
  }

  /**
   * Sort contributions by amount (stable sort - maintains order for ties)
   */
  private static sortByContribution(
    contributions: Array<{ player: string; committed: number }>
  ): Array<{ player: string; committed: number }> {

    // Stable sort: players with same contribution maintain their original order
    return [...contributions].sort((a, b) => {
      if (a.committed === b.committed) {
        // Maintain alphabetical order for determinism
        return a.player.localeCompare(b.player);
      }
      return a.committed - b.committed;
    });
  }

  /**
   * Build pots level by level based on sorted active contributions
   * CRITICAL: Also handles folded players with contributions higher than active players
   */
  private static buildPots(
    sortedActive: Array<{ player: string; committed: number }>,
    foldedContributions: Array<{ player: string; committed: number }>
  ): SidePot[] {

    const sumSortedActive = sortedActive.reduce((sum, p) => sum + p.committed, 0);
    const sumFolded = foldedContributions.reduce((sum, p) => sum + p.committed, 0);
    console.log(`[SidePotCalculator.buildPots] START - Sorted Active sum: ${sumSortedActive}, Folded sum: ${sumFolded}, Total: ${sumSortedActive + sumFolded}`);

    const pots: SidePot[] = [];
    let lastProcessedLevel = 0;

    for (let i = 0; i < sortedActive.length; i++) {
      const capLevel = sortedActive[i].committed;

      // EDGE CASE: Skip duplicate contribution levels (same all-in amount)
      if (capLevel === lastProcessedLevel) {
        console.log(`   ⏭️  Skipping duplicate level ${capLevel} for ${sortedActive[i].player}`);
        continue;
      }

      // EDGE CASE: Skip zero contribution levels
      if (capLevel === 0) {
        console.log(`   ⏭️  Skipping zero contribution level for ${sortedActive[i].player}`);
        continue;
      }

      const levelContribution = capLevel - lastProcessedLevel;

      // Calculate pot: sum from ALL players (active + folded) at this level
      let potAmount = 0;

      // Add from active players who contributed >= capLevel
      for (const active of sortedActive) {
        if (active.committed >= capLevel) {
          potAmount += levelContribution;
        }
      }

      // Add from folded players (they contribute to pot but are not eligible)
      for (const folded of foldedContributions) {
        const foldedContribution = Math.min(
          levelContribution,
          Math.max(0, folded.committed - lastProcessedLevel)
        );
        potAmount += foldedContribution;
      }

      // Determine eligible players: active players who contributed >= capLevel
      const eligible = sortedActive
        .filter(entry => entry.committed >= capLevel)
        .map(entry => entry.player);

      // GUARD: Ensure pot has eligible players (should always be true for active player levels)
      if (eligible.length === 0) {
        console.error(`❌ CRITICAL BUG: Pot at level ${capLevel} has no eligible players`);
        console.error(`   sortedActive:`, sortedActive);
        console.error(`   i=${i}, capLevel=${capLevel}, lastProcessedLevel=${lastProcessedLevel}`);
        throw new Error(`CRITICAL BUG: Pot at level ${capLevel} has no eligible players`);
      }

      // GUARD: Ensure pot has positive amount
      if (potAmount <= 0) {
        console.error(`❌ CRITICAL BUG: Pot at level ${capLevel} has non-positive amount: ${potAmount}`);
        throw new Error(`CRITICAL BUG: Pot at level ${capLevel} has amount ${potAmount}`);
      }

      pots.push({
        amount: potAmount,
        eligible,
        sourceLevel: capLevel
      });

      console.log(`🔍 POT ${pots.length - 1}: Level ${lastProcessedLevel} → ${capLevel}`);
      console.log(`   Contribution per player: ${levelContribution}`);
      console.log(`   Total pot amount: ${potAmount} cents`);
      console.log(`   Eligible: [${eligible.join(', ')}]`);

      lastProcessedLevel = capLevel;
    }

    // CRITICAL FIX: Handle "dead money" from folded players with contributions > all active players
    // Example: player1=100, player2=200 (folded), player3=100 → player2's extra 100 must go somewhere
    // Solution: Add dead money to the LAST pot (highest level pot)
    if (pots.length > 0) {
      const maxActiveLevel = lastProcessedLevel;
      let deadMoney = 0;

      for (const folded of foldedContributions) {
        if (folded.committed > maxActiveLevel) {
          const excess = folded.committed - maxActiveLevel;
          deadMoney += excess;
          console.log(`   💀 DEAD MONEY from ${folded.player}: ${excess} cents (contributed ${folded.committed}, max active ${maxActiveLevel})`);
        }
      }

      if (deadMoney > 0) {
        pots[pots.length - 1].amount += deadMoney;
        console.log(`   ➕ Added ${deadMoney} cents dead money to POT ${pots.length - 1}`);
      }
    }

    const sumFinalPotsInBuildPots = pots.reduce((sum, pot) => sum + pot.amount, 0);
    console.log(`[SidePotCalculator.buildPots] END - Final Pots:`, pots, `Sum: ${sumFinalPotsInBuildPots}`);

    return pots;
  }

  /**
   * CRITICAL: Validate mathematical consistency
   * sum(pots) MUST equal sum(all contributions) - rake
   */
  private static async validatePotMath(
    pots: SidePot[],
    totalCommittedMap: Record<string, number>,
    rake: number
  ): Promise<void> {

    const sumPots = pots.reduce((sum, pot) => sum + pot.amount, 0);
    const sumCommitted = this.calculateTotalPot(totalCommittedMap);
    const expectedSum = sumCommitted - rake;

    console.log(`🔍 POT MATH VALIDATION: sum(pots)=${sumPots} vs sum(committed)=${sumCommitted} - rake=${rake} = expectedSum=${expectedSum}`);

    if (CurrencyUtils.hasDifference(sumPots, expectedSum)) {
      const difference = sumPots - expectedSum;

      console.error(`❌ MATHEMATICAL INCONSISTENCY DETECTED`);
      console.error(`   sum(pots) = ${sumPots} cents`);
      console.error(`   sum(committed) = ${sumCommitted} cents`);
      console.error(`   rake = ${rake} cents`);
      console.error(`   expected (committed - rake) = ${expectedSum} cents`);
      console.error(`   difference = ${difference} cents`);
      console.error(`   pots:`, pots);
      console.error(`   totalCommittedMap:`, totalCommittedMap);

      // Log to anomaly system
      const incidentId = await AnomalyLogger.logMathematicalInconsistency(
        expectedSum,
        sumPots,
        'side pot calculation',
        totalCommittedMap
      );

      throw new Error(
        `CRITICAL INCIDENT ${incidentId}: Mathematical inconsistency in side pots: ` +
        `sum(pots)=${sumPots} !== expected=${expectedSum} (committed=${sumCommitted} - rake=${rake}), diff=${difference} cents`
      );
    }

    console.log(`✅ POT MATH VALIDATED: ${sumPots} cents distributed correctly (after ${rake} cents rake)`);
  }

  /**
   * Calculate total pot from all contributions
   */
  private static calculateTotalPot(totalCommittedMap: Record<string, number>): number {
    return Object.values(totalCommittedMap).reduce((sum, val) => sum + val, 0);
  }
}
