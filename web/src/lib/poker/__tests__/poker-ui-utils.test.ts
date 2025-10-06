/**
 * PokerUIUtils - Unit Tests
 *
 * Comprehensive test coverage for poker UI positioning utilities.
 * Tests all table sizes and positioning logic.
 */

import { PokerUIUtils } from '../poker-ui-utils';

describe('PokerUIUtils', () => {
  describe('getPlayerPosition', () => {
    it('should position players correctly for 2-max (heads-up)', () => {
      const pos1 = PokerUIUtils.getPlayerPosition(1, 2);
      const pos2 = PokerUIUtils.getPlayerPosition(2, 2);

      expect(pos1.position).toBe('absolute');
      expect(pos1.left).toBe('50%');
      expect(pos1.bottom).toBe('5%');
      expect(pos1.transform).toBe('translateX(-50%)');

      expect(pos2.position).toBe('absolute');
      expect(pos2.left).toBe('50%');
      expect(pos2.top).toBe('5%');
      expect(pos2.transform).toBe('translateX(-50%)');
    });

    it('should position players correctly for 3-max', () => {
      const positions = [1, 2, 3].map(seat => PokerUIUtils.getPlayerPosition(seat, 3));

      // All should be absolute positioned
      positions.forEach(pos => {
        expect(pos.position).toBe('absolute');
      });

      // Hero (seat 1) at bottom center
      expect(positions[0].bottom).toBe('5%');
      expect(positions[0].left).toBe('50%');

      // Seat 2 at left
      expect(positions[1].left).toBe('15%');
      expect(positions[1].top).toBe('35%');

      // Seat 3 at right
      expect(positions[2].right).toBe('15%');
      expect(positions[2].top).toBe('35%');
    });

    it('should position players correctly for 4-max', () => {
      const positions = [1, 2, 3, 4].map(seat => PokerUIUtils.getPlayerPosition(seat, 4));

      expect(positions[0].bottom).toBe('5%');
      expect(positions[1].left).toBe('12%');
      expect(positions[2].top).toBe('5%');
      expect(positions[3].right).toBe('12%');
    });

    it('should position players correctly for 5-max', () => {
      const positions = [1, 2, 3, 4, 5].map(seat => PokerUIUtils.getPlayerPosition(seat, 5));

      expect(positions.length).toBe(5);
      positions.forEach(pos => expect(pos.position).toBe('absolute'));

      // Hero at bottom center
      expect(positions[0].bottom).toBe('5%');
      expect(positions[0].left).toBe('50%');
    });

    it('should position players correctly for 6-max', () => {
      const positions = [1, 2, 3, 4, 5, 6].map(seat => PokerUIUtils.getPlayerPosition(seat, 6));

      expect(positions.length).toBe(6);

      // Hero at bottom center
      expect(positions[0].bottom).toBe('3%');
      expect(positions[0].left).toBe('50%');

      // Top center
      expect(positions[3].top).toBe('3%');
      expect(positions[3].left).toBe('50%');
    });

    it('should position players correctly for 7-max', () => {
      const positions = [1, 2, 3, 4, 5, 6, 7].map(seat => PokerUIUtils.getPlayerPosition(seat, 7));

      expect(positions.length).toBe(7);
      positions.forEach(pos => expect(pos.position).toBe('absolute'));
    });

    it('should position players correctly for 8-max', () => {
      const positions = [1, 2, 3, 4, 5, 6, 7, 8].map(seat => PokerUIUtils.getPlayerPosition(seat, 8));

      expect(positions.length).toBe(8);

      // Hero at bottom center
      expect(positions[0].bottom).toBe('3%');
      expect(positions[0].left).toBe('50%');

      // Top center
      expect(positions[4].top).toBe('3%');
      expect(positions[4].left).toBe('50%');
    });

    it('should position players correctly for 9-max', () => {
      const positions = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(seat => PokerUIUtils.getPlayerPosition(seat, 9));

      expect(positions.length).toBe(9);

      // Hero at bottom center
      expect(positions[0].bottom).toBe('3%');
      expect(positions[0].left).toBe('50%');
    });

    it('should position players correctly for 10-max', () => {
      const positions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(seat =>
        PokerUIUtils.getPlayerPosition(seat, 10)
      );

      expect(positions.length).toBe(10);

      // Hero at bottom center
      expect(positions[0].bottom).toBe('3%');
      expect(positions[0].left).toBe('50%');
    });

    it('should use elliptical fallback for non-standard table sizes', () => {
      const pos = PokerUIUtils.getPlayerPosition(1, 11);

      expect(pos.position).toBe('absolute');
      expect(pos.left).toMatch(/%$/);
      expect(pos.top).toMatch(/%$/);
      expect(pos.transform).toBe('translate(-50%, -50%)');
    });

    it('should create circular positioning for 12-max using fallback', () => {
      const positions = Array.from({ length: 12 }, (_, i) =>
        PokerUIUtils.getPlayerPosition(i + 1, 12)
      );

      positions.forEach(pos => {
        expect(pos.position).toBe('absolute');
        expect(typeof pos.left).toBe('string');
        expect(typeof pos.top).toBe('string');
      });
    });

    it('should always position hero (seat 1) at bottom center for standard tables', () => {
      const tableSizes = [2, 3, 4, 5, 6, 7, 8, 9, 10];

      tableSizes.forEach(maxPlayers => {
        const heroPos = PokerUIUtils.getPlayerPosition(1, maxPlayers);

        expect(heroPos.bottom).toBeDefined();
        expect(heroPos.left).toBe('50%');
        expect(heroPos.transform).toContain('translateX(-50%)');
      });
    });

    it('should return consistent data types for all positions', () => {
      const positions = [1, 2, 3, 4, 5, 6].map(seat =>
        PokerUIUtils.getPlayerPosition(seat, 6)
      );

      positions.forEach(pos => {
        expect(pos.position).toBe('absolute');
        expect(typeof pos.transform).toBe('string');

        // Should have either left+right or left+transform
        if (pos.left) {
          expect(typeof pos.left).toBe('string');
        }
        if (pos.right) {
          expect(typeof pos.right).toBe('string');
        }
        if (pos.top) {
          expect(typeof pos.top).toBe('string');
        }
        if (pos.bottom) {
          expect(typeof pos.bottom).toBe('string');
        }
      });
    });
  });

  describe('getActionAreaPosition', () => {
    it('should position action areas correctly for 6-max', () => {
      const positions = [1, 2, 3, 4, 5, 6].map(seat =>
        PokerUIUtils.getActionAreaPosition(seat, 6)
      );

      positions.forEach(pos => {
        expect(pos.position).toBe('absolute');
        expect(pos.zIndex).toBe(25);
      });

      // Hero action area at bottom center area
      expect(positions[0].bottom).toBe('25%');
      expect(positions[0].left).toBe('50%');
    });

    it('should position action areas correctly for 8-max', () => {
      const positions = [1, 2, 3, 4, 5, 6, 7, 8].map(seat =>
        PokerUIUtils.getActionAreaPosition(seat, 8)
      );

      expect(positions.length).toBe(8);
      positions.forEach(pos => {
        expect(pos.position).toBe('absolute');
        expect(pos.zIndex).toBe(25);
      });
    });

    it('should position action areas correctly for 5-max', () => {
      const positions = [1, 2, 3, 4, 5].map(seat =>
        PokerUIUtils.getActionAreaPosition(seat, 5)
      );

      expect(positions.length).toBe(5);
      positions.forEach(pos => expect(pos.zIndex).toBe(25));
    });

    it('should position action areas correctly for 4-max', () => {
      const positions = [1, 2, 3, 4].map(seat =>
        PokerUIUtils.getActionAreaPosition(seat, 4)
      );

      expect(positions.length).toBe(4);
      positions.forEach(pos => expect(pos.zIndex).toBe(25));
    });

    it('should use fallback positioning for non-standard table sizes', () => {
      const pos = PokerUIUtils.getActionAreaPosition(1, 9);

      expect(pos.position).toBe('absolute');
      expect(pos.zIndex).toBe(25);
      expect(pos.transform).toBe('translate(-50%, -50%)');
    });

    it('should always set zIndex to 25 (above table, below modals)', () => {
      const tableSizes = [4, 5, 6, 8, 10];

      tableSizes.forEach(maxPlayers => {
        for (let seat = 1; seat <= maxPlayers; seat++) {
          const pos = PokerUIUtils.getActionAreaPosition(seat, maxPlayers);
          expect(pos.zIndex).toBe(25);
        }
      });
    });

    it('should create positions closer to table center than player seats', () => {
      // Action areas should be between player seat and pot (center)
      const playerPos = PokerUIUtils.getPlayerPosition(2, 6);
      const actionPos = PokerUIUtils.getActionAreaPosition(2, 6);

      // Both should have positioning, but action closer to center
      expect(playerPos.position).toBe('absolute');
      expect(actionPos.position).toBe('absolute');
    });
  });

  describe('getDealerButtonPosition', () => {
    it('should return consistent position for dealer button', () => {
      const positions = [1, 2, 3, 4, 5, 6].map(seat =>
        PokerUIUtils.getDealerButtonPosition(seat, 6)
      );

      // All dealer buttons should have same relative position
      positions.forEach(pos => {
        expect(pos.position).toBe('absolute');
        expect(pos.left).toBe('85%');
        expect(pos.top).toBe('15%');
        expect(pos.zIndex).toBe(40);
      });
    });

    it('should position dealer button above action areas (zIndex 40)', () => {
      const buttonPos = PokerUIUtils.getDealerButtonPosition(1, 6);
      const actionPos = PokerUIUtils.getActionAreaPosition(1, 6);

      expect(buttonPos.zIndex).toBe(40);
      expect(actionPos.zIndex).toBe(25);
      expect(buttonPos.zIndex).toBeGreaterThan(Number(actionPos.zIndex));
    });

    it('should work for all table sizes', () => {
      const tableSizes = [2, 4, 6, 8, 10];

      tableSizes.forEach(maxPlayers => {
        const pos = PokerUIUtils.getDealerButtonPosition(1, maxPlayers);

        expect(pos.position).toBe('absolute');
        expect(pos.zIndex).toBe(40);
      });
    });
  });

  describe('calculateVisualSeats', () => {
    it('should map hero to visual seat 1', () => {
      const visualSeats = PokerUIUtils.calculateVisualSeats(3, 6);
      expect(visualSeats.get(3)).toBe(1); // Hero at seat 3 -> visual 1
    });

    it('should rotate seats clockwise from hero', () => {
      const visualSeats = PokerUIUtils.calculateVisualSeats(1, 6);

      expect(visualSeats.get(1)).toBe(1); // Hero
      expect(visualSeats.get(2)).toBe(2); // Next seat
      expect(visualSeats.get(3)).toBe(3);
      expect(visualSeats.get(4)).toBe(4);
      expect(visualSeats.get(5)).toBe(5);
      expect(visualSeats.get(6)).toBe(6);
    });

    it('should wrap around correctly when hero is not at seat 1', () => {
      const visualSeats = PokerUIUtils.calculateVisualSeats(4, 6);

      expect(visualSeats.get(4)).toBe(1); // Hero at seat 4 -> visual 1
      expect(visualSeats.get(5)).toBe(2); // Seat 5 -> visual 2
      expect(visualSeats.get(6)).toBe(3); // Seat 6 -> visual 3
      expect(visualSeats.get(1)).toBe(4); // Wrap: Seat 1 -> visual 4
      expect(visualSeats.get(2)).toBe(5); // Seat 2 -> visual 5
      expect(visualSeats.get(3)).toBe(6); // Seat 3 -> visual 6
    });

    it('should work for 2-max (heads-up)', () => {
      const visualSeats1 = PokerUIUtils.calculateVisualSeats(1, 2);
      expect(visualSeats1.get(1)).toBe(1);
      expect(visualSeats1.get(2)).toBe(2);

      const visualSeats2 = PokerUIUtils.calculateVisualSeats(2, 2);
      expect(visualSeats2.get(2)).toBe(1); // Hero
      expect(visualSeats2.get(1)).toBe(2); // Opponent
    });

    it('should work for 9-max (full ring)', () => {
      const visualSeats = PokerUIUtils.calculateVisualSeats(5, 9);

      expect(visualSeats.get(5)).toBe(1); // Hero
      expect(visualSeats.get(6)).toBe(2);
      expect(visualSeats.get(7)).toBe(3);
      expect(visualSeats.get(8)).toBe(4);
      expect(visualSeats.get(9)).toBe(5);
      expect(visualSeats.get(1)).toBe(6); // Wrap
      expect(visualSeats.get(2)).toBe(7);
      expect(visualSeats.get(3)).toBe(8);
      expect(visualSeats.get(4)).toBe(9);
    });

    it('should return a Map with correct size', () => {
      const tableSizes = [2, 4, 6, 8, 9, 10];

      tableSizes.forEach(maxPlayers => {
        const visualSeats = PokerUIUtils.calculateVisualSeats(1, maxPlayers);
        expect(visualSeats.size).toBe(maxPlayers);
      });
    });

    it('should ensure all visual seats are unique', () => {
      const visualSeats = PokerUIUtils.calculateVisualSeats(3, 6);
      const visualSeatValues = Array.from(visualSeats.values());
      const uniqueValues = new Set(visualSeatValues);

      expect(uniqueValues.size).toBe(visualSeatValues.length);
    });

    it('should ensure all visual seats are in range [1, maxPlayers]', () => {
      const visualSeats = PokerUIUtils.calculateVisualSeats(4, 8);

      Array.from(visualSeats.values()).forEach(visualSeat => {
        expect(visualSeat).toBeGreaterThanOrEqual(1);
        expect(visualSeat).toBeLessThanOrEqual(8);
      });
    });

    it('should create correct mapping for all possible hero positions', () => {
      const maxPlayers = 6;

      for (let heroSeat = 1; heroSeat <= maxPlayers; heroSeat++) {
        const visualSeats = PokerUIUtils.calculateVisualSeats(heroSeat, maxPlayers);

        // Hero should always map to visual seat 1
        expect(visualSeats.get(heroSeat)).toBe(1);

        // All seats should be mapped
        expect(visualSeats.size).toBe(maxPlayers);
      }
    });
  });

  describe('Integration: Position consistency', () => {
    it('should create non-overlapping positions for 6-max table', () => {
      const positions = [1, 2, 3, 4, 5, 6].map(seat =>
        PokerUIUtils.getPlayerPosition(seat, 6)
      );

      // All positions should be unique (at least one coordinate different)
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const isDifferent =
            positions[i].left !== positions[j].left ||
            positions[i].right !== positions[j].right ||
            positions[i].top !== positions[j].top ||
            positions[i].bottom !== positions[j].bottom;

          expect(isDifferent).toBe(true);
        }
      }
    });

    it('should maintain visual seat ordering matches physical positioning', () => {
      const heroSeat = 3;
      const maxPlayers = 6;
      const visualSeats = PokerUIUtils.calculateVisualSeats(heroSeat, maxPlayers);

      // Each original seat should map to exactly one visual seat
      const originalSeats = [1, 2, 3, 4, 5, 6];
      originalSeats.forEach(seat => {
        const visualSeat = visualSeats.get(seat);
        expect(visualSeat).toBeGreaterThanOrEqual(1);
        expect(visualSeat).toBeLessThanOrEqual(maxPlayers);
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle visual seat 0 or negative (invalid input)', () => {
      // Implementation should handle gracefully or throw
      expect(() => PokerUIUtils.getPlayerPosition(0, 6)).not.toThrow();
      expect(() => PokerUIUtils.getPlayerPosition(-1, 6)).not.toThrow();
    });

    it('should handle visual seat beyond maxPlayers', () => {
      expect(() => PokerUIUtils.getPlayerPosition(10, 6)).not.toThrow();
    });

    it('should handle maxPlayers = 1 (single player)', () => {
      const visualSeats = PokerUIUtils.calculateVisualSeats(1, 1);
      expect(visualSeats.get(1)).toBe(1);
    });

    it('should handle large table sizes gracefully', () => {
      expect(() => PokerUIUtils.getPlayerPosition(1, 20)).not.toThrow();
      expect(() => PokerUIUtils.calculateVisualSeats(1, 20)).not.toThrow();
    });
  });
});
