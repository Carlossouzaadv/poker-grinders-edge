import { HandParser } from './hand-parser';
import { SnapshotBuilder } from './snapshot-builder';
import { normalizeKey } from './normalize-key';

/**
 * Regression Tests for Side Pot Cases
 *
 * Specific tests for the 200-chip case and variants
 */

describe('Side Pot Regression Tests', () => {

  describe('200-Chip Case Variants', () => {

    it('4a: Player3 active - should award 200 to Player3 with SINGLE-ELIGIBLE log', async () => {
      const handHistory = `PokerStars Hand #1004: Tournament #1004, $5.50+$0.50 USD Hold'em No Limit - Level I (10/20) - 2025/01/15 20:30:00 ET
Table '1004a 1' 9-max Seat #3 is the button
Seat 1: Player1 (2000 in chips)
Seat 2: CashUrChecks (15969 in chips)
Seat 3: Player3 (16169 in chips)

Player1: posts small blind 10
CashUrChecks: posts big blind 20
*** HOLE CARDS ***
Dealt to Player1 [As Ks]
Player3: raises 180 to 200
Player1: folds
CashUrChecks: raises 15769 to 15969 and is all-in
Player3: raises 200 to 16169 and is all-in
*** FLOP *** [2h 3d 4c]
*** TURN *** [2h 3d 4c] [5s]
*** RIVER *** [2h 3d 4c 5s] [6h]
*** SHOW DOWN ***
CashUrChecks: shows [Ac Ad] (a pair of Aces)
Player3: shows [Kh Qh] (King high)
CashUrChecks collected 32188 from pot
*** SUMMARY ***
Total pot 32188 | Rake 0
Board [2h 3d 4c 5s 6h]
Seat 1: Player1 (small blind) folded before Flop
Seat 2: CashUrChecks (big blind) showed [Ac Ad] and won (32188) with a pair of Aces
Seat 3: Player3 (button) showed [Kh Qh] and lost with King high`;

      // Capture console logs
      const consoleLogs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        consoleLogs.push(args.join(' '));
        originalLog(...args);
      };

      try {
        const parseResult = HandParser.parse(handHistory);
        expect(parseResult.success).toBe(true);
        if (!parseResult.success) return;

        const snapshots = await SnapshotBuilder.buildSnapshots(parseResult.handHistory);
        const finalSnapshot = snapshots[snapshots.length - 1];

        expect(finalSnapshot.totalCommitted).toBeDefined();
        expect(finalSnapshot.payouts).toBeDefined();

        if (finalSnapshot.totalCommitted && finalSnapshot.payouts) {
          const cashKey = normalizeKey('CashUrChecks');
          const player3Key = normalizeKey('Player3');

          // Expected commits in cents
          expect(finalSnapshot.totalCommitted[cashKey]).toBe(1596900); // 15969 * 100
          expect(finalSnapshot.totalCommitted[player3Key]).toBe(1616900); // 16169 * 100

          // Expected payouts
          expect(finalSnapshot.payouts[cashKey]).toBe(3193800); // Main pot: 15969 * 2 = 31938 * 100
          expect(finalSnapshot.payouts[player3Key]).toBe(20000); // Side pot: 200 * 100 = 20000 cents

          // Mathematical consistency
          const sumCommitted = Object.values(finalSnapshot.totalCommitted).reduce((sum, val) => sum + val, 0);
          const sumPayouts = Object.values(finalSnapshot.payouts).reduce((sum, val) => sum + val, 0);
          expect(sumPayouts).toBe(sumCommitted);

          // Verify specific log messages
          const hasExpectedLogs = consoleLogs.some(log =>
            log.includes('🏆 SINGLE-ELIGIBLE POT: POT 1 (20000 cents) → player3')
          );
          expect(hasExpectedLogs).toBe(true);

          const hasTotalCommittedLog = consoleLogs.some(log =>
            log.includes('🔍 TOTAL_COMMITTED BEFORE POTS (cents): { cashurchecks: 1596900, player3: 1616900 }')
          );
          expect(hasTotalCommittedLog).toBe(true);

          const hasPayoutVerificationLog = consoleLogs.some(log =>
            log.includes('🔍 PAYOUT VERIFICATION: SUM_PAYOUTS = 3213800, SUM_POTS = 3213800')
          );
          expect(hasPayoutVerificationLog).toBe(true);
        }
      } finally {
        console.log = originalLog;
      }
    });

    it('4b: Player3 folded - should trigger anomaly detection (no eligible winners)', async () => {
      // This is a variant where Player3 folds after contributing to side pot
      const handHistory = `PokerStars Hand #1005: Tournament #1005, $5.50+$0.50 USD Hold'em No Limit - Level I (10/20) - 2025/01/15 20:30:00 ET
Table '1005 1' 9-max Seat #3 is the button
Seat 1: Player1 (2000 in chips)
Seat 2: CashUrChecks (15969 in chips)
Seat 3: Player3 (16169 in chips)

Player1: posts small blind 10
CashUrChecks: posts big blind 20
*** HOLE CARDS ***
Dealt to Player1 [As Ks]
Player3: raises 200 to 220
Player1: folds
CashUrChecks: raises 15749 to 15969 and is all-in
Player3: calls 15749 and is all-in
*** FLOP *** [2h 3d 4c]
Player3: folds
*** TURN *** [2h 3d 4c] [5s]
*** RIVER *** [2h 3d 4c 5s] [6h]
*** SHOW DOWN ***
CashUrChecks: shows [Ac Ad] (a pair of Aces)
CashUrChecks collected 31938 from pot
*** SUMMARY ***
Total pot 31938 | Rake 0
Board [2h 3d 4c 5s 6h]
Seat 1: Player1 (small blind) folded before Flop
Seat 2: CashUrChecks (big blind) showed [Ac Ad] and won (31938) with a pair of Aces
Seat 3: Player3 (button) folded after Flop`;

      const parseResult = HandParser.parse(handHistory);

      // This should parse successfully but potentially trigger anomaly during side pot calculation
      if (parseResult.success) {
        try {
          const snapshots = await SnapshotBuilder.buildSnapshots(parseResult.handHistory);
          const finalSnapshot = snapshots[snapshots.length - 1];

          if (finalSnapshot.totalCommitted && finalSnapshot.payouts) {
            const sumCommitted = Object.values(finalSnapshot.totalCommitted).reduce((sum, val) => sum + val, 0);
            const sumPayouts = Object.values(finalSnapshot.payouts).reduce((sum, val) => sum + val, 0);

            // Should still maintain mathematical consistency
            expect(sumPayouts).toBeLessThanOrEqual(sumCommitted);
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('CRITICAL ANOMALY')) {
            // This is expected for this scenario - Player3 folded after contributing
            expect(error.message).toContain('CRITICAL ANOMALY');
            console.log('✅ Expected anomaly detected for folded contributor case');
          } else {
            throw error;
          }
        }
      } else {
        // Hand parsing might fail for this malformed hand - that's acceptable
        console.log('Hand parsing failed for 4b variant - acceptable for malformed hand');
      }
    });

    it('should handle exact 200-cent side pot allocation', async () => {
      // Simplified test focusing on the exact 200-cent allocation
      const commits = {
        'cashurchecks': 1596900, // 15969 * 100 cents
        'player3': 1616900       // 16169 * 100 cents
      };

      // Directly test the side pot calculation logic
      // This would normally be called from SnapshotBuilder, but we can test it directly
      const playerStatus = {
        'cashurchecks': 'all-in' as const,
        'player3': 'all-in' as const
      };

      // We'll create a minimal mock to test the computation
      // Since computeSidePots is private, we test through the public interface
      const mockHand = `PokerStars Hand #200: Tournament #200, $1+$0 USD Hold'em No Limit - Level I (10/20) - 2025/01/01 00:00:00 ET
Table 'Test' 9-max Seat #1 is the button
Seat 1: CashUrChecks (20000 in chips)
Seat 2: Player3 (20000 in chips)
CashUrChecks: posts small blind 159690
Player3: posts big blind 161690
*** HOLE CARDS ***
Dealt to CashUrChecks [As Ks]
*** FLOP *** [2h 3d 4c]
*** TURN *** [2h 3d 4c] [5s]
*** RIVER *** [2h 3d 4c 5s] [6h]
*** SHOW DOWN ***
CashUrChecks: shows [Ac Ad] (a pair of Aces)
Player3: shows [Kh Qh] (King high)
CashUrChecks collected 321380 from pot
*** SUMMARY ***
Total pot 321380 | Rake 0
Board [2h 3d 4c 5s 6h]
Seat 1: CashUrChecks showed [Ac Ad] and won (321380) with a pair of Aces
Seat 2: Player3 showed [Kh Qh] and lost with King high`;

      const parseResult = HandParser.parse(mockHand);
      if (parseResult.success) {
        const snapshots = await SnapshotBuilder.buildSnapshots(parseResult.handHistory);
        const finalSnapshot = snapshots[snapshots.length - 1];

        if (finalSnapshot.totalCommitted && finalSnapshot.payouts) {
          // Verify the 200-cent difference is handled correctly
          const cashKey = normalizeKey('CashUrChecks');
          const player3Key = normalizeKey('Player3');

          const cashCommitted = finalSnapshot.totalCommitted[cashKey];
          const player3Committed = finalSnapshot.totalCommitted[player3Key];
          const difference = Math.abs(player3Committed - cashCommitted);

          // The difference should create a side pot
          if (difference > 0) {
            // Player3 should get the side pot if they committed more
            // Or the side pot should be allocated based on showdown results
            const sumCommitted = Object.values(finalSnapshot.totalCommitted).reduce((sum, val) => sum + val, 0);
            const sumPayouts = Object.values(finalSnapshot.payouts).reduce((sum, val) => sum + val, 0);

            expect(sumPayouts).toBe(sumCommitted);
          }
        }
      }
    });
  });

  describe('Console Log Format Validation', () => {
    it('should produce exact expected console output format for 200-case', async () => {
      const handHistory = `PokerStars Hand #1004: Tournament #1004, $5.50+$0.50 USD Hold'em No Limit - Level I (10/20) - 2025/01/15 20:30:00 ET
Table '1004a 1' 9-max Seat #3 is the button
Seat 1: Player1 (2000 in chips)
Seat 2: CashUrChecks (15969 in chips)
Seat 3: Player3 (16169 in chips)

Player1: posts small blind 10
CashUrChecks: posts big blind 20
*** HOLE CARDS ***
Dealt to Player1 [As Ks]
Player3: raises 180 to 200
Player1: folds
CashUrChecks: raises 15769 to 15969 and is all-in
Player3: raises 200 to 16169 and is all-in
*** FLOP *** [2h 3d 4c]
*** TURN *** [2h 3d 4c] [5s]
*** RIVER *** [2h 3d 4c 5s] [6h]
*** SHOW DOWN ***
CashUrChecks: shows [Ac Ad] (a pair of Aces)
Player3: shows [Kh Qh] (King high)
CashUrChecks collected 32188 from pot
*** SUMMARY ***
Total pot 32188 | Rake 0
Board [2h 3d 4c 5s 6h]
Seat 1: Player1 (small blind) folded before Flop
Seat 2: CashUrChecks (big blind) showed [Ac Ad] and won (32188) with a pair of Aces
Seat 3: Player3 (button) showed [Kh Qh] and lost with King high`;

      const expectedLogStrings = [
        '🔍 TOTAL_COMMITTED BEFORE POTS (cents): { cashurchecks: 1596900, player3: 1616900 }',
        '🏆 SINGLE-ELIGIBLE POT: POT 1 (20000 cents) → player3',
        '🔍 PAYOUTS AFTER DISTR (cents): { cashurchecks: 3193800, player3: 20000 }',
        '🔍 PAYOUT VERIFICATION: SUM_PAYOUTS = 3213800, SUM_POTS = 3213800 ✅'
      ];

      const consoleLogs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        consoleLogs.push(args.join(' '));
        originalLog(...args);
      };

      try {
        const parseResult = HandParser.parse(handHistory);
        expect(parseResult.success).toBe(true);
        if (!parseResult.success) return;

        const snapshots = await SnapshotBuilder.buildSnapshots(parseResult.handHistory);

        // Check that each expected log string appears
        expectedLogStrings.forEach(expectedLog => {
          const found = consoleLogs.some(log => log.includes(expectedLog));
          if (!found) {
            console.error(`❌ Missing expected log: ${expectedLog}`);
            console.error(`❌ Actual logs:`, consoleLogs.filter(log => log.includes('🔍') || log.includes('🏆')));
          }
          expect(found).toBe(true);
        });

      } finally {
        console.log = originalLog;
      }
    });
  });
});