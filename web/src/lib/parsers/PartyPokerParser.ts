import { IPokerSiteParser } from './IPokerSiteParser';
import { ParseResult, GameContext } from '@/types/poker';

/**
 * Parser específico para Hand Histories do PartyPoker
 *
 * Formatos suportados:
 * - Cash games (normalmente sem antes)
 * - Torneios
 *
 * Características específicas do PartyPoker:
 * - Header format: "PartyPoker Hand #XXXXXX"
 * - Summary parsing para cartas muckadas reveladas
 * - Formato similar ao PokerStars mas com diferenças sutis
 */
export class PartyPokerParser implements IPokerSiteParser {
  getSiteName(): string {
    return 'PartyPoker';
  }

  validateFormat(handText: string): boolean {
    // Validação básica: header PartyPoker
    const hasValidHeader = /^PartyPoker Hand #/.test(handText);

    // Deve ter seção de players
    const hasPlayers = /Seat \d+:/.test(handText);

    return hasValidHeader && hasPlayers;
  }

  detectGameContext(headerLine: string): GameContext {
    // PartyPoker tournament detection
    const isTournament = /Tournament/.test(headerLine);

    if (isTournament) {
      return {
        isTournament: true,
        isHighStakes: false,
        currencyUnit: 'chips',
        conversionNeeded: false
      };
    }

    // Cash game
    const blindsMatch = headerLine.match(/\(\$?([0-9.]+)\/\$?([0-9.]+)/);
    const bigBlind = blindsMatch ? parseFloat(blindsMatch[2]) : 0;

    return {
      isTournament: false,
      isHighStakes: bigBlind >= 1.0,
      currencyUnit: 'dollars',
      conversionNeeded: true
    };
  }

  parse(handText: string): ParseResult {
    // IMPLEMENTAÇÃO COMPLETA SIMILAR AO PokerStarsParser
    // Mas com lógica específica do PartyPoker

    // TODO: Extrair do código existente em hand-parser.ts
    return {
      success: false,
      error: 'PartyPokerParser.parse() - Implementação pendente. Use código existente de hand-parser.ts'
    };
  }
}
