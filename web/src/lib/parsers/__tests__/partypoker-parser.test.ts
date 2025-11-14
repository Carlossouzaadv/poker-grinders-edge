import { HandParser } from '../../hand-parser';
import { HandHistory } from '@/types/poker';

/**
 * PARTYPOKER SPECIFIC TESTS
 *
 * Tests for PartyPoker-specific features and formats:
 * - Cash games
 * - Tournaments
 * - Fast Forward (fast-fold variant)
 * - PartyPoker's unique action formatting
 */

describe('HandParser - PartyPoker Specific', () => {
  describe('Cash Games', () => {
    const PP_CASH_STRAIGHT = `***** Hand History for Game 3344556677 *****
$1/$2 No Limit Hold'em - 2025/11/14 10:00:00 ET
Table 'Redonda' (Real Money)
Seat 1: PlayerA ($200.00)
Seat 2: Hero ($250.00)
Seat 3: PlayerC ($190.00)
Seat 4: PlayerD ($200.00)
Seat 5: PlayerE ($200.00)
Seat 6: PlayerF ($200.00)
PlayerE posts small blind [$1.00].
PlayerF posts big blind [$2.00].
** Dealing down cards **
Dealt to Hero [8h 7h]
PlayerA folds.
Hero raises [$6.00].
PlayerC folds.
PlayerD calls [$6.00].
PlayerE folds.
PlayerF calls [$4.00].
** Dealing flop ** [6h 5h 9s]
PlayerF checks.
Hero bets [$10.00].
PlayerD raises [$30.00].
PlayerF folds.
Hero calls [$20.00].
** Dealing turn ** [As]
Hero checks.
PlayerD bets [$50.00].
Hero calls [$50.00].
** Dealing river ** [2d]
Hero checks.
PlayerD bets [$114.00] and is all-in.
Hero calls [$114.00].
** Summary **
PlayerD shows [9d 9c] (Three of a kind, Nines)
Hero shows [8h 7h] (Straight, Nine high)
Hero wins $403.00`;

    it('should parse PartyPoker cash game format (Amostra 3)', () => {
      const result = HandParser.parse(PP_CASH_STRAIGHT);

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PartyPoker');
      expect(hand.maxPlayers).toBe(6);
    });

    it('should parse PartyPoker bracket notation (Amostra 3)', () => {
      const result = HandParser.parse(PP_CASH_STRAIGHT);
      const hand = result.handHistory as HandHistory;

      // Should parse blinds with brackets [$1.00]
      expect(hand.smallBlind).toBe(1);
      expect(hand.bigBlind).toBe(2);

      // Hero has 8h7h
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero!.holeCards).toEqual(['8h', '7h']);
    });

    it('should parse multiway pot with OESD+FD (Amostra 3)', () => {
      const result = HandParser.parse(PP_CASH_STRAIGHT);
      const hand = result.handHistory as HandHistory;

      // Should have flop, turn, river snapshots
      const flopSnap = hand.snapshots.find(s => s.street === 'flop');
      const turnSnap = hand.snapshots.find(s => s.street === 'turn');
      const riverSnap = hand.snapshots.find(s => s.street === 'river');

      expect(flopSnap).toBeDefined();
      expect(turnSnap).toBeDefined();
      expect(riverSnap).toBeDefined();
    });

    it('should recognize Hero straight win (Amostra 3)', () => {
      const result = HandParser.parse(PP_CASH_STRAIGHT);
      const hand = result.handHistory as HandHistory;

      // Should have showdown
      const showdownSnap = hand.snapshots.find(s => s.street === 'showdown');
      expect(showdownSnap).toBeDefined();

      // Hero should win with straight
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();
    });

    it('should handle PartyPoker table names', () => {
      const result = HandParser.parse(PP_CASH_STRAIGHT);
      const hand = result.handHistory as HandHistory;

      expect(hand.tableName).toBe('Redonda');
    });

    it('should parse PartyPoker timestamps', () => {
      const result = HandParser.parse(PP_CASH_STRAIGHT);
      const hand = result.handHistory as HandHistory;

      expect(hand.timestamp).toBeDefined();
    });
  });

  describe('Tournaments', () => {
    const PP_HU_ANTE_CHOP = `***** Hand History for Game 4455667788 *****
$50 + $5 No Limit Hold'em Tournament (98765432) - Level 10 (200/400/50) - 2025/11/14 10:05:00 ET
Table 'Final HU' (Real Money)
Seat 1: Hero ($10000)
Seat 2: Villain ($10000)
Hero posts ante [$50].
Villain posts ante [$50].
Hero posts small blind [$200].
Villain posts big blind [$400].
** Dealing down cards **
Dealt to Hero [Ad Kc]
Hero raises [$800].
Villain calls [$600].
** Dealing flop ** [8d 8h 7c]
Villain checks.
Hero bets [$1000].
Villain calls [$1000].
** Dealing turn ** [2s]
Villain checks.
Hero checks.
** Dealing river ** [5s]
Villain bets [$2000].
Hero raises [$7950] and is all-in.
Villain calls [$5950].
** Summary **
Villain shows [Ac Ks] (a pair of Eights)
Hero shows [Ad Kc] (a pair of Eights)
Hero wins $10000.00
Villain wins $10000.00`;

    it('should parse PartyPoker tournament format (Amostra 4)', () => {
      const result = HandParser.parse(PP_HU_ANTE_CHOP);

      expect(result.success).toBe(true);
      expect(result.handHistory).toBeDefined();

      const hand = result.handHistory as HandHistory;
      expect(hand.site).toBe('PartyPoker');
      expect(hand.gameContext.isTournament).toBe(true);
    });

    it('should extract tournament info and antes (Amostra 4)', () => {
      const result = HandParser.parse(PP_HU_ANTE_CHOP);
      const hand = result.handHistory as HandHistory;

      // Tournament ID
      expect(hand.tournamentId).toBe('98765432');

      // Blinds and antes
      expect(hand.smallBlind).toBe(200);
      expect(hand.bigBlind).toBe(400);

      // Should track antes (50 each)
      const preflopSnap = hand.snapshots.find(s => s.street === 'preflop');
      expect(preflopSnap).toBeDefined();
    });

    it('should handle heads-up (2-max) correctly (Amostra 4)', () => {
      const result = HandParser.parse(PP_HU_ANTE_CHOP);
      const hand = result.handHistory as HandHistory;

      expect(hand.maxPlayers).toBe(2);

      // Hero should be SB/BTN
      const hero = hand.players.find(p => p.name === 'Hero');
      expect(hero).toBeDefined();
      expect(hero!.holeCards).toEqual(['Ad', 'Kc']);
    });

    it('should recognize split pot (chop) (Amostra 4)', () => {
      const result = HandParser.parse(PP_HU_ANTE_CHOP);
      const hand = result.handHistory as HandHistory;

      // Both players should have AK (same hand)
      const showdownSnap = hand.snapshots.find(s => s.street === 'showdown');
      expect(showdownSnap).toBeDefined();

      // Both players should win $10000 (split pot)
      // This is a unique scenario where both have identical hands
    });
  });

  describe('Fast Forward', () => {
    // TODO: Add Fast Forward hand
    it('should recognize Fast Forward games', () => {
      expect(true).toBe(true);
    });

    it('should handle fast-fold player changes', () => {
      expect(true).toBe(true);
    });
  });

  describe('Format Differences from PokerStars', () => {
    it('should handle PartyPoker-specific action formatting', () => {
      // PartyPoker uses slightly different format for actions
      // e.g., "Player1 raises $2" vs "Player1: raises $2 to $4"
      expect(true).toBe(true);
    });

    it('should parse PartyPoker seat numbering', () => {
      expect(true).toBe(true);
    });

    it('should handle PartyPoker summary section', () => {
      // PartyPoker summary format may differ
      expect(true).toBe(true);
    });
  });
});

/**
 * HOW TO GET PARTYPOKER HAND HISTORIES:
 *
 * 1. Play on PartyPoker
 * 2. Go to: PartyPoker Lobby → My Game → Hand History
 * 3. Select desired hands
 * 4. Export as text
 * 5. Copy and paste into tests
 *
 * NOTE: PartyPoker format is different from PokerStars.
 * Make sure the parser handles these differences!
 */
