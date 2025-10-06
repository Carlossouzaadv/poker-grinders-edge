/**
 * CURRENCY UTILITIES
 *
 * Funções para trabalhar com valores monetários evitando problemas de precisão
 * de ponto flutuante.
 *
 * REGRAS:
 * - Internamente: sempre trabalhar com centavos (integers) para cash games
 * - Para torneios: trabalhar diretamente com fichas (integers)
 * - Display: sempre usar formatCurrency/formatChips para exibir valores
 * - Nunca usar divisão/multiplicação por 100 diretamente no código de negócio
 */

export class CurrencyUtils {
  /**
   * Tolerância para comparações matemáticas (1 centavo)
   */
  static readonly EPSILON = 1;

  /**
   * Formata centavos como string monetária (CASH GAMES)
   * @param cents - Valor em centavos (integer)
   * @returns String formatada como "$X.XX"
   */
  static formatCurrency(cents: number): string {
    if (!Number.isFinite(cents)) {
      console.warn('⚠️ CurrencyUtils.formatCurrency: valor inválido:', cents);
      return '$0.00';
    }

    // Converter centavos para dólares usando aritmética de strings
    // para evitar problemas de ponto flutuante
    const isNegative = cents < 0;
    const absCents = Math.abs(cents);

    const dollars = Math.floor(absCents / 100);
    const centsRemainder = absCents % 100;

    // Pad com zeros à esquerda se necessário
    const centsStr = centsRemainder.toString().padStart(2, '0');

    return `${isNegative ? '-' : ''}$${dollars}.${centsStr}`;
  }

  /**
   * Formata fichas de torneio (TOURNAMENTS)
   * @param chips - Valor em fichas (integer)
   * @returns String formatada como número sem símbolo (ex: "5000" ou "5,000")
   */
  static formatChips(chips: number): string {
    if (!Number.isFinite(chips)) {
      console.warn('⚠️ CurrencyUtils.formatChips: valor inválido:', chips);
      return '0';
    }

    const isNegative = chips < 0;
    const absChips = Math.abs(chips);

    // Formatar com separadores de milhar para valores grandes
    if (absChips >= 1000) {
      const formatted = absChips.toLocaleString('en-US');
      return `${isNegative ? '-' : ''}${formatted}`;
    }

    return `${isNegative ? '-' : ''}${absChips}`;
  }

  /**
   * Formata valor automaticamente baseado no tipo de jogo
   * @param value - Valor (chips para torneio, centavos para cash)
   * @param isTournament - Se true, formata como fichas; se false, como dólar
   * @returns String formatada
   */
  static formatValue(value: number, isTournament: boolean = false): string {
    return isTournament ? this.formatChips(value) : this.formatCurrency(value);
  }

  /**
   * Converte dólares para centavos usando aritmética de strings
   * @param dollars - Valor em dólares (pode ter decimais)
   * @returns Valor em centavos (integer)
   */
  static dollarsToCents(dollars: number): number {
    if (!Number.isFinite(dollars)) {
      console.warn('⚠️ CurrencyUtils.dollarsToCents: valor inválido:', dollars);
      return 0;
    }

    // Converter para string e manipular diretamente
    const dollarsStr = dollars.toFixed(2); // Garantir 2 casas decimais
    const [integerPart, decimalPart] = dollarsStr.split('.');

    // Construir valor em centavos como integer
    const cents = parseInt(integerPart, 10) * 100 + parseInt(decimalPart || '0', 10);

    return cents;
  }

  /**
   * Converte centavos para dólares (para cálculos internos apenas)
   * @param cents - Valor em centavos (integer)
   * @returns Valor em dólares (float - usar com cuidado!)
   */
  static centsToDollars(cents: number): number {
    if (!Number.isFinite(cents)) {
      console.warn('⚠️ CurrencyUtils.centsToDollars: valor inválido:', cents);
      return 0;
    }

    return cents / 100;
  }

  /**
   * Compara dois valores monetários com tolerância de 1 centavo
   * @param a - Primeiro valor em centavos
   * @param b - Segundo valor em centavos
   * @returns true se os valores são iguais dentro da tolerância
   */
  static areEqual(a: number, b: number): boolean {
    return Math.abs(a - b) <= this.EPSILON;
  }

  /**
   * Verifica se a diferença entre dois valores é maior que a tolerância
   * @param a - Primeiro valor em centavos
   * @param b - Segundo valor em centavos
   * @returns true se há diferença significativa
   */
  static hasDifference(a: number, b: number): boolean {
    return Math.abs(a - b) > this.EPSILON;
  }
}
