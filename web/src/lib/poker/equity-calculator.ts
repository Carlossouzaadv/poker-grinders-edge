/**
 * Equity Calculator
 *
 * MVP Implementation: Hand vs Hand equity calculation using Monte Carlo simulation
 * Future: Add range support
 */

import { Card } from '@/types/poker';
import { EquityResult, Street } from '@/types/equity';

// Ranks and suits for deck generation
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;
const SUITS = ['h', 'd', 'c', 's'] as const;

type Rank = typeof RANKS[number];
type Suit = typeof SUITS[number];

interface PokerCard {
  rank: Rank;
  suit: Suit;
}

/**
 * Parse a card string (e.g., "Ah", "Ks") into a PokerCard
 */
function parseCard(cardStr: string): PokerCard | null {
  if (cardStr.length !== 2) return null;

  const rank = cardStr[0].toUpperCase() as Rank;
  const suit = cardStr[1].toLowerCase() as Suit;

  if (!RANKS.includes(rank) || !SUITS.includes(suit)) {
    return null;
  }

  return { rank, suit };
}

/**
 * Parse a hand string (e.g., "AhKs") into an array of PokerCards
 */
function parseHand(handStr: string): PokerCard[] | null {
  const normalized = handStr.trim().replace(/\s+/g, '');

  if (normalized.length !== 4) return null;

  const card1 = parseCard(normalized.substring(0, 2));
  const card2 = parseCard(normalized.substring(2, 4));

  if (!card1 || !card2) return null;

  // Check for duplicate cards
  if (card1.rank === card2.rank && card1.suit === card2.suit) {
    return null;
  }

  return [card1, card2];
}

/**
 * Parse board cards (e.g., "AhKs2c")
 */
function parseBoard(boardStr: string): PokerCard[] | null {
  const normalized = boardStr.trim().replace(/\s+/g, '');

  if (normalized.length === 0) return [];
  if (normalized.length % 2 !== 0) return null;

  const cards: PokerCard[] = [];
  for (let i = 0; i < normalized.length; i += 2) {
    const card = parseCard(normalized.substring(i, i + 2));
    if (!card) return null;
    cards.push(card);
  }

  // Check for duplicates
  const seen = new Set<string>();
  for (const card of cards) {
    const key = `${card.rank}${card.suit}`;
    if (seen.has(key)) return null;
    seen.has(key);
  }

  return cards;
}

/**
 * Create a full deck of cards
 */
function createDeck(): PokerCard[] {
  const deck: PokerCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/**
 * Check if two cards are equal
 */
function cardsEqual(c1: PokerCard, c2: PokerCard): boolean {
  return c1.rank === c2.rank && c1.suit === c2.suit;
}

/**
 * Remove used cards from deck
 */
function removeUsedCards(deck: PokerCard[], usedCards: PokerCard[]): PokerCard[] {
  return deck.filter(deckCard =>
    !usedCards.some(usedCard => cardsEqual(deckCard, usedCard))
  );
}

/**
 * Shuffle an array (Fisher-Yates)
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Evaluate a 5-card poker hand (simplified - returns score)
 * Higher score = better hand
 */
function evaluateHand(cards: PokerCard[]): number {
  if (cards.length !== 5) return 0;

  // Count ranks
  const rankCounts = new Map<Rank, number>();
  for (const card of cards) {
    rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
  }

  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);

  // Check flush
  const isFlush = cards.every(card => card.suit === cards[0].suit);

  // Check straight
  const rankValues = cards.map(c => RANKS.indexOf(c.rank)).sort((a, b) => a - b);
  const isStraight = rankValues.every((val, idx) => idx === 0 || val === rankValues[idx - 1] + 1) ||
                     (rankValues[0] === 0 && rankValues[1] === 1 && rankValues[2] === 2 &&
                      rankValues[3] === 3 && rankValues[4] === 12); // Wheel (A2345)

  // Score hand (simplified)
  if (isFlush && isStraight) return 8000000; // Straight flush
  if (counts[0] === 4) return 7000000; // Four of a kind
  if (counts[0] === 3 && counts[1] === 2) return 6000000; // Full house
  if (isFlush) return 5000000; // Flush
  if (isStraight) return 4000000; // Straight
  if (counts[0] === 3) return 3000000; // Three of a kind
  if (counts[0] === 2 && counts[1] === 2) return 2000000; // Two pair
  if (counts[0] === 2) return 1000000; // One pair

  // High card
  return Math.max(...rankValues) * 1000;
}

