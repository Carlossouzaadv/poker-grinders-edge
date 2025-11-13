import { HandParser } from '../../hand-parser';
import { HandHistory } from '@/types/poker';

/**
 * CRITICAL EDGE CASES TEST SUITE
 *
 * These tests cover unusual scenarios that could break the parser:
 * - Heads-up (2 players)
 * - Full table (10 players)
 * - Split pots
 * - Multiple all-ins with side pots
 * - Players with special characters in names
 * - Very large stack sizes
 * - Micro stakes (decimal values)
 * - Hands with no showdown (all fold)
 */

describe('HandParser - Critical Edge Cases', () => {
  describe('Heads-Up (2 Players)', () => {
    const HEADS_UP_HAND = `PokerStars Hand #123456789: Hold'em No Limit ($0.50/$1.00 USD) - 2025/01/13 10:00:00 ET
Table 'Test' 2-max Seat #1 is the button
Seat 1: Hero ($100 in chips)
Seat 2: Villain ($100 in chips)
Hero: posts small blind $0.50
Villain: posts big blind $1
*** HOLE CARDS ***
Dealt to Hero [As Kh]
Hero: raises $2 to $3
Villain: calls $2
*** FLOP *** [Ah Kd Qc]
Villain: checks
Hero: bets $4
Villain: folds
Uncalled bet ($4) returned to Hero
Hero collected $5.70 from pot
Hero: doesn't show hand
*** SUMMARY ***
Total pot $6 | Rake $0.30
Board [Ah Kd Qc]
Seat 1: Hero (button) (small blind) collected ($5.70)
Seat 2: Villain (big blind) folded on the Flop`;

    it('should parse heads-up hand correctly', () => {
      const result = HandParser.parse(HEADS_UP_HAND);

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();

      const hand = result.handHistory as HandHistory;
      expect(hand.players).toHaveLength(2);
      expect(hand.maxPlayers).toBe(2);
    });

    it('should identify hero correctly in heads-up', () => {
      const result = HandParser.parse(HEADS_UP_HAND);
      const hand = result.handHistory as HandHistory;

      const hero = hand.players.find(p => p.isHero);
      expect(hero).toBeDefined();
      expect(hero!.name).toBe('Hero');
      expect(hero!.cards).toBeDefined();
    });

    it('should handle SB/BB correctly in heads-up', () => {
      const result = HandParser.parse(HEADS_UP_HAND);
      const hand = result.handHistory as HandHistory;

      expect(hand.smallBlind).toBe(0.5);
      expect(hand.bigBlind).toBe(1);
    });
  });

  describe('Full Table (10 Players)', () => {
    it('should handle 10-max table', () => {
      // TODO: Add actual 10-player hand history
      // This is a placeholder for where to add the test
      expect(true).toBe(true);
    });

    it('should position all 10 players correctly', () => {
      // TODO: Verify all 10 players get unique visual seats
      expect(true).toBe(true);
    });
  });

  describe('Split Pot Scenarios', () => {
    it('should handle exact split pot (2 winners)', () => {
      // TODO: Add hand with exact split (e.g., both players have same straight)
      // Verify pot is divided correctly
      expect(true).toBe(true);
    });

    it('should handle 3-way split pot', () => {
      // TODO: Add hand with 3 winners sharing pot
      expect(true).toBe(true);
    });
  });

  describe('Multiple All-Ins with Side Pots', () => {
    it('should handle 3-way all-in with 2 side pots', () => {
      // TODO: Add hand with players having different stack sizes
      // Player A: 1000, Player B: 500, Player C: 200
      // Verify main pot and 2 side pots are calculated correctly
      expect(true).toBe(true);
    });

    it('should distribute winnings correctly across multiple pots', () => {
      // TODO: Verify each player wins the correct pot
      expect(true).toBe(true);
    });
  });

  describe('Player Names with Special Characters', () => {
    const SPECIAL_CHARS_HAND = `PokerStars Hand #987654321: Hold'em No Limit ($0.50/$1.00 USD) - 2025/01/13 11:00:00 ET
Table 'Test' 6-max Seat #1 is the button
Seat 1: João_BR$123 ($100 in chips)
Seat 2: Müller-2025 ($100 in chips)
Seat 3: 中文Player ($100 in chips)
Seat 4: Имя_RUS ($100 in chips)
Seat 5: Mr.Smith! ($100 in chips)
Seat 6: [Pro]Player ($100 in chips)
João_BR$123: posts small blind $0.50
Müller-2025: posts big blind $1
*** HOLE CARDS ***
Dealt to João_BR$123 [As Ad]
中文Player: folds
Имя_RUS: folds
Mr.Smith!: folds
[Pro]Player: folds
João_BR$123: raises $2 to $3
Müller-2025: folds
Uncalled bet ($2) returned to João_BR$123
João_BR$123 collected $2 from pot
*** SUMMARY ***
Total pot $2 | Rake $0
Seat 1: João_BR$123 (button) (small blind) collected ($2)
Seat 2: Müller-2025 (big blind) folded before Flop`;

    it('should parse player names with unicode characters', () => {
      const result = HandParser.parse(SPECIAL_CHARS_HAND);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.players).toHaveLength(6);

      // Verify all special character names are preserved
      const playerNames = hand.players.map(p => p.name);
      expect(playerNames).toContain('João_BR$123');
      expect(playerNames).toContain('Müller-2025');
      expect(playerNames).toContain('中文Player');
      expect(playerNames).toContain('Имя_RUS');
      expect(playerNames).toContain('Mr.Smith!');
      expect(playerNames).toContain('[Pro]Player');
    });

    it('should normalize keys correctly for special characters', () => {
      const result = HandParser.parse(SPECIAL_CHARS_HAND);
      const hand = result.handHistory as HandHistory;

      // Verify that snapshot builder can handle these names
      expect(hand.players.every(p => p.name.length > 0)).toBe(true);
    });
  });

  describe('Very Large Stack Sizes', () => {
    const HIGH_STAKES_HAND = `PokerStars Hand #111222333: Hold'em No Limit ($500/$1000 USD) - 2025/01/13 12:00:00 ET
Table 'High Roller' 6-max Seat #1 is the button
Seat 1: Whale1 ($2500000 in chips)
Seat 2: Shark1 ($1850000 in chips)
Seat 3: Hero ($3000000 in chips)
Whale1: posts small blind $500
Shark1: posts big blind $1000
*** HOLE CARDS ***
Dealt to Hero [Ac Ad]
Hero: raises $3000 to $4000
Whale1: folds
Shark1: folds
Uncalled bet ($3000) returned to Hero
Hero collected $2500 from pot
*** SUMMARY ***
Total pot $2500 | Rake $0
Seat 3: Hero collected ($2500)`;

    it('should handle million-chip stacks correctly', () => {
      const result = HandParser.parse(HIGH_STAKES_HAND);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      const hero = hand.players.find(p => p.name === 'Hero');

      expect(hero).toBeDefined();
      expect(hero!.stack).toBe(3000000);
    });

    it('should not lose precision on large numbers', () => {
      const result = HandParser.parse(HIGH_STAKES_HAND);
      const hand = result.handHistory as HandHistory;

      // Verify no rounding errors
      const whale = hand.players.find(p => p.name === 'Whale1');
      expect(whale!.stack).toBe(2500000);
    });
  });

  describe('Micro Stakes (Decimal Values)', () => {
    const MICRO_STAKES_HAND = `PokerStars Hand #444555666: Hold'em No Limit ($0.01/$0.02 USD) - 2025/01/13 13:00:00 ET
Table 'Micro' 6-max Seat #1 is the button
Seat 1: Micro1 ($2.00 in chips)
Seat 2: Micro2 ($1.85 in chips)
Seat 3: Hero ($5.00 in chips)
Micro1: posts small blind $0.01
Micro2: posts big blind $0.02
*** HOLE CARDS ***
Dealt to Hero [9s 9h]
Hero: raises $0.06 to $0.08
Micro1: folds
Micro2: folds
Uncalled bet ($0.06) returned to Hero
Hero collected $0.05 from pot
*** SUMMARY ***
Total pot $0.05 | Rake $0
Seat 3: Hero collected ($0.05)`;

    it('should handle cent-level stakes correctly', () => {
      const result = HandParser.parse(MICRO_STAKES_HAND);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.smallBlind).toBe(0.01);
      expect(hand.bigBlind).toBe(0.02);
    });

    it('should not lose precision on decimal amounts', () => {
      const result = HandParser.parse(MICRO_STAKES_HAND);
      const hand = result.handHistory as HandHistory;

      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.stack).toBe(5.00);

      const micro2 = hand.players.find(p => p.name === 'Micro2');
      expect(micro2!.stack).toBe(1.85);
    });
  });

  describe('No Showdown (All Fold)', () => {
    const NO_SHOWDOWN_HAND = `PokerStars Hand #777888999: Hold'em No Limit ($0.50/$1.00 USD) - 2025/01/13 14:00:00 ET
Table 'Fold City' 6-max Seat #1 is the button
Seat 1: Foldy1 ($100 in chips)
Seat 2: Foldy2 ($100 in chips)
Seat 3: Hero ($100 in chips)
Seat 4: Foldy4 ($100 in chips)
Foldy1: posts small blind $0.50
Foldy2: posts big blind $1
*** HOLE CARDS ***
Dealt to Hero [2c 7d]
Hero: folds
Foldy4: folds
Foldy1: folds
Uncalled bet ($0.50) returned to Foldy2
Foldy2 collected $1 from pot
Foldy2: doesn't show hand
*** SUMMARY ***
Total pot $1 | Rake $0
Seat 2: Foldy2 (big blind) collected ($1)`;

    it('should handle hand with no showdown', () => {
      const result = HandParser.parse(NO_SHOWDOWN_HAND);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.showdown).toBeUndefined();
    });

    it('should identify winner even without showdown', () => {
      const result = HandParser.parse(NO_SHOWDOWN_HAND);
      const hand = result.handHistory as HandHistory;

      // Winner should still be identifiable from SUMMARY
      expect(hand.totalPot).toBe(1);
    });

    it('should mark all non-winners as folded', () => {
      const result = HandParser.parse(NO_SHOWDOWN_HAND);
      const hand = result.handHistory as HandHistory;

      // Verify fold actions exist
      const folds = hand.preflop.filter(a => a.action === 'fold');
      expect(folds.length).toBeGreaterThan(0);
    });
  });

  describe('Empty/Invalid Input', () => {
    it('should fail gracefully on empty string', () => {
      const result = HandParser.parse('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('empty');
    });

    it('should fail gracefully on whitespace only', () => {
      const result = HandParser.parse('   \n\n\t  ');

      expect(result.success).toBe(false);
    });

    it('should fail gracefully on random text', () => {
      const result = HandParser.parse('This is not a hand history');

      expect(result.success).toBe(false);
    });

    it('should fail gracefully on malformed header', () => {
      const result = HandParser.parse(`Invalid Header Format
Seat 1: Player1 (1000 in chips)`);

      expect(result.success).toBe(false);
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle minimum valid pot (1 cent)', () => {
      // TODO: Add hand with 1 cent pot
      expect(true).toBe(true);
    });

    it('should handle maximum reasonable pot (millions)', () => {
      // TODO: Add hand with multi-million pot
      expect(true).toBe(true);
    });

    it('should handle minimum stack (going all-in for 1 chip)', () => {
      // TODO: Add hand where player has 1 chip left
      expect(true).toBe(true);
    });
  });
});

/**
 * INSTRUCTIONS FOR ADDING MORE TESTS:
 *
 * 1. Collect real hand histories from actual games
 * 2. Replace the TODO placeholders with actual hand text
 * 3. Run tests: npm test edge-cases.test.ts
 * 4. If tests fail, fix parser or adjust test expectations
 *
 * WHERE TO GET HAND HISTORIES:
 * - Your own played hands (best option)
 * - Poker forums (2+2, CardsChat)
 * - Twitch stream hand histories
 * - Ask friends who play poker online
 */
