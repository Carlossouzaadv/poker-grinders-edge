/**
 * DataValidator - Unit Tests
 *
 * Comprehensive test coverage for validation utilities.
 * Tests HandHistory validation, Snapshot validation, and all edge cases.
 */

import { DataValidator } from '../validation';
import { HandHistory, Snapshot, Player, Card, GameContext } from '@/types/poker';
import { ErrorCode, ErrorSeverity } from '@/types/errors';

describe('DataValidator', () => {
  // Helper to create valid HandHistory
  const createValidHandHistory = (overrides: Partial<HandHistory> = {}): HandHistory => ({
    handId: 'HH123456',
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
    players: [
      { name: 'Hero', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
      { name: 'Villain', position: 'SB', stack: 4500, isHero: false, seat: 2 },
    ],
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

  // Helper to create valid Snapshot
  const createValidSnapshot = (overrides: Partial<Snapshot> = {}): Snapshot => ({
    id: 0,
    street: 'preflop',
    actionIndex: 0,
    description: 'Hand starts',
    pots: [{ value: 75, eligiblePlayers: ['Hero', 'Villain'], isPotSide: false }],
    collectedPot: 0,
    pendingContribs: {},
    totalDisplayedPot: 75,
    playerStacks: { Hero: 5000, Villain: 4500 },
    playersOrder: ['Hero', 'Villain'],
    folded: new Set(),
    communityCards: [],
    ...overrides,
  });

  describe('validateHandHistory', () => {
    describe('Required field validation', () => {
      it('should validate a complete valid HandHistory', () => {
        const handHistory = createValidHandHistory();
        const errors = DataValidator.validateHandHistory(handHistory);
        expect(errors).toHaveLength(0);
      });

      it('should reject empty handId', () => {
        const handHistory = createValidHandHistory({ handId: '' });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.code === ErrorCode.VALIDATION_MISSING_REQUIRED)).toBe(true);
        expect(errors.some(e => e.message.includes('handId'))).toBe(true);
      });

      it('should reject missing gameContext', () => {
        const handHistory = createValidHandHistory({ gameContext: undefined as any });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.code === ErrorCode.VALIDATION_MISSING_REQUIRED)).toBe(true);
        expect(errors.some(e => e.severity === ErrorSeverity.CRITICAL)).toBe(true);
      });

      it('should reject empty players array', () => {
        const handHistory = createValidHandHistory({ players: [] });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.message.includes('at least one player'))).toBe(true);
      });
    });

    describe('Street validation', () => {
      it('should reject invalid preflop structure', () => {
        const handHistory = createValidHandHistory({ preflop: undefined as any });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.message.includes('preflop'))).toBe(true);
      });

      it('should reject invalid flop structure', () => {
        const handHistory = createValidHandHistory({ flop: undefined as any });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.message.includes('flop'))).toBe(true);
      });

      it('should accept empty streets (no actions)', () => {
        const handHistory = createValidHandHistory({
          preflop: [],
          flop: { cards: [], actions: [] },
          turn: { card: null, actions: [] },
          river: { card: null, actions: [] },
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Monetary value validation', () => {
      it('should reject negative smallBlind', () => {
        const handHistory = createValidHandHistory({ smallBlind: -25 });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.code === ErrorCode.MATH_NEGATIVE_VALUE)).toBe(true);
        expect(errors.some(e => e.message.includes('smallBlind'))).toBe(true);
      });

      it('should reject negative bigBlind', () => {
        const handHistory = createValidHandHistory({ bigBlind: -50 });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.code === ErrorCode.MATH_NEGATIVE_VALUE)).toBe(true);
      });

      it('should reject negative totalPot', () => {
        const handHistory = createValidHandHistory({ totalPot: -100 });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.code === ErrorCode.MATH_NEGATIVE_VALUE)).toBe(true);
      });

      it('should accept zero values', () => {
        const handHistory = createValidHandHistory({
          smallBlind: 0,
          bigBlind: 0,
          totalPot: 0,
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        // Should not have negative value errors
        expect(errors.every(e => e.code !== ErrorCode.MATH_NEGATIVE_VALUE)).toBe(true);
      });
    });

    describe('GameContext validation', () => {
      it('should accept valid tournament context', () => {
        const handHistory = createValidHandHistory({
          gameContext: {
            isTournament: true,
            isHighStakes: false,
            currencyUnit: 'chips',
            conversionNeeded: false,
          },
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.every(e => e.severity !== ErrorSeverity.ERROR)).toBe(true);
      });

      it('should accept valid cash game context', () => {
        const handHistory = createValidHandHistory({
          gameContext: {
            isTournament: false,
            isHighStakes: false,
            currencyUnit: 'dollars',
            conversionNeeded: true,
          },
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors).toHaveLength(0);
      });

      it('should warn on tournament with dollars', () => {
        const handHistory = createValidHandHistory({
          gameContext: {
            isTournament: true,
            isHighStakes: false,
            currencyUnit: 'dollars',
            conversionNeeded: false,
          },
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.some(e => e.severity === ErrorSeverity.WARNING)).toBe(true);
        expect(errors.some(e => e.message.includes('Tournament'))).toBe(true);
      });

      it('should warn on cash game with chips', () => {
        const handHistory = createValidHandHistory({
          gameContext: {
            isTournament: false,
            isHighStakes: false,
            currencyUnit: 'chips',
            conversionNeeded: true,
          },
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.some(e => e.severity === ErrorSeverity.WARNING)).toBe(true);
      });
    });

    describe('Player validation', () => {
      it('should validate all players', () => {
        const players: Player[] = [
          { name: 'Hero', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'Villain1', position: 'SB', stack: 4500, isHero: false, seat: 2 },
          { name: 'Villain2', position: 'BB', stack: 10000, isHero: false, seat: 3 },
        ];
        const handHistory = createValidHandHistory({ players });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors).toHaveLength(0);
      });

      it('should reject player with no name', () => {
        const players: Player[] = [
          { name: '', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
        ];
        const handHistory = createValidHandHistory({ players });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.message.includes('has no name'))).toBe(true);
      });

      it('should reject player with negative stack', () => {
        const players: Player[] = [
          { name: 'Hero', position: 'BTN', stack: -100, isHero: true, seat: 1 },
        ];
        const handHistory = createValidHandHistory({ players });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.code === ErrorCode.MATH_NEGATIVE_VALUE)).toBe(true);
      });

      it('should warn when no hero is marked', () => {
        const players: Player[] = [
          { name: 'Player1', position: 'BTN', stack: 5000, isHero: false, seat: 1 },
          { name: 'Player2', position: 'SB', stack: 4500, isHero: false, seat: 2 },
        ];
        const handHistory = createValidHandHistory({ players });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.some(e => e.message.includes('hero'))).toBe(true);
        expect(errors.some(e => e.severity === ErrorSeverity.WARNING)).toBe(true);
      });

      it('should warn when multiple heroes are marked', () => {
        const players: Player[] = [
          { name: 'Hero1', position: 'BTN', stack: 5000, isHero: true, seat: 1 },
          { name: 'Hero2', position: 'SB', stack: 4500, isHero: true, seat: 2 },
        ];
        const handHistory = createValidHandHistory({ players });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.some(e => e.message.includes('Only one player'))).toBe(true);
      });

      it('should reject invalid card count for player', () => {
        const players: Player[] = [
          {
            name: 'Hero',
            position: 'BTN',
            stack: 5000,
            isHero: true,
            seat: 1,
            cards: [{ rank: 'A', suit: 's' }] as any, // Only 1 card
          },
        ];
        const handHistory = createValidHandHistory({ players });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.some(e => e.message.includes('invalid card count'))).toBe(true);
      });
    });

    describe('Card validation', () => {
      it('should validate valid cards', () => {
        const players: Player[] = [
          {
            name: 'Hero',
            position: 'BTN',
            stack: 5000,
            isHero: true,
            seat: 1,
            cards: [
              { rank: 'A', suit: 's' },
              { rank: 'K', suit: 'h' },
            ],
          },
        ];
        const handHistory = createValidHandHistory({ players });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors).toHaveLength(0);
      });

      it('should reject invalid card rank', () => {
        const players: Player[] = [
          {
            name: 'Hero',
            position: 'BTN',
            stack: 5000,
            isHero: true,
            seat: 1,
            cards: [
              { rank: 'X', suit: 's' } as any,
              { rank: 'K', suit: 'h' },
            ],
          },
        ];
        const handHistory = createValidHandHistory({ players });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.some(e => e.code === ErrorCode.PARSE_INVALID_CARD)).toBe(true);
        expect(errors.some(e => e.message.includes('Invalid card rank'))).toBe(true);
      });

      it('should reject invalid card suit', () => {
        const players: Player[] = [
          {
            name: 'Hero',
            position: 'BTN',
            stack: 5000,
            isHero: true,
            seat: 1,
            cards: [
              { rank: 'A', suit: 'x' } as any,
              { rank: 'K', suit: 'h' },
            ],
          },
        ];
        const handHistory = createValidHandHistory({ players });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.some(e => e.code === ErrorCode.PARSE_INVALID_CARD)).toBe(true);
        expect(errors.some(e => e.message.includes('Invalid card suit'))).toBe(true);
      });
    });

    describe('Card consistency across streets', () => {
      it('should accept valid flop (3 cards)', () => {
        const handHistory = createValidHandHistory({
          flop: {
            cards: [
              { rank: 'A', suit: 's' },
              { rank: 'K', suit: 'h' },
              { rank: '7', suit: 'c' },
            ],
            actions: [],
          },
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors).toHaveLength(0);
      });

      it('should reject flop with invalid card count', () => {
        const handHistory = createValidHandHistory({
          flop: {
            cards: [
              { rank: 'A', suit: 's' },
              { rank: 'K', suit: 'h' },
            ] as any,
            actions: [],
          },
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.some(e => e.message.includes('Flop should have'))).toBe(true);
      });

      it('should reject turn without flop', () => {
        const handHistory = createValidHandHistory({
          flop: { cards: [], actions: [] },
          turn: { card: { rank: 'Q', suit: 'd' }, actions: [] },
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.some(e => e.message.includes('Cannot have turn card without flop'))).toBe(true);
      });

      it('should reject river without turn and flop', () => {
        const handHistory = createValidHandHistory({
          flop: { cards: [], actions: [] },
          turn: { card: null, actions: [] },
          river: { card: { rank: 'J', suit: 'c' }, actions: [] },
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors.some(e => e.message.includes('Cannot have river card without turn'))).toBe(true);
      });

      it('should accept complete board (flop, turn, river)', () => {
        const handHistory = createValidHandHistory({
          flop: {
            cards: [
              { rank: 'A', suit: 's' },
              { rank: 'K', suit: 'h' },
              { rank: '7', suit: 'c' },
            ],
            actions: [],
          },
          turn: { card: { rank: 'Q', suit: 'd' }, actions: [] },
          river: { card: { rank: 'J', suit: 'c' }, actions: [] },
        });
        const errors = DataValidator.validateHandHistory(handHistory);

        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('validateSnapshot', () => {
    describe('Required field validation', () => {
      it('should validate a complete valid Snapshot', () => {
        const snapshot = createValidSnapshot();
        const errors = DataValidator.validateSnapshot(snapshot);
        expect(errors).toHaveLength(0);
      });

      it('should reject negative snapshot id', () => {
        const snapshot = createValidSnapshot({ id: -1 });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.some(e => e.code === ErrorCode.SNAPSHOT_INVALID_ACTION)).toBe(true);
      });

      it('should warn on empty description', () => {
        const snapshot = createValidSnapshot({ description: '' });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.some(e => e.severity === ErrorSeverity.WARNING)).toBe(true);
        expect(errors.some(e => e.message.includes('description'))).toBe(true);
      });
    });

    describe('Pot validation', () => {
      it('should reject snapshot with no pots', () => {
        const snapshot = createValidSnapshot({ pots: [] });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.some(e => e.code === ErrorCode.SNAPSHOT_INVALID_POT)).toBe(true);
      });

      it('should reject pot with negative value', () => {
        const snapshot = createValidSnapshot({
          pots: [{ value: -100, eligiblePlayers: ['Hero'], isPotSide: false }],
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.some(e => e.code === ErrorCode.MATH_NEGATIVE_VALUE)).toBe(true);
      });

      it('should reject pot with no eligible players', () => {
        const snapshot = createValidSnapshot({
          pots: [{ value: 100, eligiblePlayers: [], isPotSide: false }],
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.some(e => e.message.includes('no eligible players'))).toBe(true);
      });

      it('should accept multiple pots', () => {
        const snapshot = createValidSnapshot({
          pots: [
            { value: 100, eligiblePlayers: ['Hero', 'Villain'], isPotSide: false },
            { value: 50, eligiblePlayers: ['Hero'], isPotSide: true },
          ],
          totalDisplayedPot: 150,
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Player stack validation', () => {
      it('should reject negative player stack', () => {
        const snapshot = createValidSnapshot({
          playerStacks: { Hero: -100, Villain: 5000 },
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.some(e => e.code === ErrorCode.SNAPSHOT_NEGATIVE_STACK)).toBe(true);
        expect(errors.some(e => e.severity === ErrorSeverity.CRITICAL)).toBe(true);
      });

      it('should accept zero stack (all-in)', () => {
        const snapshot = createValidSnapshot({
          playerStacks: { Hero: 0, Villain: 5000 },
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.every(e => e.code !== ErrorCode.SNAPSHOT_NEGATIVE_STACK)).toBe(true);
      });
    });

    describe('Pot total validation', () => {
      it('should accept matching pot totals', () => {
        const snapshot = createValidSnapshot({
          pots: [{ value: 100, eligiblePlayers: ['Hero'], isPotSide: false }],
          pendingContribs: { Villain: 50 },
          totalDisplayedPot: 150,
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors).toHaveLength(0);
      });

      it('should warn on mismatched pot totals (outside tolerance)', () => {
        const snapshot = createValidSnapshot({
          pots: [{ value: 100, eligiblePlayers: ['Hero'], isPotSide: false }],
          pendingContribs: {},
          totalDisplayedPot: 105, // Off by 5 cents (> 1 cent tolerance)
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.some(e => e.code === ErrorCode.SNAPSHOT_POT_MISMATCH)).toBe(true);
        expect(errors.some(e => e.severity === ErrorSeverity.WARNING)).toBe(true);
      });

      it('should accept pot totals within tolerance (1 cent)', () => {
        const snapshot = createValidSnapshot({
          pots: [{ value: 100, eligiblePlayers: ['Hero'], isPotSide: false }],
          pendingContribs: {},
          totalDisplayedPot: 101, // Off by 1 cent (within tolerance)
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        // Should not have pot mismatch error
        expect(errors.every(e => e.code !== ErrorCode.SNAPSHOT_POT_MISMATCH)).toBe(true);
      });
    });

    describe('Community card validation', () => {
      it('should validate community cards', () => {
        const snapshot = createValidSnapshot({
          communityCards: [
            { rank: 'A', suit: 's' },
            { rank: 'K', suit: 'h' },
            { rank: '7', suit: 'c' },
          ],
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors).toHaveLength(0);
      });

      it('should reject invalid community cards', () => {
        const snapshot = createValidSnapshot({
          communityCards: [{ rank: 'X', suit: 'h' } as any],
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.some(e => e.code === ErrorCode.PARSE_INVALID_CARD)).toBe(true);
      });
    });

    describe('Revealed hands validation', () => {
      it('should validate revealed hands', () => {
        const snapshot = createValidSnapshot({
          revealedHands: {
            Hero: [
              { rank: 'A', suit: 's' },
              { rank: 'K', suit: 'h' },
            ],
          },
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors).toHaveLength(0);
      });

      it('should reject revealed hand with incorrect card count', () => {
        const snapshot = createValidSnapshot({
          revealedHands: {
            Hero: [{ rank: 'A', suit: 's' }] as any, // Only 1 card
          },
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.some(e => e.message.includes('has 1 cards'))).toBe(true);
      });

      it('should reject invalid cards in revealed hands', () => {
        const snapshot = createValidSnapshot({
          revealedHands: {
            Hero: [
              { rank: 'X', suit: 's' } as any,
              { rank: 'K', suit: 'h' },
            ],
          },
        });
        const errors = DataValidator.validateSnapshot(snapshot);

        expect(errors.some(e => e.code === ErrorCode.PARSE_INVALID_CARD)).toBe(true);
      });
    });
  });

  describe('Error reporting', () => {
    it('should return empty array for valid data', () => {
      const handHistory = createValidHandHistory();
      const errors = DataValidator.validateHandHistory(handHistory);
      expect(errors).toEqual([]);
    });

    it('should include error context', () => {
      const handHistory = createValidHandHistory({ handId: '' });
      const errors = DataValidator.validateHandHistory(handHistory);

      errors.forEach(error => {
        expect(error.context).toBeDefined();
        expect(error.timestamp).toBeDefined();
      });
    });

    it('should assign appropriate severity levels', () => {
      const handHistory = createValidHandHistory({
        handId: '',
        gameContext: undefined as any,
      });
      const errors = DataValidator.validateHandHistory(handHistory);

      const hasCritical = errors.some(e => e.severity === ErrorSeverity.CRITICAL);
      const hasError = errors.some(e => e.severity === ErrorSeverity.ERROR);

      expect(hasCritical || hasError).toBe(true);
    });
  });

  describe('Complex validation scenarios', () => {
    it('should validate complete hand with all streets', () => {
      const handHistory = createValidHandHistory({
        players: [
          {
            name: 'Hero',
            position: 'BTN',
            stack: 5000,
            isHero: true,
            seat: 1,
            cards: [
              { rank: 'A', suit: 's' },
              { rank: 'K', suit: 'h' },
            ],
          },
          { name: 'Villain', position: 'SB', stack: 4500, isHero: false, seat: 2 },
        ],
        flop: {
          cards: [
            { rank: '7', suit: 'c' },
            { rank: '8', suit: 'd' },
            { rank: '9', suit: 'h' },
          ],
          actions: [],
        },
        turn: { card: { rank: 'Q', suit: 's' }, actions: [] },
        river: { card: { rank: 'J', suit: 'c' }, actions: [] },
      });

      const errors = DataValidator.validateHandHistory(handHistory);
      expect(errors).toHaveLength(0);
    });

    it('should catch multiple errors in single validation', () => {
      const handHistory = createValidHandHistory({
        handId: '',
        smallBlind: -25,
        bigBlind: -50,
        players: [],
      });

      const errors = DataValidator.validateHandHistory(handHistory);
      expect(errors.length).toBeGreaterThan(3);
    });
  });
});
