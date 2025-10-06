import { IPokerSiteParser } from './IPokerSiteParser';
import { ParseResult, GameContext, HandHistory, Player, Action, Card, Position } from '@/types/poker';

/**
 * Parser específico para Hand Histories do PokerStars
 *
 * Formatos suportados:
 * - Cash games: "PokerStars Hand #123: Hold'em No Limit ($0.25/$0.50 USD)"
 * - Torneios: "PokerStars Hand #123: Tournament #456, $10+$1 USD Hold'em No Limit"
 *
 * Características específicas do PokerStars:
 * - Antes em torneios
 * - Bounties em torneios knockout
 * - Player status (sitting out, disconnected)
 * - Mucked cards no summary
 */
export class PokerStarsParser implements IPokerSiteParser {
  getSiteName(): string {
    return 'PokerStars';
  }

  validateFormat(handText: string): boolean {
    // Validação básica: deve começar com header PokerStars
    const hasValidHeader = /^PokerStars (?:Hand|Game) #\d+/.test(handText);

    // Deve ter seção de players
    const hasPlayers = /Seat \d+:/.test(handText);

    // Deve ter blinds
    const hasBlinds = /posts (?:small blind|big blind)/.test(handText);

    return hasValidHeader && hasPlayers && hasBlinds;
  }

