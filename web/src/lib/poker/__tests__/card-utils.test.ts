/**
 * CardUtils - Unit Tests
 *
 * Comprehensive test coverage for card utility functions.
 * Tests suit symbols, colors, rank display, and validation.
 */

import { CardUtils, CardSuit, CardRank } from '../card-utils';

describe('CardUtils', () => {
  describe('getSuitSymbol', () => {
    it('should return correct Unicode symbols for valid suits', () => {
      expect(CardUtils.getSuitSymbol('c')).toBe('♣');
      expect(CardUtils.getSuitSymbol('d')).toBe('♦');
      expect(CardUtils.getSuitSymbol('h')).toBe('♥');
      expect(CardUtils.getSuitSymbol('s')).toBe('♠');
    });

    it('should return default spade symbol for invalid suit', () => {
      expect(CardUtils.getSuitSymbol('x')).toBe('♠');
      expect(CardUtils.getSuitSymbol('')).toBe('♠');
      expect(CardUtils.getSuitSymbol('invalid')).toBe('♠');
    });

    it('should handle case sensitivity (lowercase only)', () => {
      expect(CardUtils.getSuitSymbol('C')).toBe('♠'); // uppercase not valid
      expect(CardUtils.getSuitSymbol('D')).toBe('♠');
      expect(CardUtils.getSuitSymbol('c')).toBe('♣'); // lowercase valid
    });
  });

  describe('getSuitColor', () => {
    it('should return red for diamonds and hearts', () => {
      expect(CardUtils.getSuitColor('d')).toBe('red');
      expect(CardUtils.getSuitColor('h')).toBe('red');
    });

    it('should return black for clubs and spades', () => {
      expect(CardUtils.getSuitColor('c')).toBe('black');
      expect(CardUtils.getSuitColor('s')).toBe('black');
    });

    it('should return black as default for invalid suits', () => {
      expect(CardUtils.getSuitColor('x')).toBe('black');
      expect(CardUtils.getSuitColor('')).toBe('black');
      expect(CardUtils.getSuitColor('invalid')).toBe('black');
    });
  });

  describe('getSuitColorClass', () => {
    it('should return red Tailwind class for diamonds and hearts', () => {
      expect(CardUtils.getSuitColorClass('d')).toBe('text-red-600');
      expect(CardUtils.getSuitColorClass('h')).toBe('text-red-600');
    });

    it('should return black Tailwind class for clubs and spades', () => {
      expect(CardUtils.getSuitColorClass('c')).toBe('text-gray-900');
      expect(CardUtils.getSuitColorClass('s')).toBe('text-gray-900');
    });

    it('should return black class as default for invalid suits', () => {
      expect(CardUtils.getSuitColorClass('x')).toBe('text-gray-900');
      expect(CardUtils.getSuitColorClass('')).toBe('text-gray-900');
    });
  });

  describe('getRankDisplay', () => {
    it('should convert T to 10', () => {
      expect(CardUtils.getRankDisplay('T')).toBe('10');
    });

    it('should keep all other ranks unchanged', () => {
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K', 'A'];
      ranks.forEach(rank => {
        expect(CardUtils.getRankDisplay(rank)).toBe(rank);
      });
    });

    it('should handle invalid ranks by returning them unchanged', () => {
      expect(CardUtils.getRankDisplay('X')).toBe('X');
      expect(CardUtils.getRankDisplay('1')).toBe('1');
      expect(CardUtils.getRankDisplay('')).toBe('');
    });
  });

  describe('isValidSuit', () => {
    it('should return true for all valid suits', () => {
      const validSuits: CardSuit[] = ['c', 'd', 'h', 's'];
      validSuits.forEach(suit => {
        expect(CardUtils.isValidSuit(suit)).toBe(true);
      });
    });

    it('should return false for invalid suits', () => {
      expect(CardUtils.isValidSuit('x')).toBe(false);
      expect(CardUtils.isValidSuit('')).toBe(false);
      expect(CardUtils.isValidSuit('clubs')).toBe(false);
      expect(CardUtils.isValidSuit('C')).toBe(false); // uppercase
      expect(CardUtils.isValidSuit('hearts')).toBe(false);
    });

    it('should work as type guard', () => {
      const suit: string = 'h';
      if (CardUtils.isValidSuit(suit)) {
        // TypeScript should narrow type to CardSuit here
        const validSuit: CardSuit = suit;
        expect(validSuit).toBe('h');
      }
    });
  });

  describe('isValidRank', () => {
    it('should return true for all valid ranks', () => {
      const validRanks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
      validRanks.forEach(rank => {
        expect(CardUtils.isValidRank(rank)).toBe(true);
      });
    });

    it('should return false for invalid ranks', () => {
      expect(CardUtils.isValidRank('1')).toBe(false);
      expect(CardUtils.isValidRank('10')).toBe(false); // Should use 'T'
      expect(CardUtils.isValidRank('X')).toBe(false);
      expect(CardUtils.isValidRank('')).toBe(false);
      expect(CardUtils.isValidRank('a')).toBe(false); // lowercase
      expect(CardUtils.isValidRank('Ace')).toBe(false);
    });

    it('should work as type guard', () => {
      const rank: string = 'A';
      if (CardUtils.isValidRank(rank)) {
        // TypeScript should narrow type to CardRank here
        const validRank: CardRank = rank;
        expect(validRank).toBe('A');
      }
    });
  });

  describe('cardToString', () => {
    it('should format cards correctly with rank and suit symbol', () => {
      expect(CardUtils.cardToString('A', 's')).toBe('A♠');
      expect(CardUtils.cardToString('K', 'h')).toBe('K♥');
      expect(CardUtils.cardToString('Q', 'd')).toBe('Q♦');
      expect(CardUtils.cardToString('J', 'c')).toBe('J♣');
    });

    it('should convert T to 10 in display', () => {
      expect(CardUtils.cardToString('T', 's')).toBe('10♠');
      expect(CardUtils.cardToString('T', 'h')).toBe('10♥');
      expect(CardUtils.cardToString('T', 'd')).toBe('10♦');
      expect(CardUtils.cardToString('T', 'c')).toBe('10♣');
    });

    it('should format number cards correctly', () => {
      expect(CardUtils.cardToString('2', 's')).toBe('2♠');
      expect(CardUtils.cardToString('5', 'h')).toBe('5♥');
      expect(CardUtils.cardToString('9', 'd')).toBe('9♦');
    });

    it('should handle all valid rank-suit combinations', () => {
      const ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
      const suits: CardSuit[] = ['c', 'd', 'h', 's'];

      ranks.forEach(rank => {
        suits.forEach(suit => {
          const cardString = CardUtils.cardToString(rank, suit);
          expect(cardString).toBeTruthy();
          expect(cardString.length).toBeGreaterThan(1);
        });
      });
    });

    it('should handle invalid inputs gracefully', () => {
      // Should still return something, using default symbol for invalid suit
      expect(CardUtils.cardToString('A', 'x')).toBe('A♠');
      expect(CardUtils.cardToString('invalid', 's')).toBe('invalid♠');
    });
  });

  describe('Integration: Card representation', () => {
    it('should create consistent card representations', () => {
      const testCards = [
        { rank: 'A' as CardRank, suit: 's' as CardSuit, expected: 'A♠', color: 'black' },
        { rank: 'K' as CardRank, suit: 'h' as CardSuit, expected: 'K♥', color: 'red' },
        { rank: 'Q' as CardRank, suit: 'd' as CardSuit, expected: 'Q♦', color: 'red' },
        { rank: 'J' as CardRank, suit: 'c' as CardSuit, expected: 'J♣', color: 'black' },
        { rank: 'T' as CardRank, suit: 's' as CardSuit, expected: '10♠', color: 'black' },
        { rank: '2' as CardRank, suit: 'h' as CardSuit, expected: '2♥', color: 'red' },
      ];

      testCards.forEach(({ rank, suit, expected, color }) => {
        expect(CardUtils.cardToString(rank, suit)).toBe(expected);
        expect(CardUtils.getSuitColor(suit)).toBe(color);
      });
    });

    it('should maintain consistency between suit symbol and color', () => {
      const suits: CardSuit[] = ['c', 'd', 'h', 's'];

      suits.forEach(suit => {
        const symbol = CardUtils.getSuitSymbol(suit);
        const color = CardUtils.getSuitColor(suit);

        // Diamonds and hearts should be red
        if (suit === 'd' || suit === 'h') {
          expect(color).toBe('red');
          expect(['♦', '♥']).toContain(symbol);
        } else {
          expect(color).toBe('black');
          expect(['♣', '♠']).toContain(symbol);
        }
      });
    });
  });

  describe('Poker-specific scenarios', () => {
    it('should format pocket aces correctly', () => {
      const ace1 = CardUtils.cardToString('A', 's');
      const ace2 = CardUtils.cardToString('A', 'h');

      expect(ace1).toBe('A♠');
      expect(ace2).toBe('A♥');
      expect(CardUtils.getSuitColor('s')).toBe('black');
      expect(CardUtils.getSuitColor('h')).toBe('red');
    });

    it('should format common starting hands', () => {
      // Pocket Kings
      expect(CardUtils.cardToString('K', 'c')).toBe('K♣');
      expect(CardUtils.cardToString('K', 'd')).toBe('K♦');

      // Ace-King suited
      expect(CardUtils.cardToString('A', 's')).toBe('A♠');
      expect(CardUtils.cardToString('K', 's')).toBe('K♠');

      // Pocket Deuces
      expect(CardUtils.cardToString('2', 'h')).toBe('2♥');
      expect(CardUtils.cardToString('2', 'c')).toBe('2♣');
    });

    it('should format flop cards correctly', () => {
      const flop = [
        CardUtils.cardToString('A', 's'),
        CardUtils.cardToString('K', 'h'),
        CardUtils.cardToString('7', 'c'),
      ];

      expect(flop).toEqual(['A♠', 'K♥', '7♣']);
    });

    it('should handle all 52 cards uniquely', () => {
      const ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
      const suits: CardSuit[] = ['c', 'd', 'h', 's'];
      const deck: string[] = [];

      ranks.forEach(rank => {
        suits.forEach(suit => {
          deck.push(CardUtils.cardToString(rank, suit));
        });
      });

      // Should have 52 unique cards
      expect(deck.length).toBe(52);
      expect(new Set(deck).size).toBe(52);
    });
  });

  describe('Type safety and validation combinations', () => {
    it('should validate both rank and suit for complete card validation', () => {
      const validCard = { rank: 'A', suit: 's' };
      const invalidRank = { rank: '1', suit: 's' };
      const invalidSuit = { rank: 'A', suit: 'x' };

      expect(CardUtils.isValidRank(validCard.rank)).toBe(true);
      expect(CardUtils.isValidSuit(validCard.suit)).toBe(true);

      expect(CardUtils.isValidRank(invalidRank.rank)).toBe(false);
      expect(CardUtils.isValidSuit(invalidRank.suit)).toBe(true);

      expect(CardUtils.isValidRank(invalidSuit.rank)).toBe(true);
      expect(CardUtils.isValidSuit(invalidSuit.suit)).toBe(false);
    });

    it('should allow building a card validator', () => {
      const isValidCard = (rank: string, suit: string): boolean => {
        return CardUtils.isValidRank(rank) && CardUtils.isValidSuit(suit);
      };

      expect(isValidCard('A', 's')).toBe(true);
      expect(isValidCard('T', 'h')).toBe(true);
      expect(isValidCard('1', 's')).toBe(false);
      expect(isValidCard('A', 'x')).toBe(false);
      expect(isValidCard('10', 's')).toBe(false); // Should use 'T'
    });
  });

  describe('Edge cases and special characters', () => {
    it('should handle empty strings', () => {
      expect(CardUtils.getSuitSymbol('')).toBe('♠');
      expect(CardUtils.getSuitColor('')).toBe('black');
      expect(CardUtils.getRankDisplay('')).toBe('');
      expect(CardUtils.isValidRank('')).toBe(false);
      expect(CardUtils.isValidSuit('')).toBe(false);
    });

    it('should handle numeric string "10" as invalid (should use T)', () => {
      expect(CardUtils.isValidRank('10')).toBe(false);
      expect(CardUtils.getRankDisplay('10')).toBe('10'); // Returns unchanged
    });

    it('should handle whitespace in inputs', () => {
      expect(CardUtils.isValidRank(' A')).toBe(false);
      expect(CardUtils.isValidRank('A ')).toBe(false);
      expect(CardUtils.isValidSuit(' s')).toBe(false);
      expect(CardUtils.isValidSuit('s ')).toBe(false);
    });

    it('should maintain Unicode symbols correctly', () => {
      const symbols = ['♣', '♦', '♥', '♠'];
      const suits = ['c', 'd', 'h', 's'];

      suits.forEach((suit, index) => {
        expect(CardUtils.getSuitSymbol(suit)).toBe(symbols[index]);
      });
    });
  });
});
