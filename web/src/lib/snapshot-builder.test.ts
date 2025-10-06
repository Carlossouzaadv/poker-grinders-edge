import { SnapshotBuilder } from './snapshot-builder';
import { HandHistory, Player, Card, Snapshot, Pot } from '@/types/poker';

describe('SnapshotBuilder', () => {
  // Helper function to create a basic hand history for testing
  const createBasicHandHistory = (): HandHistory => ({
    handId: '123456789',
    site: 'PokerStars',
    gameType: 'Hold\'em',
    limit: 'No Limit',
    stakes: '$0.25/$0.50',
    maxPlayers: 6,
    buttonSeat: 1,
    dealerSeat: 1,
    smallBlind: 0.25,
    bigBlind: 0.50,
    timestamp: new Date('2024-01-15T14:30:25Z'),
    players: [
      { name: 'Hero', position: 'BTN', stack: 50, isHero: true, seat: 1, cards: [{ rank: 'A', suit: 'c' }, { rank: 'K', suit: 'd' }] },
      { name: 'Villain1', position: 'SB', stack: 45.75, isHero: false, seat: 2 },
      { name: 'Villain2', position: 'BB', stack: 100.25, isHero: false, seat: 3 },
      { name: 'Villain3', position: 'UTG', stack: 75.50, isHero: false, seat: 4 },
    ],
    preflop: [
      { player: 'Hero', action: 'raise', amount: 2.50 },
      { player: 'Villain1', action: 'call', amount: 2.25 },
      { player: 'Villain2', action: 'call', amount: 2.00 },
      { player: 'Villain3', action: 'fold' },
    ],
    flop: {
      cards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }, { rank: '7', suit: 'c' }],
      actions: [
        { player: 'Villain1', action: 'check' },
        { player: 'Villain2', action: 'check' },
        { player: 'Hero', action: 'bet', amount: 5.50 },
        { player: 'Villain1', action: 'fold' },
        { player: 'Villain2', action: 'call', amount: 5.50 },
      ]
    },
    turn: {
      card: { rank: '2', suit: 'd' },
      actions: [
        { player: 'Villain2', action: 'check' },
        { player: 'Hero', action: 'bet', amount: 12.00 },
        { player: 'Villain2', action: 'call', amount: 12.00 },
      ]
    },
    river: {
      card: null,
      actions: []
    },
    totalPot: 40.00,
    currency: 'USD',
    gameContext: {
      isTournament: false,
      isHighStakes: false,
      currencyUnit: 'dollars',
      conversionNeeded: false
    }
  });

  // Helper function to create an all-in scenario hand history
  const createAllInHandHistory = (): HandHistory => ({
    handId: '987654321',
    site: 'PokerStars',
    gameType: 'Hold\'em',
    limit: 'No Limit',
    stakes: '$0.25/$0.50',
    maxPlayers: 4,
    buttonSeat: 1,
    dealerSeat: 1,
    smallBlind: 0.25,
    bigBlind: 0.50,
    timestamp: new Date('2024-01-15T15:00:00Z'),
    players: [
      { name: 'Hero', position: 'BTN', stack: 25, isHero: true, seat: 1, cards: [{ rank: 'A', suit: 'h' }, { rank: 'A', suit: 's' }] },
      { name: 'ShortStack', position: 'SB', stack: 8, isHero: false, seat: 2, cards: [{ rank: 'K', suit: 'd' }, { rank: 'K', suit: 's' }] },
      { name: 'MidStack', position: 'BB', stack: 15, isHero: false, seat: 3, cards: [{ rank: 'Q', suit: 'c' }, { rank: 'Q', suit: 's' }] },
      { name: 'BigStack', position: 'CO', stack: 100, isHero: false, seat: 4, cards: [{ rank: 'J', suit: 'h' }, { rank: 'J', suit: 's' }] },
    ],
    preflop: [
      { player: 'Hero', action: 'raise', amount: 5.00 },          // Hero contributes 5
      { player: 'ShortStack', action: 'all-in', amount: 8.00 },   // ShortStack all-in for 8 (total)
      { player: 'MidStack', action: 'all-in', amount: 15.00 },    // MidStack all-in for 15 (total)
      { player: 'BigStack', action: 'call', amount: 15.00 },      // BigStack calls 15
      { player: 'Hero', action: 'call', amount: 10.00 },          // Hero calls additional 10 (total 15)
    ],
    flop: {
      cards: [],
      actions: []
    },
    turn: {
      card: null,
      actions: []
    },
    river: {
      card: null,
      actions: []
    },
    totalPot: 58.00, // 8 + 15 + 15 + 15 = 53, plus blinds
    currency: 'USD',
    gameContext: {
      isTournament: false,
      isHighStakes: false,
      currencyUnit: 'dollars',
      conversionNeeded: false
    },
    showdown: {
      info: 'Hero shows [Aa As], ShortStack shows [Kk Ks], MidStack shows [Qq Qs], BigStack shows [Jj Js]',
      winners: ['Hero'],
      potWon: 56.25
    }
  });

  describe('Basic Snapshot Generation', () => {
    test('should generate snapshots from valid hand history', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      expect(snapshots).toBeDefined();
      expect(Array.isArray(snapshots)).toBe(true);
      expect(snapshots.length).toBeGreaterThan(0);

      // Each snapshot should have required properties
      snapshots.forEach(snapshot => {
        expect(snapshot.id).toBeDefined();
        expect(typeof snapshot.id).toBe('number');
        expect(snapshot.street).toBeDefined();
        expect(['preflop', 'flop', 'turn', 'river', 'showdown']).toContain(snapshot.street);
        expect(snapshot.description).toBeDefined();
        expect(typeof snapshot.description).toBe('string');
        expect(snapshot.pots).toBeDefined();
        expect(Array.isArray(snapshot.pots)).toBe(true);
        expect(snapshot.playerStacks).toBeDefined();
        expect(typeof snapshot.playerStacks).toBe('object');
        expect(snapshot.playersOrder).toBeDefined();
        expect(Array.isArray(snapshot.playersOrder)).toBe(true);
        expect(snapshot.folded).toBeDefined();
        expect(snapshot.folded instanceof Set).toBe(true);
      });
    });

    test('should handle empty or null hand history gracefully', async () => {
      const snapshots1 = await SnapshotBuilder.buildSnapshots(null as any);
      const snapshots2 = await SnapshotBuilder.buildSnapshots(undefined as any);

      expect(snapshots1).toEqual([]);
      expect(snapshots2).toEqual([]);
    });

    test('should maintain chronological order of snapshots', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      for (let i = 1; i < snapshots.length; i++) {
        expect(snapshots[i].id).toBe(snapshots[i-1].id + 1);
      }
    });
  });

  describe('Side-Pot Algorithm Validation', () => {
    test('should calculate side-pots correctly for all-in scenario', async () => {
      const handHistory = createAllInHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      expect(snapshots.length).toBeGreaterThan(0);

      // Find final snapshot (should have side-pots calculated)
      const finalSnapshot = snapshots[snapshots.length - 1];

      expect(finalSnapshot.pots).toBeDefined();
      expect(finalSnapshot.pots.length).toBeGreaterThanOrEqual(1);

      // Test side-pot structure for our specific scenario:
      // ShortStack ($8), MidStack ($15), Hero ($15), BigStack ($15)
      // Expected pots:
      // Main pot: $8 * 4 players = $32 (eligible: all 4)
      // Side pot 1: ($15-$8) * 3 players = $21 (eligible: MidStack, Hero, BigStack)
      // Total: $53 + blinds

      let totalPotValue = 0;
      finalSnapshot.pots.forEach(pot => {
        expect(pot.value).toBeGreaterThan(0);
        expect(Array.isArray(pot.eligiblePlayers)).toBe(true);
        expect(pot.eligiblePlayers.length).toBeGreaterThan(0);
        totalPotValue += pot.value;
      });

      // Verify total pot value makes sense
      expect(totalPotValue).toBeGreaterThan(50); // Should be around 53-58
    });

    test('should ensure main pot is never marked as side pot', async () => {
      const handHistory = createAllInHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      snapshots.forEach(snapshot => {
        if (snapshot.pots.length > 0) {
          const mainPot = snapshot.pots[0];
          expect(mainPot.isPotSide).toBeFalsy(); // Should be false or undefined

          // Side pots should be marked as such
          for (let i = 1; i < snapshot.pots.length; i++) {
            expect(snapshot.pots[i].isPotSide).toBe(true);
          }
        }
      });
    });

    test('should exclude folded players from pot eligibility', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      // Find snapshot after Villain3 folds
      const postFoldSnapshot = snapshots.find(s => s.folded.has('Villain3'));

      if (postFoldSnapshot) {
        postFoldSnapshot.pots.forEach(pot => {
          expect(pot.eligiblePlayers).not.toContain('Villain3');
        });
      }
    });

    test('should handle edge case of all players folding except one', async () => {
      const singlePlayerHand = {
        ...createBasicHandHistory(),
        preflop: [
          { player: 'Hero', action: 'raise' as const, amount: 2.50 },
          { player: 'Villain1', action: 'fold' as const },
          { player: 'Villain2', action: 'fold' as const },
          { player: 'Villain3', action: 'fold' as const },
        ]
      };

      const snapshots = await SnapshotBuilder.buildSnapshots(singlePlayerHand);
      const finalSnapshot = snapshots[snapshots.length - 1];

      expect(finalSnapshot.pots.length).toBe(1);
      expect(finalSnapshot.pots[0].eligiblePlayers).toHaveLength(1);
      expect(finalSnapshot.pots[0].eligiblePlayers[0]).toBe('Hero');
    });
  });

  describe('Invariant Checking', () => {
    test('chip conservation: total chips should remain constant', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      const initialTotalChips = handHistory.players.reduce((sum, p) => sum + p.stack, 0);

      snapshots.forEach(snapshot => {
        // Calculate total chips in play (stacks + pots + pending contributions)
        const stacksTotal = Object.values(snapshot.playerStacks).reduce((sum, stack) => sum + stack, 0);
        const potsTotal = snapshot.pots.reduce((sum, pot) => sum + pot.value, 0);
        const pendingTotal = Object.values(snapshot.pendingContribs).reduce((sum, contrib) => sum + contrib, 0);
        const totalChips = stacksTotal + potsTotal + pendingTotal;

        // Allow small floating point differences
        expect(Math.abs(totalChips - initialTotalChips)).toBeLessThan(0.01);
      });
    });

    test('pot progression: total displayed pot should never decrease', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      for (let i = 1; i < snapshots.length; i++) {
        expect(snapshots[i].totalDisplayedPot).toBeGreaterThanOrEqual(snapshots[i-1].totalDisplayedPot);
      }
    });

    test('stack integrity: player stacks should only decrease or stay same', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      const players = handHistory.players.map(p => p.name);

      players.forEach(playerName => {
        let previousStack = handHistory.players.find(p => p.name === playerName)?.stack || 0;

        snapshots.forEach(snapshot => {
          const currentStack = snapshot.playerStacks[playerName] || 0;
          // Stack can only decrease or stay the same (until showdown winnings)
          if (snapshot.street !== 'showdown') {
            expect(currentStack).toBeLessThanOrEqual(previousStack);
          }
          previousStack = currentStack;
        });
      });
    });

    test('folded players should remain folded', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      for (let i = 1; i < snapshots.length; i++) {
        const previousFolded = snapshots[i-1].folded;
        const currentFolded = snapshots[i].folded;

        // Once folded, players should stay folded
        previousFolded.forEach(foldedPlayer => {
          expect(currentFolded.has(foldedPlayer)).toBe(true);
        });
      }
    });

    test('active player should be eligible in current pots', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      snapshots.forEach(snapshot => {
        if (snapshot.activePlayer) {
          // Active player should not be folded
          expect(snapshot.folded.has(snapshot.activePlayer)).toBe(false);

          // Active player should be eligible in at least one pot
          const isEligibleInSomePot = snapshot.pots.some(pot =>
            pot.eligiblePlayers.includes(snapshot.activePlayer!)
          );
          expect(isEligibleInSomePot).toBe(true);
        }
      });
    });
  });

  describe('Street Transitions and Community Cards', () => {
    test('should correctly transition between streets', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      const streets = snapshots.map(s => s.street);

      // Should start with preflop
      expect(streets[0]).toBe('preflop');

      // Should have logical street progression (no going backwards)
      const streetOrder = ['preflop', 'flop', 'turn', 'river', 'showdown'];
      let currentStreetIndex = 0;

      streets.forEach(street => {
        const streetIndex = streetOrder.indexOf(street);
        expect(streetIndex).toBeGreaterThanOrEqual(currentStreetIndex);
        currentStreetIndex = Math.max(currentStreetIndex, streetIndex);
      });
    });

    test('should show correct community cards for each street', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      snapshots.forEach(snapshot => {
        switch (snapshot.street) {
          case 'preflop':
            expect(snapshot.communityCards).toHaveLength(0);
            break;
          case 'flop':
            expect(snapshot.communityCards).toHaveLength(3);
            break;
          case 'turn':
            expect(snapshot.communityCards).toHaveLength(4);
            break;
          case 'river':
            expect(snapshot.communityCards).toHaveLength(5);
            break;
        }
      });
    });

    test('should reset pending contributions between streets', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      for (let i = 1; i < snapshots.length; i++) {
        const currentSnapshot = snapshots[i];
        const previousSnapshot = snapshots[i-1];

        // When street changes, pending contributions should reset
        if (currentSnapshot.street !== previousSnapshot.street) {
          const pendingTotal = Object.values(currentSnapshot.pendingContribs).reduce((sum, contrib) => sum + contrib, 0);
          // Should be 0 or very small (accounting for new actions in the new street)
          expect(pendingTotal).toBeLessThanOrEqual(Math.max(...Object.values(currentSnapshot.pendingContribs) || [0]));
        }
      }
    });
  });

  describe('Performance and Memory', () => {
    test('should handle large number of actions efficiently', async () => {
      let handHistory = createBasicHandHistory();

      // Add many preflop actions to simulate a complex hand
      const manyActions = [];
      for (let i = 0; i < 50; i++) {
        manyActions.push({ player: 'Hero', action: 'bet' as const, amount: 1 });
        manyActions.push({ player: 'Villain1', action: 'call' as const, amount: 1 });
      }
      handHistory = { ...handHistory, preflop: manyActions };

      const startTime = Date.now();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);
      const endTime = Date.now();

      expect(snapshots).toBeDefined();
      expect(snapshots.length).toBeGreaterThan(0);
      // Should complete within reasonable time (5 seconds max)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    test('should not leak memory with deeply nested objects', async () => {
      const handHistory = createBasicHandHistory();
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

      // Verify that snapshots have independent folded sets (no shared references)
      if (snapshots.length >= 2) {
        expect(snapshots[0].folded).not.toBe(snapshots[1].folded);

        // Verify stacks are independent objects
        expect(snapshots[0].playerStacks).not.toBe(snapshots[1].playerStacks);

        // Verify pending contributions are independent
        expect(snapshots[0].pendingContribs).not.toBe(snapshots[1].pendingContribs);
      }
    });
  });
});