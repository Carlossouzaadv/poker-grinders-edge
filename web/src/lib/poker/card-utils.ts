/**
 * CARD UTILITIES
 *
 * Funções puras para trabalhar com cartas de poker.
 * Estas funções não devem ter efeitos colaterais e devem ser facilmente testáveis.
 */

export type CardSuit = 'c' | 'd' | 'h' | 's';
export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export class CardUtils {
  /**
   * Retorna o símbolo Unicode para um naipe de carta
   * @param suit - Naipe da carta ('c', 'd', 'h', 's')
   * @returns Símbolo Unicode do naipe
   */
  static getSuitSymbol(suit: string): string {
    const symbols: Record<string, string> = {
      c: '♣',
      d: '♦',
      h: '♥',
      s: '♠'
    };
    return symbols[suit] || '♠';
  }

  /**
   * Retorna a cor do naipe (para estilização)
   * @param suit - Naipe da carta ('c', 'd', 'h', 's')
   * @returns 'red' para copas/ouros, 'black' para espadas/paus
   */
  static getSuitColor(suit: string): 'red' | 'black' {
    return (suit === 'd' || suit === 'h') ? 'red' : 'black';
  }

  /**
   * Retorna a classe CSS de cor para o naipe
   * @param suit - Naipe da carta ('c', 'd', 'h', 's')
   * @returns Classe CSS Tailwind para colorir o naipe
   */
  static getSuitColorClass(suit: string): string {
    return (suit === 'd' || suit === 'h') ? 'text-red-600' : 'text-gray-900';
  }

  /**
   * Converte rank 'T' para '10' para display
   * @param rank - Rank da carta
   * @returns Rank formatado para exibição
   */
  static getRankDisplay(rank: string): string {
    return rank === 'T' ? '10' : rank;
  }

  /**
   * Valida se um naipe é válido
   * @param suit - Naipe a validar
   * @returns true se o naipe é válido
   */
  static isValidSuit(suit: string): suit is CardSuit {
    return ['c', 'd', 'h', 's'].includes(suit);
  }

  /**
   * Valida se um rank é válido
   * @param rank - Rank a validar
   * @returns true se o rank é válido
   */
  static isValidRank(rank: string): rank is CardRank {
    return ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'].includes(rank);
  }

  /**
   * Converte uma carta para string (e.g., "As" para Ás de Espadas)
   * @param rank - Rank da carta
   * @param suit - Naipe da carta
   * @returns String formatada da carta
   */
  static cardToString(rank: string, suit: string): string {
    return `${this.getRankDisplay(rank)}${this.getSuitSymbol(suit)}`;
  }

  /**
   * Converte string (ex: "Ah") para objeto Card
   */
  static stringToCard(cardStr: string): import('@/types/poker').Card | null {
    if (cardStr.length !== 2) return null;
    const rank = cardStr[0].toUpperCase();
    const suit = cardStr[1].toLowerCase();

    if (this.isValidRank(rank) && this.isValidSuit(suit)) {
      return { rank, suit };
    }
    return null;
  }

  /**
   * Converte string de mão (ex: "AhKs") para array de Cards
   */
  static parseCards(handStr: string): import('@/types/poker').Card[] {
    const cards: import('@/types/poker').Card[] = [];
    for (let i = 0; i < handStr.length; i += 2) {
      const cardStr = handStr.slice(i, i + 2);
      const card = this.stringToCard(cardStr);
      if (card) {
        cards.push(card);
      }
    }
    return cards;
  }
}
