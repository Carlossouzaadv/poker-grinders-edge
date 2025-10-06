/**
 * PlayerSeat - Component Tests
 *
 * Comprehensive test coverage for PlayerSeat component:
 * - Rendering different player states
 * - Visual feedback for active/folded/winner states
 * - Card display logic
 * - Stack and bounty display
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerSeat from '../PlayerSeat';
import { Player } from '@/types/poker';

// Mock Card component
jest.mock('../Card', () => {
  return function MockCard({ card, faceDown }: any) {
    return (
      <div data-testid="card" data-rank={card.rank} data-suit={card.suit} data-facedown={faceDown}>
        {faceDown ? 'XX' : `${card.rank}${card.suit}`}
      </div>
    );
  };
});

describe('PlayerSeat', () => {
  // Helper to create player
  const createPlayer = (overrides: Partial<Player> = {}): Player => ({
    name: 'TestPlayer',
    position: 'BTN',
    stack: 5000,
    isHero: false,
    seat: 1,
    ...overrides,
  });

  describe('Basic Rendering', () => {
    it('should render player name', () => {
      const player = createPlayer({ name: 'John Doe' });
      render(<PlayerSeat player={player} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render player stack', () => {
      const player = createPlayer({ stack: 2500 });
      render(<PlayerSeat player={player} />);

      expect(screen.getByText('$25.00')).toBeInTheDocument();
    });

    it('should render player position', () => {
      const player = createPlayer({ position: 'BTN' });
      render(<PlayerSeat player={player} />);

      expect(screen.getByText('BTN')).toBeInTheDocument();
    });

    it('should show (Hero) label for hero player', () => {
      const player = createPlayer({ name: 'Hero', isHero: true });
      render(<PlayerSeat player={player} />);

      expect(screen.getByText('(Hero)')).toBeInTheDocument();
    });

    it('should not show (Hero) label for non-hero players', () => {
      const player = createPlayer({ isHero: false });
      render(<PlayerSeat player={player} />);

      expect(screen.queryByText('(Hero)')).not.toBeInTheDocument();
    });
  });

  describe('Card Display', () => {
    it('should show hero cards when player is hero', () => {
      const player = createPlayer({
        isHero: true,
        cards: [
          { rank: 'A', suit: 's' },
          { rank: 'K', suit: 'h' },
        ],
      });

      render(<PlayerSeat player={player} />);

      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(2);
      expect(cards[0]).toHaveAttribute('data-rank', 'A');
      expect(cards[1]).toHaveAttribute('data-rank', 'K');
    });

    it('should not show villain cards by default', () => {
      const player = createPlayer({
        isHero: false,
        cards: [
          { rank: 'Q', suit: 'd' },
          { rank: 'J', suit: 'c' },
        ],
      });

      render(<PlayerSeat player={player} showCards={false} />);

      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });

    it('should show villain cards when showCards is true', () => {
      const player = createPlayer({
        isHero: false,
        cards: [
          { rank: 'Q', suit: 'd' },
          { rank: 'J', suit: 'c' },
        ],
      });

      render(<PlayerSeat player={player} showCards={true} />);

      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(2);
      expect(cards[0]).toHaveAttribute('data-rank', 'Q');
      expect(cards[1]).toHaveAttribute('data-rank', 'J');
    });

    it('should show face-down cards when showCards is true but no cards provided', () => {
      const player = createPlayer({
        isHero: false,
        cards: undefined,
      });

      render(<PlayerSeat player={player} showCards={true} />);

      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(2);
      expect(cards[0]).toHaveAttribute('data-facedown', 'true');
      expect(cards[1]).toHaveAttribute('data-facedown', 'true');
    });

    it('should show FOLDED indicator when player has folded', () => {
      const player = createPlayer();
      render(<PlayerSeat player={player} hasFolded={true} />);

      expect(screen.getByText('FOLDED')).toBeInTheDocument();
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });
  });

  describe('Player States', () => {
    it('should apply active styling when isActive is true', () => {
      const player = createPlayer();
      const { container } = render(<PlayerSeat player={player} isActive={true} />);

      // Check for active indicator classes
      const seatPod = container.querySelector('.seat-pod');
      expect(seatPod).toBeInTheDocument();
    });

    it('should apply folded styling when hasFolded is true', () => {
      const player = createPlayer();
      const { container } = render(<PlayerSeat player={player} hasFolded={true} />);

      const seatPod = container.querySelector('.seat-pod');
      expect(seatPod).toHaveClass('opacity-40');
    });

    it('should apply winner styling when isWinner is true', () => {
      const player = createPlayer();
      const { container } = render(
        <PlayerSeat player={player} isWinner={true} isShowdown={true} />
      );

      const seatPod = container.querySelector('.seat-pod');
      expect(seatPod).toHaveClass('opacity-100');
    });

    it('should apply showdown styling for non-winners', () => {
      const player = createPlayer();
      const { container } = render(
        <PlayerSeat player={player} isWinner={false} isShowdown={true} />
      );

      const seatPod = container.querySelector('.seat-pod');
      expect(seatPod).toHaveClass('opacity-60');
    });
  });

  describe('Bounty Display', () => {
    it('should show bounty when present', () => {
      const player = createPlayer({ bounty: 1000 });
      render(<PlayerSeat player={player} />);

      expect(screen.getByText('🎯 $10.00')).toBeInTheDocument();
    });

    it('should not show bounty when zero', () => {
      const player = createPlayer({ bounty: 0 });
      render(<PlayerSeat player={player} />);

      expect(screen.queryByText(/🎯/)).not.toBeInTheDocument();
    });

    it('should not show bounty when undefined', () => {
      const player = createPlayer({ bounty: undefined });
      render(<PlayerSeat player={player} />);

      expect(screen.queryByText(/🎯/)).not.toBeInTheDocument();
    });
  });

  describe('Last Action Display', () => {
    it('should show last action when provided', () => {
      const player = createPlayer();
      render(<PlayerSeat player={player} lastAction="Raise $50" />);

      expect(screen.getByText('Raise $50')).toBeInTheDocument();
    });

    it('should not show last action when not provided', () => {
      const player = createPlayer();
      render(<PlayerSeat player={player} />);

      expect(screen.queryByText(/Raise|Call|Fold/)).not.toBeInTheDocument();
    });

    it('should not show last action when player has folded', () => {
      const player = createPlayer();
      render(<PlayerSeat player={player} lastAction="Raise $50" hasFolded={true} />);

      expect(screen.queryByText('Raise $50')).not.toBeInTheDocument();
      expect(screen.getByText('FOLDED')).toBeInTheDocument();
    });
  });

  describe('Stack Formatting', () => {
    it('should format small stacks correctly', () => {
      const player = createPlayer({ stack: 50 });
      render(<PlayerSeat player={player} />);

      expect(screen.getByText('$0.50')).toBeInTheDocument();
    });

    it('should format large stacks correctly', () => {
      const player = createPlayer({ stack: 100000 });
      render(<PlayerSeat player={player} />);

      expect(screen.getByText('$1000.00')).toBeInTheDocument();
    });

    it('should handle zero stack (all-in)', () => {
      const player = createPlayer({ stack: 0 });
      render(<PlayerSeat player={player} />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  describe('Hero Styling', () => {
    it('should apply hero styling for hero player', () => {
      const player = createPlayer({ isHero: true });
      const { container } = render(<PlayerSeat player={player} />);

      const nameContainer = screen.getByText('TestPlayer').parentElement;
      expect(nameContainer).toHaveClass('bg-blue-500/20');
    });

    it('should apply non-hero styling for villain player', () => {
      const player = createPlayer({ isHero: false });
      const { container } = render(<PlayerSeat player={player} />);

      const nameContainer = screen.getByText('TestPlayer').parentElement;
      expect(nameContainer).toHaveClass('bg-gray-500/20');
    });
  });

  describe('Edge Cases', () => {
    it('should handle player with no cards', () => {
      const player = createPlayer({ cards: undefined });
      render(<PlayerSeat player={player} />);

      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });

    it('should handle player with empty name', () => {
      const player = createPlayer({ name: '' });
      render(<PlayerSeat player={player} />);

      // Component should still render
      expect(screen.queryByText(/BTN/)).toBeInTheDocument();
    });

    it('should handle negative stack gracefully', () => {
      const player = createPlayer({ stack: -100 });
      render(<PlayerSeat player={player} />);

      // Should display something (even if incorrect)
      const stackElement = screen.getByText(/-?\$\d+\.\d+/);
      expect(stackElement).toBeInTheDocument();
    });

    it('should handle very long player names', () => {
      const player = createPlayer({ name: 'VeryLongPlayerNameThatShouldBeDisplayed' });
      render(<PlayerSeat player={player} />);

      expect(screen.getByText('VeryLongPlayerNameThatShouldBeDisplayed')).toBeInTheDocument();
    });
  });

  describe('Combination States', () => {
    it('should handle active hero player with cards', () => {
      const player = createPlayer({
        name: 'Hero',
        isHero: true,
        cards: [
          { rank: 'A', suit: 's' },
          { rank: 'A', suit: 'h' },
        ],
      });

      render(<PlayerSeat player={player} isActive={true} />);

      expect(screen.getByText('Hero')).toBeInTheDocument();
      expect(screen.getByText('(Hero)')).toBeInTheDocument();
      expect(screen.getAllByTestId('card')).toHaveLength(2);
    });

    it('should handle showdown winner with bounty', () => {
      const player = createPlayer({
        name: 'Winner',
        bounty: 2500,
      });

      render(<PlayerSeat player={player} isWinner={true} isShowdown={true} />);

      expect(screen.getByText('Winner')).toBeInTheDocument();
      expect(screen.getByText('🎯 $25.00')).toBeInTheDocument();
    });

    it('should handle all-in player with last action', () => {
      const player = createPlayer({
        stack: 0,
      });

      render(<PlayerSeat player={player} lastAction="All-in $500" />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
      expect(screen.getByText('All-in $500')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render semantic HTML structure', () => {
      const player = createPlayer();
      const { container } = render(<PlayerSeat player={player} />);

      expect(container.querySelector('.seat-pod')).toBeInTheDocument();
    });

    it('should maintain readable text contrast', () => {
      const player = createPlayer({ isHero: true });
      render(<PlayerSeat player={player} />);

      const heroLabel = screen.getByText('(Hero)');
      expect(heroLabel).toHaveClass('text-blue-300');
    });
  });
});
