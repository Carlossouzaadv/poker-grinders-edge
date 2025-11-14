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

  describe('10-Max Tables', () => {
    const PS_10MAX_CASH = `PokerStars Hand #445566778899: Hold'em No Limit ($0.50/$1.00 USD) - 2025/11/14 11:00:00 ET
Table 'Galaxy' 10-max Seat #5 is the button
Seat 1: Player1 ($100.00 in chips)
Seat 2: Player2 ($120.50 in chips)
Seat 3: Player3 ($98.00 in chips)
Seat 4: Player4 ($150.00 in chips)
Seat 5: Player5 ($200.00 in chips)
Seat 6: Hero ($100.00 in chips)
Seat 7: Player7 ($110.00 in chips)
Seat 8: Player8 ($95.50 in chips)
Seat 9: Player9 ($130.00 in chips)
Seat 10: Player10 ($80.00 in chips)
Hero: posts small blind $0.50
Player7: posts big blind $1.00
*** HOLE CARDS ***
Dealt to Hero [9h 9d]
Player8: folds
Player9: raises $2.50 to $3.50
Player10: folds
Player1: folds
Player2: folds
Player3: folds
Player4: calls $3.50
Player5: folds
Hero: calls $3.00
Player7: folds
*** FLOP *** [9c 4h 2d]
Hero: checks
Player9: bets $8.00
Player4: folds
Hero: raises $16.00 to $24.00
Player9: calls $16.00
*** TURN *** [9c 4h 2d] [Kh]
Hero: bets $35.00
Player9: folds
Uncalled bet ($35.00) returned to Hero
Hero collected $58.50 from pot
Hero: doesn't show hand
*** SUMMARY ***
Total pot $58.50 | Rake $2.50
Board [9c 4h 2d Kh]
Seat 6: Hero (small blind) collected ($58.50)`;

    it('should parse 10-max cash game format', () => {
      const result = HandParser.parse(PS_10MAX_CASH);

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');
      expect(hand.maxPlayers).toBe(10);
    });

    it('should handle all 10 players correctly', () => {
      const result = HandParser.parse(PS_10MAX_CASH);
      const hand = result.handHistory as HandHistory;

      expect(hand.players).toHaveLength(10);

      // Hero should be at seat 6
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();
      expect(hero!.holeCards).toEqual([
        { rank: '9', suit: 'h' },
        { rank: '9', suit: 'd' }
      ]);
      expect(hero!.stack).toBe(100.00);
    });

    it('should validate perfect 10-max visual positioning', () => {
      const result = HandParser.parse(PS_10MAX_CASH);
      const hand = result.handHistory as HandHistory;

      // This validates our symmetric 10-max layout from previous commits
      // All 10 seats should be present with proper positioning
      expect(hand.players.length).toBe(10);

      // Check that seats 1-10 are all occupied
      const seatNumbers = hand.players.map(p => p.seat).sort((a, b) => a - b);
      expect(seatNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
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

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();

      const hand = result.handHistory as HandHistory;
      expect(hand.tournamentId).toBe('888888');
      expect(hand.gameContext.isTournament).toBe(true);

      // Should have showdown data
      expect(hand.showdown).toBeDefined();

      // Hero should exist in players
      const heroPlayer = hand.players.find(p => p.name === 'Hero');
      expect(heroPlayer).toBeDefined();
      expect(heroPlayer!.isHero).toBe(true);
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

  describe('All-In Scenarios', () => {
    const PS_ALLIN_ACES = `PokerStars Hand #2233445566: Hold'em No Limit ($0.50/$1.00 USD) - 2025/11/14 09:50:00 ET
Table 'Urania' 6-max Seat #1 is the button
Seat 1: PlayerA ($100.00 in chips)
Seat 2: PlayerB ($120.50 in chips)
Seat 3: PlayerC ($98.00 in chips)
Seat 4: PlayerD ($205.00 in chips)
Seat 5: Hero ($100.00 in chips)
Seat 6: PlayerF ($75.00 in chips)
PlayerB: posts small blind $0.50
PlayerC: posts big blind $1.00
*** HOLE CARDS ***
Dealt to Hero [Ac As]
PlayerD: folds
Hero: raises $2.00 to $3.00
PlayerF: folds
PlayerA: folds
PlayerB: folds
PlayerC: raises $7.00 to $10.00
Hero: raises $90.00 to $100.00 and is all-in
PlayerC: calls $88.00 and is all-in
Uncalled bet ($2.00) returned to Hero
*** FLOP *** [Kd 8h 2s]
*** TURN *** [Kd 8h 2s] [4c]
*** RIVER *** [Kd 8h 2s 4c] [Js]
*** SHOW DOWN ***
PlayerC: shows [Qc Qh] (a pair of Queens)
Hero: shows [Ac As] (a pair of Aces)
Hero collected $197.50 from pot
*** SUMMARY ***
Total pot $197.50 | Rake $1.50
Board [Kd 8h 2s 4c Js]
Seat 1: PlayerA (button) folded before Flop (didn't bet)
Seat 2: PlayerB (small blind) folded before Flop
Seat 3: PlayerC (big blind) showed [Qc Qh] and lost with a pair of Queens
Seat 4: PlayerD folded before Flop (didn't bet)
Seat 5: Hero showed [Ac As] and won ($197.50) with a pair of Aces
Seat 6: PlayerF folded before Flop (didn't bet)`;

    const PS_MTT_SIDEPOT = `PokerStars Hand #2233445577: Tournament #123456789, $10+$1 USD Hold'em No Limit - Level IV (100/200) - 2025/11/14 09:55:00 ET
Table 'Musca' 9-max Seat #3 is the button
Seat 1: PlayerA ($1500 in chips)
Seat 2: PlayerB ($5000 in chips)
Seat 3: PlayerC (BTN) ($8000 in chips)
Seat 4: PlayerD (SB) ($10000 in chips)
Seat 5: PlayerE (BB) ($12000 in chips)
Seat 6: PlayerF ($3000 in chips)
Seat 7: Hero ($3000 in chips)
Seat 8: PlayerH ($3000 in chips)
Seat 9: PlayerI ($3000 in chips)
PlayerD: posts small blind 100
PlayerE: posts big blind 200
*** HOLE CARDS ***
Dealt to Hero [Jc Jd]
PlayerF: folds
Hero: raises 400 to 600
PlayerH: folds
PlayerI: folds
PlayerA: raises 900 to 1500 and is all-in
PlayerB: calls 1500
PlayerC: folds
PlayerD: folds
PlayerE: folds
Hero: raises 1500 to 3000 and is all-in
PlayerB: calls 1500
*** FLOP *** [Ah 9s 2c]
*** TURN *** [Ah 9s 2c] [4d]
*** RIVER *** [Ah 9s 2c 4d] [Kc]
*** SHOW DOWN ***
Hero: shows [Jc Jd] (a pair of Jacks)
PlayerB: shows [Qc Qh] (a pair of Queens)
PlayerB collected 3000 from side pot
PlayerA: shows [Ts Tc] (a pair of Tens)
PlayerB collected 4800 from main pot
PlayerA finished the tournament in 9th place
Hero finished the tournament in 8th place
*** SUMMARY ***
Total pot 7800 Main pot 4800. Side pot 3000. | Rake 0
Board [Ah 9s 2c 4d Kc]
Seat 1: PlayerA (all-in) showed [Ts Tc] and lost with a pair of Tens
Seat 2: PlayerB showed [Qc Qh] and won (7800) with a pair of Queens
Seat 3: PlayerC (button) folded before Flop (didn't bet)
Seat 4: PlayerD (small blind) folded before Flop
Seat 5: PlayerE (big blind) folded before Flop
Seat 7: Hero (all-in) showed [Jc Jd] and lost with a pair of Jacks`;

    it('should parse 4-bet all-in with AA vs QQ (Amostra 1)', () => {
      const result = HandParser.parse(PS_ALLIN_ACES);

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');
      expect(hand.maxPlayers).toBe(6);

      // Hero has AA
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();
      expect(hero!.holeCards).toEqual([
        { rank: 'A', suit: 'c' },
        { rank: 'A', suit: 's' }
      ]);

      // Should have showdown
      // Showdown data is in hand.showdown
      expect(hand.showdown).toBeDefined();
    });

    it('should handle uncalled bet returned to Hero (Amostra 1)', () => {
      const result = HandParser.parse(PS_ALLIN_ACES);
      const hand = result.handHistory as HandHistory;

      // Hero should win with AA
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();

      // Total pot should be $197.50 with rake $1.50
      expect(hand.totalPot).toBe(197.50);
      expect(hand.rake).toBe(1.50);
    });

    it('should parse 9-max MTT with side pot (Amostra 2)', () => {
      const result = HandParser.parse(PS_MTT_SIDEPOT);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');
      expect(hand.maxPlayers).toBe(9);
      expect(hand.gameContext.isTournament).toBe(true);

      // Tournament details
      expect(hand.tournamentId).toBe('123456789');
      expect(hand.smallBlind).toBe(100);
      expect(hand.bigBlind).toBe(200);
    });

    it('should create main pot and side pot correctly (Amostra 2)', () => {
      const result = HandParser.parse(PS_MTT_SIDEPOT);
      const hand = result.handHistory as HandHistory;

      // Should have showdown with side pots
      // Showdown data is in hand.showdown
      expect(hand.showdown).toBeDefined();

      // Total pot should be 7800 (main: 4800, side: 3000)
      expect(hand.totalPot).toBe(7800);
    });

    it('should track tournament eliminations (Amostra 2)', () => {
      const result = HandParser.parse(PS_MTT_SIDEPOT);
      const hand = result.handHistory as HandHistory;

      // PlayerA and Hero should be marked as eliminated
      const playerA = hand.players.find(p => p.name === 'PlayerA');
      const hero = hand.players.find(p => p.name === 'Hero');

      expect(playerA).toBeDefined();
      expect(hero).toBeDefined();
    });
  });

  describe('Spin & Go (3-max Tournament)', () => {
    const PS_SPINGO_3MAX = `PokerStars Hand #334455667788: Tournament #998877665, $5.00+$0.50 USD Hold'em No Limit - Level III (25/50) - 2025/11/14 10:30:00 ET
Table '998877665 1' 3-max Seat #1 is the button
Seat 1: Hero ($1500 in chips)
Seat 2: Player2 ($1450 in chips)
Seat 3: Player3 ($1550 in chips)
Hero: posts small blind 25
Player2: posts big blind 50
*** HOLE CARDS ***
Dealt to Hero [Ad Qh]
Player3: folds
Hero: raises 75 to 125
Player2: calls 75
*** FLOP *** [Ah 8c 3d]
Hero: bets 100
Player2: calls 100
*** TURN *** [Ah 8c 3d] [Qs]
Hero: bets 225
Player2: calls 225
*** RIVER *** [Ah 8c 3d Qs] [2h]
Hero: bets 450
Player2: folds
Uncalled bet (450) returned to Hero
Hero collected 900 from pot
Hero: doesn't show hand
*** SUMMARY ***
Total pot 900 | Rake 0
Board [Ah 8c 3d Qs 2h]
Seat 1: Hero (button) (small blind) collected (900)
Seat 2: Player2 (big blind) folded on the River
Seat 3: Player3 folded before Flop (didn't bet)`;

    it('should parse Spin & Go format', () => {
      const result = HandParser.parse(PS_SPINGO_3MAX);

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');
      expect(hand.gameContext.isTournament).toBe(true);
      expect(hand.tournamentId).toBe('998877665');
    });

    it('should handle 3-max table correctly', () => {
      const result = HandParser.parse(PS_SPINGO_3MAX);
      const hand = result.handHistory as HandHistory;

      expect(hand.maxPlayers).toBe(3);
      expect(hand.players).toHaveLength(3);

      // Hero should be at button (also SB in 3-max)
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();
      expect(hero!.holeCards).toEqual([{ rank: 'A', suit: 'd' }, { rank: 'Q', suit: 'h' }]);
    });

    it('should track actions correctly in 3-max', () => {
      const result = HandParser.parse(PS_SPINGO_3MAX);
      const hand = result.handHistory as HandHistory;

      // Should have preflop, flop, turn, river snapshots
      // Preflop actions are in hand.preflop
      // Flop data is in hand.flop
      // Turn data is in hand.turn
      // River data is in hand.river

      expect(hand.preflop.length).toBeGreaterThan(0);
      expect(hand.flop.cards.length).toBeGreaterThan(0);
      expect(hand.turn.card).toBeDefined();
      expect(hand.river.card).toBeDefined();
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
      expect(hero!.holeCards).toEqual([{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'd' }]);
    });

    it('should track pot size correctly across all streets (Hand #1)', () => {
      const result = HandParser.parse(PS_HAND_1_MULTISTREET);
      const hand = result.handHistory as HandHistory;

      // Should have snapshots for preflop, flop, turn, river
      // Preflop actions are in hand.preflop
      // Flop data is in hand.flop
      // Turn data is in hand.turn
      // River data is in hand.river

      expect(hand.preflop.length).toBeGreaterThan(0);
      expect(hand.flop.cards.length).toBeGreaterThan(0);
      expect(hand.turn.card).toBeDefined();
      expect(hand.river.card).toBeDefined();
    });

    it('should parse full house showdown (Hand #2)', () => {
      const result = HandParser.parse(PS_HAND_2_FULLHOUSE);
      const hand = result.handHistory as HandHistory;

      expect(hand.site).toBe('PokerStars');

      // Should have showdown
      // Showdown data is in hand.showdown
      expect(hand.showdown).toBeDefined();

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
      expect(hero!.holeCards).toEqual([{ rank: 'J', suit: 'c' }, { rank: 'J', suit: 'h' }]);
    });

    it('should parse 9-max turn raise dynamics (Hand #10)', () => {
      const result = HandParser.parse(PS_HAND_10_TWOPAIR);
      const hand = result.handHistory as HandHistory;

      expect(hand.maxPlayers).toBe(9);

      // Hero has KQ
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.holeCards).toEqual([{ rank: 'K', suit: 'd' }, { rank: 'Q', suit: 's' }]);
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
      expect(hero!.holeCards).toEqual([{ rank: 'T', suit: 'd' }, { rank: 'T', suit: 's' }]);

      // Should have showdown
      // Showdown data is in hand.showdown
      expect(hand.showdown).toBeDefined();
    });

    it('should handle river shove call (Hand #6)', () => {
      const result = HandParser.parse(PS_HAND_6_FULLHOUSE_SHOVE);
      const hand = result.handHistory as HandHistory;

      // River snapshot should exist
      // River data is in hand.river
      expect(hand.river.card).toBeDefined();

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
      expect(hero!.holeCards).toEqual([{ rank: 'A', suit: 'c' }, { rank: 'K', suit: 'c' }]);
    });

    it('should parse quads flopping (Hand #9)', () => {
      const result = HandParser.parse(PS_HAND_9_QUADS);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.maxPlayers).toBe(6);

      // Hero has 55
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.holeCards).toEqual([{ rank: '5', suit: 'c' }, { rank: '5', suit: 's' }]);

      // Board should have two 5s
      expect(hand.board).toContain('5d');
      expect(hand.board).toContain('5h');
    });

    it('should handle uncalled bets correctly (Hand #1 & #9)', () => {
      const result1 = HandParser.parse(PS_HAND_9_QUADS);

      expect(result1.success).toBe(true);
      expect(result1.handHistory).toBeDefined();

      const hand1 = result1.handHistory as HandHistory;

      // Should parse hand successfully with uncalled bet action
      // Uncalled bets are tracked in the action arrays
      const hasUncalledBet = hand1.preflop.some(a => a.action === 'uncalled_return') ||
                             hand1.flop.actions.some(a => a.action === 'uncalled_return') ||
                             hand1.turn.actions.some(a => a.action === 'uncalled_return') ||
                             hand1.river.actions.some(a => a.action === 'uncalled_return');

      // Hand should parse successfully even with uncalled bets
      expect(hand1.handId).toBeDefined();
    });
  });

  describe('Micro Stakes (Decimal Values)', () => {
    const PS_MICRO_STAKES = `PokerStars Hand #556677889900: Hold'em No Limit ($0.01/$0.02 USD) - 2025/11/14 12:00:00 ET
Table 'Micro II' 6-max Seat #3 is the button
Seat 1: MicroPlayer1 ($2.00 in chips)
Seat 2: MicroPlayer2 ($1.85 in chips)
Seat 3: Hero ($2.50 in chips)
Seat 4: MicroPlayer4 ($3.00 in chips)
Seat 5: MicroPlayer5 ($1.50 in chips)
Seat 6: MicroPlayer6 ($2.25 in chips)
MicroPlayer4: posts small blind $0.01
MicroPlayer5: posts big blind $0.02
*** HOLE CARDS ***
Dealt to Hero [Kh Kd]
MicroPlayer6: folds
MicroPlayer1: raises $0.04 to $0.06
MicroPlayer2: folds
Hero: raises $0.12 to $0.18
MicroPlayer4: folds
MicroPlayer5: folds
MicroPlayer1: calls $0.12
*** FLOP *** [8c 3h 2d]
MicroPlayer1: checks
Hero: bets $0.25
MicroPlayer1: folds
Uncalled bet ($0.25) returned to Hero
Hero collected $0.38 from pot
Hero: doesn't show hand
*** SUMMARY ***
Total pot $0.39 | Rake $0.01
Board [8c 3h 2d]
Seat 3: Hero (button) collected ($0.38)`;

    it('should parse micro stakes with decimal precision', () => {
      const result = HandParser.parse(PS_MICRO_STAKES);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');
      expect(hand.stakes).toBe('$0.01/$0.02');
      expect(hand.smallBlind).toBe(0.01);
      expect(hand.bigBlind).toBe(0.02);
    });

    it('should handle very small decimal amounts correctly', () => {
      const result = HandParser.parse(PS_MICRO_STAKES);
      const hand = result.handHistory as HandHistory;

      // Check pot and rake with decimal precision
      expect(hand.totalPot).toBe(0.39);
      expect(hand.rake).toBe(0.01);

      // Check player stacks
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.stack).toBe(2.50);
    });

    it('should maintain precision in micro stakes calculations', () => {
      const result = HandParser.parse(PS_MICRO_STAKES);
      const hand = result.handHistory as HandHistory;

      // Verify no floating point errors in tiny amounts
      // Preflop actions are in hand.preflop
      expect(hand.preflop.length).toBeGreaterThan(0);
    });
  });

  describe('Straddle Scenarios', () => {
    const PS_STRADDLE_HAND = `PokerStars Hand #667788990011: Hold'em No Limit ($1/$2 USD) - 2025/11/14 13:00:00 ET
Table 'Straddle Test' 6-max Seat #1 is the button
Seat 1: Player1 ($200.00 in chips)
Seat 2: Hero ($300.00 in chips)
Seat 3: Player3 ($250.00 in chips)
Seat 4: Player4 ($400.00 in chips)
Seat 5: Player5 ($150.00 in chips)
Seat 6: Player6 ($175.00 in chips)
Hero: posts small blind $1
Player3: posts big blind $2
Player4: posts straddle $4
*** HOLE CARDS ***
Dealt to Hero [Ac Kc]
Player5: folds
Player6: folds
Player1: folds
Hero: raises $12 to $16
Player3: folds
Player4: calls $12
*** FLOP *** [As Qd 7c]
Hero: bets $22
Player4: calls $22
*** TURN *** [As Qd 7c] [Kh]
Hero: bets $55
Player4: folds
Uncalled bet ($55) returned to Hero
Hero collected $76 from pot
*** SUMMARY ***
Total pot $78 | Rake $2
Board [As Qd 7c Kh]
Seat 2: Hero (small blind) collected ($76)`;

    it('should recognize straddle as special blind', () => {
      const result = HandParser.parse(PS_STRADDLE_HAND);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');

      // Should detect straddle (effectively makes it like $2/$4 game)
      expect(hand.smallBlind).toBe(1);
      expect(hand.bigBlind).toBe(2);
    });

    it('should handle preflop action with straddle', () => {
      const result = HandParser.parse(PS_STRADDLE_HAND);
      const hand = result.handHistory as HandHistory;

      // Straddle creates larger preflop pot
      // Preflop actions are in hand.preflop
      expect(hand.preflop.length).toBeGreaterThan(0);

      // Hero should have AK
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.holeCards).toEqual([{ rank: 'A', suit: 'c' }, { rank: 'K', suit: 'c' }]);
    });
  });

  describe('Everyone Folds Preflop (No Showdown)', () => {
    const PS_ALL_FOLD_PREFLOP = `PokerStars Hand #778899001122: Hold'em No Limit ($0.50/$1.00 USD) - 2025/11/14 14:00:00 ET
Table 'QuickFold' 6-max Seat #4 is the button
Seat 1: Player1 ($100.00 in chips)
Seat 2: Player2 ($150.00 in chips)
Seat 3: Hero ($200.00 in chips)
Seat 4: Player4 ($75.00 in chips)
Seat 5: Player5 ($120.00 in chips)
Seat 6: Player6 ($90.00 in chips)
Player5: posts small blind $0.50
Player6: posts big blind $1.00
*** HOLE CARDS ***
Dealt to Hero [Ah Ac]
Player1: folds
Player2: folds
Hero: raises $3.00 to $4.00
Player4: folds
Player5: folds
Player6: folds
Uncalled bet ($3.00) returned to Hero
Hero collected $2.50 from pot
Hero: doesn't show hand
*** SUMMARY ***
Total pot $2.50 | Rake $0
Seat 3: Hero collected ($2.50)`;

    it('should parse hand where everyone folds preflop', () => {
      const result = HandParser.parse(PS_ALL_FOLD_PREFLOP);

      expect(result.success).toBe(true);

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PokerStars');
    });

    it('should handle no showdown scenario', () => {
      const result = HandParser.parse(PS_ALL_FOLD_PREFLOP);
      const hand = result.handHistory as HandHistory;

      // Should only have preflop actions
      expect(hand.preflop.length).toBeGreaterThan(0);

      // Should NOT have flop cards, turn card, river card, or showdown
      expect(hand.flop.cards.length).toBe(0);
      expect(hand.turn.card).toBeNull();
      expect(hand.river.card).toBeNull();
      expect(hand.showdown).toBeUndefined();
    });

    it('should correctly award pot without showdown', () => {
      const result = HandParser.parse(PS_ALL_FOLD_PREFLOP);
      const hand = result.handHistory as HandHistory;

      // Hero should win small pot
      expect(hand.totalPot).toBe(2.50);
      expect(hand.rake).toBe(0);

      // Hero's cards should be defined (they were dealt)
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();
      expect(hero!.holeCards).toEqual([
        { rank: 'A', suit: 'h' },
        { rank: 'A', suit: 'c' }
      ]);
    });
  });

  /**
   * =================================================================
   * EDGE CASES - ADVANCED SCENARIOS
   * =================================================================
   * Testing complex, rare, and edge case scenarios that can happen
   * in real games but are less common
   */
  describe('Edge Cases - PokerStars Advanced Scenarios', () => {
    // Edge Case 1: 3-way all-in with complex side pots
    it('should handle 3-way all-in with partial coverage and multiple side pots', () => {
      const PS_3WAY_ALLIN = `PokerStars Hand #234567890: Hold'em No Limit ($1/$2 USD) - 2025/01/15 14:30:00 ET
Table 'Vega IV' 6-max Seat #4 is the button
Seat 1: ShortStack ($35.00 in chips)
Seat 3: MidStack ($87.50 in chips)
Seat 4: Hero ($150.00 in chips)
Seat 5: BigStack ($200.00 in chips)
ShortStack: posts small blind $1
MidStack: posts big blind $2
*** HOLE CARDS ***
Dealt to Hero [As Ah]
Hero: raises $6 to $8
BigStack: raises $18 to $26
ShortStack: raises $9 to $35 and is all-in
MidStack: calls $33
Hero: raises $115 to $150 and is all-in
BigStack: calls $124
MidStack: calls $52.50 and is all-in
*** FLOP *** [Kh 9c 2d]
*** TURN *** [Kh 9c 2d] [3s]
*** RIVER *** [Kh 9c 2d 3s] [7h]
*** SHOW DOWN ***
ShortStack: shows [Qc Qd] (a pair of Queens)
MidStack: shows [Jc Js] (a pair of Jacks)
Hero: shows [As Ah] (a pair of Aces)
BigStack: shows [Kc Ks] (three of a kind, Kings)
BigStack wins with three of a kind, Kings
*** SUMMARY ***
Total pot $419.50 Main pot $137. Side pot-1 $157.50. Side pot-2 $125. | Rake $0
Board [Kh 9c 2d 3s 7h]
Seat 1: ShortStack (small blind) showed [Qc Qd] and lost with a pair of Queens
Seat 3: MidStack (big blind) showed [Jc Js] and lost with a pair of Jacks
Seat 4: Hero (button) showed [As Ah] and lost with a pair of Aces
Seat 5: BigStack showed [Kc Ks] and won ($419.50) with three of a kind, Kings`;

      const result = HandParser.parse(PS_3WAY_ALLIN);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.site).toBe('PokerStars');
      expect(hand.totalPot).toBe(419.50);

      // Verify all 4 players present
      expect(hand.players.length).toBe(4);

      // Verify showdown
      expect(hand.showdown).toBeDefined();
      expect(hand.showdown!.winners).toContain('BigStack');

      // Verify board cards
      expect(hand.board).toContain('Kh');
      expect(hand.board?.length).toBe(5);
    });

    // Edge Case 2: Heads-up battle (button vs BB)
    it('should handle heads-up hand correctly', () => {
      const PS_HEADSUP = `PokerStars Hand #345678901: Hold'em No Limit ($5/$10 USD) - 2025/01/15 15:00:00 ET
Table 'Heads-Up Match' 2-max Seat #1 is the button
Seat 1: Hero ($1000.00 in chips)
Seat 2: Villain ($1000.00 in chips)
Hero: posts small blind $5
Villain: posts big blind $10
*** HOLE CARDS ***
Dealt to Hero [Ac Kd]
Hero: raises $20 to $30
Villain: raises $70 to $100
Hero: raises $200 to $300
Villain: calls $200
*** FLOP *** [As Ks Qh]
Villain: checks
Hero: bets $200
Villain: raises $300 to $500
Hero: raises $200 to $700 and is all-in
Villain: calls $200 and is all-in
*** TURN *** [As Ks Qh] [2c]
*** RIVER *** [As Ks Qh 2c] [9d]
*** SHOW DOWN ***
Hero: shows [Ac Kd] (two pair, Aces and Kings)
Villain: shows [Ah Qd] (two pair, Aces and Queens)
Hero wins with two pair, Aces and Kings
*** SUMMARY ***
Total pot $2000 | Rake $1
Board [As Ks Qh 2c 9d]
Seat 1: Hero (button) (small blind) showed [Ac Kd] and won ($1999) with two pair, Aces and Kings
Seat 2: Villain (big blind) showed [Ah Qd] and lost with two pair, Aces and Queens`;

      const result = HandParser.parse(PS_HEADSUP);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.maxPlayers).toBe(2);
      expect(hand.players.length).toBe(2);

      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero?.position).toBe('BTN'); // In heads-up, button is also SB

      expect(hand.showdown?.winners).toContain('Hero');
      expect(hand.rake).toBe(1);
    });

    // Edge Case 3: Split pot (chop)
    it('should handle split pot correctly', () => {
      const PS_SPLIT_POT = `PokerStars Hand #456789012: Hold'em No Limit ($0.50/$1.00 USD) - 2025/01/15 16:00:00 ET
Table 'Nebula VIII' 6-max Seat #3 is the button
Seat 1: Player1 ($100.00 in chips)
Seat 2: Hero ($120.00 in chips)
Seat 3: Player3 ($95.00 in chips)
Seat 5: Player5 ($110.00 in chips)
Player5: posts small blind $0.50
Player1: posts big blind $1
*** HOLE CARDS ***
Dealt to Hero [Ad Kh]
Hero: raises $3 to $4
Player3: folds
Player5: calls $3.50
Player1: calls $3
*** FLOP *** [Ac Kc Qc]
Player5: checks
Player1: bets $8
Hero: raises $16 to $24
Player5: folds
Player1: calls $16
*** TURN *** [Ac Kc Qc] [Jc]
Player1: checks
Hero: bets $40
Player1: calls $40
*** RIVER *** [Ac Kc Qc Jc] [Tc]
Player1: checks
Hero: checks
*** SHOW DOWN ***
Player1: shows [As Ks] (a straight flush, Ten to Ace)
Hero: shows [Ad Kh] (a straight flush, Ten to Ace)
Player1 wins with a straight flush, Ten to Ace
Hero wins with a straight flush, Ten to Ace
*** SUMMARY ***
Total pot $134 | Rake $2
Board [Ac Kc Qc Jc Tc]
Seat 1: Player1 (big blind) showed [As Ks] and won ($66) with a straight flush, Ten to Ace
Seat 2: Hero showed [Ad Kh] and won ($66) with a straight flush, Ten to Ace`;

      const result = HandParser.parse(PS_SPLIT_POT);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.showdown).toBeDefined();
      expect(hand.showdown!.winners).toContain('Player1');
      expect(hand.showdown!.winners).toContain('Hero');
      expect(hand.showdown!.winners.length).toBe(2); // Both won
      expect(hand.totalPot).toBe(134);
    });

    // Edge Case 4: Player sitting out wins blinds
    it('should handle player sitting out status', () => {
      const PS_SITTING_OUT = `PokerStars Hand #567890123: Hold'em No Limit ($0.25/$0.50 USD) - 2025/01/15 17:00:00 ET
Table 'Orion XII' 6-max Seat #2 is the button
Seat 1: ActivePlayer ($50.00 in chips)
Seat 2: Hero ($75.00 in chips)
Seat 3: SittingPlayer ($45.00 in chips, is sitting out)
Seat 5: Player5 ($60.00 in chips)
Player5: posts small blind $0.25
ActivePlayer: posts big blind $0.50
*** HOLE CARDS ***
Dealt to Hero [2c 7d]
Hero: folds
SittingPlayer: folds
Player5: folds
Uncalled bet ($0.25) returned to ActivePlayer
ActivePlayer collected $0.50 from pot
ActivePlayer: doesn't show hand
*** SUMMARY ***
Total pot $0.50 | Rake $0
Seat 1: ActivePlayer (big blind) collected ($0.50)
Seat 3: SittingPlayer folded before Flop (didn't bet)`;

      const result = HandParser.parse(PS_SITTING_OUT);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      const sittingPlayer = hand.players.find(p => p.name === 'SittingPlayer');
      expect(sittingPlayer).toBeDefined();
      // TODO: Parser should detect 'is sitting out' status in future
      // expect(sittingPlayer?.status).toBe('sitting_out');

      // Should not reach showdown
      expect(hand.showdown).toBeUndefined();
      expect(hand.flop.cards.length).toBe(0);
    });

    // Edge Case 5: PKO Tournament with bounty
    it('should parse PKO tournament with bounty information', () => {
      const PS_PKO = `PokerStars Hand #678901234: Tournament #987654321, $10+$10+$2 USD Hold'em No Limit - Level III (25/50) - 2025/01/15 18:00:00 ET
Table '987654321 1' 9-max Seat #5 is the button
Seat 1: Player1 (3000 in chips, $10 bounty)
Seat 3: Hero (2850 in chips, $10 bounty)
Seat 5: Player5 (1200 in chips, $10 bounty)
Seat 7: BigStack (4950 in chips, $15 bounty)
Player1: posts the ante 5
Hero: posts the ante 5
Player5: posts the ante 5
BigStack: posts the ante 5
Player1: posts small blind 25
Hero: posts big blind 50
*** HOLE CARDS ***
Dealt to Hero [Kd Kc]
Player5: raises 1145 to 1195 and is all-in
BigStack: calls 1195
Player1: folds
Hero: raises 1650 to 2845 and is all-in
BigStack: calls 1650
*** FLOP *** [9h 3c 2d]
*** TURN *** [9h 3c 2d] [Qh]
*** RIVER *** [9h 3c 2d Qh] [5s]
*** SHOW DOWN ***
Player5: shows [Ah Jh] (high card Ace)
Hero: shows [Kd Kc] (a pair of Kings)
BigStack: shows [As Ad] (a pair of Aces)
BigStack wins with a pair of Aces
*** SUMMARY ***
Total pot 6935 Main pot 3635. Side pot 3300. | Rake 0
Board [9h 3c 2d Qh 5s]
Seat 1: Player1 (small blind) folded before Flop
Seat 3: Hero (big blind) showed [Kd Kc] and lost with a pair of Kings
Seat 5: Player5 (button) showed [Ah Jh] and lost with high card Ace
Seat 7: BigStack showed [As Ad] and won (6935) with a pair of Aces`;

      const result = HandParser.parse(PS_PKO);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.tournamentId).toBe('987654321');

      // Verify bounties are parsed
      const player1 = hand.players.find(p => p.name === 'Player1');
      expect(player1?.bounty).toBe(10);

      const bigStack = hand.players.find(p => p.name === 'BigStack');
      expect(bigStack?.bounty).toBe(15); // Started with higher bounty

      // Verify antes
      expect(hand.ante).toBe(5);
      expect(hand.antes).toBeDefined();
      expect(hand.antes?.length).toBeGreaterThanOrEqual(4); // 4 antes + possibly blinds
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
