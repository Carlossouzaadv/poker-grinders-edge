import { HandParser } from './hand-parser';
import { HandHistory } from '@/types/poker';

describe('HandParser', () => {
  // Test samples
  const validPokerStarsHand = `PokerStars Hand #123456789: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 14:30:25 ET
Table 'Test Table' 6-max Seat #1 is the button
Seat 1: Hero ($50.00 in chips)
Seat 2: Villain1 ($45.75 in chips)
Seat 3: Villain2 ($100.25 in chips)
Seat 4: Villain3 ($75.50 in chips)
Seat 5: Villain4 ($30.00 in chips)
Seat 6: Villain5 ($85.00 in chips)
Villain1: posts small blind $0.25
Villain2: posts big blind $0.50
*** HOLE CARDS ***
Dealt to Hero [Ac Kd]
Villain3: folds
Villain4: calls $0.50
Villain5: folds
Hero: raises $2.00 to $2.50
Villain1: folds
Villain2: calls $2.00
Villain4: calls $2.00
*** FLOP *** [As Kh 7c]
Villain2: checks
Villain4: checks
Hero: bets $5.50
Villain2: calls $5.50
Villain4: folds
*** TURN *** [As Kh 7c] [2d]
Villain2: checks
Hero: bets $12.00
Villain2: calls $12.00
*** RIVER *** [As Kh 7c 2d] [9s]
Villain2: checks
Hero: bets $29.75 and is all-in
Villain2: calls $29.75
*** SHOW DOWN ***
Hero: shows [Ac Kd] (two pair, Aces and Kings)
Villain2: mucks hand
Hero collected $97.25 from pot
*** SUMMARY ***
Total pot $100.00 | Rake $2.75
Board [As Kh 7c 2d 9s]
Seat 1: Hero (button) showed [Ac Kd] and won ($97.25) with two pair, Aces and Kings
Seat 2: Villain1 (small blind) folded before Flop
Seat 3: Villain2 (big blind) mucked [Ah Qc]
Seat 4: Villain3 folded before Flop (didn't bet)
Seat 5: Villain4 folded on the Flop
Seat 6: Villain5 folded before Flop (didn't bet)`;

  const multipleHandsText = `PokerStars Hand #123456789: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 14:30:25 ET
Table 'Test Table' 6-max Seat #1 is the button
Seat 1: Hero ($50.00 in chips)
*** HOLE CARDS ***
Dealt to Hero [Ac Kd]
Hero: folds

PokerStars Hand #987654321: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 14:31:30 ET
Table 'Test Table' 6-max Seat #2 is the button
Seat 2: Hero ($50.00 in chips)
*** HOLE CARDS ***
Dealt to Hero [2s 7h]
Hero: folds`;

  const invalidFormatText = `This is not a valid hand history format.
It doesn't contain any poker site headers.`;

  const unsupportedSiteText = `888poker Hand #123456: Hold'em No Limit ($0.25/$0.50) - 2024/01/15
Table 'Unsupported' 6-max Seat #1 is the button`;

  const ggPokerHandText = `Game ID: 123456789 - Natural8
Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 14:30:25 ET
Table 'Natural8 Table' 6-max Seat #1 is the button`;

  describe('Hand Validation', () => {
    test('should successfully parse valid PokerStars hand', () => {
      const result = HandParser.parse(validPokerStarsHand);

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();
      expect(result.error).toBeUndefined();

      if (result.handHistory) {
        expect(result.handHistory.handId).toBe('123456789');
        expect(result.handHistory.site).toBe('PokerStars');
        expect(result.handHistory.gameType).toBe('Hold\'em');
        expect(result.handHistory.limit).toBe('No Limit');
        expect(result.handHistory.stakes).toBe('$0.25/$0.5');
        expect(result.handHistory.maxPlayers).toBe(6);
        expect(result.handHistory.buttonSeat).toBe(1);
        expect(result.handHistory.smallBlind).toBe(0.25);
        expect(result.handHistory.bigBlind).toBe(0.5);
        expect(result.handHistory.players).toHaveLength(6);
        expect(result.handHistory.preflop).toBeDefined();
      }
    });

    test('should reject multiple hands in single text', () => {
      const result = HandParser.parse(multipleHandsText);

      expect(result.success).toBe(false);
      expect(result.error).toContain('2 mãos');
      expect(result.error).toContain('uma mão por vez');
      expect(result.handHistory).toBeUndefined();
    });

    test('should reject invalid format text', () => {
      const result = HandParser.parse(invalidFormatText);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Formato de hand history não reconhecido');
      expect(result.handHistory).toBeUndefined();
    });

    test('should reject unsupported sites', () => {
      const result = HandParser.parse(unsupportedSiteText);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Site não suportado');
      expect(result.handHistory).toBeUndefined();
    });

    test('should detect but not yet support GGPoker format', () => {
      const result = HandParser.parse(ggPokerHandText);

      expect(result.success).toBe(false);
      expect(result.error).toContain('GGPoker ainda não implementado');
      expect(result.handHistory).toBeUndefined();
    });
  });

  describe('Hero Detection and Card Parsing', () => {
    test('should correctly identify hero player and parse hole cards', () => {
      const result = HandParser.parse(validPokerStarsHand);

      expect(result.success).toBe(true);
      if (result.handHistory) {
        const hero = result.handHistory.players.find(p => p.isHero);
        expect(hero).toBeDefined();
        expect(hero?.name).toBe('Hero');
        expect(hero?.cards).toBeDefined();
        expect(hero?.cards).toHaveLength(2);
        expect(hero?.cards?.[0]).toEqual({ rank: 'A', suit: 'c' });
        expect(hero?.cards?.[1]).toEqual({ rank: 'K', suit: 'd' });
      }
    });

    test('should parse community cards correctly for all streets', () => {
      const result = HandParser.parse(validPokerStarsHand);

      expect(result.success).toBe(true);
      if (result.handHistory) {
        // Flop cards
        expect(result.handHistory.flop).toBeDefined();
        expect(result.handHistory.flop?.cards).toHaveLength(3);
        expect(result.handHistory.flop?.cards[0]).toEqual({ rank: 'A', suit: 's' });
        expect(result.handHistory.flop?.cards[1]).toEqual({ rank: 'K', suit: 'h' });
        expect(result.handHistory.flop?.cards[2]).toEqual({ rank: '7', suit: 'c' });

        // Turn card
        expect(result.handHistory.turn).toBeDefined();
        expect(result.handHistory.turn?.card).toEqual({ rank: '2', suit: 'd' });

        // River card
        expect(result.handHistory.river).toBeDefined();
        expect(result.handHistory.river?.card).toEqual({ rank: '9', suit: 's' });
      }
    });

    test('should parse mucked hands in summary', () => {
      const result = HandParser.parse(validPokerStarsHand);

      expect(result.success).toBe(true);
      if (result.handHistory) {
        const villain2 = result.handHistory.players.find(p => p.name === 'Villain2');
        expect(villain2).toBeDefined();
        expect(villain2?.cards).toBeDefined();
        expect(villain2?.cards).toHaveLength(2);
        expect(villain2?.cards?.[0]).toEqual({ rank: 'A', suit: 'h' });
        expect(villain2?.cards?.[1]).toEqual({ rank: 'Q', suit: 'c' });
      }
    });
  });

  describe('Action Parsing and Street Structure', () => {
    test('should parse all player actions correctly', () => {
      const result = HandParser.parse(validPokerStarsHand);

      expect(result.success).toBe(true);
      if (result.handHistory) {
        // Preflop actions
        expect(result.handHistory.preflop).toBeDefined();
        expect(result.handHistory.preflop.length).toBeGreaterThan(0);

        const heroRaise = result.handHistory.preflop.find(a => a.player === 'Hero' && a.action === 'raise');
        expect(heroRaise).toBeDefined();
        expect(heroRaise?.amount).toBe(2.5);

        const villain4Call = result.handHistory.preflop.find(a => a.player === 'Villain4' && a.action === 'call');
        expect(villain4Call).toBeDefined();
        expect(villain4Call?.amount).toBe(0.5);

        // Flop actions
        expect(result.handHistory.flop?.actions).toBeDefined();
        const heroBet = result.handHistory.flop?.actions.find(a => a.player === 'Hero' && a.action === 'bet');
        expect(heroBet).toBeDefined();
        expect(heroBet?.amount).toBe(5.5);
      }
    });

    test('should parse showdown information correctly', () => {
      const result = HandParser.parse(validPokerStarsHand);

      expect(result.success).toBe(true);
      if (result.handHistory) {
        expect(result.handHistory.showdown).toBeDefined();
        expect(result.handHistory.showdown?.winners).toContain('Hero');
        expect(result.handHistory.showdown?.potWon).toBe(97.25);
        expect(result.handHistory.showdown?.info).toContain('shows [Ac Kd]');
        expect(result.handHistory.showdown?.info).toContain('mucks hand');
      }
    });

    test('should calculate positions correctly for 6-max table', () => {
      const result = HandParser.parse(validPokerStarsHand);

      expect(result.success).toBe(true);
      if (result.handHistory) {
        const hero = result.handHistory.players.find(p => p.name === 'Hero');
        const villain1 = result.handHistory.players.find(p => p.name === 'Villain1');
        const villain2 = result.handHistory.players.find(p => p.name === 'Villain2');

        expect(hero?.position).toBe('BTN'); // Seat 1 is button
        expect(villain1?.position).toBe('SB'); // Seat 2 is SB
        expect(villain2?.position).toBe('BB'); // Seat 3 is BB
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty string gracefully', () => {
      const result = HandParser.parse('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.handHistory).toBeUndefined();
    });

    test('should handle malformed header', () => {
      const malformedHand = `PokerStars Hand: Invalid format
Table 'Test' 6-max`;

      const result = HandParser.parse(malformedHand);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Formato de header inválido');
    });

    test('should handle missing players section', () => {
      const incompleteHand = `PokerStars Hand #123456789: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 14:30:25 ET
Table 'Test Table' 6-max Seat #1 is the button
*** HOLE CARDS ***`;

      const result = HandParser.parse(incompleteHand);

      expect(result.success).toBe(true); // Should still parse but with empty players
      if (result.handHistory) {
        expect(result.handHistory.players).toHaveLength(0);
      }
    });

    test('should handle exception during parsing', () => {
      // Simulate internal error by providing corrupted data
      const corruptedHand = `PokerStars Hand #123456789: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 14:30:25 ET
Table 'Test Table' 6-max Seat #1 is the button
Seat 1: Hero ($invalid_stack in chips)`;

      const result = HandParser.parse(corruptedHand);

      // Parser should handle this gracefully and either succeed with default values or fail with proper error
      expect(result.success).toBeDefined();
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
      }
    });
  });
});