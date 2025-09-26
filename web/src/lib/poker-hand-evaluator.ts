import { Card } from '@/types/poker';

export interface HandEvaluation {
  rank: number; // 1 = high card, 2 = pair, ..., 10 = royal flush
  name: string; // Nome da combinação
  description: string; // Descrição detalhada (ex: "Par de Ases")
  cards: Card[]; // Cartas que formam a combinação
}

// Converte rank para valor numérico para comparação
const getRankValue = (rank: string): number => {
  switch (rank) {
    case '2': return 2;
    case '3': return 3;
    case '4': return 4;
    case '5': return 5;
    case '6': return 6;
    case '7': return 7;
    case '8': return 8;
    case '9': return 9;
    case 'T': return 10;
    case 'J': return 11;
    case 'Q': return 12;
    case 'K': return 13;
    case 'A': return 14;
    default: return 0;
  }
};

// Converte valor numérico de volta para rank
const getDisplayRank = (value: number): string => {
  switch (value) {
    case 14: return 'A';
    case 13: return 'K';
    case 12: return 'Q';
    case 11: return 'J';
    case 10: return 'T';
    default: return value.toString();
  }
};

// Converte suit para nome em português
const getSuitName = (suit: string): string => {
  switch (suit) {
    case 'h': return 'Copas';
    case 'd': return 'Ouros';
    case 'c': return 'Paus';
    case 's': return 'Espadas';
    default: return suit;
  }
};

// Nome da carta em português
const getCardName = (rank: string): string => {
  switch (rank) {
    case 'A': return 'Ás';
    case 'K': return 'Rei';
    case 'Q': return 'Dama';
    case 'J': return 'Valete';
    case 'T': return '10';
    default: return rank;
  }
};

export class PokerHandEvaluator {
  static evaluateHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
    const allCards = [...holeCards, ...communityCards];

    if (allCards.length < 5) {
      return {
        rank: 1,
        name: 'Carta Alta',
        description: 'Cartas insuficientes para avaliação',
        cards: allCards
      };
    }

    // Ordenar cartas por valor (maior para menor)
    const sortedCards = allCards
      .map(card => ({ ...card, value: getRankValue(card.rank) }))
      .sort((a, b) => b.value - a.value);

    // Contar ocorrências de cada rank
    const rankCounts: { [key: number]: Card[] } = {};
    sortedCards.forEach(card => {
      if (!rankCounts[card.value]) {
        rankCounts[card.value] = [];
      }
      rankCounts[card.value].push(card);
    });

    // Contar ocorrências de cada suit
    const suitCounts: { [key: string]: Card[] } = {};
    sortedCards.forEach(card => {
      if (!suitCounts[card.suit]) {
        suitCounts[card.suit] = [];
      }
      suitCounts[card.suit].push(card);
    });

