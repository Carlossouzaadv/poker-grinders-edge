import { splitHandHistories, detectPokerSite, extractHandId } from '../hand-splitter';

describe('Hand Splitter', () => {
  describe('splitHandHistories', () => {
    it('should return empty result for empty input', () => {
      const result = splitHandHistories('');
      expect(result.hands).toEqual([]);
      expect(result.totalHands).toBe(0);
      expect(result.errors).toContain('Texto vazio fornecido');
    });

    it('should split multiple PokerStars hands', () => {
      const input = `PokerStars Hand #123456: Tournament #1, 10+1 Hold'em No Limit - Level I (10/20) - 2025/01/01 12:00:00 ET
Table 'Test 1' 6-max Seat #1 is the button
Seat 1: Player1 (1500 in chips)
Seat 2: Player2 (1500 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Ah Kh]
Player2: folds
*** SUMMARY ***
Total pot 30 | Rake 0

PokerStars Hand #123457: Tournament #1, 10+1 Hold'em No Limit - Level I (10/20) - 2025/01/01 12:05:00 ET
Table 'Test 1' 6-max Seat #2 is the button
Seat 1: Player1 (1500 in chips)
Seat 2: Player2 (1500 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Qs Qd]
Player2: calls 20
*** SUMMARY ***
Total pot 40 | Rake 0`;

      const result = splitHandHistories(input);
      expect(result.totalHands).toBe(2);
      expect(result.hands).toHaveLength(2);
      expect(result.hands[0]).toContain('PokerStars Hand #123456');
      expect(result.hands[1]).toContain('PokerStars Hand #123457');
    });

    it('should split multiple GGPoker hands', () => {
      const input = `Poker Hand #TM5030367055: Tournament #232064631, Bounty Hunters Special $2.50 Hold'em No Limit - Level12(400/800) - 2025/09/26 11:36:31
Table '200' 8-max Seat #7 is the button
Seat 1: Player1 (10000 in chips)
Seat 2: Player2 (15000 in chips)
*** HOLE CARDS ***
Dealt to Player1 [As Ks]
Player2: folds
*** SUMMARY ***
Total pot 1200 | Rake 0

Poker Hand #TM5030367056: Tournament #232064631, Bounty Hunters Special $2.50 Hold'em No Limit - Level12(400/800) - 2025/09/26 11:38:00
Table '200' 8-max Seat #1 is the button
Seat 1: Player1 (11000 in chips)
Seat 2: Player2 (14000 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Jc Jd]
Player2: calls 800
*** SUMMARY ***
Total pot 1600 | Rake 0`;

      const result = splitHandHistories(input);
      expect(result.totalHands).toBe(2);
      expect(result.hands[0]).toContain('Poker Hand #TM5030367055');
      expect(result.hands[1]).toContain('Poker Hand #TM5030367056');
    });

    it('should split multiple PartyPoker hands', () => {
      const input = `***** Hand History for Game 12345 *****
PartyPoker Hand #12345: Tournament #100, $50+$5 No Limit Hold'em - Level III (25/50) - 2025/01/01 12:00:00
Table 'Party Table' 9-max Seat #3 is the button
Seat 1: Player1 (2000 in chips)
Seat 2: Player2 (2000 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Kh Kd]
Player2: folds
*** SUMMARY ***
Total pot 75 | Rake 0

***** Hand History for Game 12346 *****
PartyPoker Hand #12346: Tournament #100, $50+$5 No Limit Hold'em - Level III (25/50) - 2025/01/01 12:05:00
Table 'Party Table' 9-max Seat #1 is the button
Seat 1: Player1 (2050 in chips)
Seat 2: Player2 (1950 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Ac Ad]
Player2: calls 50
*** SUMMARY ***
Total pot 100 | Rake 0`;

      const result = splitHandHistories(input);
      expect(result.totalHands).toBe(2);
      expect(result.hands[0]).toContain('Hand History for Game 12345');
      expect(result.hands[1]).toContain('Hand History for Game 12346');
    });

    it('should handle mixed sites (PokerStars and GGPoker)', () => {
      const input = `PokerStars Hand #111111: Hold'em No Limit ($0.25/$0.50 USD) - 2025/01/01
Table 'Test' 6-max Seat #1 is the button
Seat 1: Player1 (50 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Ah Kh]
*** SUMMARY ***
Total pot 1 | Rake 0

Poker Hand #TM222222: Tournament #123, $5 Hold'em No Limit - Level1(10/20) - 2025/01/01
Table 'GG Table' 6-max Seat #2 is the button
Seat 1: Player2 (1500 in chips)
*** HOLE CARDS ***
Dealt to Player2 [Qs Qd]
*** SUMMARY ***
Total pot 30 | Rake 0`;

      const result = splitHandHistories(input);
      expect(result.totalHands).toBe(2);
      expect(result.hands[0]).toContain('PokerStars Hand #111111');
      expect(result.hands[1]).toContain('Poker Hand #TM222222');
    });

    it('should ignore invalid or too short hand texts', () => {
      const input = `PokerStars Hand #123: Short
Table

PokerStars Hand #456: Tournament #1, 10+1 Hold'em No Limit - Level I (10/20)
Table 'Valid' 6-max Seat #1 is the button
Seat 1: Player1 (1500 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Ah Kh]
*** SUMMARY ***
Total pot 20 | Rake 0`;

      const result = splitHandHistories(input);
      expect(result.totalHands).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.hands[0]).toContain('PokerStars Hand #456');
    });

    it('should handle hands without SUMMARY section', () => {
      const input = `PokerStars Hand #789: Hold'em No Limit ($1/$2) - 2025/01/01
Table 'NoSummary' 6-max Seat #1 is the button
Seat 1: Player1 (200 in chips)
Seat 2: Player2 (200 in chips)
*** HOLE CARDS ***
Dealt to Player1 [9h 9d]
Player1: raises 4 to 6
Player2: folds`;

      const result = splitHandHistories(input);
      expect(result.totalHands).toBe(1);
      expect(result.hands[0]).toContain('PokerStars Hand #789');
    });
  });

  describe('detectPokerSite', () => {
    it('should detect PokerStars', () => {
      const handText = "PokerStars Hand #123456: Tournament #1...";
      expect(detectPokerSite(handText)).toBe('PokerStars');
    });

    it('should detect GGPoker (Tournament format)', () => {
      const handText = "Poker Hand #TM5030367055: Tournament #232064631...";
      expect(detectPokerSite(handText)).toBe('GGPoker');
    });

    it('should detect GGPoker (Cash game format)', () => {
      const handText = "Poker Hand #CG123456: Hold'em No Limit...";
      expect(detectPokerSite(handText)).toBe('GGPoker');
    });

    it('should detect PartyPoker', () => {
      const handText = "***** Hand History for Game 12345 *****";
      expect(detectPokerSite(handText)).toBe('PartyPoker');
    });

    it('should return Unknown for unrecognized format', () => {
      const handText = "Some random poker text";
      expect(detectPokerSite(handText)).toBe('Unknown');
    });
  });

  describe('extractHandId', () => {
    it('should extract PokerStars hand ID', () => {
      const handText = "PokerStars Hand #123456789: Tournament...";
      expect(extractHandId(handText)).toBe('123456789');
    });

    it('should extract GGPoker tournament hand ID', () => {
      const handText = "Poker Hand #TM5030367055: Tournament...";
      expect(extractHandId(handText)).toBe('TM5030367055');
    });

    it('should extract GGPoker cash game hand ID', () => {
      const handText = "Poker Hand #CG987654: Hold'em...";
      expect(extractHandId(handText)).toBe('CG987654');
    });

    it('should extract PartyPoker hand ID', () => {
      const handText = "***** Hand History for Game 12345 *****";
      expect(extractHandId(handText)).toBe('12345');
    });

    it('should return null for unrecognized format', () => {
      const handText = "Random text without hand ID";
      expect(extractHandId(handText)).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle hands with extra whitespace', () => {
      const input = `

PokerStars Hand #111: Tournament #1, Hold'em No Limit - Level I (10/20)
Table 'Test' 6-max Seat #1 is the button
Seat 1: Player1 (1500 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Ah Kh]
*** SUMMARY ***
Total pot 20 | Rake 0


PokerStars Hand #222: Tournament #1, Hold'em No Limit - Level I (10/20)
Table 'Test' 6-max Seat #2 is the button
Seat 1: Player1 (1520 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Ks Kd]
*** SUMMARY ***
Total pot 40 | Rake 0

`;

      const result = splitHandHistories(input);
      expect(result.totalHands).toBe(2);
    });

    it('should handle single hand input', () => {
      const input = `PokerStars Hand #123: Hold'em No Limit ($0.5/$1) - 2025/01/01
Table 'Single' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Ac Kc]
*** SUMMARY ***
Total pot 2 | Rake 0`;

      const result = splitHandHistories(input);
      expect(result.totalHands).toBe(1);
      expect(result.errors).toEqual([]);
    });

    it('should handle very large number of hands efficiently', () => {
      // Generate 100 hands
      let input = '';
      for (let i = 1; i <= 100; i++) {
        input += `PokerStars Hand #${i}: Hold'em No Limit ($1/$2) - 2025/01/01
Table 'Test' 6-max Seat #1 is the button
Seat 1: Player1 (200 in chips)
*** HOLE CARDS ***
Dealt to Player1 [Ah Kh]
*** SUMMARY ***
Total pot ${i * 2} | Rake 0

`;
      }

      const startTime = Date.now();
      const result = splitHandHistories(input);
      const duration = Date.now() - startTime;

      expect(result.totalHands).toBe(100);
      expect(duration).toBeLessThan(1000); // Should process in less than 1 second
    });
  });
});
