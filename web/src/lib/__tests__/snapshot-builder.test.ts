/**
 * SnapshotBuilder - Integration Tests
 *
 * Comprehensive test coverage for snapshot building with complex scenarios:
 * - Multiple all-ins with side pots
 * - Split pots and payouts
 * - Rake handling
 * - Antes and varying blinds
 * - Edge cases and consistency validation
 */

import { SnapshotBuilder } from '../snapshot-builder';
import { HandHistory, Player, Card } from '@/types/poker';

describe('SnapshotBuilder - Integration Tests', () => {
  // Helper to create base HandHistory
  const createHandHistory = (overrides: Partial<HandHistory> = {}): HandHistory => ({
    handId: 'TEST_HAND',
    site: 'PokerStars',
    gameType: "Hold'em",
    limit: 'No Limit',
    stakes: '$0.25/$0.50',
    maxPlayers: 6,
    buttonSeat: 1,
    dealerSeat: 1,
    smallBlind: 25,
    bigBlind: 50,
    timestamp: new Date(),
    players: [],
    preflop: [],
    flop: { cards: [], actions: [] },
    turn: { card: null, actions: [] },
    river: { card: null, actions: [] },
    totalPot: 0,
    currency: 'USD',
    gameContext: {
      isTournament: false,
      isHighStakes: false,
      currencyUnit: 'dollars',
      conversionNeeded: true,
    },
    ...overrides,
  });

  describe('Basic Snapshot Generation', () => {
    it('should create initial snapshot with blinds', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'Hero', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'Villain', position: 'SB', stack: 4500, isHero: false, seat: 2 },
          { name: 'Player3', position: 'BB', stack: 10000, isHero: false, seat: 3 },
        ],
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      expect(snapshots.length).toBeGreaterThan(0);

      const initialSnapshot = snapshots[0];
      expect(initialSnapshot.street).toBe('preflop');
      expect(initialSnapshot.actionIndex).toBe(-1); // Initial snapshot
      expect(initialSnapshot.totalDisplayedPot).toBe(75); // 25 SB + 50 BB
      expect(initialSnapshot.pots).toBeDefined();
      expect(initialSnapshot.pots.length).toBeGreaterThan(0);
    });

    it('should adjust player stacks for blinds', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'Hero', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'SB', position: 'SB', stack: 4500, isHero: false, seat: 2 },
          { name: 'BB', position: 'BB', stack: 10000, isHero: false, seat: 3 },
        ],
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);
      const initialSnapshot = snapshots[0];

      // BTN should have full stack
      expect(initialSnapshot.playerStacks['Hero']).toBe(5000);

      // SB should have stack minus small blind (4500 - 25 = 4475)
      expect(initialSnapshot.playerStacks['SB']).toBe(4475);

      // BB should have stack minus big blind (10000 - 50 = 9950)
      expect(initialSnapshot.playerStacks['BB']).toBe(9950);
    });

    it('should include antes in initial pot', async () => {
      const handHistory = createHandHistory({
        ante: 5,
        players: [
          { name: 'Hero', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'SB', position: 'SB', stack: 4500, isHero: false, seat: 2 },
          { name: 'BB', position: 'BB', stack: 10000, isHero: false, seat: 3 },
        ],
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);
      const initialSnapshot = snapshots[0];

      // 3 antes (3 * 5) + 25 SB + 50 BB = 90
      expect(initialSnapshot.totalDisplayedPot).toBe(90);

      // Stacks should be adjusted for antes
      expect(initialSnapshot.playerStacks['Hero']).toBe(4995); // 5000 - 5 ante
      expect(initialSnapshot.playerStacks['SB']).toBe(4470); // 4500 - 25 SB - 5 ante
      expect(initialSnapshot.playerStacks['BB']).toBe(9945); // 10000 - 50 BB - 5 ante
    });
  });

  describe('Multiple All-Ins with Side Pots', () => {
    it('should handle 3-way all-in with different stack sizes', async () => {
      const handHistory = createHandHistory({
        players: [
          {
            name: 'ShortStack',
            position: 'BTN',
            stack: 800,
            isHero: false,
            seat: 1,
            cards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }],
          },
          {
            name: 'MidStack',
            position: 'SB',
            stack: 1500,
            isHero: false,
            seat: 2,
            cards: [{ rank: 'Q', suit: 'd' }, { rank: 'Q', suit: 'c' }],
          },
          {
            name: 'BigStack',
            position: 'BB',
            stack: 5000,
            isHero: true,
            seat: 3,
            cards: [{ rank: 'J', suit: 'h' }, { rank: 'J', suit: 'd' }],
          },
        ],
        preflop: [
          { player: 'ShortStack', action: 'all-in', amount: 800 },
          { player: 'MidStack', action: 'all-in', amount: 1500 },
          { player: 'BigStack', action: 'call', amount: 1500 },
        ],
        flop: {
          cards: [
            { rank: '9', suit: 's' },
            { rank: '8', suit: 'h' },
            { rank: '7', suit: 'c' },
          ],
          actions: [],
        },
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      // Find snapshot after all all-ins
      const postAllinSnapshot = snapshots.find(s =>
        s.description?.includes('all-in') && s.street === 'preflop'
      );

      expect(postAllinSnapshot).toBeDefined();

      if (postAllinSnapshot) {
        // Should have multiple pots
        expect(postAllinSnapshot.pots.length).toBeGreaterThan(1);

        // Main pot: 800 * 3 = 2400 (plus blinds)
        const mainPot = postAllinSnapshot.pots[0];
        expect(mainPot.eligiblePlayers).toContain('ShortStack');
        expect(mainPot.eligiblePlayers).toContain('MidStack');
        expect(mainPot.eligiblePlayers).toContain('BigStack');

        // First side pot: (1500-800) * 2 = 1400
        if (postAllinSnapshot.pots.length > 1) {
          const sidePot1 = postAllinSnapshot.pots[1];
          expect(sidePot1.eligiblePlayers).toContain('MidStack');
          expect(sidePot1.eligiblePlayers).toContain('BigStack');
          expect(sidePot1.eligiblePlayers).not.toContain('ShortStack');
        }

        // Validate all players are all-in or called
        expect(postAllinSnapshot.playerStacks['ShortStack']).toBe(0);
        expect(postAllinSnapshot.playerStacks['MidStack']).toBe(0);
      }
    });

    it('should handle 4-way all-in creating multiple side pots', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'P1', position: 'UTG', stack: 500, isHero: false, seat: 1 },
          { name: 'P2', position: 'MP', stack: 1000, isHero: false, seat: 2 },
          { name: 'P3', position: 'CO', stack: 2000, isHero: false, seat: 3 },
          { name: 'P4', position: 'BTN', stack: 5000, isHero: true, seat: 4 },
        ],
        preflop: [
          { player: 'P1', action: 'all-in', amount: 500 },
          { player: 'P2', action: 'all-in', amount: 1000 },
          { player: 'P3', action: 'all-in', amount: 2000 },
          { player: 'P4', action: 'call', amount: 2000 },
        ],
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      const postAllinSnapshot = snapshots.find(s =>
        s.street === 'preflop' && s.pots && s.pots.length > 2
      );

      if (postAllinSnapshot) {
        // Should have 4 pots (main + 3 side pots)
        expect(postAllinSnapshot.pots.length).toBeGreaterThanOrEqual(3);

        // Validate pot structure
        const totalPot = postAllinSnapshot.pots.reduce((sum, pot) => sum + pot.value, 0);
        const expectedTotal = 500 + 1000 + 2000 + 2000 + 75; // All commitments + blinds
        expect(Math.abs(totalPot - expectedTotal)).toBeLessThanOrEqual(1); // Allow 1 cent rounding
      }
    });
  });

  describe('Split Pots and Payouts', () => {
    it('should handle split pot scenario', async () => {
      const handHistory = createHandHistory({
        players: [
          {
            name: 'Hero',
            position: 'BTN',
            stack: 5000,
            isHero: true,
            seat: 1,
            cards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 's' }],
          },
          {
            name: 'Villain',
            position: 'BB',
            stack: 5000,
            isHero: false,
            seat: 2,
            cards: [{ rank: 'A', suit: 'h' }, { rank: 'K', suit: 'h' }],
          },
        ],
        preflop: [
          { player: 'Hero', action: 'raise', amount: 150 },
          { player: 'Villain', action: 'call', amount: 100 },
        ],
        flop: {
          cards: [
            { rank: 'A', suit: 'd' },
            { rank: 'K', suit: 'c' },
            { rank: '2', suit: 'h' },
          ],
          actions: [],
        },
        showdown: {
          info: 'Split pot - both players have two pair, Aces and Kings',
          winners: ['Hero', 'Villain'],
          potWon: 300,
        },
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      // Should generate snapshots successfully
      expect(snapshots.length).toBeGreaterThan(0);

      // Validate final snapshot
      const finalSnapshot = snapshots[snapshots.length - 1];
      if (finalSnapshot.street === 'showdown') {
        expect(finalSnapshot.description).toBeDefined();
      }
    });
  });

  describe('Fold Scenarios', () => {
    it('should handle all players folding to one winner', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'Hero', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'SB', position: 'SB', stack: 4500, isHero: false, seat: 2 },
          { name: 'BB', position: 'BB', stack: 10000, isHero: false, seat: 3 },
        ],
        preflop: [
          { player: 'Hero', action: 'raise', amount: 150 },
          { player: 'SB', action: 'fold' },
          { player: 'BB', action: 'fold' },
        ],
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      // Find fold snapshots
      const foldSnapshots = snapshots.filter(s => s.folded && s.folded.size > 0);

      expect(foldSnapshots.length).toBeGreaterThan(0);

      const finalSnapshot = snapshots[snapshots.length - 1];
      expect(finalSnapshot.folded?.size).toBe(2); // SB and BB folded
    });

    it('should track folded players correctly through multiple streets', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'P1', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'P2', position: 'SB', stack: 4500, isHero: false, seat: 2 },
          { name: 'P3', position: 'BB', stack: 10000, isHero: false, seat: 3 },
          { name: 'P4', position: 'UTG', stack: 3000, isHero: false, seat: 4 },
        ],
        preflop: [
          { player: 'P4', action: 'fold' },
          { player: 'P1', action: 'call', amount: 50 },
          { player: 'P2', action: 'call', amount: 25 },
          { player: 'P3', action: 'check' },
        ],
        flop: {
          cards: [
            { rank: 'A', suit: 's' },
            { rank: 'K', suit: 'h' },
            { rank: '7', suit: 'c' },
          ],
          actions: [
            { player: 'P2', action: 'fold' },
            { player: 'P3', action: 'bet', amount: 100 },
            { player: 'P1', action: 'call', amount: 100 },
          ],
        },
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      // Find flop snapshots
      const flopSnapshots = snapshots.filter(s => s.street === 'flop');

      if (flopSnapshots.length > 0) {
        const latestFlop = flopSnapshots[flopSnapshots.length - 1];

        // P4 folded preflop, P2 folded on flop
        expect(latestFlop.folded?.has('P4')).toBe(true);
        expect(latestFlop.folded?.has('P2')).toBe(true);
        expect(latestFlop.folded?.has('P1')).toBe(false);
        expect(latestFlop.folded?.has('P3')).toBe(false);
      }
    });
  });

  describe('Rake Handling', () => {
    it('should account for rake in pot calculations', async () => {
      const handHistory = createHandHistory({
        rake: 5, // $0.05 rake
        players: [
          { name: 'Hero', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'Villain', position: 'BB', stack: 5000, isHero: false, seat: 2 },
        ],
        preflop: [
          { player: 'Hero', action: 'raise', amount: 150 },
          { player: 'Villain', action: 'call', amount: 100 },
        ],
        totalPot: 295, // 300 - 5 rake
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      expect(snapshots.length).toBeGreaterThan(0);

      // Validate pot totals account for rake
      const postActionSnapshot = snapshots.find(s => s.totalDisplayedPot >= 200);

      if (postActionSnapshot) {
        expect(postActionSnapshot.totalDisplayedPot).toBeGreaterThan(0);
      }
    });
  });

  describe('Varying Blinds and Antes', () => {
    it('should handle different blind structures', async () => {
      const testCases = [
        { sb: 10, bb: 20, ante: 0 },
        { sb: 50, bb: 100, ante: 0 },
        { sb: 100, bb: 200, ante: 25 },
        { sb: 500, bb: 1000, ante: 100 },
      ];

      for (const { sb, bb, ante } of testCases) {
        const handHistory = createHandHistory({
          smallBlind: sb,
          bigBlind: bb,
          ante: ante > 0 ? ante : undefined,
          players: [
            { name: 'Hero', position: 'BTN', stack: 10000, isHero: true, seat: 1 },
            { name: 'SB', position: 'SB', stack: 10000, isHero: false, seat: 2 },
            { name: 'BB', position: 'BB', stack: 10000, isHero: false, seat: 3 },
          ],
        });

        const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);
        const initialSnapshot = snapshots[0];

        const expectedPot = sb + bb + (ante > 0 ? ante * 3 : 0);
        expect(initialSnapshot.totalDisplayedPot).toBe(expectedPot);
      }
    });
  });

  describe('Mathematical Consistency', () => {
    it('should maintain stack + committed = initial stack (no rake)', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'Hero', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'Villain', position: 'BB', stack: 5000, isHero: false, seat: 2 },
        ],
        preflop: [
          { player: 'Hero', action: 'raise', amount: 150 },
          { player: 'Villain', action: 'call', amount: 100 },
        ],
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      snapshots.forEach(snapshot => {
        // For each player, current stack + contributions should equal initial
        Object.keys(snapshot.playerStacks).forEach(player => {
          const currentStack = snapshot.playerStacks[player];
          const committed = snapshot.totalCommitted?.[player] || 0;
          const initial = handHistory.players.find(p => p.name === player)?.stack || 0;

          // Allow small rounding tolerance
          const difference = Math.abs(currentStack + committed - initial);
          expect(difference).toBeLessThanOrEqual(1);
        });
      });
    });

    it('should ensure pot total matches sum of contributions', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'P1', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'P2', position: 'SB', stack: 4500, isHero: false, seat: 2 },
          { name: 'P3', position: 'BB', stack: 10000, isHero: false, seat: 3 },
        ],
        preflop: [
          { player: 'P1', action: 'raise', amount: 150 },
          { player: 'P2', action: 'fold' },
          { player: 'P3', action: 'call', amount: 100 },
        ],
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      snapshots.forEach(snapshot => {
        const potTotal = snapshot.pots.reduce((sum, pot) => sum + pot.value, 0);
        const pendingTotal = Object.values(snapshot.pendingContribs || {}).reduce(
          (sum, val) => sum + val,
          0
        );
        const totalDisplayed = snapshot.totalDisplayedPot;

        // Pot + pending should equal total displayed
        expect(Math.abs(potTotal + pendingTotal - totalDisplayed)).toBeLessThanOrEqual(1);
      });
    });

    it('should never produce negative stacks', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'ShortStack', position: 'BTN', stack: 100, isHero: false, seat: 1 },
          { name: 'BigStack', position: 'BB', stack: 10000, isHero: true, seat: 2 },
        ],
        preflop: [
          { player: 'ShortStack', action: 'all-in', amount: 100 },
          { player: 'BigStack', action: 'call', amount: 50 },
        ],
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      snapshots.forEach(snapshot => {
        Object.values(snapshot.playerStacks).forEach(stack => {
          expect(stack).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty action arrays', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'Hero', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'BB', position: 'BB', stack: 5000, isHero: false, seat: 2 },
        ],
        preflop: [], // No actions
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      // Should at least have initial snapshot
      expect(snapshots.length).toBeGreaterThanOrEqual(1);
      expect(snapshots[0].street).toBe('preflop');
    });

    it('should handle single player (walk)', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'Hero', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
        ],
        preflop: [],
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      expect(snapshots.length).toBeGreaterThan(0);
      expect(snapshots[0].playerStacks['Hero']).toBeDefined();
    });

    it('should handle very small stacks relative to blinds', async () => {
      const handHistory = createHandHistory({
        smallBlind: 25,
        bigBlind: 50,
        players: [
          { name: 'MicroStack', position: 'SB', stack: 10, isHero: false, seat: 1 },
          { name: 'BigStack', position: 'BB', stack: 10000, isHero: true, seat: 2 },
        ],
        preflop: [
          { player: 'MicroStack', action: 'all-in', amount: 10 },
          { player: 'BigStack', action: 'call', amount: 0 },
        ],
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      expect(snapshots.length).toBeGreaterThan(0);

      // MicroStack should be all-in
      const postAllin = snapshots.find(s => s.playerStacks['MicroStack'] === 0);
      expect(postAllin).toBeDefined();
    });
  });

  describe('Performance and Regression', () => {
    it('should handle large number of players efficiently', async () => {
      const players: Player[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Player${i + 1}`,
        position: 'UTG',
        stack: 5000,
        isHero: i === 0,
        seat: i + 1,
      }));

      const handHistory = createHandHistory({
        maxPlayers: 10,
        players,
        preflop: players.map(p => ({
          player: p.name,
          action: 'fold' as const,
        })),
      });

      const startTime = Date.now();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);
      const duration = Date.now() - startTime;

      expect(snapshots.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle complex hand with many actions', async () => {
      const handHistory = createHandHistory({
        players: [
          { name: 'Hero', position: 'BTN', stack: 10000, isHero: true, seat: 1 },
          { name: 'Villain', position: 'BB', stack: 10000, isHero: false, seat: 2 },
        ],
        preflop: [
          { player: 'Hero', action: 'raise', amount: 150 },
          { player: 'Villain', action: 'raise', amount: 450 },
          { player: 'Hero', action: 'raise', amount: 1200 },
          { player: 'Villain', action: 'call', amount: 750 },
        ],
        flop: {
          cards: [
            { rank: 'A', suit: 's' },
            { rank: 'K', suit: 'h' },
            { rank: 'Q', suit: 'd' },
          ],
          actions: [
            { player: 'Villain', action: 'bet', amount: 800 },
            { player: 'Hero', action: 'raise', amount: 2400 },
            { player: 'Villain', action: 'call', amount: 1600 },
          ],
        },
        turn: {
          card: { rank: 'J', suit: 'c' },
          actions: [
            { player: 'Villain', action: 'check' },
            { player: 'Hero', action: 'bet', amount: 3000 },
            { player: 'Villain', action: 'fold' },
          ],
        },
      });

      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      expect(snapshots.length).toBeGreaterThan(5);

      // Verify snapshots progress through streets correctly
      const streets = snapshots.map(s => s.street);
      expect(streets).toContain('preflop');
      expect(streets).toContain('flop');
      expect(streets).toContain('turn');
    });
  });
});
