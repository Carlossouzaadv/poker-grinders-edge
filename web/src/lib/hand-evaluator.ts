/**
 * Hand Evaluator - Avaliar e comparar mãos de poker Texas Hold'em
 *
 * Este módulo implementa a lógica completa de avaliação de mãos de poker,
 * incluindo ranking de mãos e comparação de kickers.
 */

import { Card } from '@/types/poker';

// Rankings de mãos (quanto maior, melhor)
export enum HandRank {
  HIGH_CARD = 1,
  PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10
}

export interface HandEvaluation {
  rank: HandRank;
  rankName: string;
  values: number[]; // Valores das cartas que formam a mão (para comparação de kickers)
  description: string;
}

export class HandEvaluator {
  /**
   * Converte rank de carta (2-9, T, J, Q, K, A) para valor numérico
   */
  private static cardValue(rank: string): number {
    const valueMap: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return valueMap[rank.toUpperCase()] || 0;
  }

  /**
   * Converte valor numérico de volta para rank de carta
   */
  private static valueToRank(value: number): string {
    const rankMap: Record<number, string> = {
      2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
      10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A'
    };
    return rankMap[value] || '?';
  }

  /**
   * Avalia a melhor mão de 5 cartas possível a partir de 7 cartas (2 hole cards + 5 community cards)
   */
  static evaluateHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
    const allCards = [...holeCards, ...communityCards];

    if (allCards.length < 5) {
      throw new Error(`Insufficient cards to evaluate: expected at least 5, got ${allCards.length}`);
    }

    // Gerar todas as combinações possíveis de 5 cartas
    const combinations = this.getCombinations(allCards, 5);

    // Avaliar cada combinação e retornar a melhor
    let bestEval: HandEvaluation | null = null;

    for (const combo of combinations) {
      const evaluation = this.evaluateFiveCards(combo);

      if (!bestEval || this.compareEvaluations(evaluation, bestEval) > 0) {
        bestEval = evaluation;
      }
    }