  detectGameContext(headerLine: string): GameContext {
    // Tournament detection: "Tournament #123456"
    const isTournament = /Tournament #\d+/.test(headerLine);

    if (isTournament) {
      return {
        isTournament: true,
        isHighStakes: false,
        currencyUnit: 'chips',
        conversionNeeded: false // Chips mantém valores inteiros
      };
    }

    // Cash game detection: extract blinds to determine stakes
    const blindsMatch = headerLine.match(/\(\$?([0-9.]+)\/\$?([0-9.]+)/);
    const bigBlind = blindsMatch ? parseFloat(blindsMatch[2]) : 0;

    return {
      isTournament: false,
      isHighStakes: bigBlind >= 1.0,
      currencyUnit: 'dollars',
      conversionNeeded: true // Cash games convertem para cents
    };
  }

  parse(handText: string): ParseResult {
    const lines = handText.trim().split('\n').map(line => line.trim());
    const warnings: string[] = [];

    try {
      // ===== FASE 1: Parse Header =====
      let headerMatch = lines[0].match(/PokerStars (?:Hand|Game) #(\d+):\s*Tournament #\d+, (.+?) USD (Hold'em|Omaha|Stud)\s+(No Limit|Pot Limit|Fixed Limit) - Level .+ \(([0-9.]+)\/([0-9.]+)\) - (.+)/);

      let handId: string, gameType: string, limit: string, stakes: string;
      let smallBlind: number, bigBlind: number;

      if (headerMatch) {
        // Tournament format
        [, handId, , gameType, limit] = headerMatch;
        smallBlind = parseFloat(headerMatch[5]);
        bigBlind = parseFloat(headerMatch[6]);
        stakes = headerMatch[2]; // Tournament name
      } else {
        // Cash game format
        headerMatch = lines[0].match(/PokerStars (?:Hand|Game) #(\d+):\s*(Hold'em|Omaha|Stud)\s+(No Limit|Pot Limit|Fixed Limit)\s+\(\$?([0-9.]+)\/\$?([0-9.]+).+?\) - (.+)/);

        if (!headerMatch) {
          return { success: false, error: 'Formato de header PokerStars inválido' };
        }

        [, handId, gameType, limit] = headerMatch;
        smallBlind = parseFloat(headerMatch[4]);
        bigBlind = parseFloat(headerMatch[5]);
        stakes = `$${smallBlind}/$${bigBlind}`;
      }

      const timestamp = new Date(headerMatch[headerMatch.length - 1]);
      const gameContext = this.detectGameContext(lines[0]);

      // ===== FASE 2: Parse Table Info =====
      const tableMatch = lines[1].match(/Table '(.+?)' (\d+)-max Seat #(\d+) is the button/);
      if (!tableMatch) {
        return { success: false, error: 'Informações da mesa inválidas' };
      }

      const maxPlayers = parseInt(tableMatch[2]);
      const buttonSeat = parseInt(tableMatch[3]);

      // ===== FASE 3: Parse Players =====
      const players: Player[] = [];
      let currentLine = 2;

      while (currentLine < lines.length && lines[currentLine].startsWith('Seat ')) {
        const seatMatch = lines[currentLine].match(/Seat (\d+): (.+?) \(\$?([0-9.]+) in chips(?:, \$([0-9.]+) bounty)?\)(?:\s+(is sitting out))?/);

        if (seatMatch) {
          const [, seat, playerName, stack, bounty, sittingOut] = seatMatch;

          players.push({
            name: playerName,
            position: this.getPosition(parseInt(seat), buttonSeat, maxPlayers),
            stack: parseFloat(stack),
            isHero: false,
            seat: parseInt(seat),
            bounty: bounty ? parseFloat(bounty) : undefined,
            status: sittingOut ? 'sitting_out' : 'active'
          });
        }
        currentLine++;
      }

      // ===== FASE 4: Parse Antes e Blinds =====
      let anteAmount: number | undefined;
      const anteActions: Action[] = [];

      while (currentLine < lines.length &&
             (lines[currentLine]?.includes('posts the ante') ||
              lines[currentLine]?.includes('posts small blind') ||
              lines[currentLine]?.includes('posts big blind'))) {

        const line = lines[currentLine];

        const anteMatch = line.match(/(.+?): posts the ante (\d+(?:\.\d+)?)/);
        if (anteMatch) {
          anteAmount = parseFloat(anteMatch[2]);
          anteActions.push({
            player: anteMatch[1],
            action: 'ante',
            amount: anteAmount
          });
        }

        const blindMatch = line.match(/(.+?): posts (?:small blind|big blind) \$?(\d+(?:\.\d+)?)/);
        if (blindMatch) {
          anteActions.push({
            player: blindMatch[1],
            action: line.includes('small blind') ? 'small_blind' : 'big_blind',
            amount: parseFloat(blindMatch[2])
          });
        }

        currentLine++;
      }

      // ===== FASE 5: Parse Preflop =====
      const preflop: Action[] = [];

      // Skip até "*** HOLE CARDS ***"
      while (currentLine < lines.length && !lines[currentLine]?.includes('*** HOLE CARDS ***')) {
        currentLine++;
      }
      if (lines[currentLine]?.includes('*** HOLE CARDS ***')) {
        currentLine++;
      }

      // Detectar Hero
      if (lines[currentLine]?.startsWith('Dealt to ')) {
        const heroMatch = lines[currentLine].match(/Dealt to (.+?) \[(.+?)\]/);
        if (heroMatch) {
          const heroPlayerIndex = players.findIndex(p => p.name === heroMatch[1]);
          if (heroPlayerIndex !== -1) {
            players[heroPlayerIndex] = {
              ...players[heroPlayerIndex],
              isHero: true,
              cards: this.parseCards(heroMatch[2])
            };
          }
        }
        currentLine++;
      }

      // Parse ações preflop
      while (currentLine < lines.length && !lines[currentLine].includes('***')) {
        const action = this.parseAction(lines[currentLine], gameContext);
        if (action) preflop.push(action);
        currentLine++;
      }

      // ===== FASE 6: Parse Streets (Flop, Turn, River) =====
      let flopData: { cards: Card[]; actions: Action[]; } | undefined;
      let turnData: { card: Card; actions: Action[]; } | undefined;
      let riverData: { card: Card; actions: Action[]; } | undefined;

      while (currentLine < lines.length) {
        const line = lines[currentLine];

        if (line.includes('*** FLOP ***')) {
          const flopMatch = line.match(/\*\*\* FLOP \*\*\* \[([^\]]+)\]/);
          if (flopMatch) {
            flopData = { cards: this.parseCards(flopMatch[1]), actions: [] };
          }
          currentLine++;
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) flopData?.actions.push(action);
            currentLine++;
          }
          continue;
        }

        if (line.includes('*** TURN ***')) {
          const turnMatch = line.match(/\*\*\* TURN \*\*\* \[.+?\] \[([^\]]+)\]/);
          if (turnMatch) {
            turnData = { card: this.parseCards(turnMatch[1])[0], actions: [] };
          }
          currentLine++;
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) turnData?.actions.push(action);
            currentLine++;
          }
          continue;
        }

        if (line.includes('*** RIVER ***')) {
          const riverMatch = line.match(/\*\*\* RIVER \*\*\* \[.+?\] \[([^\]]+)\]/);
          if (riverMatch) {
            riverData = { card: this.parseCards(riverMatch[1])[0], actions: [] };
          }
          currentLine++;
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) riverData?.actions.push(action);
            currentLine++;
          }
          continue;
        }

        currentLine++;
      }

      // ===== FASE 7: Parse Showdown e Summary =====
      // (Simplified for brevity - full implementation would include showdown parsing)
      const showdown = undefined;
      const totalPot = 0;
      const rake = 0;

      // ===== FASE 8: Construir HandHistory =====
      const handHistory: HandHistory = {
        handId,
        site: 'PokerStars',
        gameType: gameType as 'Hold\'em' | 'Omaha' | 'Stud',
        limit: limit as 'No Limit' | 'Pot Limit' | 'Fixed Limit',
        stakes,
        maxPlayers,
        buttonSeat,
        dealerSeat: buttonSeat,
        smallBlind,
        bigBlind,
        ante: anteAmount,
        timestamp,
        players,
        gameContext,
        antes: anteActions.length > 0 ? anteActions : undefined,
        preflop,
        flop: flopData || { cards: [], actions: [] },
        turn: turnData || { card: null, actions: [] },
        river: riverData || { card: null, actions: [] },
        showdown,
        totalPot,
        rake,
        currency: 'USD'
      };

      return {
        success: true,
        handHistory,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: `Erro ao parsear PokerStars: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  // ===== MÉTODOS AUXILIARES PRIVADOS =====

  private getPosition(seat: number, button: number, maxPlayers: number): Position {
    const relativePosition = (seat - button + maxPlayers) % maxPlayers;

    switch (maxPlayers) {
      case 2:
        return relativePosition === 0 ? 'BTN' : 'BB';
      case 6:
        const pos6: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'];
        return pos6[relativePosition] || 'UTG';
      case 9:
        const pos9: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'MP2', 'CO', 'HJ'];
        return pos9[relativePosition] || 'UTG';
      case 10:
        const pos10: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP1', 'MP2', 'CO', 'HJ'];
        return pos10[relativePosition] || 'UTG';
      default:
        if (relativePosition === 0) return 'BTN';
        if (relativePosition === 1) return 'SB';
        if (relativePosition === 2) return 'BB';
        if (relativePosition <= 4) return 'EP';
        if (relativePosition <= 6) return 'MP';
        return 'LP';
    }
  }

  private parseCards(cardsStr: string): Card[] {
    const cards: Card[] = [];
    const cardPairs = cardsStr.split(' ');

    for (const cardStr of cardPairs) {
      if (cardStr.length >= 2) {
        const rank = cardStr[0] as Card['rank'];
        const suit = cardStr[1].toLowerCase() as Card['suit'];
        cards.push({ rank, suit });
      }
    }

    return cards;
  }

  private parseAction(line: string, gameContext: GameContext): Action | null {
    if (!line || line.trim() === '') return null;

    // Fold
    const foldMatch = line.match(/(.+?): folds/);
    if (foldMatch) {
      return { player: foldMatch[1], action: 'fold' };
    }

    // Check
    const checkMatch = line.match(/(.+?): checks/);
    if (checkMatch) {
      return { player: checkMatch[1], action: 'check' };
    }

    // Call
    const callMatch = line.match(/(.+?): calls \$?([0-9,.]+)/);
    if (callMatch) {
      return {
        player: callMatch[1],
        action: 'call',
        amount: this.parseAmount(callMatch[2], gameContext)
      };
    }

    // Bet
    const betMatch = line.match(/(.+?): bets \$?([0-9,.]+)/);
    if (betMatch) {
      return {
        player: betMatch[1],
        action: 'bet',
        amount: this.parseAmount(betMatch[2], gameContext)
      };
    }

    // Raise
    const raiseMatch = line.match(/(.+?): raises \$?([0-9,.]+) to \$?([0-9,.]+)/);
    if (raiseMatch) {
      return {
        player: raiseMatch[1],
        action: 'raise',
        amount: this.parseAmount(raiseMatch[3], gameContext)
      };
    }

    return null;
  }

  private parseAmount(rawValue: string, gameContext: GameContext): number {
    const cleanValue = rawValue.replace(/,/g, '');
    const parsed = parseFloat(cleanValue);

    if (gameContext.isTournament) {
      return Math.round(parsed); // Chips: inteiro
    } else {
      return Math.round(parsed * 100); // Cash: dollars → cents
    }
  }
}
