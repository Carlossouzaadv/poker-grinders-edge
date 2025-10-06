import { IPokerSiteParser } from './IPokerSiteParser';
import { ParseResult, GameContext } from '@/types/poker';

/**
 * Parser específico para Hand Histories do GGPoker
 *
 * Formatos suportados:
 * - Cash games e torneios
 * - Formato único: Button identificado por tag [BTN] no nome
 *
 * Características específicas do GGPoker:
 * - Players têm tags de posição no nome: "PlayerName [BTN]"
 * - Header format: "GGPoker Hand #XXXXXX" ou "Game ID: XXXXX"
 * - Diferentes formatos de table info
 */
export class GGPokerParser implements IPokerSiteParser {
  getSiteName(): string {
    return 'GGPoker';
  }

  validateFormat(handText: string): boolean {
    // Validação básica: header GGPoker
    const hasValidHeader = /^(?:GGPoker Hand|Poker Hand) #/.test(handText) ||
                          /Game ID:/.test(handText);

    // Deve ter seção de players
    const hasPlayers = /Seat \d+:/.test(handText);

    return hasValidHeader && hasPlayers;
  }

  detectGameContext(headerLine: string): GameContext {
    // GGPoker tournament detection
    const isTournament = /Tournament/.test(headerLine) ||
                        /T\$/.test(headerLine);

    if (isTournament) {
      return {
        isTournament: true,
        isHighStakes: false,
        currencyUnit: 'chips',
        conversionNeeded: false
      };
    }

    // Cash game - extract blinds
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
    // Mas com lógica específica do GGPoker:
    // - Detectar button via tag [BTN]
    // - Parse header diferente
    // - Etc.

    // TODO: Extrair do código existente em hand-parser.ts
    // Por ora, retorna erro para forçar implementação
    return {
      success: false,
      error: 'GGPokerParser.parse() - Implementação pendente. Use código existente de hand-parser.ts'
    };
  }
}
