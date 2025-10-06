/**
 * Card - Component Tests
 *
 * Comprehensive test coverage for Card component:
 * - Rendering different card types
 * - Size variants
 * - Face-down cards
 * - Suit colors and symbols
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../Card';
import { Card as CardType } from '@/types/poker';

describe('Card', () => {
  describe('Basic Rendering', () => {
    it('should render a card with rank and suit', () => {
      const card: CardType = { rank: 'A', suit: 's' };
      const { container } = render(<Card card={card} />);

      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(screen.getAllByText('A')).toHaveLength(2); // Top-left and bottom-right
      expect(screen.getAllByText('♠')).toHaveLength(3); // Corners + center
    });

    it('should render all ranks correctly', () => {
      const ranks: Array<'2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A'> =
        ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

      ranks.forEach(rank => {
        const card: CardType = { rank, suit: 's' };
        const { container } = render(<Card card={card} />);

        const displayRank = rank === 'T' ? '10' : rank;
        expect(screen.getAllByText(displayRank).length).toBeGreaterThan(0);
      });
    });

    it('should render all suits correctly', () => {
      const suits: Array<'c' | 'd' | 'h' | 's'> = ['c', 'd', 'h', 's'];
      const symbols = { c: '♣', d: '♦', h: '♥', s: '♠' };

      suits.forEach(suit => {
        const card: CardType = { rank: 'A', suit };
        render(<Card card={card} />);

        const symbol = symbols[suit];
        expect(screen.getAllByText(symbol).length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Suit Colors', () => {
    it('should render red suits with red color', () => {
      const redSuits: Array<'d' | 'h'> = ['d', 'h'];

      redSuits.forEach(suit => {
        const card: CardType = { rank: 'K', suit };
        const { container } = render(<Card card={card} />);

        const suitElements = container.querySelectorAll('.text-red-600');
        expect(suitElements.length).toBeGreaterThan(0);
      });
    });

    it('should render black suits with black color', () => {
      const blackSuits: Array<'c' | 's'> = ['c', 's'];

      blackSuits.forEach(suit => {
        const card: CardType = { rank: 'Q', suit };
        const { container } = render(<Card card={card} />);

        const suitElements = container.querySelectorAll('.text-gray-900');
        expect(suitElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Size Variants', () => {
    it('should render small card with correct dimensions', () => {
      const card: CardType = { rank: 'A', suit: 's' };
      const { container } = render(<Card card={card} size="small" />);

      const cardElement = container.querySelector('.bg-white');
      expect(cardElement).toHaveStyle({ width: '35px', height: '49px' });
    });

    it('should render medium card with correct dimensions', () => {
      const card: CardType = { rank: 'K', suit: 'h' };
      const { container } = render(<Card card={card} size="medium" />);

      const cardElement = container.querySelector('.bg-white');
      expect(cardElement).toHaveStyle({ width: '50px', height: '70px' });
    });

    it('should render large card with correct dimensions', () => {
      const card: CardType = { rank: 'Q', suit: 'd' };
      const { container } = render(<Card card={card} size="large" />);

      const cardElement = container.querySelector('.bg-white');
      expect(cardElement).toHaveStyle({ width: '70px', height: '97px' });
    });

    it('should default to medium size when size not specified', () => {
      const card: CardType = { rank: 'J', suit: 'c' };
      const { container } = render(<Card card={card} />);

      const cardElement = container.querySelector('.bg-white');
      expect(cardElement).toHaveStyle({ width: '50px', height: '70px' });
    });
  });

  describe('Face-Down Cards', () => {
    it('should render face-down card with blue background', () => {
      const card: CardType = { rank: 'A', suit: 's' };
      const { container } = render(<Card card={card} faceDown={true} />);

      const faceDownElement = container.querySelector('.from-blue-800');
      expect(faceDownElement).toBeInTheDocument();
    });

    it('should not show rank/suit when face-down', () => {
      const card: CardType = { rank: 'K', suit: 'h' };
      render(<Card card={card} faceDown={true} />);

      expect(screen.queryByText('K')).not.toBeInTheDocument();
      expect(screen.queryByText('♥')).not.toBeInTheDocument();
    });

    it('should show spade symbol on face-down card', () => {
      const card: CardType = { rank: 'Q', suit: 'd' };
      const { container } = render(<Card card={card} faceDown={true} />);

      // Should show a decorative spade symbol
      const spadeSymbol = container.querySelector('.text-blue-200');
      expect(spadeSymbol).toBeInTheDocument();
    });

    it('should render face-down card with correct dimensions', () => {
      const card: CardType = { rank: 'A', suit: 's' };
      const { container } = render(<Card card={card} size="small" faceDown={true} />);

      const faceDownElement = container.querySelector('.from-blue-800');
      expect(faceDownElement).toHaveStyle({ width: '35px', height: '49px' });
    });
  });

  describe('Rank Display', () => {
    it('should display "10" for rank T', () => {
      const card: CardType = { rank: 'T', suit: 's' };
      render(<Card card={card} />);

      expect(screen.getAllByText('10')).toHaveLength(2); // Top-left and bottom-right
    });

    it('should display face cards correctly', () => {
      const faceCards: Array<{ rank: 'J' | 'Q' | 'K' | 'A'; display: string }> = [
        { rank: 'J', display: 'J' },
        { rank: 'Q', display: 'Q' },
        { rank: 'K', display: 'K' },
        { rank: 'A', display: 'A' },
      ];

      faceCards.forEach(({ rank, display }) => {
        const card: CardType = { rank, suit: 'h' };
        render(<Card card={card} />);

        expect(screen.getAllByText(display)).toHaveLength(2);
      });
    });

    it('should display number cards correctly', () => {
      const numberRanks: Array<'2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'> =
        ['2', '3', '4', '5', '6', '7', '8', '9'];

      numberRanks.forEach(rank => {
        const card: CardType = { rank, suit: 'c' };
        render(<Card card={card} />);

        expect(screen.getAllByText(rank)).toHaveLength(2);
      });
    });
  });

  describe('Card Layout', () => {
    it('should have rank and suit in top-left corner', () => {
      const card: CardType = { rank: 'A', suit: 's' };
      const { container } = render(<Card card={card} />);

      const topLeft = container.querySelector('.top-1.left-1');
      expect(topLeft).toBeInTheDocument();
      expect(topLeft).toHaveTextContent('A');
      expect(topLeft).toHaveTextContent('♠');
    });

    it('should have rank and suit in bottom-right corner (rotated)', () => {
      const card: CardType = { rank: 'K', suit: 'h' };
      const { container } = render(<Card card={card} />);

      const bottomRight = container.querySelector('.bottom-1.right-1');
      expect(bottomRight).toBeInTheDocument();
      expect(bottomRight).toHaveClass('rotate-180');
    });

    it('should have center symbol', () => {
      const card: CardType = { rank: 'Q', suit: 'd' };
      const { container } = render(<Card card={card} />);

      const centerSymbol = container.querySelector('.inset-0.flex.items-center.justify-center');
      expect(centerSymbol).toBeInTheDocument();
    });
  });

  describe('Styling and Interactions', () => {
    it('should have hover effect', () => {
      const card: CardType = { rank: 'A', suit: 's' };
      const { container } = render(<Card card={card} />);

      const cardElement = container.querySelector('.hover\\:scale-105');
      expect(cardElement).toBeInTheDocument();
    });

    it('should have shadow effect', () => {
      const card: CardType = { rank: 'K', suit: 'h' };
      const { container } = render(<Card card={card} />);

      const cardElement = container.querySelector('.shadow-lg');
      expect(cardElement).toBeInTheDocument();
    });

    it('should have rounded corners', () => {
      const card: CardType = { rank: 'Q', suit: 'd' };
      const { container } = render(<Card card={card} />);

      const cardElement = container.querySelector('.rounded-lg');
      expect(cardElement).toBeInTheDocument();
    });

    it('should have cursor pointer', () => {
      const card: CardType = { rank: 'J', suit: 'c' };
      const { container } = render(<Card card={card} />);

      const cardElement = container.querySelector('.cursor-pointer');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Common Poker Scenarios', () => {
    it('should render pocket aces correctly', () => {
      const ace1: CardType = { rank: 'A', suit: 's' };
      const ace2: CardType = { rank: 'A', suit: 'h' };

      const { rerender } = render(<Card card={ace1} />);
      expect(screen.getAllByText('A')).toHaveLength(2);
      expect(screen.getAllByText('♠')).toHaveLength(3);

      rerender(<Card card={ace2} />);
      expect(screen.getAllByText('A')).toHaveLength(2);
      expect(screen.getAllByText('♥')).toHaveLength(3);
    });

    it('should render suited connectors correctly', () => {
      const card1: CardType = { rank: 'T', suit: 's' };
      const card2: CardType = { rank: '9', suit: 's' };

      const { rerender } = render(<Card card={card1} size="small" />);
      expect(screen.getAllByText('10')).toHaveLength(2);

      rerender(<Card card={card2} size="small" />);
      expect(screen.getAllByText('9')).toHaveLength(2);
    });

    it('should render broadway cards correctly', () => {
      const broadway: Array<CardType> = [
        { rank: 'A', suit: 's' },
        { rank: 'K', suit: 's' },
        { rank: 'Q', suit: 's' },
        { rank: 'J', suit: 's' },
        { rank: 'T', suit: 's' },
      ];

      broadway.forEach(card => {
        const { rerender } = render(<Card card={card} />);
        expect(screen.getAllByText('♠').length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle all 52 card combinations', () => {
      const ranks: Array<'2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A'> =
        ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
      const suits: Array<'c' | 'd' | 'h' | 's'> = ['c', 'd', 'h', 's'];

      ranks.forEach(rank => {
        suits.forEach(suit => {
          const card: CardType = { rank, suit };
          expect(() => render(<Card card={card} />)).not.toThrow();
        });
      });
    });

    it('should render consistently across different sizes', () => {
      const card: CardType = { rank: 'A', suit: 's' };

      ['small', 'medium', 'large'].forEach(size => {
        const { container } = render(<Card card={card} size={size as any} />);
        expect(container.querySelector('.bg-white') || container.querySelector('.from-blue-800')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should maintain readability for all card colors', () => {
      const cards: CardType[] = [
        { rank: 'A', suit: 's' }, // Black
        { rank: 'K', suit: 'h' }, // Red
        { rank: 'Q', suit: 'd' }, // Red
        { rank: 'J', suit: 'c' }, // Black
      ];

      cards.forEach(card => {
        const { container } = render(<Card card={card} />);
        const suitElements = container.querySelectorAll('.text-red-600, .text-gray-900');
        expect(suitElements.length).toBeGreaterThan(0);
      });
    });
  });
});
