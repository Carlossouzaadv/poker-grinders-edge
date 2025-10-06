import { Card, HandHistory, Street } from '@/types/poker';

/**
 * Utility class for poker-related operations
 */
export class PokerUtils {
  /**
   * Gets community cards visible for a given street based on HandHistory
   *
   * Handles all edge cases:
   * - Ensures no runtime errors from undefined/null values
   * - Validates card structure (rank and suit)
   * - Returns empty array for preflop
   * - Accumulates cards progressively through streets
   *
   * @param handHistory - The complete hand history
   * @param currentStreet - The current street to get cards for
   * @returns Array of valid community cards visible at this street
   */
  static getCommunityCardsForStreet(
    handHistory: HandHistory,
    currentStreet: Street
  ): Card[] {
    const cards: Card[] = [];

    // Preflop has no community cards
    if (currentStreet === 'preflop') {
      return cards;
    }

    // Add flop cards (available from flop onwards)
    if (['flop', 'turn', 'river', 'showdown'].includes(currentStreet)) {
      const flopCards = handHistory.flop?.cards || [];

      // Validate and add each flop card
      flopCards.forEach((card, index) => {
        if (this.isValidCard(card)) {
          cards.push(card);
        } else {
          console.warn(`[PokerUtils] Invalid flop card at index ${index}:`, card);
        }
      });
    }

    // Add turn card (available from turn onwards)
    if (['turn', 'river', 'showdown'].includes(currentStreet)) {
      const turnCard = handHistory.turn?.card;

      if (turnCard) {
        if (this.isValidCard(turnCard)) {
          cards.push(turnCard);
        } else {
          console.warn('[PokerUtils] Invalid turn card:', turnCard);
        }
      }
    }

    // Add river card (available from river onwards)
    if (['river', 'showdown'].includes(currentStreet)) {
      const riverCard = handHistory.river?.card;

      if (riverCard) {
        if (this.isValidCard(riverCard)) {
          cards.push(riverCard);
        } else {
          console.warn('[PokerUtils] Invalid river card:', riverCard);
        }
      }
    }

    return cards;
  }

  /**
   * Validates that a card has proper rank and suit
   *
   * @param card - The card to validate
   * @returns true if card is valid, false otherwise
   */
  private static isValidCard(card: any): card is Card {
    if (!card || typeof card !== 'object') {
      return false;
    }

    const validRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const validSuits = ['h', 'd', 'c', 's'];

    const hasValidRank = validRanks.includes(card.rank);
    const hasValidSuit = validSuits.includes(card.suit);

    return hasValidRank && hasValidSuit;
  }
}
