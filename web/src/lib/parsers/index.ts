/**
 * Parsers Module - Strategy Pattern Implementation
 *
 * Este módulo exporta a interface formal e todas as implementações
 * de parsers de sites de poker, seguindo Strategy Pattern.
 *
 * Factory Method incluído para criação polimórfica de parsers.
 */

export type { IPokerSiteParser } from './IPokerSiteParser';
export { PokerStarsParser } from './PokerStarsParser';
export { GGPokerParser } from './GGPokerParser';
export { PartyPokerParser } from './PartyPokerParser';

import { IPokerSiteParser } from './IPokerSiteParser';
import { PokerStarsParser } from './PokerStarsParser';
import { GGPokerParser } from './GGPokerParser';
import { PartyPokerParser } from './PartyPokerParser';

/**
 * Factory Method para criar parser específico baseado no nome do site
 *
 * Implementa padrão Factory para criação polimórfica de parsers.
 * Centraliza lógica de instanciação e garante type safety.
 *
 * @param siteName - Nome do site ('PokerStars', 'GGPoker', 'PartyPoker')
 * @returns Instância do parser específico
 * @throws Error se site não for suportado
 *
 * @example
 * ```typescript
 * const parser = ParserFactory.createParser('PokerStars');
 * const result = parser.parse(handHistoryText);
 * ```
 */
export class ParserFactory {
  /**
   * Mapa de parsers singleton para reutilização
   * Evita criar múltiplas instâncias do mesmo parser
   */
  private static parserInstances: Map<string, IPokerSiteParser> = new Map();

  /**
   * Cria ou retorna instância existente do parser
   *
   * @param siteName - Nome do site
   * @returns Parser instance
   * @throws Error se site não suportado
   */
  static createParser(siteName: string): IPokerSiteParser {
    // Check cache first
    if (this.parserInstances.has(siteName)) {
      return this.parserInstances.get(siteName)!;
    }

    // Create new instance
    let parser: IPokerSiteParser;

    switch (siteName) {
      case 'PokerStars':
        parser = new PokerStarsParser();
        break;

      case 'GGPoker':
        parser = new GGPokerParser();
        break;

      case 'PartyPoker':
        parser = new PartyPokerParser();
        break;

      default:
        throw new Error(`Site não suportado: ${siteName}. Sites suportados: PokerStars, GGPoker, PartyPoker`);
    }

    // Cache instance
    this.parserInstances.set(siteName, parser);

    return parser;
  }

  /**
   * Retorna lista de sites suportados
   */
  static getSupportedSites(): string[] {
    return ['PokerStars', 'GGPoker', 'PartyPoker'];
  }

  /**
   * Valida se um site é suportado
   */
  static isSiteSupported(siteName: string): boolean {
    return this.getSupportedSites().includes(siteName);
  }

  /**
   * Limpa cache de parsers (útil para testes)
   */
  static clearCache(): void {
    this.parserInstances.clear();
  }
}
