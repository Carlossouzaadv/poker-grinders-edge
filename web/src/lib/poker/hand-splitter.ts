/**
 * Hand History Splitter
 *
 * Separa múltiplas hand histories de um texto em um array de strings individuais.
 * Suporta PokerStars, GGPoker e PartyPoker.
 */

export interface SplitResult {
  hands: string[];
  totalHands: number;
  errors: string[];
}

export interface HandInfo {
  text: string;
  site: 'PokerStars' | 'GGPoker' | 'PartyPoker' | 'Unknown';
  handId: string | null;
  lineStart: number;
  lineEnd: number;
}

/**
 * Separa múltiplas hand histories de um texto completo
 */
export function splitHandHistories(fullText: string): SplitResult {
  const errors: string[] = [];

  if (!fullText || fullText.trim().length === 0) {
    return {
      hands: [],
      totalHands: 0,
      errors: ['Texto vazio fornecido']
    };
  }

  const lines = fullText.split('\n');
  const handInfos: HandInfo[] = [];
  let currentHandStart: number | null = null;
  let currentSite: 'PokerStars' | 'GGPoker' | 'PartyPoker' | 'Unknown' | null = null;
  let currentHandId: string | null = null;

  // Primeira passagem: identificar onde cada mão começa
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detectar início de uma nova mão
    const handStart = detectHandStart(line);

    if (handStart) {
      // Se já estamos rastreando uma mão, finalizá-la
      if (currentHandStart !== null && currentSite !== null) {
        handInfos.push({
          text: '', // Será preenchido na segunda passagem
          site: currentSite,
          handId: currentHandId,
          lineStart: currentHandStart,
          lineEnd: i - 1
        });
      }

      // Iniciar rastreamento de nova mão
      currentHandStart = i;
      currentSite = handStart.site;
      currentHandId = handStart.handId;
    }
  }

  // Finalizar última mão se existir
  if (currentHandStart !== null && currentSite !== null) {
    handInfos.push({
      text: '',
      site: currentSite,
      handId: currentHandId,
      lineStart: currentHandStart,
      lineEnd: lines.length - 1
    });
  }

  // Segunda passagem: extrair texto de cada mão
  const hands: string[] = [];

  for (const handInfo of handInfos) {
    const handLines = lines.slice(handInfo.lineStart, handInfo.lineEnd + 1);
    const handText = handLines.join('\n').trim();

    // Validar que a mão tem conteúdo mínimo
    if (handText.length < 50) {
      errors.push(`Mão ignorada: texto muito curto (${handText.length} caracteres)`);
      continue;
    }

    // Validar que a mão tem estrutura básica
    if (!hasBasicHandStructure(handText, handInfo.site)) {
      errors.push(`Mão ignorada: estrutura inválida (Site: ${handInfo.site})`);
      continue;
    }

    hands.push(handText);
  }

  return {
    hands,
    totalHands: hands.length,
    errors: errors.length > 0 ? errors : []
  };
}

/**
 * Detecta o início de uma hand history
 * Retorna informações sobre a mão se detectada, null caso contrário
 */
function detectHandStart(line: string): { site: 'PokerStars' | 'GGPoker' | 'PartyPoker'; handId: string | null } | null {
  // PokerStars: "PokerStars Hand #123456789: ..."
  const pokerStarsMatch = line.match(/^PokerStars (?:Hand|Game) #(\d+):/);
  if (pokerStarsMatch) {
    return {
      site: 'PokerStars',
      handId: pokerStarsMatch[1]
    };
  }

  // GGPoker: "Poker Hand #TM123456789: Tournament #..." ou "Poker Hand #CG123456: ..."
  const ggPokerMatch = line.match(/^(?:GGPoker Hand|Poker Hand|Game ID:) #([A-Z0-9]+):/);
  if (ggPokerMatch) {
    return {
      site: 'GGPoker',
      handId: ggPokerMatch[1]
    };
  }

  // PartyPoker: "***** Hand History for Game 123456789 *****"
  const partyPokerMatch = line.match(/^\*+\s*Hand History for Game (\d+)/);
  if (partyPokerMatch) {
    return {
      site: 'PartyPoker',
      handId: partyPokerMatch[1]
    };
  }

  return null;
}

/**
 * Valida se uma hand history tem estrutura básica mínima
 */
function hasBasicHandStructure(handText: string, site: 'PokerStars' | 'GGPoker' | 'PartyPoker' | 'Unknown'): boolean {
  // Todos os sites devem ter pelo menos:
  // 1. Header com ID da mão
  // 2. Informações da mesa (Table)
  // 3. Pelo menos um jogador (Seat)

  const hasTable = /Table ['"]/.test(handText);
  const hasSeat = /Seat \d+:/.test(handText);

  // Verificações específicas por site
  switch (site) {
    case 'PokerStars':
      return /PokerStars (?:Hand|Game) #\d+:/.test(handText) && hasTable && hasSeat;

    case 'GGPoker':
      return /(?:GGPoker Hand|Poker Hand|Game ID:) #[A-Z0-9]+:/.test(handText) && hasTable && hasSeat;

    case 'PartyPoker':
      return /Hand History for Game \d+/.test(handText) && hasTable && hasSeat;

    default:
      return false;
  }
}

/**
 * Detecta o site de poker de uma hand history individual
 */
export function detectPokerSite(handText: string): 'PokerStars' | 'GGPoker' | 'PartyPoker' | 'Unknown' {
  if (/PokerStars (?:Hand|Game) #/.test(handText)) {
    return 'PokerStars';
  }

  if (/(?:GGPoker Hand|Poker Hand|Game ID:) #/.test(handText)) {
    return 'GGPoker';
  }

  if (/Hand History for Game/.test(handText)) {
    return 'PartyPoker';
  }

  return 'Unknown';
}

/**
 * Extrai ID de uma hand history individual
 */
export function extractHandId(handText: string): string | null {
  // PokerStars
  const psMatch = handText.match(/PokerStars (?:Hand|Game) #(\d+):/);
  if (psMatch) return psMatch[1];

  // GGPoker
  const ggMatch = handText.match(/(?:GGPoker Hand|Poker Hand|Game ID:) #([A-Z0-9]+):/);
  if (ggMatch) return ggMatch[1];

  // PartyPoker
  const ppMatch = handText.match(/Hand History for Game (\d+)/);
  if (ppMatch) return ppMatch[1];

  return null;
}