/**
 * Get best 5-card hand from 7 cards
 */
function getBestHand(sevenCards: PokerCard[]): number {
  if (sevenCards.length < 5) return 0;

  let bestScore = 0;

  // Generate all 5-card combinations
  for (let i = 0; i < sevenCards.length; i++) {
    for (let j = i + 1; j < sevenCards.length; j++) {
      for (let k = j + 1; k < sevenCards.length; k++) {
        for (let l = k + 1; l < sevenCards.length; l++) {
          for (let m = l + 1; m < sevenCards.length; m++) {
            const fiveCards = [sevenCards[i], sevenCards[j], sevenCards[k], sevenCards[l], sevenCards[m]];
            const score = evaluateHand(fiveCards);
            if (score > bestScore) {
              bestScore = score;
            }
          }
        }
      }
    }
  }

  return bestScore;
}

/**
 * Run Monte Carlo simulation to calculate equity
 */
export function calculateEquity(
  heroHandStr: string,
  villainHandStr: string,
  boardStr: string = '',
  iterations: number = 10000
): EquityResult | null {
  // Parse inputs
  const heroHand = parseHand(heroHandStr);
  const villainHand = parseHand(villainHandStr);
  const board = parseBoard(boardStr);

  if (!heroHand || !villainHand || board === null) {
    return null;
  }

  // Check for duplicate cards
  const allCards = [...heroHand, ...villainHand, ...board];
  const seen = new Set<string>();
  for (const card of allCards) {
    const key = `${card.rank}${card.suit}`;
    if (seen.has(key)) return null; // Duplicate card
    seen.add(key);
  }

  // Determine street
  let street: Street;
  if (board.length === 0) street = 'preflop';
  else if (board.length === 3) street = 'flop';
  else if (board.length === 4) street = 'turn';
  else if (board.length === 5) street = 'river';
  else return null; // Invalid board

  // Create available deck
  let deck = createDeck();
  deck = removeUsedCards(deck, allCards);

  let heroWins = 0;
  let villainWins = 0;
  let ties = 0;

  // Monte Carlo simulation
  for (let i = 0; i < iterations; i++) {
    const shuffledDeck = shuffle(deck);

    // Complete the board if needed
    const simulatedBoard = [...board];
    let cardIndex = 0;
    while (simulatedBoard.length < 5) {
      simulatedBoard.push(shuffledDeck[cardIndex++]);
    }

    // Evaluate hands
    const heroSevenCards = [...heroHand, ...simulatedBoard];
    const villainSevenCards = [...villainHand, ...simulatedBoard];

    const heroScore = getBestHand(heroSevenCards);
    const villainScore = getBestHand(villainSevenCards);

    if (heroScore > villainScore) {
      heroWins++;
    } else if (villainScore > heroScore) {
      villainWins++;
    } else {
      ties++;
    }
  }

  const heroEquity = ((heroWins + ties / 2) / iterations) * 100;
  const villainEquity = ((villainWins + ties / 2) / iterations) * 100;
  const tieEquity = (ties / iterations) * 100;

  return {
    heroEquity: Math.round(heroEquity * 100) / 100,
    villainEquity: Math.round(villainEquity * 100) / 100,
    tieEquity: Math.round(tieEquity * 100) / 100,
    heroHand: heroHandStr,
    villainRange: villainHandStr, // For now, just a single hand
    board: boardStr,
    street
  };
}

/**
 * Validate card format
 */
export function isValidCard(cardStr: string): boolean {
  return parseCard(cardStr) !== null;
}

/**
 * Validate hand format
 */
export function isValidHand(handStr: string): boolean {
  return parseHand(handStr) !== null;
}

/**
 * Validate board format
 */
export function isValidBoard(boardStr: string): boolean {
  return parseBoard(boardStr) !== null;
}
