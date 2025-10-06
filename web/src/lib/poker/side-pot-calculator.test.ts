/**
 * Side Pot Calculator - Unit Tests
 *
 * Tests 100% robustness for production:
 * - Input validation (empty, negative, invalid)
 * - Edge cases (single player, duplicate contributions, all folded)
 * - Mathematical consistency (sum validation)
 * - Complex scenarios (5+ players, multiple all-ins)
 */

import { SidePotCalculator, SidePot } from './side-pot-calculator';

describe('SidePotCalculator', () => {

  describe('Input Validation', () => {

    it('should reject empty contributions map', async () => {
      await expect(
        SidePotCalculator.calculate({}, {})
      ).rejects.toThrow('totalCommittedMap is empty');
    });

    it('should reject negative contributions', async () => {
      await expect(
        SidePotCalculator.calculate(
          { player1: 100, player2: -50 },
          { player1: 'active', player2: 'active' }
        )
      ).rejects.toThrow('negative contribution');
    });

    it('should reject non-numeric contributions', async () => {
      await expect(
        SidePotCalculator.calculate(
          { player1: 100, player2: 'invalid' as any },
          { player1: 'active', player2: 'active' }
        )
      ).rejects.toThrow('non-numeric contribution');
    });

    it('should reject infinite contributions', async () => {
      await expect(
        SidePotCalculator.calculate(
          { player1: 100, player2: Infinity },
          { player1: 'active', player2: 'active' }
        )
      ).rejects.toThrow('invalid contribution');
    });

    it('should reject all-zero contributions', async () => {
      await expect(
        SidePotCalculator.calculate(
          { player1: 0, player2: 0 },
          { player1: 'active', player2: 'active' }
        )
      ).rejects.toThrow('No player has committed any chips');
    });

    it('should auto-default missing player status to active', async () => {
      const pots = await SidePotCalculator.calculate(
        { player1: 100, player2: 200 },
        {} // Empty status map
      );

      expect(pots).toBeDefined();
      expect(pots.length).toBeGreaterThan(0);
    });

  });

  describe('Edge Cases', () => {

    it('should handle single active player (winner takes all)', async () => {
      const pots = await SidePotCalculator.calculate(
        { player1: 500, player2: 100, player3: 200 },
        { player1: 'active', player2: 'folded', player3: 'folded' }
      );

      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(800); // 500 + 100 + 200
      expect(pots[0].eligible).toEqual(['player1']);
    });

    it('should handle all players folded (empty pots)', async () => {
      const pots = await SidePotCalculator.calculate(
        { player1: 100, player2: 200 },
        { player1: 'folded', player2: 'folded' }
      );

      expect(pots).toEqual([]);
    });

    it('should handle multiple players with same contribution (duplicate levels)', async () => {
      const pots = await SidePotCalculator.calculate(
        { player1: 100, player2: 100, player3: 100 },
        { player1: 'active', player2: 'active', player3: 'active' }
      );

      // Should create single main pot (no duplicates)
      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(300); // 100 * 3
      expect(pots[0].eligible).toHaveLength(3);
      expect(pots[0].eligible).toContain('player1');
      expect(pots[0].eligible).toContain('player2');
      expect(pots[0].eligible).toContain('player3');
    });

    it('should ignore zero contributions', async () => {
      const pots = await SidePotCalculator.calculate(
        { player1: 100, player2: 0, player3: 200 },
        { player1: 'active', player2: 'active', player3: 'active' }
      );

      // Player2 with 0 contribution should not affect pots
      expect(pots).toHaveLength(2);
      expect(pots[0].eligible).not.toContain('player2');
    });

    it('should handle folded player with contribution (contributes but not eligible)', async () => {
      const pots = await SidePotCalculator.calculate(
        { player1: 100, player2: 200, player3: 100 },
        { player1: 'active', player2: 'folded', player3: 'active' }
      );

      // Main pot: 100 * 3 = 300 (player1 100, player2 folded 100, player3 100)
      // Folded excess: player2 has 200 total, but only 100 goes to main pot
      // Remaining 100 from player2 stays in pot but has no eligible players
      // Total pot = 300 + 100 = 400
      // BUT: Since there are only 2 active players at level 100, we only create 1 pot
      // The folded player's extra contribution is included in that pot
      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(400); // 100*2 active + 200 folded
      expect(pots[0].eligible).toEqual(['player1', 'player3']);
      expect(pots[0].eligible).not.toContain('player2'); // Folded
    });

  });

  describe('Basic Scenarios (2-3 players)', () => {

    it('should handle heads-up all-in (equal stacks)', async () => {
      const pots = await SidePotCalculator.calculate(
        { hero: 5000, villain: 5000 },
        { hero: 'all-in', villain: 'all-in' }
      );

      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(10000);
      expect(pots[0].eligible).toHaveLength(2);
      expect(pots[0].eligible).toContain('hero');
      expect(pots[0].eligible).toContain('villain');
    });

    it('should handle heads-up all-in (different stacks)', async () => {
      const pots = await SidePotCalculator.calculate(
        { shortStack: 2500, bigStack: 5000 },
        { shortStack: 'all-in', bigStack: 'active' }
      );

      // Main pot: 2500 * 2 = 5000
      // Side pot: (5000-2500) * 1 = 2500
      expect(pots).toHaveLength(2);

      expect(pots[0].amount).toBe(5000);
      expect(pots[0].eligible).toHaveLength(2);

      expect(pots[1].amount).toBe(2500);
      expect(pots[1].eligible).toEqual(['bigStack']);
    });

    it('should handle 3-way all-in (equal stacks)', async () => {
      const pots = await SidePotCalculator.calculate(
        { player1: 3000, player2: 3000, player3: 3000 },
        { player1: 'all-in', player2: 'all-in', player3: 'all-in' }
      );

      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(9000);
      expect(pots[0].eligible).toHaveLength(3);
    });

    it('should handle 3-way with one fold', async () => {
      const pots = await SidePotCalculator.calculate(
        { player1: 1000, player2: 1000, player3: 500 },
        { player1: 'active', player2: 'active', player3: 'folded' }
      );

      // Main pot includes folded player's contribution
      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(2500); // 1000 + 1000 + 500
      expect(pots[0].eligible).toEqual(['player1', 'player2']);
      expect(pots[0].eligible).not.toContain('player3');
    });

  });

  describe('Complex Scenarios (4+ players)', () => {

    it('should handle 4-way with multiple side pots', async () => {
      const pots = await SidePotCalculator.calculate(
        {
          shortStack: 800,
          midStack1: 1500,
          midStack2: 1500,
          bigStack: 5000
        },
        {
          shortStack: 'all-in',
          midStack1: 'all-in',
          midStack2: 'all-in',
          bigStack: 'active'
        }
      );

      // Main pot: 800 * 4 = 3200 (all 4 eligible)
      // Side pot 1: (1500-800) * 3 = 2100 (midStack1, midStack2, bigStack)
      // Side pot 2: (5000-1500) * 1 = 3500 (bigStack only)
      expect(pots).toHaveLength(3);

      expect(pots[0].amount).toBe(3200);
      expect(pots[0].eligible).toHaveLength(4);

      expect(pots[1].amount).toBe(2100);
      expect(pots[1].eligible).toHaveLength(3);
      expect(pots[1].eligible).not.toContain('shortStack');

      expect(pots[2].amount).toBe(3500);
      expect(pots[2].eligible).toEqual(['bigStack']);

      // Total = 3200 + 2100 + 3500 = 8800
      const total = pots.reduce((sum, pot) => sum + pot.amount, 0);
      expect(total).toBe(8800);
    });

    it('should handle 5-way with folded player contribution', async () => {
      const pots = await SidePotCalculator.calculate(
        {
          player1: 1000,
          player2: 2000,
          player3: 3000,
          player4: 500,
          player5: 4000
        },
        {
          player1: 'active',
          player2: 'active',
          player3: 'active',
          player4: 'folded',
          player5: 'active'
        }
      );

      // Active sorted: player1(1000), player2(2000), player3(3000), player5(4000)
      // Pot 0 (0→1000): 1000*4 active + 500 folded = 4500
      // Pot 1 (1000→2000): 1000*3 active = 3000
      // Pot 2 (2000→3000): 1000*2 active = 2000
      // Pot 3 (3000→4000): 1000*1 active = 1000
      expect(pots).toHaveLength(4);

      expect(pots[0].amount).toBe(4500); // Includes folded player's 500
      expect(pots[0].eligible).toHaveLength(4); // player4 folded

      // Verify total
      const total = pots.reduce((sum, pot) => sum + pot.amount, 0);
      expect(total).toBe(10500); // 1000+2000+3000+500+4000
    });

  });

  describe('Mathematical Consistency', () => {

    const testMathConsistency = async (
      contributions: Record<string, number>,
      statuses: Record<string, 'folded' | 'all-in' | 'active'>
    ) => {
      const pots = await SidePotCalculator.calculate(contributions, statuses);

      const sumPots = pots.reduce((sum, pot) => sum + pot.amount, 0);
      const sumContributions = Object.values(contributions).reduce((sum, val) => sum + val, 0);

      expect(sumPots).toBe(sumContributions);

      // Additional checks
      pots.forEach(pot => {
        expect(pot.amount).toBeGreaterThan(0);
        expect(pot.eligible.length).toBeGreaterThan(0);
      });
    };

    it('should maintain math consistency: 2 players equal', async () => {
      await testMathConsistency(
        { p1: 1000, p2: 1000 },
        { p1: 'active', p2: 'active' }
      );
    });

    it('should maintain math consistency: 2 players unequal', async () => {
      await testMathConsistency(
        { p1: 500, p2: 1500 },
        { p1: 'all-in', p2: 'active' }
      );
    });

    it('should maintain math consistency: 3 players with fold', async () => {
      await testMathConsistency(
        { p1: 800, p2: 1200, p3: 600 },
        { p1: 'active', p2: 'active', p3: 'folded' }
      );
    });

    it('should maintain math consistency: 5 players complex', async () => {
      await testMathConsistency(
        { p1: 250, p2: 500, p3: 750, p4: 1000, p5: 1250 },
        { p1: 'all-in', p2: 'all-in', p3: 'active', p4: 'folded', p5: 'active' }
      );
    });

    it('should maintain math consistency: 10 players (max table)', async () => {
      await testMathConsistency(
        {
          p1: 100, p2: 200, p3: 300, p4: 400, p5: 500,
          p6: 600, p7: 700, p8: 800, p9: 900, p10: 1000
        },
        {
          p1: 'folded', p2: 'all-in', p3: 'all-in', p4: 'active', p5: 'active',
          p6: 'folded', p7: 'active', p8: 'active', p9: 'folded', p10: 'active'
        }
      );
    });

  });

  describe('Pot Structure Validation', () => {

    it('should ensure main pot is always first', async () => {
      const pots = await SidePotCalculator.calculate(
        { p1: 100, p2: 200, p3: 300 },
        { p1: 'all-in', p2: 'all-in', p3: 'active' }
      );

      expect(pots.length).toBeGreaterThan(0);
      expect(pots[0].sourceLevel).toBe(100); // Smallest level = main pot
    });

    it('should order pots by increasing source level', async () => {
      const pots = await SidePotCalculator.calculate(
        { p1: 500, p2: 1000, p3: 2000 },
        { p1: 'all-in', p2: 'all-in', p3: 'active' }
      );

      for (let i = 1; i < pots.length; i++) {
        expect(pots[i].sourceLevel).toBeGreaterThan(pots[i - 1].sourceLevel);
      }
    });

    it('should ensure eligible players decrease or stay same in higher pots', async () => {
      const pots = await SidePotCalculator.calculate(
        { p1: 100, p2: 200, p3: 300 },
        { p1: 'all-in', p2: 'all-in', p3: 'active' }
      );

      for (let i = 1; i < pots.length; i++) {
        expect(pots[i].eligible.length).toBeLessThanOrEqual(pots[i - 1].eligible.length);
      }
    });

  });

  describe('Realistic Poker Scenarios', () => {

    it('should handle PokerStars example: SB 100 folded, 3 all-ins 2500/4800/5000', async () => {
      const pots = await SidePotCalculator.calculate(
        {
          'player2_sb': 100,
          'player6': 2500,
          'player4': 4800,
          'hero': 5000
        },
        {
          'player2_sb': 'folded',
          'player6': 'all-in',
          'player4': 'all-in',
          'hero': 'all-in'
        }
      );

      // Main pot: 2500*3 + 100 = 7600
      // Side pot 1: (4800-2500)*2 = 4600
      // Side pot 2: (5000-4800)*1 = 200
      expect(pots).toHaveLength(3);

      expect(pots[0].amount).toBe(7600);
      expect(pots[0].eligible).toHaveLength(3); // player6, player4, hero

      expect(pots[1].amount).toBe(4600);
      expect(pots[1].eligible).toHaveLength(2); // player4, hero

      expect(pots[2].amount).toBe(200);
      expect(pots[2].eligible).toEqual(['hero']);

      const total = pots.reduce((sum, pot) => sum + pot.amount, 0);
      expect(total).toBe(12400);
    });

    it('should handle tournament antes (9 players, 5 chip ante)', async () => {
      const contributions: Record<string, number> = {};
      const statuses: Record<string, 'folded' | 'all-in' | 'active'> = {};

      // 9 players post 5 chip ante
      for (let i = 1; i <= 9; i++) {
        contributions[`p${i}`] = 5;
        statuses[`p${i}`] = i <= 7 ? 'folded' : 'active'; // 7 fold, 2 remain
      }

      const pots = await SidePotCalculator.calculate(contributions, statuses);

      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(45); // 9 * 5
      expect(pots[0].eligible).toHaveLength(2); // p8, p9
    });

  });

});
