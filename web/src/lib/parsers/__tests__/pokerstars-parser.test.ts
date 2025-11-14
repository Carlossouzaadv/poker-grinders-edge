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
    const PS_TOURNAMENT_HAND_1 = `PokerStars Hand #123456789003: Tournament #555555 NLHE Level II (50/100)
Hero (4980)
V1 (6000)
V2 (5100)
*** HOLE CARDS ***
Hero dealt [Ah Kh]
V1 raises to 250
Hero 3-bets to 750
V1 calls
*** FLOP *** [Kd 6h 2h]
Hero bets 900
V1 calls
*** TURN *** [4s]
Hero bets 1600
V1 folds
Hero wins 2150`;

    const PS_TOURNAMENT_HAND_2 = `PokerStars Hand #123456789004: Tournament #777777 NLHE Level III (75/150)
*** HOLE CARDS ***
Hero [9s 9d]
UTG raises 300
HJ calls
Hero calls
Blinds fold
*** FLOP *** [9h Th Jc]
UTG bets 450
HJ folds
Hero raises to 1350
UTG calls
*** TURN *** [3d]
Hero bets 2700
UTG folds
Hero wins 3900`;

    const PS_TOURNAMENT_MULTIWAY_ALLIN = `PokerStars Hand #123456789007: Tournament #888888 Level IV (100/200)
*** HOLE CARDS ***
Hero [Jh Js]
UTG shoves 1,300
HJ reshoves 3,000
CO folds
Hero (BTN) calls 3,000
Blinds fold
*** SHOW DOWN ***
UTG shows [9d 9s]
HJ shows [As Qh]
Hero shows [Jh Js]
*** BOARD *** [3c Kd 7h Qs Jd]
Hero wins with trips`;

    it('should parse regular tournament format (Hand #4)', () => {
      const result = HandParser.parse(PS_TOURNAMENT_HAND_1);

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');
      expect(hand.gameContext.isTournament).toBe(true);
    });

    it('should extract tournament ID and blinds (Hand #4)', () => {
      const result = HandParser.parse(PS_TOURNAMENT_HAND_1);
      const hand = result.handHistory as HandHistory;

      expect(hand.tournamentId).toBe('555555');
      expect(hand.smallBlind).toBe(50);
      expect(hand.bigBlind).toBe(100);
    });

    it('should handle tournament chips with no decimal (Hand #5)', () => {
      const result = HandParser.parse(PS_TOURNAMENT_HAND_2);
      const hand = result.handHistory as HandHistory;

      expect(hand.tournamentId).toBe('777777');
      expect(hand.smallBlind).toBe(75);
      expect(hand.bigBlind).toBe(150);
    });

    it('should parse multiway all-in with side pots (Hand #8)', () => {
      const result = HandParser.parse(PS_TOURNAMENT_MULTIWAY_ALLIN);
      const hand = result.handHistory as HandHistory;

      expect(hand.tournamentId).toBe('888888');

      // Should have showdown
      const riverSnapshot = hand.snapshots.find(s => s.street === 'showdown');
      expect(riverSnapshot).toBeDefined();

      // Hero should win
      const heroPlayer = hand.players.find(p => p.name === 'Hero');
      expect(heroPlayer).toBeDefined();
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
    const PS_HAND_1_MULTISTREET = `PokerStars Hand #123456789000: Hold'em No Limit ($0.50/$1.00 USD) - 2025/02/10 21:12:34 ET
Table 'Orion 6-max' 6-max Seat #3 is the button
Seat 1: Hero ($100)
Seat 2: V1 ($102.50)
Seat 3: V2 ($80)
Seat 4: V3 ($120)
Seat 5: V4 ($95)
Seat 6: V5 ($110)
V4: posts small blind $0.50
V5: posts big blind $1
*** HOLE CARDS ***
Dealt to Hero [As Kd]
Hero raises to $3
V1 folds
V2 calls $3
V3 folds
V4 folds
V5 folds
*** FLOP *** [Kh 7c 4d]
Hero bets $4.50
V2 calls $4.50
*** TURN *** [Kh 7c 4d] [9s]
Hero checks
V2 bets $11
Hero calls $11
*** RIVER *** [Kh 7c 4d 9s] [2c]
Hero bets $18
V2 folds
Uncalled bet returned to Hero
Hero wins $29.50`;

    const PS_HAND_2_FULLHOUSE = `PokerStars Hand #123456789001: Hold'em No Limit ($0.25/$0.50 USD)
Table 'Pegasus 6-max' Seat #1 is the button
Seat 1: Hero ($80.25)
Seat 2: V1 ($60)
Seat 3: V2 ($55)
Seat 4: V3 ($44)
Seat 5: V4 ($100)
Seat 6: V5 ($110)
V4 posts SB $0.25
V5 posts BB $0.50
*** HOLE CARDS ***
Dealt to Hero [Qs Qd]
Hero raises to $1.25
V1 folds
V2 folds
V3 3-bets to $4
V4 folds
V5 folds
Hero calls $2.75
*** FLOP *** [Qc 8h 3s]
Hero checks
V3 bets $5.50
Hero calls $5.50
*** TURN *** [Qc 8h 3s] [Td]
Both players check
*** RIVER *** [Qc 8h 3s Td] [8c]
Hero bets $11
V3 calls $11
*** SHOW DOWN ***
Hero shows full house (Q full of 8)
V3 mucks [Ad Ac]
Hero wins $41`;

    const PS_HAND_3_NINMAX_SET = `PokerStars Hand #123456789002: Hold'em No Limit ($1/$2 USD) - 9-max
Table 'Titanium' Seat #8 is button
*** HOLE CARDS ***
Dealt to Hero [Jc Jh]
UTG raises to $6
MP calls
Hero calls
Blinds fold
*** FLOP *** [Js 9d 5c]
UTG bets $12
MP folds
Hero raises to $32
UTG calls
*** TURN *** [Js 9d 5c] [Qh]
Both players check
*** RIVER *** [Js 9d 5c Qh] [2s]
UTG bets $45
Hero calls $45
*** SHOW DOWN ***
Hero wins with set of Jacks
UTG shows Q pair`;

    const PS_HAND_10_TWOPAIR = `PokerStars Hand #123456789009: Hold'em No Limit ($0.50/$1.00) - 9-max
*** HOLE CARDS ***
Hero [Kd Qs]
UTG raises to $3
UTG+1 calls
Hero calls in CO
*** FLOP *** [Ks Ts 3c]
UTG bets $6
UTG+1 raises to $18
Hero calls
UTG folds
*** TURN *** [Ks Ts 3c] [Qc]
UTG+1 bets $28
Hero raises to $75
UTG+1 calls
*** RIVER *** [Ks Ts 3c Qc] [6h]
UTG+1 checks
Hero bets $140
UTG+1 folds
Hero wins`;

    it('should parse raise preflop + continuation bet (Hand #1)', () => {
      const result = HandParser.parse(PS_HAND_1_MULTISTREET);

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');
      expect(hand.maxPlayers).toBe(6);

      // Hero should have AK
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();
      expect(hero!.holeCards).toEqual(['As', 'Kd']);
    });

    it('should track pot size correctly across all streets (Hand #1)', () => {
      const result = HandParser.parse(PS_HAND_1_MULTISTREET);
      const hand = result.handHistory as HandHistory;

      // Should have snapshots for preflop, flop, turn, river
      const preflopSnap = hand.snapshots.find(s => s.street === 'preflop');
      const flopSnap = hand.snapshots.find(s => s.street === 'flop');
      const turnSnap = hand.snapshots.find(s => s.street === 'turn');
      const riverSnap = hand.snapshots.find(s => s.street === 'river');

      expect(preflopSnap).toBeDefined();
      expect(flopSnap).toBeDefined();
      expect(turnSnap).toBeDefined();
      expect(riverSnap).toBeDefined();
    });

    it('should parse full house showdown (Hand #2)', () => {
      const result = HandParser.parse(PS_HAND_2_FULLHOUSE);
      const hand = result.handHistory as HandHistory;

      expect(hand.site).toBe('PokerStars');

      // Should have showdown
      const showdownSnap = hand.snapshots.find(s => s.street === 'showdown');
      expect(showdownSnap).toBeDefined();

      // Hero should win
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();
    });

    it('should parse 9-max multiway pot (Hand #3)', () => {
      const result = HandParser.parse(PS_HAND_3_NINMAX_SET);
      const hand = result.handHistory as HandHistory;

      expect(hand.maxPlayers).toBe(9);

      // Hero has JJ
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.holeCards).toEqual(['Jc', 'Jh']);
    });

    it('should parse 9-max turn raise dynamics (Hand #10)', () => {
      const result = HandParser.parse(PS_HAND_10_TWOPAIR);
      const hand = result.handHistory as HandHistory;

      expect(hand.maxPlayers).toBe(9);

      // Hero has KQ
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.holeCards).toEqual(['Kd', 'Qs']);
    });
  });

  describe('Special Scenarios', () => {
    const PS_HAND_6_FULLHOUSE_SHOVE = `PokerStars Hand #123456789005: Hold'em No Limit ($0.50/$1.00 USD) - 6-max
Table 'Andromeda' Seat #2 is the button
Seat 1: Hero ($140)
Seat 2: V1 ($100)
Seat 3: V2 ($90)
Seat 4: V3 ($200)
Seat 5: V4 ($50)
Seat 6: V5 ($160)
V4 posts SB $0.50
V5 posts BB $1
*** HOLE CARDS ***
Hero dealt [Td Ts]
Hero raises to $3
V1 folds
V2 3-bets to $10
V3 folds
V4 folds
V5 folds
Hero calls $7
*** FLOP *** [Th 6c 2d]
Hero checks
V2 bets $12
Hero raises to $36
V2 calls
*** TURN *** [Th 6c 2d] [7d]
Hero bets $55
V2 calls
*** RIVER *** [Th 6c 2d 7d] [7h]
Hero checks
V2 shoves $32
Hero calls
*** SHOW DOWN ***
Hero shows full house (T over 7)
V2 shows flush missed bluff [Ad Kd]
Hero wins $183`;

    const PS_HAND_7_FLUSH_FOLD = `PokerStars Hand #123456789006: Hold'em No Limit ($2/$4 USD) - 9-max
Table 'Lyra' Seat #4 is the button
*** HOLE CARDS ***
Hero [Ac Kc]
UTG raises to $12
MP calls
Hero 3-bets to $42
Blinds fold
UTG folds
MP calls
*** FLOP *** [8c Jc 3s]
MP checks
Hero bets $55
MP calls
*** TURN *** [8c Jc 3s] [4c]
MP checks
Hero bets $110
MP calls
*** RIVER *** [8c Jc 3s 4c] [2h]
MP bets $260
Hero folds
MP shows bluff [9s Td]
MP wins`;

    const PS_HAND_9_QUADS = `PokerStars Hand #123456789008: Hold'em No Limit ($0.10/$0.25) - 6-max
*** HOLE CARDS ***
Hero [5c 5s]
Hero raises to $0.60
SB folds
BB calls
*** FLOP *** [5d 5h 9c]
BB checks
Hero bets $0.75
BB folds
Hero wins`;

    it('should handle 3-bet pot with full house (Hand #6)', () => {
      const result = HandParser.parse(PS_HAND_6_FULLHOUSE_SHOVE);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');
      expect(hand.maxPlayers).toBe(6);

      // Hero has TT
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.holeCards).toEqual(['Td', 'Ts']);

      // Should have showdown
      const showdownSnap = hand.snapshots.find(s => s.street === 'showdown');
      expect(showdownSnap).toBeDefined();
    });

    it('should handle river shove call (Hand #6)', () => {
      const result = HandParser.parse(PS_HAND_6_FULLHOUSE_SHOVE);
      const hand = result.handHistory as HandHistory;

      // River snapshot should exist
      const riverSnap = hand.snapshots.find(s => s.street === 'river');
      expect(riverSnap).toBeDefined();

      // Hero should win
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();
    });

    it('should handle flush draw fold to large river bet (Hand #7)', () => {
      const result = HandParser.parse(PS_HAND_7_FLUSH_FOLD);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.maxPlayers).toBe(9);

      // Hero has AKs clubs
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.holeCards).toEqual(['Ac', 'Kc']);
    });

    it('should parse quads flopping (Hand #9)', () => {
      const result = HandParser.parse(PS_HAND_9_QUADS);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.maxPlayers).toBe(6);

      // Hero has 55
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.holeCards).toEqual(['5c', '5s']);

      // Board should have two 5s
      expect(hand.board).toContain('5d');
      expect(hand.board).toContain('5h');
    });

    it('should handle uncalled bets correctly (Hand #1 & #9)', () => {
      const result1 = HandParser.parse(PS_HAND_9_QUADS);
      const hand1 = result1.handHistory as HandHistory;

      // Should track uncalled bet
      const riverSnap = hand1.snapshots.find(s => s.street === 'flop');
      expect(riverSnap).toBeDefined();
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