    return bestEval!;
  }

  /**
   * Gera todas as combinações de k elementos de um array
   */
  private static getCombinations<T>(arr: T[], k: number): T[][] {
    if (k === 0) return [[]];
    if (k > arr.length) return [];

    const result: T[][] = [];

    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr[i];
      const tailCombos = this.getCombinations(arr.slice(i + 1), k - 1);

      for (const tailCombo of tailCombos) {
        result.push([head, ...tailCombo]);
      }
    }

    return result;
  }

  /**
   * Avalia exatamente 5 cartas e retorna o ranking
   */
  private static evaluateFiveCards(cards: Card[]): HandEvaluation {
    if (cards.length !== 5) {
      throw new Error(`evaluateFiveCards requires exactly 5 cards, got ${cards.length}`);
    }

    // Ordenar cartas por valor (decrescente)
    const sortedCards = cards
      .map(c => ({ card: c, value: this.cardValue(c.rank) }))
      .sort((a, b) => b.value - a.value);

    const values = sortedCards.map(c => c.value);
    const suits = sortedCards.map(c => c.card.suit);

    // Verificar flush
    const isFlush = suits.every(s => s === suits[0]);

    // Verificar straight
    const isStraight = this.isStraight(values);

    // Verificar straight especial (A-2-3-4-5, "wheel")
    const isWheelStraight = values[0] === 14 && values[1] === 5 && values[2] === 4 &&
                            values[3] === 3 && values[4] === 2;

    // Contar frequências de valores
    const valueCounts = new Map<number, number>();
    for (const value of values) {
      valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
    }

    const counts = Array.from(valueCounts.entries())
      .sort((a, b) => {
        // Primeiro ordena por frequência (descendente), depois por valor (descendente)
        if (b[1] !== a[1]) return b[1] - a[1];
        return b[0] - a[0];
      });

    // Royal Flush
    if (isFlush && isStraight && values[0] === 14 && values[4] === 10) {
      return {
        rank: HandRank.ROYAL_FLUSH,
        rankName: 'Royal Flush',
        values: [14],
        description: 'Royal Flush'
      };
    }

    // Straight Flush
    if (isFlush && (isStraight || isWheelStraight)) {
      return {
        rank: HandRank.STRAIGHT_FLUSH,
        rankName: 'Straight Flush',
        values: isWheelStraight ? [5] : [values[0]],
        description: `Straight Flush, ${this.valueToRank(isWheelStraight ? 5 : values[0])} high`
      };
    }

    // Four of a Kind
    if (counts[0][1] === 4) {
      return {
        rank: HandRank.FOUR_OF_KIND,
        rankName: 'Four of a Kind',
        values: [counts[0][0], counts[1][0]],
        description: `Four of a Kind, ${this.valueToRank(counts[0][0])}s`
      };
    }

    // Full House
    if (counts[0][1] === 3 && counts[1][1] === 2) {
      return {
        rank: HandRank.FULL_HOUSE,
        rankName: 'Full House',
        values: [counts[0][0], counts[1][0]],
        description: `Full House, ${this.valueToRank(counts[0][0])}s full of ${this.valueToRank(counts[1][0])}s`
      };
    }

    // Flush
    if (isFlush) {
      return {
        rank: HandRank.FLUSH,
        rankName: 'Flush',
        values: values,
        description: `Flush, ${this.valueToRank(values[0])} high`
      };
    }

    // Straight
    if (isStraight || isWheelStraight) {
      return {
        rank: HandRank.STRAIGHT,
        rankName: 'Straight',
        values: isWheelStraight ? [5] : [values[0]],
        description: `Straight, ${this.valueToRank(isWheelStraight ? 5 : values[0])} high`
      };
    }

    // Three of a Kind
    if (counts[0][1] === 3) {
      return {
        rank: HandRank.THREE_OF_KIND,
        rankName: 'Three of a Kind',
        values: [counts[0][0], counts[1][0], counts[2][0]],
        description: `Three of a Kind, ${this.valueToRank(counts[0][0])}s`
      };
    }

    // Two Pair
    if (counts[0][1] === 2 && counts[1][1] === 2) {
      return {
        rank: HandRank.TWO_PAIR,
        rankName: 'Two Pair',
        values: [counts[0][0], counts[1][0], counts[2][0]],
        description: `Two Pair, ${this.valueToRank(counts[0][0])}s and ${this.valueToRank(counts[1][0])}s`
      };
    }

    // One Pair
    if (counts[0][1] === 2) {
      return {
        rank: HandRank.PAIR,
        rankName: 'Pair',
        values: [counts[0][0], counts[1][0], counts[2][0], counts[3][0]],
        description: `Pair of ${this.valueToRank(counts[0][0])}s`
      };
    }

    // High Card
    return {
      rank: HandRank.HIGH_CARD,
      rankName: 'High Card',
      values: values,
      description: `High Card, ${this.valueToRank(values[0])}`
    };
  }

  /**
   * Verifica se 5 valores formam um straight (consecutivos)
   */
  private static isStraight(values: number[]): boolean {
    if (values.length !== 5) return false;

    for (let i = 0; i < 4; i++) {
      if (values[i] - values[i + 1] !== 1) {
        return false;
      }
    }

    return true;
  }

  /**
   * Compara duas avaliações de mãos
   * @returns > 0 se eval1 é melhor, < 0 se eval2 é melhor, 0 se empate
   */
  static compareEvaluations(eval1: HandEvaluation, eval2: HandEvaluation): number {
    // Primeiro compara o rank da mão
    if (eval1.rank !== eval2.rank) {
      return eval1.rank - eval2.rank;
    }

    // Se o rank é igual, compara os valores (kickers)
    for (let i = 0; i < Math.max(eval1.values.length, eval2.values.length); i++) {
      const v1 = eval1.values[i] || 0;
      const v2 = eval2.values[i] || 0;

      if (v1 !== v2) {
        return v1 - v2;
      }
    }

    // Empate completo
    return 0;
  }

  /**
   * Determina o(s) vencedor(es) entre múltiplos jogadores
   * @returns Array de índices dos jogadores vencedores (pode haver empate)
   */
  static determineWinners(
    playerHands: Array<{ holeCards: Card[], communityCards: Card[] }>
  ): number[] {
    if (playerHands.length === 0) return [];
    if (playerHands.length === 1) return [0];

    // Avaliar todas as mãos
    const evaluations = playerHands.map(hand =>
      this.evaluateHand(hand.holeCards, hand.communityCards)
    );

    // Encontrar a melhor avaliação
    let bestEval = evaluations[0];
    let winnerIndices = [0];

    for (let i = 1; i < evaluations.length; i++) {
      const comparison = this.compareEvaluations(evaluations[i], bestEval);

      if (comparison > 0) {
        // Nova melhor mão
        bestEval = evaluations[i];
        winnerIndices = [i];
      } else if (comparison === 0) {
        // Empate
        winnerIndices.push(i);
      }
    }

    return winnerIndices;
  }
}
