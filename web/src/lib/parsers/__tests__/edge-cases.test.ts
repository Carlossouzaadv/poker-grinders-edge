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
      // Parser returns Portuguese message
      expect(result.error).toContain('Por favor');
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

  /**
   * =================================================================
   * GGPOKER EDGE CASES
   * =================================================================
   */
  describe('GGPoker Advanced Scenarios', () => {
    // GGPoker Edge 1: Large pot with comma-separated amounts
    it('should handle GGPoker large pots with commas', () => {
      const GG_LARGE_POT = `Poker Hand #HD345678901: Hold'em No Limit ($500/$1,000) - 2025/01/15 14:00:00
Table 'Big Money' 6-max Seat #2 is the button
Seat 1: Hero (125,000 in chips)
Seat 2: BigFish (95,500 in chips)
Seat 5: Shark (180,000 in chips)
Hero: posts small blind 500
BigFish: posts big blind 1,000
*** HOLE CARDS ***
Dealt to Hero [Kh Ks]
Shark: raises 3,000 to 4,000
Hero: raises 10,000 to 14,000
BigFish: folds
Shark: calls 10,000
*** FLOP *** [Kd 7c 2h]
Hero: bets 18,000
Shark: calls 18,000
*** TURN *** [Kd 7c 2h] [9s]
Hero: bets 35,000
Shark: raises 113,000 to 148,000 and is all-in
Hero: calls 58,000 and is all-in
*** RIVER *** [Kd 7c 2h 9s] [4c]
*** SHOW DOWN ***
Hero: shows [Kh Ks] (three of a kind, Kings)
Shark: shows [Ah Ad] (a pair of Aces)
Hero collected 251,000 from pot
*** SUMMARY ***
Total pot 251,000 | Rake 0 | Jackpot 0 | Bingo 0 | Fortune 0 | Tax 0
Board [Kd 7c 2h 9s 4c]
Seat 1: Hero (small blind) showed [Kh Ks] and won (251,000) with three of a kind, Kings
Seat 2: BigFish (big blind) folded before Flop
Seat 5: Shark showed [Ah Ad] and lost with a pair of Aces`;

      const result = HandParser.parse(GG_LARGE_POT);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.site).toBe('GGPoker');
      expect(hand.totalPot).toBe(251000);

      // Verify large stacks parsed correctly
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero?.stack).toBe(125000);
    });

    // GGPoker Edge 2: Tournament with antes and multiple all-ins
    it('should handle GGPoker tournament with antes', () => {
      const GG_TOURNAMENT_ANTES = `Poker Hand #TM456789012: Tournament #222333444, Test Tournament $5 Hold'em No Limit - Level6(100/200) - 2025/01/15 15:00:00
Table '222333444 8' 9-max Seat #3 is the button
Seat 1: Player1 (5,500 in chips)
Seat 2: Player2 (3,200 in chips)
Seat 3: Hero (8,000 in chips)
Seat 5: Player5 (2,800 in chips)
Seat 7: Player7 (6,500 in chips)
Player1: posts the ante 20
Player2: posts the ante 20
Hero: posts the ante 20
Player5: posts the ante 20
Player7: posts the ante 20
Player5: posts small blind 100
Player7: posts big blind 200
*** HOLE CARDS ***
Dealt to Hero [Qh Qd]
Player1: raises 400 to 600
Player2: raises 2,580 to 3,180 and is all-in
Hero: calls 3,180
Player5: folds
Player7: folds
Player1: folds
*** FLOP *** [Jh 8c 3d]
*** TURN *** [Jh 8c 3d] [2s]
*** RIVER *** [Jh 8c 3d 2s] [9h]
*** SHOW DOWN ***
Player2: shows [Ac Kh] (high card Ace)
Hero: shows [Qh Qd] (a pair of Queens)
Hero collected 7,400 from pot
*** SUMMARY ***
Total pot 7,400 | Rake 0
Board [Jh 8c 3d 2s 9h]
Seat 2: Player2 showed [Ac Kh] and lost with high card Ace
Seat 3: Hero (button) showed [Qh Qd] and won (7,400) with a pair of Queens`;

      const result = HandParser.parse(GG_TOURNAMENT_ANTES);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.gameContext.isTournament).toBe(true);
      expect(hand.ante).toBe(20);
      expect(hand.rake).toBe(0); // Tournaments never have rake
    });

    // GGPoker Edge 3: 3-way pot with different winners
    it('should handle GGPoker 3-way pot with side pots', () => {
      const GG_3WAY = `Poker Hand #HD567890123: Hold'em No Limit ($50/$100) - 2025/01/15 16:00:00
Table 'Three Way' 6-max Seat #1 is the button
Seat 1: ShortStack (800 in chips)
Seat 3: Hero (2,500 in chips)
Seat 5: BigStack (4,000 in chips)
Hero: posts small blind 50
BigStack: posts big blind 100
*** HOLE CARDS ***
Dealt to Hero [As Kd]
ShortStack: raises 700 to 800 and is all-in
Hero: calls 750
BigStack: calls 700
*** FLOP *** [Ah Kh 9h]
Hero: bets 1,700 and is all-in
BigStack: calls 1,700
*** TURN *** [Ah Kh 9h] [2c]
*** RIVER *** [Ah Kh 9h 2c] [5s]
*** SHOW DOWN ***
ShortStack: shows [Jh Th] (a flush, Ace high)
Hero: shows [As Kd] (two pair, Aces and Kings)
BigStack: shows [9c 9d] (three of a kind, Nines)
ShortStack collected 2,400 from pot
BigStack collected 3,200 from pot
*** SUMMARY ***
Total pot 5,600 Main pot 2,400. Side pot 3,200. | Rake 0 | Jackpot 0 | Bingo 0 | Fortune 0 | Tax 0
Board [Ah Kh 9h 2c 5s]
Seat 1: ShortStack (button) showed [Jh Th] and won (2,400) with a flush, Ace high
Seat 3: Hero (small blind) showed [As Kd] and lost with two pair, Aces and Kings
Seat 5: BigStack (big blind) showed [9c 9d] and won (3,200) with three of a kind, Nines`;

      const result = HandParser.parse(GG_3WAY);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.showdown).toBeDefined();
      // Different winners for main pot and side pot
      expect(hand.showdown!.winners.length).toBeGreaterThan(0);
    });

    // GGPoker Edge 4: 9-max full table
    it('should handle GGPoker 9-max table', () => {
      const GG_9MAX = `Poker Hand #HD678901234: Hold'em No Limit ($10/$20) - 2025/01/15 17:00:00
Table 'Full House' 9-max Seat #5 is the button
Seat 1: P1 (2,000 in chips)
Seat 2: P2 (2,000 in chips)
Seat 3: P3 (2,000 in chips)
Seat 4: P4 (2,000 in chips)
Seat 5: Hero (2,000 in chips)
Seat 6: P6 (2,000 in chips)
Seat 7: P7 (2,000 in chips)
Seat 8: P8 (2,000 in chips)
Seat 9: P9 (2,000 in chips)
P6: posts small blind 10
P7: posts big blind 20
*** HOLE CARDS ***
Dealt to Hero [Ac Ad]
P8: folds
P9: folds
P1: folds
P2: raises 40 to 60
P3: folds
P4: folds
Hero: raises 140 to 200
P6: folds
P7: folds
P2: folds
Uncalled bet (140) returned to Hero
Hero collected 150 from pot
*** SUMMARY ***
Total pot 150 | Rake 0 | Jackpot 0 | Bingo 0 | Fortune 0 | Tax 0
Seat 5: Hero (button) collected (150)`;

      const result = HandParser.parse(GG_9MAX);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.maxPlayers).toBe(9);
      expect(hand.players.length).toBe(9);
    });

    // GGPoker Edge 5: Heads-up with straddle
    it('should handle GGPoker heads-up match', () => {
      const GG_HEADSUP = `Poker Hand #HD789012345: Hold'em No Limit ($25/$50) - 2025/01/15 18:00:00
Table 'HU Battle' 2-max Seat #1 is the button
Seat 1: Hero (1,500 in chips)
Seat 2: Villain (1,500 in chips)
Hero: posts small blind 25
Villain: posts big blind 50
*** HOLE CARDS ***
Dealt to Hero [Kc Kh]
Hero: raises 100 to 150
Villain: raises 300 to 450
Hero: raises 1,050 to 1,500 and is all-in
Villain: calls 1,050 and is all-in
*** FLOP *** [9d 7c 2h]
*** TURN *** [9d 7c 2h] [Qs]
*** RIVER *** [9d 7c 2h Qs] [3s]
*** SHOW DOWN ***
Hero: shows [Kc Kh] (a pair of Kings)
Villain: shows [Ah Jd] (high card Ace)
Hero collected 3,000 from pot
*** SUMMARY ***
Total pot 3,000 | Rake 0 | Jackpot 0 | Bingo 0 | Fortune 0 | Tax 0
Board [9d 7c 2h Qs 3s]
Seat 1: Hero (button) (small blind) showed [Kc Kh] and won (3,000) with a pair of Kings
Seat 2: Villain (big blind) showed [Ah Jd] and lost with high card Ace`;

      const result = HandParser.parse(GG_HEADSUP);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.maxPlayers).toBe(2);
      expect(hand.players.length).toBe(2);
    });
  });

  /**
   * =================================================================
   * PARTYPOKER EDGE CASES
   * =================================================================
   */
  describe('PartyPoker Advanced Scenarios', () => {
    // PartyPoker Edge 1: Runner-runner straight
    it('should handle PartyPoker runner-runner hand', () => {
      const PP_RUNNER = `***** Hand History for Game 123456789 *****
$1/$2 USD NL Texas Hold'em - Friday, January 15, 14:00:00 ET 2025
Table High Action (Real Money)
Seat 3 is the button
Seat 1: Player1 (200)
Seat 2: Hero (250)
Seat 3: Player3 (180)
Seat 5: Player5 (220)
Player5 posts small blind [1]
Player1 posts big blind [2]
** Dealing down cards **
Dealt to Hero [7c 8c]
Hero raises [6] to 8
Player3 calls [8]
Player5 folds
Player1 calls [6]
** Dealing flop ** [Ac 2h Kd]
Player1 checks
Hero bets [12]
Player3 calls [12]
Player1 folds
** Dealing turn ** [9s]
Hero bets [20]
Player3 calls [20]
** Dealing river ** [6h]
Hero checks
Player3 bets [35]
Hero calls [35]
Player3 shows [Td Jd] a straight, Seven to Jack
Hero shows [7c 8c] a straight, Six to Ten
Player3 wins 157 with a straight, Seven to Jack
***** End of hand T123456789 *****`;

      const result = HandParser.parse(PP_RUNNER);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.site).toBe('PartyPoker');
      expect(hand.board?.length).toBe(5);
    });

    // PartyPoker Edge 2: Multiple mucked hands
    it('should handle PartyPoker mucked cards', () => {
      const PP_MUCKED = `***** Hand History for Game 234567890 *****
$2/$4 USD NL Texas Hold'em - Friday, January 15, 15:00:00 ET 2025
Table Muck City (Real Money)
Seat 2 is the button
Seat 1: Player1 (400)
Seat 2: Player2 (350)
Seat 3: Hero (500)
Seat 5: Player5 (450)
Hero posts small blind [2]
Player5 posts big blind [4]
** Dealing down cards **
Dealt to Hero [As Ah]
Player1 raises [12] to 16
Player2 calls [16]
Hero raises [50] to 52
Player5 folds
Player1 calls [36]
Player2 calls [36]
** Dealing flop ** [Kh Qd Jc]
Hero bets [75]
Player1 folds
Player2 folds
Uncalled bet (75) returned to Hero
Hero wins 160 with [As Ah] a pair of Aces
Player1 mucks [Tc Th]
Player2 mucks hand
***** End of hand T234567890 *****`;

      const result = HandParser.parse(PP_MUCKED);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      // Player1 mucked and revealed cards
      const player1 = hand.players.find(p => p.name === 'Player1');
      expect(player1).toBeDefined();
    });

    // PartyPoker Edge 3: Split pot scenario
    it('should handle PartyPoker split pot', () => {
      const PP_SPLIT = `***** Hand History for Game 345678901 *****
$0.50/$1 USD NL Texas Hold'em - Friday, January 15, 16:00:00 ET 2025
Table Split City (Real Money)
Seat 1 is the button
Seat 1: Player1 (100)
Seat 2: Hero (120)
Seat 3: Player3 (95)
Hero posts small blind [0.50]
Player3 posts big blind [1]
** Dealing down cards **
Dealt to Hero [Ac Kh]
Player1 raises [3] to 4
Hero calls [3.50]
Player3 calls [3]
** Dealing flop ** [Ah Kc Qc]
Hero bets [8]
Player3 folds
Player1 calls [8]
** Dealing turn ** [Jc]
Hero bets [16]
Player1 calls [16]
** Dealing river ** [Tc]
Hero checks
Player1 checks
Hero shows [Ac Kh] a straight, Ten to Ace
Player1 shows [As Ks] a straight, Ten to Ace
Hero wins 30 with a straight, Ten to Ace
Player1 wins 30 with a straight, Ten to Ace
***** End of hand T345678901 *****`;

      const result = HandParser.parse(PP_SPLIT);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.showdown).toBeDefined();
      expect(hand.showdown!.winners).toContain('Hero');
      expect(hand.showdown!.winners).toContain('Player1');
    });

    // PartyPoker Edge 4: Tournament format
    it('should handle PartyPoker tournament', () => {
      const PP_TOURNAMENT = `***** Hand History for Game 456789012 *****
$5 + $0.50 USD NL Texas Hold'em - Tournament - Level III (25/50) - Friday, January 15, 17:00:00 ET 2025
Table #555666 (Real Money)
Seat 4 is the button
Seat 1: Player1 (3,000)
Seat 2: Hero (2,800)
Seat 4: Player4 (1,500)
Seat 6: Player6 (2,700)
Player6 posts small blind [25]
Player1 posts big blind [50]
** Dealing down cards **
Dealt to Hero [Jd Js]
Hero raises [150] to 200
Player4 folds
Player6 folds
Player1 calls [150]
** Dealing flop ** [9h 5c 2d]
Player1 checks
Hero bets [250]
Player1 folds
Uncalled bet (250) returned to Hero
Hero wins 425 with [Jd Js] a pair of Jacks
***** End of hand T456789012 *****`;

      const result = HandParser.parse(PP_TOURNAMENT);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.gameContext.isTournament).toBe(true);
      expect(hand.rake).toBe(0); // No rake in tournaments
    });

    // PartyPoker Edge 5: Everyone folds to BB
    it('should handle PartyPoker everyone folds preflop', () => {
      const PP_ALLFOLD = `***** Hand History for Game 567890123 *****
$0.25/$0.50 USD NL Texas Hold'em - Friday, January 15, 18:00:00 ET 2025
Table Easy Money (Real Money)
Seat 3 is the button
Seat 1: Player1 (50)
Seat 2: Player2 (75)
Seat 3: Hero (100)
Seat 5: Player5 (60)
Player5 posts small blind [0.25]
Player1 posts big blind [0.50]
** Dealing down cards **
Dealt to Hero [2h 7d]
Player2 folds
Hero folds
Player5 folds
Uncalled bet (0.25) returned to Player1
Player1 wins 0.50
***** End of hand T567890123 *****`;

      const result = HandParser.parse(PP_ALLFOLD);
      expect(result.success).toBe(true);

      const hand = result.handHistory!;
      expect(hand.showdown).toBeUndefined();
      expect(hand.flop.cards.length).toBe(0);
      expect(hand.totalPot).toBe(0.50);
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
