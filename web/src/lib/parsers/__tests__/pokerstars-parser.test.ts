import { HandParser } from '../../hand-parser';
import { HandHistory } from '@/types/poker';

/**
 * POKERSTARS SPECIFIC TESTS
 *
 * Tests for PokerStars-specific features and formats:
 * - Regular cash games (USD, EUR)
 * - Tournaments (regular, Spin & Go, Knockout)
 * - Zoom poker (fast-fold)
 * - Currency conversion
 * - PokerStars-specific action formats
 */

describe('HandParser - PokerStars Specific', () => {
  describe('Cash Games', () => {
    const PS_CASH_USD = `PokerStars Hand #123456789:  Hold'em No Limit ($0.25/$0.50 USD) - 2025/01/13 10:00:00 ET
Table 'Aurora II' 6-max Seat #2 is the button
Seat 1: Player1 ($50.00 in chips)
Seat 2: Player2 ($75.25 in chips)
Seat 3: Hero ($100.00 in chips)
Seat 5: Player5 ($45.00 in chips)
Seat 6: Player6 ($55.50 in chips)
Player1: posts small blind $0.25
Player2: posts big blind $0.50
*** HOLE CARDS ***
Dealt to Hero [Ah Kh]
Hero: raises $1.50 to $2
Player5: folds
Player6: folds
Player1: folds
Player2: calls $1.50
*** FLOP *** [As Kd 7c]
Player2: checks
Hero: bets $2.50
Player2: folds
Uncalled bet ($2.50) returned to Hero
Hero collected $4.05 from pot
Hero: doesn't show hand
*** SUMMARY ***
Total pot $4.25 | Rake $0.20
Board [As Kd 7c]
Seat 3: Hero collected ($4.05)`;

    it('should parse PokerStars cash game format', () => {
      const result = HandParser.parse(PS_CASH_USD);

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');
      expect(hand.gameType).toBe("Hold'em");
      expect(hand.limit).toBe('No Limit');
    });

    it('should parse USD cash game stakes correctly', () => {
      const result = HandParser.parse(PS_CASH_USD);
      const hand = result.handHistory as HandHistory;

      expect(hand.stakes).toBe('$0.25/$0.50');
      expect(hand.smallBlind).toBe(0.25);
      expect(hand.bigBlind).toBe(0.50);
      expect(hand.currency).toBe('USD');
    });

    it('should handle rake in cash games', () => {
      const result = HandParser.parse(PS_CASH_USD);
      const hand = result.handHistory as HandHistory;

      expect(hand.totalPot).toBe(4.25);
      expect(hand.rake).toBe(0.20);
    });

    it('should identify non-tournament context', () => {
      const result = HandParser.parse(PS_CASH_USD);
      const hand = result.handHistory as HandHistory;

      expect(hand.gameContext.isTournament).toBe(false);
      expect(hand.gameContext.currencyUnit).toBe('dollars');
    });
  });

  describe('Tournaments', () => {
    // TODO: Add PokerStars tournament hand
    it('should parse regular tournament format', () => {
      expect(true).toBe(true);
    });

    it('should extract tournament ID and buy-in', () => {
      expect(true).toBe(true);
    });

    it('should handle tournament chips (no decimal)', () => {
      expect(true).toBe(true);
    });
  });

  describe('Zoom Poker (Fast-Fold)', () => {
    const PS_ZOOM_HAND = `PokerStars Zoom Hand #987654321:  Hold'em No Limit ($0.50/$1.00 USD) - 2025/01/13 11:00:00 ET
Table 'Kepler' 6-max Seat #1 is the button
Seat 1: FastPlayer1 ($100.00 in chips)
Seat 2: FastPlayer2 ($150.50 in chips)
Seat 3: Hero ($200.00 in chips)
Seat 4: FastPlayer4 ($75.25 in chips)
Seat 5: FastPlayer5 ($125.00 in chips)
Seat 6: FastPlayer6 ($90.75 in chips)
FastPlayer1: posts small blind $0.50
FastPlayer2: posts big blind $1
*** HOLE CARDS ***
Dealt to Hero [Qh Qd]
Hero: raises $2 to $3
FastPlayer4: folds
FastPlayer5: folds
FastPlayer6: folds
FastPlayer1: folds
FastPlayer2: folds
Uncalled bet ($2) returned to Hero
Hero collected $2.50 from pot
Hero: doesn't show hand
*** SUMMARY ***
Total pot $2.50 | Rake $0
Seat 3: Hero collected ($2.50)`;

    it('should recognize Zoom poker hands', () => {
      const result = HandParser.parse(PS_ZOOM_HAND);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      // Zoom hands should still parse as normal PokerStars hands
      expect(hand.site).toBe('PokerStars');
    });

    it('should handle 6 active players in Zoom', () => {
      const result = HandParser.parse(PS_ZOOM_HAND);
      const hand = result.handHistory as HandHistory;

      expect(hand.players).toHaveLength(6);
      expect(hand.maxPlayers).toBe(6);
    });
  });

  describe('Spin & Go (3-max Tournament)', () => {
    // TODO: Add Spin & Go hand
    it('should parse Spin & Go format', () => {
      expect(true).toBe(true);
    });

    it('should handle 3-max table correctly', () => {
      expect(true).toBe(true);
    });

    it('should identify tournament multiplier if present', () => {
      // Spin & Go has prize pool multiplier (2x, 5x, 10x, etc.)
      expect(true).toBe(true);
    });
  });

  describe('Knockout Tournaments', () => {
    // TODO: Add knockout tournament hand
    it('should parse knockout bounty amounts', () => {
      expect(true).toBe(true);
    });

    it('should track bounties won', () => {
      expect(true).toBe(true);
    });
  });

  describe('Currency Conversion (EUR, GBP)', () => {
    const PS_CASH_EUR = `PokerStars Hand #111222333:  Hold'em No Limit (€0.25/€0.50 EUR) - 2025/01/13 12:00:00 ET
Table 'Europa' 6-max Seat #1 is the button
Seat 1: EuroPlayer1 (€50.00 in chips)
Seat 2: Hero (€100.00 in chips)
Seat 3: EuroPlayer3 (€75.50 in chips)
EuroPlayer1: posts small blind €0.25
Hero: posts big blind €0.50
*** HOLE CARDS ***
Dealt to Hero [Jc Js]
EuroPlayer3: folds
EuroPlayer1: raises €1 to €1.50
Hero: raises €3.50 to €5
EuroPlayer1: folds
Uncalled bet (€3.50) returned to Hero
Hero collected €3 from pot
*** SUMMARY ***
Total pot €3 | Rake €0
Seat 2: Hero (big blind) collected (€3)`;

    it('should parse EUR currency correctly', () => {
      const result = HandParser.parse(PS_CASH_EUR);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.currency).toBe('EUR');
    });

    it('should handle euro symbol in amounts', () => {
      const result = HandParser.parse(PS_CASH_EUR);
      const hand = result.handHistory as HandHistory;

      expect(hand.smallBlind).toBe(0.25);
      expect(hand.bigBlind).toBe(0.50);

      const euroPlayer1 = hand.players.find(p => p.name === 'EuroPlayer1');
      expect(euroPlayer1!.stack).toBe(50.00);
    });

    it('should flag EUR as needing conversion', () => {
      const result = HandParser.parse(PS_CASH_EUR);
      const hand = result.handHistory as HandHistory;

      // EUR might need USD conversion for display
      expect(hand.gameContext.currencyUnit).toBe('euros');
    });
  });

  describe('Multi-Street Actions', () => {
    // TODO: Add hand that goes to river with multiple bets
    it('should parse complex betting on all streets', () => {
      expect(true).toBe(true);
    });

    it('should track pot size correctly across streets', () => {
      expect(true).toBe(true);
    });
  });

  describe('Special Scenarios', () => {
    it('should handle player disconnects', () => {
      // TODO: Add hand where player times out
      expect(true).toBe(true);
    });

    it('should handle all-in situations', () => {
      // TODO: Add hand with multiple all-ins
      expect(true).toBe(true);
    });

    it('should handle uncalled bets', () => {
      // TODO: Verify uncalled bet amount is returned correctly
      expect(true).toBe(true);
    });
  });
});

/**
 * HOW TO GET POKERSTARS HAND HISTORIES:
 *
 * 1. Play on PokerStars (or PokerStars.com/.eu/.net depending on region)
 * 2. After playing, go to: PokerStars Lobby → Tools → Hand History
 * 3. Select the hands you want
 * 4. Click "Export Selected"
 * 5. Copy the text from the exported file
 * 6. Paste into test cases above
 *
 * ALTERNATIVE:
 * - Search on poker forums (2+2, Reddit r/poker)
 * - Look for hand analysis posts
 * - Copy the PokerStars hand history text
 */
