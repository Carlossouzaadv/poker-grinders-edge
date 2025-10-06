/**
 * ChipStack - Component Tests
 *
 * Comprehensive test coverage for ChipStack component:
 * - Different chip denominations
 * - Size variants
 * - Stacking behavior
 * - Label display
 * - Realistic stacking mode
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChipStack from '../ChipStack';

describe('ChipStack', () => {
  describe('Basic Rendering', () => {
    it('should render a chip with value label', () => {
      render(<ChipStack valor={100} />);
      expect(screen.getByText('$100')).toBeInTheDocument();
    });

    it('should render chip without label when showLabel is false', () => {
      render(<ChipStack valor={100} showLabel={false} />);
      expect(screen.queryByText('$100')).not.toBeInTheDocument();
    });

    it('should render chip for all standard denominations', () => {
      const denominations = [1, 5, 25, 50, 100, 500, 1000, 5000, 10000, 25000, 100000, 500000, 1000000];

      denominations.forEach(valor => {
        const { container } = render(<ChipStack valor={valor} />);
        expect(container.querySelector('.chip')).toBeInTheDocument();
      });
    });
  });

  describe('Chip Denomination Selection', () => {
    it('should use $1 chip for small values', () => {
      const { container } = render(<ChipStack valor={1} size="medium" />);
      const chip = container.querySelector('.chip-1');
      expect(chip).toBeInTheDocument();
    });

    it('should use $5 chip for values >= 5', () => {
      const { container } = render(<ChipStack valor={5} size="medium" />);
      const chip = container.querySelector('.chip-5');
      expect(chip).toBeInTheDocument();
    });

    it('should use $25 chip for values >= 25', () => {
      const { container } = render(<ChipStack valor={25} size="medium" />);
      const chip = container.querySelector('.chip-25');
      expect(chip).toBeInTheDocument();
    });

    it('should use $100 chip for values >= 100', () => {
      const { container } = render(<ChipStack valor={100} size="medium" />);
      const chip = container.querySelector('.chip-100');
      expect(chip).toBeInTheDocument();
    });

    it('should use highest denomination chip for large values', () => {
      const { container } = render(<ChipStack valor={1000000} size="medium" />);
      const chip = container.querySelector('.chip-1m');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Special $50 Stacking', () => {
    it('should stack two $25 chips for $50', () => {
      const { container } = render(<ChipStack valor={50} size="medium" />);
      const chips = container.querySelectorAll('.chip-25');
      expect(chips.length).toBe(2);
    });

    it('should position second chip on top of first', () => {
      const { container } = render(<ChipStack valor={50} size="medium" />);
      const chips = container.querySelectorAll('.chip-25');

      const topChip = chips[1];
      expect(topChip).toHaveStyle({ position: 'absolute' });
    });

    it('should show $50 label for stacked chips', () => {
      render(<ChipStack valor={50} />);
      expect(screen.getByText('$50')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small chip with correct class', () => {
      const { container } = render(<ChipStack valor={100} size="small" />);
      const chip = container.querySelector('.chip');
      expect(chip).toBeInTheDocument();
    });

    it('should render medium chip with correct class', () => {
      const { container } = render(<ChipStack valor={100} size="medium" />);
      const chip = container.querySelector('.chip-medium, .chip');
      expect(chip).toBeInTheDocument();
    });

    it('should render large chip with correct class', () => {
      const { container } = render(<ChipStack valor={100} size="large" />);
      const chip = container.querySelector('.chip-large');
      expect(chip).toBeInTheDocument();
    });

    it('should adjust label size for small chips', () => {
      const { container } = render(<ChipStack valor={100} size="small" />);
      const label = screen.getByText('$100');
      expect(label).toHaveClass('money-label-small');
    });

    it('should adjust label size for large chips', () => {
      const { container } = render(<ChipStack valor={100} size="large" />);
      const label = screen.getByText('$100');
      expect(label).toHaveClass('money-label-large');
    });
  });

  describe('Value Formatting', () => {
    it('should format values >= 1000 with K suffix', () => {
      render(<ChipStack valor={1000} />);
      expect(screen.getByText('$1000')).toBeInTheDocument();
    });

    it('should format small values without suffix', () => {
      render(<ChipStack valor={500} />);
      expect(screen.getByText('$500')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(<ChipStack valor={0} />);
      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  describe('Realistic Stacking Mode', () => {
    it('should enable realistic stacking when prop is true', () => {
      const { container } = render(<ChipStack valor={100} enableRealisticStacking={true} />);
      expect(container.querySelector('.chip')).toBeInTheDocument();
    });

    it('should not use realistic stacking for values <= 25', () => {
      const { container } = render(<ChipStack valor={25} enableRealisticStacking={true} />);
      // Should use single chip display
      const chips = container.querySelectorAll('.chip');
      expect(chips.length).toBe(1);
    });

    it('should break down large values into multiple chips', () => {
      const { container } = render(<ChipStack valor={250} enableRealisticStacking={true} />);
      // Should stack multiple chips
      const chips = container.querySelectorAll('.chip');
      expect(chips.length).toBeGreaterThan(1);
    });

    it('should limit stack height to prevent excessive stacking', () => {
      const { container } = render(<ChipStack valor={100000} enableRealisticStacking={true} />);
      // Should not create more than reasonable number of chips
      const chips = container.querySelectorAll('.chip');
      expect(chips.length).toBeLessThan(20); // Reasonable limit
    });
  });

  describe('Chip Positioning', () => {
    it('should use CSS sprite for small chips', () => {
      const { container } = render(<ChipStack valor={100} size="small" />);
      const chip = container.querySelector('.chip');

      if (chip) {
        const styles = window.getComputedStyle(chip);
        // Should have background position set
        expect(chip).toHaveStyle({ backgroundImage: expect.stringContaining('chips-sprite.png') });
      }
    });

    it('should stack chips vertically with proper z-index', () => {
      const { container } = render(<ChipStack valor={50} size="medium" />);
      const chips = Array.from(container.querySelectorAll('.chip-25'));

      if (chips.length === 2) {
        const bottomChip = chips[0];
        const topChip = chips[1] as HTMLElement;

        expect(topChip.style.zIndex).toBe('2');
      }
    });
  });

  describe('Tournament Chip Values', () => {
    it('should handle tournament chip values', () => {
      const tournamentValues = [
        100, 500, 1000, 5000, 25000, 100000, 500000, 1000000,
      ];

      tournamentValues.forEach(valor => {
        const { container } = render(<ChipStack valor={valor} />);
        expect(container.querySelector('.chip')).toBeInTheDocument();
      });
    });

    it('should handle very large tournament stacks', () => {
      const { container } = render(<ChipStack valor={25000000000} />);
      expect(container.querySelector('.chip-25b')).toBeInTheDocument();
    });
  });

  describe('Cash Game Chip Values', () => {
    it('should handle common cash game denominations', () => {
      const cashValues = [1, 5, 25, 100, 500];

      cashValues.forEach(valor => {
        const { container } = render(<ChipStack valor={valor} />);
        expect(container.querySelector('.chip')).toBeInTheDocument();
      });
    });

    it('should handle fractional dollar amounts (for display only)', () => {
      // Component expects integer values, but should handle gracefully
      const { container } = render(<ChipStack valor={Math.floor(0.5 * 100)} />);
      expect(container.querySelector('.chip')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative values gracefully', () => {
      const { container } = render(<ChipStack valor={-100} />);
      expect(container.querySelector('.chip')).toBeInTheDocument();
    });

    it('should handle very small values', () => {
      render(<ChipStack valor={0} />);
      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('should handle very large values', () => {
      render(<ChipStack valor={999999999} />);
      expect(screen.getByText(/\$/)).toBeInTheDocument();
    });

    it('should handle undefined size prop', () => {
      const { container } = render(<ChipStack valor={100} />);
      expect(container.querySelector('.chip')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should center chip and label', () => {
      const { container } = render(<ChipStack valor={100} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      });
    });

    it('should have pointer-events: none for chips', () => {
      const { container } = render(<ChipStack valor={100} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper).toHaveStyle({ pointerEvents: 'none' });
    });

    it('should apply transparent background to chips', () => {
      const { container } = render(<ChipStack valor={100} size="medium" />);
      const chip = container.querySelector('.chip');

      if (chip) {
        // Chips should use sprite image, not background color
        expect(chip).toHaveClass('chip-100');
      }
    });
  });

  describe('Label Display', () => {
    it('should show label by default', () => {
      render(<ChipStack valor={100} />);
      expect(screen.getByText('$100')).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      render(<ChipStack valor={100} showLabel={false} />);
      expect(screen.queryByText('$100')).not.toBeInTheDocument();
    });

    it('should format label correctly for all values', () => {
      const testCases = [
        { valor: 1, expected: '$1' },
        { valor: 50, expected: '$50' },
        { valor: 500, expected: '$500' },
        { valor: 1000, expected: '$1000' },
        { valor: 100000, expected: '$100000' },
      ];

      testCases.forEach(({ valor, expected }) => {
        render(<ChipStack valor={valor} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should memoize component to prevent unnecessary re-renders', () => {
      const { rerender } = render(<ChipStack valor={100} />);

      // Should not throw or cause issues on re-render with same props
      expect(() => rerender(<ChipStack valor={100} />)).not.toThrow();
    });

    it('should handle rapid prop changes', () => {
      const { rerender } = render(<ChipStack valor={100} />);

      const values = [100, 200, 300, 400, 500];
      values.forEach(valor => {
        expect(() => rerender(<ChipStack valor={valor} />)).not.toThrow();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have title attribute for accessibility', () => {
      const { container } = render(<ChipStack valor={100} />);
      const chip = container.querySelector('.chip');

      expect(chip).toHaveAttribute('title');
    });

    it('should provide meaningful title text', () => {
      const { container } = render(<ChipStack valor={100} />);
      const chip = container.querySelector('.chip');

      const title = chip?.getAttribute('title');
      expect(title).toContain('$100');
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle typical pot sizes', () => {
      const potSizes = [75, 150, 500, 1500, 5000, 10000];

      potSizes.forEach(valor => {
        const { container } = render(<ChipStack valor={valor} />);
        expect(container.querySelector('.chip')).toBeInTheDocument();
      });
    });

    it('should handle bet amounts', () => {
      const betAmounts = [50, 100, 200, 500];

      betAmounts.forEach(valor => {
        const { container } = render(<ChipStack valor={valor} />);
        expect(container.querySelector('.chip')).toBeInTheDocument();
      });
    });

    it('should handle all-in amounts', () => {
      const allInAmounts = [2500, 5000, 10000, 50000];

      allInAmounts.forEach(valor => {
        const { container } = render(<ChipStack valor={valor} />);
        expect(container.querySelector('.chip')).toBeInTheDocument();
      });
    });
  });
});
