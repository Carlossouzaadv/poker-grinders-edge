import { HandParser } from './hand-parser';
import { HandHistory } from '@/types/poker';

/**
 * Tests for GGPoker hand history parser
 * CRITICAL: These tests ensure the parser correctly handles all phases of a hand
 */

describe('HandParser - GGPoker', () => {
  describe('Full Tournament Hand (Multi-way All-in with Showdown)', () => {
    const GGPOKER_TOURNAMENT_HAND = `Poker Hand #TM5030367055: Tournament #232064631, Bounty Hunters Special $2.50 Hold'em No Limit - Level12(400/800) - 2025/09/26 11:36:31
Table '200' 8-max Seat #7 is the button
Seat 1: c0969eff (9,680 in chips)
Seat 3: 4f29b34d (34,700 in chips)
Seat 4: 26587683 (25,438 in chips)
Seat 5: c8b449a6 (58,039 in chips)
Seat 6: 683c325e (22,651 in chips)
Seat 7: 4311619d (42,391 in chips)
Seat 8: Hero (5,140 in chips)
Hero: posts the ante 120
4311619d: posts the ante 120
c8b449a6: posts the ante 120
683c325e: posts the ante 120
26587683: posts the ante 120
4f29b34d: posts the ante 120
c0969eff: posts the ante 120
Hero: posts small blind 400
c0969eff: posts big blind 800
*** HOLE CARDS ***
Dealt to c0969eff
Dealt to 4f29b34d
Dealt to 26587683
Dealt to c8b449a6
Dealt to 683c325e
Dealt to 4311619d
Dealt to Hero [Js As]
4f29b34d: folds
26587683: folds
c8b449a6: folds
683c325e: raises 960 to 1,760
4311619d: calls 1,760
Hero: raises 3,260 to 5,020 and is all-in
c0969eff: raises 4,540 to 9,560 and is all-in
683c325e: raises 12,971 to 22,531 and is all-in
4311619d: calls 20,771
683c325e: shows [Td Kh]
4311619d: shows [Jd Ad]
Hero: shows [Js As]
c0969eff: shows [7s 7c]
*** FLOP *** [Jh 6c Tc]
*** TURN *** [Jh 6c Tc] [5c]
*** RIVER *** [Jh 6c Tc 5c] [9c]
*** SHOWDOWN ***
c0969eff collected 20,920 from pot
c0969eff collected 13,620 from pot
4311619d collected 25,942 from pot
*** SUMMARY ***
Total pot 60,482 | Rake 0 | Jackpot 0 | Bingo 0 | Fortune 0 | Tax 0
Board [Jh 6c Tc 5c 9c]
Seat 1: c0969eff (big blind) showed [7s 7c] and won (34,540) with a flush Ten high
Seat 3: 4f29b34d folded before Flop
Seat 4: 26587683 folded before Flop
Seat 5: c8b449a6 folded before Flop
Seat 6: 683c325e showed [Td Kh] and lost with a pair of Tens
Seat 7: 4311619d (button) showed [Jd Ad] and won (25,942) with a pair of Jacks
Seat 8: Hero (small blind) showed [Js As] and lost with a pair of Jacks`;

    it('should successfully parse the complete hand', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.handHistory).toBeDefined();
    });

    it('should parse header correctly', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);
      const hand = result.handHistory as HandHistory;

      expect(hand.handId).toBe('TM5030367055');
      expect(hand.site).toBe('GGPoker');
      expect(hand.gameType).toBe('Hold\'em');
      expect(hand.limit).toBe('No Limit');
      expect(hand.smallBlind).toBe(400);
      expect(hand.bigBlind).toBe(800);
    });

    it('should parse all 7 players correctly', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);
      const hand = result.handHistory as HandHistory;

      expect(hand.players).toHaveLength(7);
      expect(hand.maxPlayers).toBe(8);
      expect(hand.buttonSeat).toBe(7);

      // Check specific players
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();
      expect(hero!.stack).toBe(5140);
      expect(hero!.seat).toBe(8);
      expect(hero!.cards).toEqual([
        { rank: 'J', suit: 's' },
        { rank: 'A', suit: 's' }
      ]);

      const bigBlind = hand.players.find(p => p.name === 'c0969eff');
      expect(bigBlind).toBeDefined();
      expect(bigBlind!.stack).toBe(9680);
      expect(bigBlind!.cards).toEqual([
        { rank: '7', suit: 's' },
        { rank: '7', suit: 'c' }
      ]);
    });

    it('should parse antes correctly', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);
      const hand = result.handHistory as HandHistory;

      expect(hand.antes).toBeDefined();
      expect(hand.antes).toHaveLength(9); // 7 antes + 2 blinds

      const anteActions = hand.antes!.filter(a => a.action === 'ante');
      expect(anteActions).toHaveLength(7);
      expect(anteActions[0].amount).toBe(120);
    });

    it('should parse preflop actions correctly', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);
      const hand = result.handHistory as HandHistory;

      // Should have: folds, raises, calls, all-ins, shows
      expect(hand.preflop.length).toBeGreaterThan(0);

      // Check for folds
      const folds = hand.preflop.filter(a => a.action === 'fold');
      expect(folds.length).toBe(3); // 4f29b34d, 26587683, c8b449a6

      // Check for all-ins
      const allIns = hand.preflop.filter(a => a.action === 'all-in');
      expect(allIns.length).toBeGreaterThan(0);
    });

    it('should parse board cards correctly', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);
      const hand = result.handHistory as HandHistory;

      // Flop
      expect(hand.flop.cards).toHaveLength(3);
      expect(hand.flop.cards).toEqual([
        { rank: 'J', suit: 'h' },
        { rank: '6', suit: 'c' },
        { rank: 'T', suit: 'c' }
      ]);

      // Turn
      expect(hand.turn.card).toEqual({ rank: '5', suit: 'c' });

      // River
      expect(hand.river.card).toEqual({ rank: '9', suit: 'c' });
    });

    it('should parse showdown correctly', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);
      const hand = result.handHistory as HandHistory;

      expect(hand.showdown).toBeDefined();
      expect(hand.showdown!.winners).toContain('c0969eff');
      expect(hand.showdown!.winners).toContain('4311619d');

      // Total pot collected (20,920 + 13,620 + 25,942 = 60,482)
      expect(hand.showdown!.potWon).toBe(60482);
    });

    it('should parse summary correctly', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);
      const hand = result.handHistory as HandHistory;

      expect(hand.totalPot).toBe(60482);
      expect(hand.rake).toBe(0);

      // Check that all revealed cards are assigned to players
      const player683c325e = hand.players.find(p => p.name === '683c325e');
      expect(player683c325e!.cards).toEqual([
        { rank: 'T', suit: 'd' },
        { rank: 'K', suit: 'h' }
      ]);

      const player4311619d = hand.players.find(p => p.name === '4311619d');
      expect(player4311619d!.cards).toEqual([
        { rank: 'J', suit: 'd' },
        { rank: 'A', suit: 'd' }
      ]);
    });

    it('should detect tournament context correctly', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);
      const hand = result.handHistory as HandHistory;

      expect(hand.gameContext).toBeDefined();
      expect(hand.gameContext.isTournament).toBe(true);
      expect(hand.gameContext.currencyUnit).toBe('chips');
      expect(hand.gameContext.conversionNeeded).toBe(false);
    });

    it('should handle comma-separated amounts correctly', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);
      const hand = result.handHistory as HandHistory;

      // Check raises with commas (e.g., "raises 12,971 to 22,531")
      const raiseAction = hand.preflop.find(
        a => a.player === '683c325e' && a.action === 'all-in'
      );
      expect(raiseAction).toBeDefined();
      // Amount should be parsed correctly (commas removed)
      expect(raiseAction!.amount).toBeGreaterThan(0);
    });

    it('should assign all revealed cards to correct players', () => {
      const result = HandParser.parse(GGPOKER_TOURNAMENT_HAND);
      const hand = result.handHistory as HandHistory;

      // All players who showed cards should have them assigned
      const playersWithCards = hand.players.filter(p => p.cards !== undefined);
      expect(playersWithCards.length).toBeGreaterThanOrEqual(4);

      // Hero, c0969eff, 683c325e, 4311619d all showed cards
      expect(playersWithCards.map(p => p.name)).toEqual(
        expect.arrayContaining(['Hero', 'c0969eff', '683c325e', '4311619d'])
      );
    });
  });

  describe('Error Handling', () => {
    it('should fail gracefully on empty input', () => {
      const result = HandParser.parse('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should fail on invalid header format', () => {
      const invalidHand = `Invalid Header Format
Table '200' 8-max Seat #7 is the button
Seat 1: Player1 (1000 in chips)`;

      const result = HandParser.parse(invalidHand);

      expect(result.success).toBe(false);
    });

    it('should detect GGPoker format correctly', () => {
      const ggPokerSnippet = `Poker Hand #TM123: Tournament #456, Test $1.00 Hold'em No Limit - Level1(10/20)`;
      const result = HandParser.parse(ggPokerSnippet + '\nTable "test" 6-max');

      // Should attempt GGPoker parsing (even if it fails due to incomplete data)
      expect(result.error).not.toContain('not recognized');
    });
  });
});