    // Verificar flush
    const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit].length >= 5);
    const flushCards = flushSuit ? suitCounts[flushSuit].slice(0, 5) : null;

    // Verificar straight
    const straightCards = this.findStraight(sortedCards);

    // Verificar royal flush
    if (flushCards && straightCards && straightCards[0].value === 14 && straightCards[4].value === 10) {
      const royalFlushCards = straightCards.filter(card => card.suit === flushSuit);
      if (royalFlushCards.length === 5) {
        return {
          rank: 10,
          name: 'Royal Flush',
          description: `Royal Flush de ${getSuitName(flushSuit!)}`,
          cards: royalFlushCards
        };
      }
    }

    // Verificar straight flush
    if (flushCards && straightCards) {
      const straightFlushCards = straightCards.filter(card => card.suit === flushSuit);
      if (straightFlushCards.length === 5) {
        return {
          rank: 9,
          name: 'Straight Flush',
          description: `Straight Flush de ${getCardName(getDisplayRank(straightFlushCards[0].value))} a ${getCardName(getDisplayRank(straightFlushCards[4].value))} de ${getSuitName(flushSuit!)}`,
          cards: straightFlushCards
        };
      }
    }

    // Verificar quadra
    const quadra = Object.values(rankCounts).find(cards => cards.length === 4);
    if (quadra) {
      return {
        rank: 8,
        name: 'Quadra',
        description: `Quadra de ${getCardName(quadra[0].rank)}`,
        cards: quadra
      };
    }

    // Verificar full house
    const trinca = Object.values(rankCounts).find(cards => cards.length === 3);
    const par = Object.values(rankCounts).find(cards => cards.length === 2);
    if (trinca && par) {
      return {
        rank: 7,
        name: 'Full House',
        description: `Full House de ${getCardName(trinca[0].rank)} com ${getCardName(par[0].rank)}`,
        cards: [...trinca, ...par]
      };
    }

    // Verificar flush
    if (flushCards) {
      return {
        rank: 6,
        name: 'Flush',
        description: `Flush de ${getSuitName(flushSuit!)}`,
        cards: flushCards
      };
    }

    // Verificar straight
    if (straightCards) {
      return {
        rank: 5,
        name: 'Straight',
        description: `Straight de ${getCardName(getDisplayRank(straightCards[0].value))} a ${getCardName(getDisplayRank(straightCards[4].value))}`,
        cards: straightCards
      };
    }

    // Verificar trinca
    if (trinca) {
      return {
        rank: 4,
        name: 'Trinca',
        description: `Trinca de ${getCardName(trinca[0].rank)}`,
        cards: trinca
      };
    }

    // Verificar dois pares
    const pares = Object.values(rankCounts).filter(cards => cards.length === 2);
    if (pares.length >= 2) {
      const doisPares = pares.slice(0, 2).flat();
      return {
        rank: 3,
        name: 'Dois Pares',
        description: `Dois Pares: ${getCardName(pares[0][0].rank)} e ${getCardName(pares[1][0].rank)}`,
        cards: doisPares
      };
    }

    // Verificar um par
    if (pares.length === 1) {
      return {
        rank: 2,
        name: 'Um Par',
        description: `Um Par de ${getCardName(pares[0][0].rank)}`,
        cards: pares[0]
      };
    }

    // Carta alta
    return {
      rank: 1,
      name: 'Carta Alta',
      description: `Carta Alta: ${getCardName(sortedCards[0].rank)}`,
      cards: [sortedCards[0]]
    };
  }

  private static findStraight(sortedCards: any[]): any[] | null {
    const uniqueValues = [...new Set(sortedCards.map(card => card.value))];

    // Verificar A-5 straight (A, 5, 4, 3, 2)
    if (uniqueValues.includes(14) && uniqueValues.includes(5) &&
        uniqueValues.includes(4) && uniqueValues.includes(3) && uniqueValues.includes(2)) {
      return [
        sortedCards.find(card => card.value === 5),
        sortedCards.find(card => card.value === 4),
        sortedCards.find(card => card.value === 3),
        sortedCards.find(card => card.value === 2),
        sortedCards.find(card => card.value === 14)
      ].filter(card => card);
    }

    // Verificar straight normal
    for (let i = 0; i < uniqueValues.length - 4; i++) {
      if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
        return [
          sortedCards.find(card => card.value === uniqueValues[i]),
          sortedCards.find(card => card.value === uniqueValues[i + 1]),
          sortedCards.find(card => card.value === uniqueValues[i + 2]),
          sortedCards.find(card => card.value === uniqueValues[i + 3]),
          sortedCards.find(card => card.value === uniqueValues[i + 4])
        ].filter(card => card);
      }
    }

    return null;
  }

  // Método auxiliar para encontrar a melhor mão de um jogador
  static getBestHandDescription(player: any, communityCards: Card[]): string {
    if (!player.cards || player.cards.length < 2) {
      return 'Cartas não reveladas';
    }

    const evaluation = this.evaluateHand(player.cards, communityCards);
    return evaluation.description;
  }
}