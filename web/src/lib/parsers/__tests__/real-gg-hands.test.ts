import { HandParser } from '../../hand-parser';

/**
 * Tests using REAL GGPoker hand histories provided by the user
 * These are actual tournament hands to validate parser accuracy
 */
describe('Real GGPoker Tournament Hands', () => {
  it('should parse real GGPoker all-in hand with showdown', () => {
    const REAL_HAND = `Poker Hand #TM5148170724: Tournament #238314829, Bounty Hunters Mini Encore $5.40 Hold'em No Limit - Level15(1,500/3,000) - 2025/10/26 20:21:23
Table '119' 8-max Seat #4 is the button
Seat 1: a221e335 (145,068 in chips)
Seat 2: Hero (44,867 in chips)
Seat 3: cd311949 (46,489 in chips)
Seat 4: 7b045224 (245,366 in chips)
Seat 5: a9957d2b (48,054 in chips)
Seat 6: 4d89fc07 (82,819 in chips)
Seat 7: 57b0324a (58,388 in chips)
Seat 8: b33072e1 (81,484 in chips)
Hero: posts the ante 450
57b0324a: posts the ante 450
7b045224: posts the ante 450
a221e335: posts the ante 450
b33072e1: posts the ante 450
4d89fc07: posts the ante 450
a9957d2b: posts the ante 450
cd311949: posts the ante 450
a9957d2b: posts small blind 1,500
4d89fc07: posts big blind 3,000
*** HOLE CARDS ***
Dealt to a221e335
Dealt to Hero [As Qc]
Dealt to cd311949
Dealt to 7b045224
Dealt to a9957d2b
Dealt to 4d89fc07
Dealt to 57b0324a
Dealt to b33072e1
57b0324a: folds
b33072e1: raises 6,000 to 9,000
a221e335: folds
Hero: raises 35,417 to 44,417 and is all-in
cd311949: folds
7b045224: folds
a9957d2b: folds
4d89fc07: folds
b33072e1: calls 35,417
Hero: shows [As Qc]
b33072e1: shows [Ah Ac]
*** FLOP *** [3d Qd 7d]
*** TURN *** [3d Qd 7d] [4d]
*** RIVER *** [3d Qd 7d 4d] [8h]
*** SHOWDOWN ***
b33072e1 collected 96,934 from pot
*** SUMMARY ***
Total pot 96,934 | Rake 0 | Jackpot 0 | Bingo 0 | Fortune 0 | Tax 0
Board [3d Qd 7d 4d 8h]
Seat 1: a221e335 folded before Flop
Seat 2: Hero showed [As Qc] and lost with a pair of Queens
Seat 3: cd311949 folded before Flop
Seat 4: 7b045224 (button) folded before Flop
Seat 5: a9957d2b (small blind) folded before Flop
Seat 6: 4d89fc07 (big blind) folded before Flop
Seat 7: 57b0324a folded before Flop
Seat 8: b33072e1 showed [Ah Ac] and won (96,934) with a pair of Aces`;

    const result = HandParser.parse(REAL_HAND);
    if (!result.success) {
      console.log('ERROR:', result.error);
    }
    expect(result.success).toBe(true);

    const hand = result.handHistory!;
    expect(hand.site).toBe('GGPoker');
    expect(hand.tournamentId).toBe('238314829');
    expect(hand.gameContext.isTournament).toBe(true);
    expect(hand.smallBlind).toBe(1500);
    expect(hand.bigBlind).toBe(3000);
    expect(hand.ante).toBe(450);
    expect(hand.maxPlayers).toBe(8);
    expect(hand.players.length).toBe(8);
    expect(hand.totalPot).toBe(96934);
    expect(hand.rake).toBe(0); // Tournaments have no rake
    expect(hand.board).toEqual(['3d', 'Qd', '7d', '4d', '8h']);

    // Verify Hero exists
    const hero = hand.players.find(p => p.name === 'Hero');
    expect(hero).toBeDefined();

    // Verify winner
    expect(hand.showdown?.winners).toContain('b33072e1');
  });

  it('should parse real GGPoker hand with full house', () => {
    const FULL_HOUSE_HAND = `Poker Hand #TM5148170193: Tournament #238314829, Bounty Hunters Mini Encore $5.40 Hold'em No Limit - Level13(1,000/2,000) - 2025/10/26 20:09:40
Table '119' 8-max Seat #2 is the button
Seat 1: a221e335 (97,603 in chips)
Seat 2: Hero (29,617 in chips)
Seat 3: cd311949 (85,104 in chips)
Seat 4: 7b045224 (150,001 in chips)
Seat 5: a9957d2b (64,440 in chips)
Seat 6: 4b9dfa42 (46,127 in chips)
Seat 7: fb647cb1 (47,302 in chips)
Seat 8: b33072e1 (78,334 in chips)
Hero: posts the ante 300
a221e335: posts the ante 300
7b045224: posts the ante 300
b33072e1: posts the ante 300
a9957d2b: posts the ante 300
4b9dfa42: posts the ante 300
cd311949: posts the ante 300
fb647cb1: posts the ante 300
cd311949: posts small blind 1,000
7b045224: posts big blind 2,000
*** HOLE CARDS ***
Dealt to a221e335
Dealt to Hero [4d 8c]
Dealt to cd311949
Dealt to 7b045224
Dealt to a9957d2b
Dealt to 4b9dfa42
Dealt to fb647cb1
Dealt to b33072e1
a9957d2b: calls 2,000
4b9dfa42: folds
fb647cb1: raises 2,000 to 4,000
b33072e1: folds
a221e335: folds
Hero: folds
cd311949: calls 3,000
7b045224: calls 2,000
a9957d2b: calls 2,000
*** FLOP *** [5d Kc 2d]
cd311949: checks
7b045224: checks
a9957d2b: checks
fb647cb1: checks
*** TURN *** [5d Kc 2d] [As]
cd311949: checks
7b045224: bets 9,936
a9957d2b: calls 9,936
fb647cb1: raises 31,818 to 41,754
cd311949: folds
7b045224: raises 31,818 to 73,572
a9957d2b: folds
fb647cb1: calls 1,248 and is all-in
Uncalled bet (30,570) returned to 7b045224
7b045224: shows [5c 5h] (three of a kind, Fives)
fb647cb1: shows [Ah Qs] (a pair of Aces)
*** RIVER *** [5d Kc 2d As] [2h]
*** SHOWDOWN ***
7b045224 collected 114,340 from pot
*** SUMMARY ***
Total pot 114,340 | Rake 0 | Jackpot 0 | Bingo 0 | Fortune 0 | Tax 0
Board [5d Kc 2d As 2h]
Seat 1: a221e335 folded before Flop
Seat 2: Hero (button) folded before Flop
Seat 3: cd311949 (small blind) folded on the Turn
Seat 4: 7b045224 (big blind) showed [5c 5h] and won (114,340) with a full house, Fives full of Twos
Seat 5: a9957d2b folded on the Turn
Seat 6: 4b9dfa42 folded before Flop
Seat 7: fb647cb1 showed [Ah Qs] and lost with two pair, Aces and Twos
Seat 8: b33072e1 folded before Flop`;

    const result = HandParser.parse(FULL_HOUSE_HAND);
    expect(result.success).toBe(true);

    const hand = result.handHistory!;
    expect(hand.site).toBe('GGPoker');
    expect(hand.tournamentId).toBe('238314829');
    expect(hand.smallBlind).toBe(1000);
    expect(hand.bigBlind).toBe(2000);
    expect(hand.ante).toBe(300);
    expect(hand.board).toEqual(['5d', 'Kc', '2d', 'As', '2h']);
    expect(hand.showdown?.winners).toContain('7b045224');
  });

  it('should parse real GGPoker split pot hand', () => {
    const SPLIT_POT = `Poker Hand #TM5148169873: Tournament #238314829, Bounty Hunters Mini Encore $5.40 Hold'em No Limit - Level13(1,000/2,000) - 2025/10/26 20:03:25
Table '119' 8-max Seat #1 is the button
Seat 1: a221e335 (107,003 in chips)
Seat 2: Hero (21,217 in chips)
Seat 3: 8ed105ca (16,500 in chips)
Seat 4: 7b045224 (126,265 in chips)
Seat 5: a9957d2b (60,040 in chips)
Seat 6: 4b9dfa42 (43,727 in chips)
Seat 7: fb647cb1 (52,702 in chips)
Seat 8: b33072e1 (97,734 in chips)
Hero: posts the ante 300
8ed105ca: posts the ante 300
a221e335: posts the ante 300
7b045224: posts the ante 300
b33072e1: posts the ante 300
a9957d2b: posts the ante 300
4b9dfa42: posts the ante 300
fb647cb1: posts the ante 300
Hero: posts small blind 1,000
8ed105ca: posts big blind 2,000
*** HOLE CARDS ***
Dealt to a221e335
Dealt to Hero [Kd 2h]
Dealt to 8ed105ca
Dealt to 7b045224
Dealt to a9957d2b
Dealt to 4b9dfa42
Dealt to fb647cb1
Dealt to b33072e1
7b045224: folds
a9957d2b: calls 2,000
4b9dfa42: raises 4,000 to 6,000
fb647cb1: folds
b33072e1: folds
a221e335: folds
Hero: folds
8ed105ca: calls 4,000
a9957d2b: raises 53,740 to 59,740 and is all-in
4b9dfa42: calls 37,427 and is all-in
8ed105ca: calls 10,200 and is all-in
Uncalled bet (16,313) returned to a9957d2b
a9957d2b: shows [Ah Ks]
4b9dfa42: shows [As Kc]
8ed105ca: shows [Jc 8c]
*** FLOP *** [Kh 6h Ts]
*** TURN *** [Kh 6h Ts] [Qc]
*** RIVER *** [Kh 6h Ts Qc] [Qd]
*** SHOWDOWN ***
a9957d2b collected 26,000 from pot
4b9dfa42 collected 26,000 from pot
a9957d2b collected 27,227 from pot
4b9dfa42 collected 27,227 from pot
*** SUMMARY ***
Total pot 106,454 | Rake 0 | Jackpot 0 | Bingo 0 | Fortune 0 | Tax 0
Board [Kh 6h Ts Qc Qd]
Seat 1: a221e335 (button) folded before Flop
Seat 2: Hero (small blind) folded before Flop
Seat 3: 8ed105ca (big blind) showed [Jc 8c] and lost with a pair of Queens
Seat 4: 7b045224 folded before Flop
Seat 5: a9957d2b showed [Ah Ks] and won (53,227) with two pair, Kings and Queens
Seat 6: 4b9dfa42 showed [As Kc] and won (53,227) with two pair, Kings and Queens
Seat 7: fb647cb1 folded before Flop
Seat 8: b33072e1 folded before Flop`;

    const result = HandParser.parse(SPLIT_POT);
    expect(result.success).toBe(true);

    const hand = result.handHistory!;
    expect(hand.site).toBe('GGPoker');
    expect(hand.board).toEqual(['Kh', '6h', 'Ts', 'Qc', 'Qd']);

    // Split pot - both winners should be detected
    expect(hand.showdown?.winners).toContain('a9957d2b');
    expect(hand.showdown?.winners).toContain('4b9dfa42');
  });
});
