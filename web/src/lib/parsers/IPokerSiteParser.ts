import { ParseResult, GameContext } from '@/types/poker';

/**
 * Interface formal para parsers de sites de poker
 *
 * Implementa Strategy Pattern para permitir parsing polimórfico
 * de diferentes formatos de Hand History mantendo interface consistente.
 *
 * Cada site de poker tem formato único de HH, mas todos devem:
 * 1. Detectar contexto do jogo (cash vs tournament)
 * 2. Validar formato da HH
 * 3. Parsear para estrutura HandHistory comum
 * 4. Retornar nome do site
 */
export interface IPokerSiteParser {
  /**
   * Parser principal que converte texto bruto em HandHistory
   *
   * @param handText - Texto bruto da Hand History
   * @returns ParseResult com HandHistory ou erro
   */
  parse(handText: string): ParseResult;

  /**
   * Detecta contexto do jogo baseado no header
   * Determina se é torneio/cash e unidade monetária
   *
   * @param headerLine - Primeira linha da HH
   * @returns GameContext com flags de conversão
   */
  detectGameContext(headerLine: string): GameContext;

  /**
   * Valida se o formato da HH é válido para este site
   * Verifica estrutura básica antes de parsear
   *
   * @param handText - Texto completo da HH
   * @returns true se formato válido, false caso contrário
   */
  validateFormat(handText: string): boolean;

  /**
   * Retorna o nome do site de poker
   * Usado para logging e identificação
   *
   * @returns Nome do site (e.g., 'PokerStars', 'GGPoker')
   */
  getSiteName(): string;
}
