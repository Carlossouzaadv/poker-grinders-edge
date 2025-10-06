import { HandHistory, ParseResult, Card, Action, Player, Position, GameContext } from '@/types/poker';
import { ErrorHandler } from './error-handling/error-handler';
import { ErrorCode, ErrorSeverity, AppError } from '@/types/errors';
import { DataValidator } from '@/utils/validation';
import { CurrencyUtils } from '@/utils/currency-utils';

export class HandParser {
  static parse(handText: string): ParseResult {
    const errors: AppError[] = [];
    const warnings: string[] = [];

    try {
      // Validação de entrada vazia
      if (!handText || handText.trim().length === 0) {
        const error = ErrorHandler.createValidationError(
          ErrorCode.VALIDATION_EMPTY_INPUT,
          'Hand history text is empty',
          { context: 'HandParser.parse' }
        );
        errors.push(error.toAppError());
        return {
          success: false,
          error: ErrorHandler.getUserMessage(error.toAppError()),
          errors: errors as readonly AppError[],
          warnings: warnings as readonly string[]
        };
      }

      // Detectar site automaticamente
      const site = this.detectSite(handText);

      switch (site) {
        case 'PokerStars':
          return this.parsePokerStars(handText);
        case 'GGPoker':
          return this.parseGGPoker(handText);
        case 'PartyPoker':
          return this.parsePartyPoker(handText);
        default:
          const error = ErrorHandler.createParseError(
            ErrorCode.PARSE_UNKNOWN_SITE,
            `Poker site format not recognized: ${site}`,
            {
              context: 'HandParser.parse',
              details: { detectedSite: site },
              severity: ErrorSeverity.ERROR,
              isRecoverable: false
            }
          );
          errors.push(error.toAppError());
          return {
            success: false,
            error: `Formato de hand history não reconhecido. Sites suportados: PokerStars, GGPoker, PartyPoker. Detectado: ${site}`,
            errors: errors as readonly AppError[],
            warnings: warnings as readonly string[]
          };
      }
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'HandParser.parse');
      errors.push(appError);
      return {
        success: false,
        error: `Erro ao processar hand history: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        errors: errors as readonly AppError[],
        warnings: warnings as readonly string[]
      };
    }
  }

  private static detectSite(handText: string): string {
    // PokerStars detection
    if (handText.includes('PokerStars Hand #') || handText.includes('PokerStars Game #')) {
      return 'PokerStars';
    }

    // GGPoker detection (multiple formats)
    // Format 1: "GGPoker Hand #123456" (generic)
    // Format 2: "Poker Hand #TM123456: Tournament #..." (GGPoker tournament format)
    // Format 3: "Poker Hand #CG123456: ..." (GGPoker cash game format)
    // Format 4: "Game ID:" with Natural8
    if (handText.includes('GGPoker Hand #') ||
        /Poker Hand #(?:TM|CG)\d+/.test(handText) ||
        (handText.includes('Game ID:') && handText.includes('Natural8'))) {
      return 'GGPoker';
    }

    // PartyPoker detection
    if (handText.includes('PartyPoker Hand #')) {
      return 'PartyPoker';
    }

    return 'Unknown';
  }

  private static parsePokerStars(handText: string): ParseResult {
    const lines = handText.trim().split('\n').map(line => line.trim());
    const warnings: string[] = [];

    try {
      // Linha 1: Header com ID da mão - regex mais específica para torneios
      let headerMatch = lines[0].match(/PokerStars (?:Hand|Game) #(\d+):\s*Tournament #\d+, (.+?) USD (Hold'em|Omaha|Stud)\s+(No Limit|Pot Limit|Fixed Limit) - Level .+ \(([0-9.]+)\/([0-9.]+)\) - (.+)/);

      let handId: string, gameType: string, limit: string, stakes: string, smallBlind: number, bigBlind: number, tournamentName: string;

      if (headerMatch) {
        // É um torneio
        [, handId, tournamentName, gameType, limit] = headerMatch;
        smallBlind = parseFloat(headerMatch[5]);
        bigBlind = parseFloat(headerMatch[6]);
        stakes = tournamentName; // Use tournament name instead of blinds for tournaments
      } else {
        // Tentar cash game: "PokerStars Hand #123: Hold'em No Limit ($0.25/$0.50 USD) - 2023/..."
        headerMatch = lines[0].match(/PokerStars (?:Hand|Game) #(\d+):\s*(Hold'em|Omaha|Stud)\s+(No Limit|Pot Limit|Fixed Limit)\s+\(\$?([0-9.]+)\/\$?([0-9.]+).+?\) - (.+)/);

        if (!headerMatch) {
          return { success: false, error: 'Formato de header inválido - não reconhece cash game nem torneio' };
        }

        [, handId, gameType, limit] = headerMatch;
        smallBlind = parseFloat(headerMatch[4]);
        bigBlind = parseFloat(headerMatch[5]);
        stakes = `$${smallBlind}/$${bigBlind}`;
      }

      // Parse da data - timestamp está em posições diferentes
      const timestamp = headerMatch[headerMatch.length - 1]; // Última captura sempre é timestamp
      const parsedDate = new Date(timestamp);

      // Linha 2: Table info
      const tableMatch = lines[1].match(/Table '(.+?)' (\d+)-max Seat #(\d+) is the button/);
      if (!tableMatch) {
        return { success: false, error: 'Informações da mesa inválidas' };
      }

      const [, , maxPlayers, buttonSeat] = tableMatch;

      // NOVA: Detectar contexto do jogo (Tournament vs Cash)
      const detectionResult = this.detectGameContext(lines[0], 'PokerStars');
      const { confidence, warnings: contextWarnings, ...gameContext } = detectionResult;

      // Add context warnings to main warnings array
      if (contextWarnings && contextWarnings.length > 0) {
        warnings.push(...contextWarnings);
      }


      // Parse dos jogadores (seats)
      const players: Player[] = [];
      let currentLine = 2;

      while (currentLine < lines.length && lines[currentLine].startsWith('Seat ')) {
        // Enhanced regex to capture bounty and sitting out status
        const seatMatch = lines[currentLine].match(/Seat (\d+): (.+?) \(\$?([0-9.]+) in chips(?:, \$([0-9.]+) bounty)?\)(?:\s+(is sitting out))?/);
        if (seatMatch) {
          const [, seat, playerName, stack, bounty, sittingOut] = seatMatch;

          // Determine player status
          let status: 'active' | 'sitting_out' | 'disconnected' = 'active';
          if (sittingOut) {
            status = 'sitting_out';
          }

          players.push({
            name: playerName,
            position: this.getPosition(parseInt(seat), parseInt(buttonSeat), parseInt(maxPlayers)),
            stack: parseFloat(stack),
            isHero: false, // Será detectado depois
            seat: parseInt(seat),
            bounty: bounty ? parseFloat(bounty) : undefined,
            status: status
          });
        }
        currentLine++;
      }

      // Parse antes and blinds (torneios têm antes)
      let anteAmount = 0;
      const anteActions: Action[] = [];

      while (currentLine < lines.length &&
             (lines[currentLine]?.includes('posts the ante') ||
              lines[currentLine]?.includes('posts small blind') ||
              lines[currentLine]?.includes('posts big blind'))) {

        const line = lines[currentLine];

        // Parse ante
        const anteMatch = line.match(/(.+?): posts the ante (\d+(?:\.\d+)?)/);
        if (anteMatch) {
          const [, playerName, amount] = anteMatch;
          anteAmount = parseFloat(amount);
          anteActions.push({
            player: playerName,
            action: 'ante',
            amount: anteAmount
          });
        }

        // Parse blinds (keep existing logic)
        const blindMatch = line.match(/(.+?): posts (?:small blind|big blind) \$?(\d+(?:\.\d+)?)/);
        if (blindMatch) {
          const [, playerName, amount] = blindMatch;
          const blindType = line.includes('small blind') ? 'small_blind' : 'big_blind';
          anteActions.push({
            player: playerName,
            action: blindType,
            amount: parseFloat(amount)
          });
        }

        currentLine++;
      }

      // Parse do preflop
      const preflop: Action[] = [];

      // Encontrar e pular linha "*** HOLE CARDS ***"
      while (currentLine < lines.length && !lines[currentLine]?.includes('*** HOLE CARDS ***')) {
        currentLine++;
      }
      if (lines[currentLine]?.includes('*** HOLE CARDS ***')) {
        currentLine++;
      }

      // Detectar hero cards
      if (lines[currentLine]?.startsWith('Dealt to ')) {
        const heroMatch = lines[currentLine].match(/Dealt to (.+?) \[(.+?)\]/);
        if (heroMatch) {
          const [, heroName, cardsStr] = heroMatch;
          const heroPlayerIndex = players.findIndex(p => p.name === heroName);
          if (heroPlayerIndex !== -1) {
            players[heroPlayerIndex] = {
              ...players[heroPlayerIndex],
              isHero: true,
              cards: this.parseCards(cardsStr)
            };
          }
        }
        currentLine++;
      }

      // Parse das ações do preflop
      while (currentLine < lines.length && !lines[currentLine].includes('***')) {
        const line = lines[currentLine];

        // Skip empty lines
        if (!line || line.trim() === '') {
          currentLine++;
          continue;
        }

        // Check for player disconnect/reconnect status
        const disconnectMatch = line.match(/(.+?) is disconnected/);
        if (disconnectMatch) {
          const [, playerName] = disconnectMatch;
          const playerIndex = players.findIndex(p => p.name === playerName);
          if (playerIndex !== -1) {
            players[playerIndex] = { ...players[playerIndex], status: 'disconnected' };
          }
          currentLine++;
          continue;
        }

        const reconnectMatch = line.match(/(.+?) has returned/);
        if (reconnectMatch) {
          const [, playerName] = reconnectMatch;
          const playerIndex = players.findIndex(p => p.name === playerName);
          if (playerIndex !== -1) {
            players[playerIndex] = { ...players[playerIndex], status: 'active' };
          }
          currentLine++;
          continue;
        }

        const action = this.parseAction(line, gameContext);
        if (action) {
          preflop.push(action);
        } else {
          // Check for uncalled bet return
          const uncalledMatch = line.match(/Uncalled bet \((\d+(?:\.\d+)?)\) returned to (.+)/);
          if (uncalledMatch) {
            const [, amount, player] = uncalledMatch;
            preflop.push({
              player: player,
              action: 'uncalled_return',
              amount: parseFloat(amount)
            });
          } else {
          }
        }
        currentLine++;
      }


      preflop.forEach((action, idx) => {
      });

      // Parse das outras streets (flop, turn, river) e showdown
      let flopData: { cards: Card[]; actions: Action[]; } | null = null;
      let turnData: { card: Card; actions: Action[]; } | null = null;
      let riverData: { card: Card; actions: Action[]; } | null = null;
      let showdownData: { info: string; winners: string[]; potWon: number; rake?: number; } | null = null;
      let rakeAmount = 0;
      let totalPotAmount = 0;

      // Processar todas as streets
      while (currentLine < lines.length) {
        const line = lines[currentLine];

        // FLOP
        if (line.includes('*** FLOP ***')) {
          const flopMatch = line.match(/\*\*\* FLOP \*\*\* \[([^\]]+)\]/);
          if (flopMatch) {
            const cards = this.parseCards(flopMatch[1]);
            flopData = {
              cards,
              actions: []
            };
          }
          currentLine++;
          // Parse ações do flop
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) {
              flopData?.actions.push(action);
            } else {
              // Check for uncalled bet return
              const uncalledMatch = lines[currentLine].match(/Uncalled bet \((\d+(?:\.\d+)?)\) returned to (.+)/);
              if (uncalledMatch && flopData) {
                const [, amount, player] = uncalledMatch;
                flopData.actions.push({
                  player: player,
                  action: 'uncalled_return',
                  amount: parseFloat(amount)
                });
              }
            }
            currentLine++;
          }
          continue;
        }

        // TURN
        if (line.includes('*** TURN ***')) {
          const turnMatch = line.match(/\*\*\* TURN \*\*\* \[.+?\] \[([^\]]+)\]/);
          if (turnMatch) {
            const card = this.parseCards(turnMatch[1])[0];
            turnData = {
              card,
              actions: []
            };
          } else {
          }
          currentLine++;
          // Parse ações do turn
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) {
              turnData?.actions.push(action);
            } else {
              // Check for uncalled bet return
              const uncalledMatch = lines[currentLine].match(/Uncalled bet \((\d+(?:\.\d+)?)\) returned to (.+)/);
              if (uncalledMatch && turnData) {
                const [, amount, player] = uncalledMatch;
                turnData.actions.push({
                  player: player,
                  action: 'uncalled_return',
                  amount: parseFloat(amount)
                });
              }
            }
            currentLine++;
          }
          continue;
        }

        // RIVER
        if (line.includes('*** RIVER ***')) {
          // CRITICAL FIX: Get the LAST bracketed card, not the first one after board
          // Format: *** RIVER *** [Jc 8s 2h] [5d] [9s] - we want [9s]
          const riverMatch = line.match(/\*\*\* RIVER \*\*\* .+\[([^\]]+)\]$/);
          if (riverMatch) {
            const card = this.parseCards(riverMatch[1])[0];
            riverData = {
              card,
              actions: []
            };
          }
          currentLine++;
          // Parse ações do river
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) {
              riverData?.actions.push(action);
            } else {
              // Check for uncalled bet return
              const uncalledMatch = lines[currentLine].match(/Uncalled bet \((\d+(?:\.\d+)?)\) returned to (.+)/);
              if (uncalledMatch && riverData) {
                const [, amount, player] = uncalledMatch;
                riverData.actions.push({
                  player: player,
                  action: 'uncalled_return',
                  amount: parseFloat(amount)
                });
              }
            }
            currentLine++;
          }
          continue;
        }

        // SHOWDOWN
        if (line.includes('*** SHOW DOWN ***')) {
          currentLine++;
          let showdownInfo = '';
          let winners: string[] = [];
          let potWon = 0;

          // Parse das linhas de showdown (continua até encontrar ***)
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const showLine = lines[currentLine];

            // Jogador mostra cartas: "draper24492: shows [As 4s] (high card Ace)"
            if (showLine.includes(': shows [') && showLine.includes(']')) {
              showdownInfo += showLine + '\n';

              // Extrair cartas e atribuir ao jogador
              const showMatch = showLine.match(/(.+?): shows \[([^\]]+)\]/);
              if (showMatch) {
                const playerName = showMatch[1];
                const cardsText = showMatch[2];
                const cards = this.parseCards(cardsText);

                // Encontrar o jogador e atribuir as cartas
                const playerIndex = players.findIndex(p => p.name === playerName);
                if (playerIndex !== -1 && cards.length === 2) {
                  players[playerIndex] = { ...players[playerIndex], cards: cards };
                }
              }
            }

            // Vilão muck: "Player 5: mucks hand"
            if (showLine.includes(': mucks hand')) {
              showdownInfo += showLine + '\n';
            }

            // Support "Hero wins pot" format
            const winsMatch = showLine.match(/(.+?) wins (?:side pot \d+|main pot) \((\d+(?:\.\d+)?)\)/);
            if (winsMatch) {
              const winnerName = winsMatch[1];
              if (!winners.includes(winnerName)) {
                winners.push(winnerName);
              }
              potWon += parseFloat(winsMatch[2]);
              showdownInfo += showLine + '\n';
            }

            // Winner: "Hero collected 6200 from pot" (old format)
            const collectedMatch = showLine.match(/(.+?) collected (\d+(?:\.\d+)?) from pot/);
            if (collectedMatch) {
              const winnerName = collectedMatch[1];
              if (!winners.includes(winnerName)) {
                winners.push(winnerName);
              }
              potWon += parseFloat(collectedMatch[2]);
              showdownInfo += showLine + '\n';
            }

            currentLine++;
          }

          // Se temos informações de showdown, vamos salvá-las
          if (showdownInfo || winners.length > 0) {
            showdownData = {
              info: showdownInfo,
              winners,
              potWon
            };
          }
          continue;
        }

        // SUMMARY - para capturar cartas muckadas e rake
        if (line.includes('*** SUMMARY ***')) {
          currentLine++;

          // Parse das linhas de summary
          while (currentLine < lines.length) {
            const summaryLine = lines[currentLine];

            // Parse total pot and rake: "Total pot 2185 | Rake 0"
            const potRakeMatch = summaryLine.match(/Total pot (\d+(?:\.\d+)?)(?:\s*\|\s*Rake\s+(\d+(?:\.\d+)?))?/);
            if (potRakeMatch) {
              const [, potAmount, rake] = potRakeMatch;
              totalPotAmount = parseFloat(potAmount);
              rakeAmount = rake ? parseFloat(rake) : 0;
            }

            // Procurar por cartas muckadas: "Seat 5: Player 5 mucked [Ks Qs]"
            const muckedMatch = summaryLine.match(/Seat (\d+): (.+?) mucked \[([^\]]+)\]/);
            if (muckedMatch) {
              const [, seat, playerName, cardsStr] = muckedMatch;
              const muckedCards = this.parseCards(cardsStr);

              // Encontrar o jogador e adicionar suas cartas
              const playerIndex = players.findIndex(p => p.name === playerName);
              if (playerIndex !== -1) {
                players[playerIndex] = { ...players[playerIndex], cards: muckedCards };
              }
            }

            // Cartas mostradas no summary: "Seat 3: Hero showed [Ac Jd] and won"
            const shownMatch = summaryLine.match(/Seat (\d+): (.+?) showed \[([^\]]+)\]/);
            if (shownMatch) {
              const [, seat, playerName, cardsStr] = shownMatch;
              const shownCards = this.parseCards(cardsStr);

              // Encontrar o jogador e garantir que suas cartas estejam definidas
              const playerIndex = players.findIndex(p => p.name === playerName);
              if (playerIndex !== -1 && !players[playerIndex].cards) {
                players[playerIndex] = { ...players[playerIndex], cards: shownCards };
              }
            }

            currentLine++;
          }

          // Update showdown data with rake if present
          if (showdownData && rakeAmount > 0) {
            showdownData.rake = rakeAmount;
          }

          break; // SUMMARY é geralmente a última seção
        }

        currentLine++;
      }


      const handHistory: HandHistory = {
        handId,
        site: 'PokerStars',
        gameType: gameType as 'Hold\'em' | 'Omaha' | 'Stud',
        limit: limit as 'No Limit' | 'Pot Limit' | 'Fixed Limit',
        stakes: stakes, // Use the properly set stakes (tournament name or cash blinds)
        maxPlayers: parseInt(maxPlayers),
        buttonSeat: parseInt(buttonSeat),
        dealerSeat: parseInt(buttonSeat),
        smallBlind,
        bigBlind,
        gameContext, // Add game context to HandHistory
        ante: anteAmount > 0 ? anteAmount : undefined, // Include ante if present
        timestamp: parsedDate,
        players,
        antes: anteActions.length > 0 ? anteActions : undefined, // Include ante actions
        preflop,
        flop: flopData || { cards: [], actions: [] }, // Always defined
        turn: turnData || { card: null, actions: [] }, // Always defined
        river: riverData || { card: null, actions: [] }, // Always defined
        showdown: showdownData || undefined,
        totalPot: totalPotAmount || 0, // Use parsed total pot
        rake: rakeAmount, // Include rake (can be 0)
        currency: 'USD'
      };

      // Validate HandHistory after parsing
      const validationErrors = DataValidator.validateHandHistory(handHistory);
      if (validationErrors.length > 0) {
        // Separate critical from non-critical errors
        const criticalErrors = validationErrors.filter(e => e.severity === ErrorSeverity.CRITICAL);
        const nonCriticalErrors = validationErrors.filter(e => e.severity !== ErrorSeverity.CRITICAL);

        // Log all validation errors
        validationErrors.forEach(err => {
        });

        // If there are critical errors, fail the parse
        if (criticalErrors.length > 0) {
          return {
            success: false,
            error: `Critical validation errors: ${criticalErrors.map(e => e.message).join('; ')}`,
            errors: criticalErrors as readonly AppError[],
            warnings: warnings as readonly string[]
          };
        }

        // Add non-critical errors as warnings
        warnings.push(...nonCriticalErrors.map(e => e.message));
      }

      return {
        success: true,
        handHistory,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: `Erro no parsing PokerStars: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  private static parseGGPoker(handText: string): ParseResult {
    const lines = handText.trim().split('\n').map(line => line.trim());
    const warnings: string[] = [];

    try {
      // GGPoker Header formats:
      // Tournament: "Poker Hand #TM5030367055: Tournament #232064631, Bounty Hunters Special $2.50 Hold'em No Limit - Level12(400/800)"
      // Cash Game: "GGPoker Hand #123456789: Hold'em No Limit ($0.25/$0.50)"

      // Try Tournament format first
      // Pattern: "Poker Hand #TM123: Tournament #456, Tournament Name $X.XX Hold'em No Limit - LevelXX(SB/BB)"
      // The tournament name can include the buy-in at the end (e.g., "Bounty Hunters Special $2.50")
      // We need to capture everything between ", " and " Hold'em" (or Omaha/Stud)
      let headerMatch = lines[0].match(/(?:GGPoker Hand|Poker Hand|Game ID:) #([A-Z0-9]+):\s*Tournament #(\d+),\s*(.+?)\s+(Hold'em|Omaha|Stud)\s+(No Limit|Pot Limit|Fixed Limit|Limit)\s*-\s*Level(\d+)\(([0-9.]+)\/([0-9.]+)\)/);

      let handId: string, tourneyId: string | null = null, tournamentName: string | null = null;
      let gameType: string, limit: string, level: string | null = null;
      let smallBlind: number, bigBlind: number, anteAmount = 0;
      let buyIn: number | null = null;

      if (headerMatch) {
        // Tournament format matched
        [, handId, tourneyId, tournamentName, gameType, limit, level] = headerMatch;
        smallBlind = parseFloat(headerMatch[7]);
        bigBlind = parseFloat(headerMatch[8]);

        // Extract buy-in from tournament name if present (e.g., "Bounty Hunters Special $2.50")
        const buyInMatch = tournamentName.match(/\$([0-9.]+)$/);
        if (buyInMatch) {
          buyIn = parseFloat(buyInMatch[1]);
        }
      } else {
        // Try Cash Game format: "GGPoker Hand #CG123: Hold'em No Limit ($0.25/$0.50)"
        headerMatch = lines[0].match(/(?:GGPoker Hand|Poker Hand|Game ID:) #([A-Z0-9]+):\s*(Hold'em|Omaha|Stud)\s+(No Limit|Pot Limit|Fixed Limit|Limit)\s*\(\$?([0-9.]+)\/\$?([0-9.]+)\)/);

        if (!headerMatch) {
          return { success: false, error: 'Formato de header GGPoker inválido. Formatos suportados: Tournament e Cash Game' };
        }

        // Cash game format matched
        [, handId, gameType, limit] = headerMatch;
        smallBlind = parseFloat(headerMatch[4]);
        bigBlind = parseFloat(headerMatch[5]);
      }

      // Parse timestamp (GGPoker format: "2023/12/25 14:30:00 ET")
      const timestampMatch = lines[0].match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/);
      const parsedDate = timestampMatch ? new Date(timestampMatch[1]) : new Date();

      // Game context for GGPoker using multi-layer detection
      const detectionResult = this.detectGameContext(lines[0], 'GGPoker');
      const { confidence, warnings: contextWarnings, ...gameContext } = detectionResult;

      // Add context warnings to main warnings array
      if (contextWarnings && contextWarnings.length > 0) {
        warnings.push(...contextWarnings);
      }

      // CRITICAL FIX: Add buyIn to gameContext if extracted from tournament name
      if (buyIn !== null && gameContext.isTournament) {
        gameContext.buyIn = `$${buyIn.toFixed(2)}`;
      }

      // Parse table info - GGPoker format:
      // - "Table 'RushAndCash123', 6-max"
      // - "Table '200' 8-max Seat #7 is the button"
      let tableMatch = lines[1].match(/Table '(.+?)'[\s,]+(\d+)-max/);
      if (!tableMatch) {
        return { success: false, error: 'Informações da mesa inválidas' };
      }

      const [, tableName, maxPlayers] = tableMatch;

      // Extract button seat from table line if present
      let buttonSeat = '1'; // Default
      const buttonMatch = lines[1].match(/Seat #(\d+) is the button/);
      if (buttonMatch) {
        buttonSeat = buttonMatch[1];
      } else {
      }

      // Parse players (seats) - GGPoker format: "Seat 4: Hero ($55.30) [BTN]"
      const players: Player[] = [];
      let currentLine = 2;
      // buttonSeat was already declared above when parsing table line

      while (currentLine < lines.length && lines[currentLine].startsWith('Seat ')) {
        // Match both formats: with and without position tags, with or without $ and with/without commas
        // Examples:
        // - Seat 6: 683c325e (22,651 in chips)
        // - Seat 4: Hero ($55.30) [BTN]
        const seatMatch = lines[currentLine].match(/Seat (\d+): (.+?) \((?:\$|£|€)?([0-9,.]+)(?: in chips)?\)(?: \[(\w+)\])?/);
        if (seatMatch) {
          const [, seat, playerName, stackStr, positionTag] = seatMatch;
          // Remove commas from stack amount
          const stack = stackStr.replace(/,/g, '');

          // If this player has [BTN] tag, save the button seat
          if (positionTag === 'BTN') {
            buttonSeat = seat;
          }

          players.push({
            name: playerName,
            position: 'MP', // Will be updated after we know button position
            stack: parseFloat(stack),
            isHero: false,
            seat: parseInt(seat),
            status: 'active'
          });
        }
        currentLine++;
      }


      // Now update positions based on button seat
      for (let i = 0; i < players.length; i++) {
        players[i] = {
          ...players[i],
          position: this.getPosition(players[i].seat!, parseInt(buttonSeat), parseInt(maxPlayers))
        };
      }

      // Parse antes and blinds
      const anteActions: Action[] = [];

      while (currentLine < lines.length &&
             (lines[currentLine]?.includes('posts the ante') ||
              lines[currentLine]?.includes('posts ante') ||
              lines[currentLine]?.includes('posts small blind') ||
              lines[currentLine]?.includes('posts big blind'))) {

        const line = lines[currentLine];

        // Parse ante - GGPoker formats:
        // - "PlayerD: posts the ante 120"
        // - "PlayerD: posts ante 20"
        const anteMatch = line.match(/(.+?): posts (?:the )?ante ([0-9,.]+)/);
        if (anteMatch) {
          const [, playerName, amountStr] = anteMatch;
          // Remove commas from amount
          const amount = amountStr.replace(/,/g, '');
          const { amount: parsedAmount, warnings: parseWarnings } = this.parseAmountWithContext(amount, gameContext);
          warnings.push(...parseWarnings);

          // CRITICAL FIX: Update anteAmount variable (used in HandHistory.ante field)
          if (anteAmount === 0) {
            anteAmount = parsedAmount;
          }

          anteActions.push({
            player: playerName,
            action: 'ante',
            amount: parsedAmount
          });
        }

        // Parse blinds - FIXED to support decimals like $0.25 and commas
        const blindMatch = line.match(/(.+?): posts (?:small blind|big blind) ([0-9,.]+)/);
        if (blindMatch) {
          const [, playerName, amountStr] = blindMatch;
          // Remove commas from amount
          const amount = amountStr.replace(/,/g, '');
          const blindType = line.includes('small blind') ? 'small_blind' : 'big_blind';
          const { amount: parsedAmount, warnings: parseWarnings } = this.parseAmountWithContext(amount, gameContext);
          warnings.push(...parseWarnings);
          anteActions.push({
            player: playerName,
            action: blindType,
            amount: parsedAmount
          });
        }

        currentLine++;
      }


      // Parse preflop
      const preflop: Action[] = [];

      // Find "*** HOLE CARDS ***"
      while (currentLine < lines.length && !lines[currentLine]?.includes('*** HOLE CARDS ***')) {
        currentLine++;
      }
      if (lines[currentLine]?.includes('*** HOLE CARDS ***')) {
        currentLine++;
      }

      // Detect hero cards - GGPoker shows cards for all players
      // Keep parsing until we hit a non-"Dealt to" line
      while (currentLine < lines.length && lines[currentLine]?.startsWith('Dealt to ')) {
        const heroMatch = lines[currentLine].match(/Dealt to (.+?)(?:\s+\[(.+?)\])?$/);
        if (heroMatch) {
          const [, playerName, cardsStr] = heroMatch;
          const playerIndex = players.findIndex(p => p.name === playerName);
          if (playerIndex !== -1) {
            players[playerIndex] = {
              ...players[playerIndex],
              isHero: players[playerIndex].name === 'Hero',
              cards: cardsStr ? this.parseCards(cardsStr) : undefined
            };
          }
        }
        currentLine++;
      }

      // Parse preflop actions
      while (currentLine < lines.length && !lines[currentLine].includes('***')) {
        const line = lines[currentLine];

        // Skip empty lines
        if (!line || line.trim() === '') {
          currentLine++;
          continue;
        }

        // Parse "shows [cards]" format (GGPoker all-in reveals)
        const showsMatch = line.match(/^(.+?): shows \[([^\]]+)\]$/);
        if (showsMatch) {
          const [, playerName, cardsStr] = showsMatch;
          const cards = this.parseCards(cardsStr);
          const playerIndex = players.findIndex(p => p.name === playerName);
          if (playerIndex !== -1 && cards.length === 2) {
            players[playerIndex] = { ...players[playerIndex], cards: cards };
          }
          currentLine++;
          continue;
        }

        const action = this.parseAction(line, gameContext);
        if (action) {
          preflop.push(action);
        } else {
        }
        currentLine++;
      }

      // Parse other streets
      let flopData: { cards: Card[]; actions: Action[]; } | null = null;
      let turnData: { card: Card; actions: Action[]; } | null = null;
      let riverData: { card: Card; actions: Action[]; } | null = null;
      let showdownData: { info: string; winners: string[]; potWon: number; rake?: number; } | null = null;
      let rakeAmount = 0;
      let totalPotAmount = 0;

      while (currentLine < lines.length) {
        const line = lines[currentLine];

        // FLOP
        if (line.includes('*** FLOP ***')) {
          const flopMatch = line.match(/\*\*\* FLOP \*\*\* \[([^\]]+)\]/);
          if (flopMatch) {
            const cards = this.parseCards(flopMatch[1]);
            flopData = { cards, actions: [] };
          }
          currentLine++;
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) flopData?.actions.push(action);
            currentLine++;
          }
          continue;
        }

        // TURN
        if (line.includes('*** TURN ***')) {
          const turnMatch = line.match(/\*\*\* TURN \*\*\* \[.+?\] \[([^\]]+)\]/);
          if (turnMatch) {
            const card = this.parseCards(turnMatch[1])[0];
            turnData = { card, actions: [] };
          }
          currentLine++;
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) turnData?.actions.push(action);
            currentLine++;
          }
          continue;
        }

        // RIVER
        if (line.includes('*** RIVER ***')) {
          // CRITICAL FIX: Get the LAST bracketed card, not the first one after board
          // Format: *** RIVER *** [Jc 8s 2h] [5d] [9s] - we want [9s]
          const riverMatch = line.match(/\*\*\* RIVER \*\*\* .+\[([^\]]+)\]$/);
          if (riverMatch) {
            const card = this.parseCards(riverMatch[1])[0];
            riverData = { card, actions: [] };
          } else {
          }
          currentLine++;
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) riverData?.actions.push(action);
            currentLine++;
          }
          continue;
        }

        // SHOWDOWN
        if (line.includes('*** SHOWDOWN ***') || line.includes('*** SHOW DOWN ***')) {
          currentLine++;
          let showdownInfo = '';
          let winners: string[] = [];
          let potWon = 0;

          while (currentLine < lines.length && !lines[currentLine].includes('***') && !lines[currentLine].includes('SUMMARY')) {
            const showLine = lines[currentLine];

            if (showLine.includes(': shows [') && showLine.includes(']')) {
              showdownInfo += showLine + '\n';
              const showMatch = showLine.match(/(.+?): shows \[([^\]]+)\]/);
              if (showMatch) {
                const playerName = showMatch[1];
                const cardsText = showMatch[2];
                const cards = this.parseCards(cardsText);
                const playerIndex = players.findIndex(p => p.name === playerName);
                if (playerIndex !== -1 && cards.length === 2) {
                  players[playerIndex] = { ...players[playerIndex], cards: cards };
                }
              }
            }

            // CRITICAL FIX: Support comma-separated amounts (e.g., "20,920")
            const winMatch = showLine.match(/(.+?) collected ([0-9,]+) from pot/);
            if (winMatch) {
              const winnerName = winMatch[1];
              // Remove commas from amount
              const amountStr = winMatch[2].replace(/,/g, '');
              if (!winners.includes(winnerName)) {
                winners.push(winnerName);
              }
              potWon += parseInt(amountStr, 10);
              showdownInfo += showLine + '\n';
            }

            currentLine++;
          }

          if (showdownInfo || winners.length > 0) {
            showdownData = { info: showdownInfo, winners, potWon };
          }
          continue;
        }

        // SUMMARY
        if (line.includes('*** SUMMARY ***')) {
          currentLine++;

          while (currentLine < lines.length) {
            const summaryLine = lines[currentLine];

            // Parse total pot, main pot, side pots and rake
            // GGPoker format: "Total pot 60,482 | Rake 0 | Jackpot 0 | Bingo 0 | Fortune 0 | Tax 0"
            // Also support: "Total pot 4500 Main pot 3000. Side pot 1500. | Rake 0"
            const potRakeMatch = summaryLine.match(/Total pot ([0-9,]+)(?:.+?)?\s*\|\s*Rake\s+([0-9,]+)/);
            if (potRakeMatch) {
              // Remove commas from amounts
              const potStr = potRakeMatch[1].replace(/,/g, '');
              const rakeStr = potRakeMatch[2].replace(/,/g, '');
              totalPotAmount = parseInt(potStr, 10);
              rakeAmount = parseInt(rakeStr, 10);
            }

            // Parse board cards (GGPoker format: "Board [Jh 6c Tc 5c 9c]")
            const boardMatch = summaryLine.match(/Board \[([^\]]+)\]/);
            if (boardMatch) {
            }

            // Parse mucked cards
            const muckedMatch = summaryLine.match(/Seat (\d+): (.+?) mucked \[([^\]]+)\]/);
            if (muckedMatch) {
              const [, seat, playerName, cardsStr] = muckedMatch;
              const muckedCards = this.parseCards(cardsStr);
              const playerIndex = players.findIndex(p => p.name === playerName);
              if (playerIndex !== -1) {
                players[playerIndex] = { ...players[playerIndex], cards: muckedCards };
              }
            }

            // Parse shown cards in summary (GGPoker format: "Seat 1: c0969eff (big blind) showed [7s 7c] and won (34,540)")
            const shownMatch = summaryLine.match(/Seat (\d+): (.+?) (?:\([^)]+\) )?showed \[([^\]]+)\]/);
            if (shownMatch) {
              const [, seat, playerName, cardsStr] = shownMatch;
              const shownCards = this.parseCards(cardsStr);
              const playerIndex = players.findIndex(p => p.name === playerName);
              if (playerIndex !== -1 && !players[playerIndex].cards) {
                players[playerIndex] = { ...players[playerIndex], cards: shownCards };
              }
            }

            // CRITICAL FIX: Parse winnings from SUMMARY section (GGPoker format: "and won (34,540)")
            const wonMatch = summaryLine.match(/Seat \d+: (.+?) (?:\([^)]+\) )?(?:showed|folded|mucked)[^)]*and won \(([0-9,]+)\)/);
            if (wonMatch) {
              const [, playerName, amountStr] = wonMatch;
              const wonAmount = parseInt(amountStr.replace(/,/g, ''), 10);

              // Update showdown data with individual player winnings
              if (!showdownData) {
                showdownData = { info: '', winners: [], potWon: 0 };
              }

              // Add to winners list if not already present
              if (!showdownData.winners.includes(playerName)) {
                showdownData.winners.push(playerName);
              }

              // Store player-specific winning amount
              if (!(showdownData as any).playerWinnings) {
                (showdownData as any).playerWinnings = {};
              }
              (showdownData as any).playerWinnings[playerName] = wonAmount;

            }

            currentLine++;
          }

          if (showdownData && rakeAmount > 0) {
            showdownData.rake = rakeAmount;
          }

          break;
        }

        currentLine++;
      }

      const handHistory: HandHistory = {
        handId,
        site: 'GGPoker',
        gameType: gameType as 'Hold\'em' | 'Omaha' | 'Stud',
        limit: limit as 'No Limit' | 'Pot Limit' | 'Fixed Limit',
        stakes: tournamentName,
        maxPlayers: parseInt(maxPlayers),
        buttonSeat: parseInt(buttonSeat),
        dealerSeat: parseInt(buttonSeat),
        smallBlind,
        bigBlind,
        gameContext,
        ante: anteAmount > 0 ? anteAmount : undefined,
        timestamp: parsedDate,
        players,
        antes: anteActions.length > 0 ? anteActions : undefined,
        preflop,
        flop: flopData || { cards: [], actions: [] }, // Always defined
        turn: turnData || { card: null, actions: [] }, // Always defined
        river: riverData || { card: null, actions: [] }, // Always defined
        showdown: showdownData || undefined,
        totalPot: totalPotAmount || 0,
        rake: rakeAmount,
        currency: 'USD'
      };

      // Validate HandHistory after parsing
      const validationErrors = DataValidator.validateHandHistory(handHistory);
      if (validationErrors.length > 0) {
        const criticalErrors = validationErrors.filter(e => e.severity === ErrorSeverity.CRITICAL);
        const nonCriticalErrors = validationErrors.filter(e => e.severity !== ErrorSeverity.CRITICAL);

        validationErrors.forEach(err => {
        });

        if (criticalErrors.length > 0) {
          return {
            success: false,
            error: `Critical validation errors: ${criticalErrors.map(e => e.message).join('; ')}`,
            warnings
          };
        }

        warnings.push(...nonCriticalErrors.map(e => e.message));
      }

      return {
        success: true,
        handHistory,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: `Erro no parsing GGPoker: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        warnings
      };
    }
  }

  private static parsePartyPoker(handText: string): ParseResult {
    const lines = handText.trim().split('\n').map(line => line.trim());
    const warnings: string[] = [];

    try {
      // PartyPoker Header formats:
      // Tournament: "PartyPoker Hand #123456789: Tournament #12345, $50+$5 Hold'em No Limit - Level III (25/50)"
      // Cash Game: "PartyPoker Hand #5555: No Limit Hold'em Cash Game ($1/$2)"

      // FLEXIBILIZED REGEX: Now accepts both Tournament and Cash Game formats
      // Tournament pattern has "Tournament #" while cash game has "Cash Game" descriptor
      let headerMatch = lines[0].match(/PartyPoker Hand #(\d+):\s*(?:Tournament #(\d+), (\$[\d.]+\+\$[\d.]+) )?(No Limit|Pot Limit|Fixed Limit|) ?(Hold'em|Omaha|Stud)\s*(?:Cash Game)?(?: - Level ([IVXLC]+))?\s*\([\$]?(\d+(?:\.\d+)?)\/[\$]?(\d+(?:\.\d+)?)\)/);

      if (!headerMatch) {
        return { success: false, error: 'Formato de header PartyPoker inválido. Formatos suportados: Tournament e Cash Game' };
      }

      const [, handId, tourneyId, buyIn, gameType, limit, level, sbStr, bbStr] = headerMatch;
      const smallBlind = parseInt(sbStr);
      const bigBlind = parseInt(bbStr);

      // Parse timestamp
      const timestampMatch = lines[0].match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/);
      const parsedDate = timestampMatch ? new Date(timestampMatch[1]) : new Date();

      // Game context for PartyPoker using multi-layer detection
      const detectionResult = this.detectGameContext(lines[0], 'PartyPoker');
      const { confidence, warnings: contextWarnings, ...gameContext } = detectionResult;

      // Add context warnings to main warnings array
      if (contextWarnings && contextWarnings.length > 0) {
        warnings.push(...contextWarnings);
      }


      // Parse table info
      let tableMatch = lines[1].match(/Table '(.+?)' (\d+)-max Seat #(\d+) is the button/);
      if (!tableMatch) {
        return { success: false, error: 'Informações da mesa inválidas' };
      }

      const [, , maxPlayers, buttonSeat] = tableMatch;

      // Parse players
      const players: Player[] = [];
      let currentLine = 2;

      while (currentLine < lines.length && lines[currentLine].startsWith('Seat ')) {
        const seatMatch = lines[currentLine].match(/Seat (\d+): (.+?) \((\d+) in chips\)/);
        if (seatMatch) {
          const [, seat, playerName, stack] = seatMatch;
          players.push({
            name: playerName,
            position: this.getPosition(parseInt(seat), parseInt(buttonSeat), parseInt(maxPlayers)),
            stack: parseInt(stack),
            isHero: false,
            seat: parseInt(seat),
            status: 'active'
          });
        }
        currentLine++;
      }

      // Parse blinds (PartyPoker typically doesn't have antes in standard tournaments)
      const anteActions: Action[] = [];

      while (currentLine < lines.length &&
             (lines[currentLine]?.includes('posts small blind') ||
              lines[currentLine]?.includes('posts big blind'))) {

        const line = lines[currentLine];
        const blindMatch = line.match(/(.+?): posts (?:small blind|big blind) (\d+)/);
        if (blindMatch) {
          const [, playerName, amount] = blindMatch;
          const blindType = line.includes('small blind') ? 'small_blind' : 'big_blind';
          anteActions.push({
            player: playerName,
            action: blindType,
            amount: parseInt(amount)
          });
        }

        currentLine++;
      }

      // Parse preflop
      const preflop: Action[] = [];

      // Find "*** HOLE CARDS ***"
      while (currentLine < lines.length && !lines[currentLine]?.includes('*** HOLE CARDS ***')) {
        currentLine++;
      }
      if (lines[currentLine]?.includes('*** HOLE CARDS ***')) {
        currentLine++;
      }

      // Detect hero cards
      if (lines[currentLine]?.startsWith('Dealt to ')) {
        const heroMatch = lines[currentLine].match(/Dealt to (.+?) \[(.+?)\]/);
        if (heroMatch) {
          const [, heroName, cardsStr] = heroMatch;
          const heroPlayerIndex = players.findIndex(p => p.name === heroName);
          if (heroPlayerIndex !== -1) {
            players[heroPlayerIndex] = {
              ...players[heroPlayerIndex],
              isHero: true,
              cards: this.parseCards(cardsStr)
            };
          }
        }
        currentLine++;
      }

      // Parse preflop actions
      while (currentLine < lines.length && !lines[currentLine].includes('***')) {
        const action = this.parseAction(lines[currentLine], gameContext);
        if (action) {
          preflop.push(action);
        }
        currentLine++;
      }

      // Parse other streets
      let flopData: { cards: Card[]; actions: Action[]; } | null = null;
      let turnData: { card: Card; actions: Action[]; } | null = null;
      let riverData: { card: Card; actions: Action[]; } | null = null;
      let showdownData: { info: string; winners: string[]; potWon: number; rake?: number; } | null = null;
      let rakeAmount = 0;
      let totalPotAmount = 0;

      while (currentLine < lines.length) {
        const line = lines[currentLine];

        // FLOP
        if (line.includes('*** FLOP ***')) {
          const flopMatch = line.match(/\*\*\* FLOP \*\*\* \[([^\]]+)\]/);
          if (flopMatch) {
            const cards = this.parseCards(flopMatch[1]);
            flopData = { cards, actions: [] };
          }
          currentLine++;
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) flopData?.actions.push(action);
            currentLine++;
          }
          continue;
        }

        // TURN
        if (line.includes('*** TURN ***')) {
          const turnMatch = line.match(/\*\*\* TURN \*\*\* \[.+?\] \[([^\]]+)\]/);
          if (turnMatch) {
            const card = this.parseCards(turnMatch[1])[0];
            turnData = { card, actions: [] };
          }
          currentLine++;
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) turnData?.actions.push(action);
            currentLine++;
          }
          continue;
        }

        // RIVER
        if (line.includes('*** RIVER ***')) {
          // CRITICAL FIX: Get the LAST bracketed card, not the first one after board
          // Format: *** RIVER *** [Jc 8s 2h] [5d] [9s] - we want [9s]
          const riverMatch = line.match(/\*\*\* RIVER \*\*\* .+\[([^\]]+)\]$/);
          if (riverMatch) {
            const card = this.parseCards(riverMatch[1])[0];
            riverData = { card, actions: [] };
          } else {
          }
          currentLine++;
          while (currentLine < lines.length && !lines[currentLine].includes('***')) {
            const action = this.parseAction(lines[currentLine], gameContext);
            if (action) riverData?.actions.push(action);
            currentLine++;
          }
          continue;
        }

        // SHOWDOWN
        if (line.includes('*** SHOW DOWN ***')) {
          currentLine++;
          let showdownInfo = '';
          let winners: string[] = [];
          let potWon = 0;

          while (currentLine < lines.length && !lines[currentLine].includes('***') && !lines[currentLine].includes('SUMMARY')) {
            const showLine = lines[currentLine];

            if (showLine.includes(': shows [') && showLine.includes(']')) {
              showdownInfo += showLine + '\n';
              const showMatch = showLine.match(/(.+?): shows \[([^\]]+)\]/);
              if (showMatch) {
                const playerName = showMatch[1];
                const cardsText = showMatch[2];
                const cards = this.parseCards(cardsText);
                const playerIndex = players.findIndex(p => p.name === playerName);
                if (playerIndex !== -1 && cards.length === 2) {
                  players[playerIndex] = { ...players[playerIndex], cards: cards };
                }
              }
            }

            // PartyPoker muck format: "PlayerY: mucks hand"
            if (showLine.includes(': mucks hand')) {
              showdownInfo += showLine + '\n';
            }

            const winMatch = showLine.match(/(.+?) collected (\d+) from pot/);
            if (winMatch) {
              winners.push(winMatch[1]);
              potWon = parseInt(winMatch[2]);
              showdownInfo += showLine + '\n';
            }

            currentLine++;
          }

          if (showdownInfo) {
            showdownData = { info: showdownInfo, winners, potWon };
          }
          continue;
        }

        // SUMMARY
        if (line.includes('*** SUMMARY ***')) {
          currentLine++;

          while (currentLine < lines.length) {
            const summaryLine = lines[currentLine];

            // Parse total pot and rake
            const potRakeMatch = summaryLine.match(/Total pot (\d+)\s*\|\s*Rake\s+(\d+)/);
            if (potRakeMatch) {
              totalPotAmount = parseInt(potRakeMatch[1]);
              rakeAmount = parseInt(potRakeMatch[2]);
            }

            // CRITICAL: Parse mucked cards revealed in summary
            // PartyPoker format: "Seat 5: PlayerY (big blind) mucked [Js Jc]"
            const muckedMatch = summaryLine.match(/Seat (\d+): (.+?) (?:\([^)]+\) )?mucked \[([^\]]+)\]/);
            if (muckedMatch) {
              const [, seat, playerName, cardsStr] = muckedMatch;
              const muckedCards = this.parseCards(cardsStr);
              const playerIndex = players.findIndex(p => p.name === playerName);
              if (playerIndex !== -1) {
                players[playerIndex] = { ...players[playerIndex], cards: muckedCards };
              }
            }

            currentLine++;
          }

          if (showdownData && rakeAmount > 0) {
            showdownData.rake = rakeAmount;
          }

          break;
        }

        currentLine++;
      }

      const handHistory: HandHistory = {
        handId,
        site: 'PartyPoker',
        gameType: gameType as 'Hold\'em' | 'Omaha' | 'Stud',
        limit: limit as 'No Limit' | 'Pot Limit' | 'Fixed Limit',
        stakes: buyIn,
        maxPlayers: parseInt(maxPlayers),
        buttonSeat: parseInt(buttonSeat),
        dealerSeat: parseInt(buttonSeat),
        smallBlind,
        bigBlind,
        gameContext,
        ante: undefined, // PartyPoker typically doesn't show antes
        timestamp: parsedDate,
        players,
        antes: anteActions.length > 0 ? anteActions : undefined,
        preflop,
        flop: flopData || { cards: [], actions: [] }, // Always defined
        turn: turnData || { card: null, actions: [] }, // Always defined
        river: riverData || { card: null, actions: [] }, // Always defined
        showdown: showdownData || undefined,
        totalPot: totalPotAmount || 0,
        rake: rakeAmount,
        currency: 'USD'
      };

      // Validate HandHistory after parsing
      const validationErrors = DataValidator.validateHandHistory(handHistory);
      if (validationErrors.length > 0) {
        const criticalErrors = validationErrors.filter(e => e.severity === ErrorSeverity.CRITICAL);
        const nonCriticalErrors = validationErrors.filter(e => e.severity !== ErrorSeverity.CRITICAL);

        validationErrors.forEach(err => {
        });

        if (criticalErrors.length > 0) {
          return {
            success: false,
            error: `Critical validation errors: ${criticalErrors.map(e => e.message).join('; ')}`,
            warnings
          };
        }

        warnings.push(...nonCriticalErrors.map(e => e.message));
      }

      return {
        success: true,
        handHistory,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: `Erro no parsing PartyPoker: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  private static parseCards(cardsStr: string): Card[] {
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

  // Comprehensive patterns para detectar all-in em diferentes formatos
  private static ALL_IN_PATTERNS = [
    /and\s+is\s+all-?in/i,
    /is\s+all-?in\s*\(\$?[\d,\.]+\)/i,
    /is\s+all-?in$/i,
    /\(all-?in\)/i,
    /goes\s+all-?in/i,
    /goes\s+all-?in\s+for\s+\$?[\d,\.]+/i,
    /all-?in\s*$/i
  ];

  private static isAllInAction(text: string): boolean {
    return this.ALL_IN_PATTERNS.some(pattern => pattern.test(text));
  }

  /**
   * Extracts amount from all-in text, returns undefined if not found
   */
  private static extractAllInAmount(text: string): number | undefined {
    // Pattern for "goes all-in for $X" or "is all-in ($X)"
    const amountMatch = text.match(/(?:for|all-?in\s*\(?)\s*\$?([\d,\.]+)/i);
    if (amountMatch) {
      return this.parseAmount(amountMatch[1]);
    }
    return undefined;
  }

  /**
   * Context-aware amount parsing with rigorous validation
   * For tournaments: returns chips as integer values
   * For cash games: returns cents as integer values
   * Returns { amount: number, warnings: string[] } for debugging
   */
  private static parseAmountWithContext(
    rawValue: string,
    gameContext: GameContext
  ): { amount: number; warnings: string[] } {
    const warnings: string[] = [];

    // VALIDATION 1: Check for null/undefined/empty
    if (!rawValue || typeof rawValue !== 'string') {
      warnings.push(`Invalid input: "${rawValue}" is not a valid string`);
      return { amount: 0, warnings };
    }

    const trimmedValue = rawValue.trim();
    if (trimmedValue === '') {
      warnings.push('Empty string provided for amount');
      return { amount: 0, warnings };
    }

    try {
      // VALIDATION 2: Remove currency symbols and whitespace
      let cleanValue = trimmedValue
        .replace(/\$/g, '')      // Remove $ signs
        .replace(/€/g, '')       // Remove € signs
        .replace(/£/g, '')       // Remove £ signs
        .replace(/\s+/g, '')     // Remove all whitespace
        .replace(/,/g, '');      // Remove thousand separators

      // VALIDATION 3: Check for special strings
      const lowerValue = cleanValue.toLowerCase();
      if (lowerValue === 'all-in' || lowerValue === 'allin') {
        warnings.push('Detected "all-in" string - cannot parse as numeric amount');
        return { amount: 0, warnings };
      }

      // VALIDATION 4: Validate numeric format
      const decimalPoints = (cleanValue.match(/\./g) || []).length;
      if (decimalPoints > 1) {
        warnings.push(`Invalid format: multiple decimal points in "${rawValue}"`);
        return { amount: 0, warnings };
      }

      // VALIDATION 5: Parse to float
      const parsed = parseFloat(cleanValue);

      if (isNaN(parsed)) {
        warnings.push(`Cannot parse "${rawValue}" to number`);
        return { amount: 0, warnings };
      }

      // VALIDATION 6: Check for negative values
      if (parsed < 0) {
        warnings.push(`Negative value detected: ${parsed} from "${rawValue}"`);
        return { amount: 0, warnings };
      }

      // VALIDATION 7: Check for unreasonably large values (overflow prevention)
      const MAX_SAFE_CHIPS = 1_000_000_000; // 1 billion chips
      const MAX_SAFE_CENTS = 100_000_000;   // $1 million dollars (100M cents)

      if (gameContext.isTournament) {
        if (parsed > MAX_SAFE_CHIPS) {
          warnings.push(`Value ${parsed} exceeds maximum safe chip count (${MAX_SAFE_CHIPS})`);
          return { amount: MAX_SAFE_CHIPS, warnings };
        }
      } else {
        if (parsed > MAX_SAFE_CENTS / 100) {
          warnings.push(`Value ${parsed} exceeds maximum safe dollar amount ($${MAX_SAFE_CENTS / 100})`);
          return { amount: MAX_SAFE_CENTS, warnings };
        }
      }

      // CONVERSION: Use integer arithmetic to avoid floating point errors
      let finalAmount: number;

      if (gameContext.isTournament) {
        // Tournament: values are already in chips, keep as integer
        finalAmount = Math.round(parsed);

        // Warn if fractional chips detected
        if (parsed !== finalAmount) {
          warnings.push(`Fractional chips detected: ${parsed} rounded to ${finalAmount}`);
        }
      } else {
        // Cash game: convert dollars to cents using integer arithmetic
        // Multiply by 100 using string manipulation to avoid float errors
        const [integerPart, decimalPart = ''] = cleanValue.split('.');

        // Pad or truncate decimal to exactly 2 digits
        const paddedDecimal = (decimalPart + '00').substring(0, 2);

        // Construct integer cents value
        const centsString = integerPart + paddedDecimal;
        finalAmount = parseInt(centsString, 10);

        // Validate the conversion
        if (isNaN(finalAmount) || finalAmount < 0) {
          warnings.push(`Conversion error: "${rawValue}" -> ${finalAmount} cents`);
          return { amount: 0, warnings };
        }

        // Warn if more than 2 decimal places (precision loss)
        if (decimalPart.length > 2) {
          warnings.push(`Precision loss: "${rawValue}" has ${decimalPart.length} decimal places, truncated to 2`);
        }
      }

      // VALIDATION 8: Final sanity check
      if (!Number.isFinite(finalAmount)) {
        warnings.push(`Final amount is not finite: ${finalAmount} from "${rawValue}"`);
        return { amount: 0, warnings };
      }

      // Log suspicious conversions for debugging
      if (warnings.length > 0) {
      }

      return { amount: finalAmount, warnings };

    } catch (error) {
      warnings.push(`Exception during parsing: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { amount: 0, warnings };
    }
  }

  /**
   * Legacy amount parsing (maintains compatibility)
   * Returns integer cents to prevent floating point arithmetic errors
   */
  private static parseAmount(rawValue: string): number {
    if (!rawValue) {
      return 0;
    }

    try {
      // Remove thousand separators (commas) and parse
      const cleanValue = rawValue.replace(/,/g, '');
      const parsed = parseFloat(cleanValue);

      if (isNaN(parsed)) {
        return 0;
      }

      // Convert to integer cents to prevent floating point errors
      // Store all monetary values as integer cents internally
      return CurrencyUtils.dollarsToCents(parsed);
    } catch (error) {
      return 0;
    }
  }


  /**
   * Peek ahead to check for shows in next lines (for immediate card reveal)
   */
  private static peekForShows(lines: string[], currentIndex: number): Card[] | null {
    // Check next 3 lines for shows
    for (let i = currentIndex + 1; i < Math.min(currentIndex + 4, lines.length); i++) {
      const line = lines[i].trim();
      if (line.includes('shows [') || line.includes('shows:')) {
        const cards = this.parseCards(line);
        if (cards.length === 2) {
          return cards;
        }
      }
    }
    return null;
  }

  private static parseAction(line: string, gameContext: GameContext): Action | null {
    // Parse de ações: "PlayerName: folds", "PlayerName: calls $X", etc.
    const foldMatch = line.match(/^(.+?): folds/);
    if (foldMatch) {
      return { player: foldMatch[1], action: 'fold' };
    }

    const callMatch = line.match(/^(.+?): calls \$?([0-9,\.]+)(.*)$/);
    if (callMatch) {
      // Check if it's an all-in call
      const isAllIn = this.isAllInAction(callMatch[3]);

      const { amount, warnings: parseWarnings } = this.parseAmountWithContext(callMatch[2], gameContext);
      let revealedCards: Card[] | undefined;

      // If all-in, try to extract explicit amount and check for shows
      if (isAllIn) {
        const extractedAmount = this.extractAllInAmount(callMatch[3]);
        if (extractedAmount !== undefined) {
          // For all-in extracted amounts, assume they need conversion too
          const { amount: convertedAmount } = this.parseAmountWithContext(extractedAmount.toString(), gameContext);
          return {
            player: callMatch[1],
            action: 'all-in',
            amount: convertedAmount,
            reveals: revealedCards !== undefined,
            revealedCards
          };
        }
      }

      return {
        player: callMatch[1],
        action: isAllIn ? 'all-in' : 'call',
        amount,
        reveals: isAllIn && revealedCards !== undefined,
        revealedCards
      };
    }

    const betMatch = line.match(/^(.+?): bets \$?([0-9,\.]+)(.*)$/);
    if (betMatch) {
      // Check if it's an all-in
      const isAllIn = this.isAllInAction(betMatch[3]);

      const { amount, warnings: parseWarnings } = this.parseAmountWithContext(betMatch[2], gameContext);
      let revealedCards: Card[] | undefined;

      // If all-in, try to extract explicit amount
      if (isAllIn) {
        const extractedAmount = this.extractAllInAmount(betMatch[3]);
        if (extractedAmount !== undefined) {
          const { amount: convertedAmount } = this.parseAmountWithContext(extractedAmount.toString(), gameContext);
          return {
            player: betMatch[1],
            action: 'all-in',
            amount: convertedAmount,
            reveals: revealedCards !== undefined,
            revealedCards
          };
        }
      }

      return {
        player: betMatch[1],
        action: isAllIn ? 'all-in' : 'bet',
        amount,
        reveals: isAllIn && revealedCards !== undefined,
        revealedCards
      };
    }

    // CRITICAL: Match "raises all-in X" format FIRST (before normal raises)
    const raiseAllInMatch = line.match(/^(.+?): raises all-?in \$?([0-9,\.]+)$/i);
    if (raiseAllInMatch) {
      const { amount, warnings: parseWarnings } = this.parseAmountWithContext(raiseAllInMatch[2], gameContext);
      return {
        player: raiseAllInMatch[1],
        action: 'all-in',
        amount: amount,
        reveals: false
      };
    }

    // Match normal raises "raises X to Y"
    const raiseMatch = line.match(/^(.+?): raises \$?([0-9,\.]+) to \$?([0-9,\.]+)(.*)$/);
    if (raiseMatch) {
      // Check if it's an all-in
      const isAllIn = this.isAllInAction(raiseMatch[4]);
      const { amount: totalBet, warnings: totalWarnings } = this.parseAmountWithContext(raiseMatch[3], gameContext); // Total amount player bets
      const { amount: raiseBy, warnings: raiseWarnings } = this.parseAmountWithContext(raiseMatch[2], gameContext); // How much they raised by
      let revealedCards: Card[] | undefined;

      // If all-in, try to extract explicit amount
      if (isAllIn) {
        const extractedAmount = this.extractAllInAmount(raiseMatch[4]);
        if (extractedAmount !== undefined) {
          const { amount: convertedTotal } = this.parseAmountWithContext(extractedAmount.toString(), gameContext);
          return {
            player: raiseMatch[1],
            action: 'all-in',
            amount: convertedTotal, // Total amount added to pot
            raiseBy: raiseBy, // How much they raised by (for display)
            totalBet: convertedTotal, // Store total bet for reference
            reveals: revealedCards !== undefined,
            revealedCards
          };
        }
      }

      return {
        player: raiseMatch[1],
        action: isAllIn ? 'all-in' : 'raise',
        amount: totalBet, // Total amount added to pot
        raiseBy: raiseBy, // How much they raised by (for display)
        totalBet: totalBet, // Store total bet for reference
        reveals: isAllIn && revealedCards !== undefined,
        revealedCards
      };
    }

    const checkMatch = line.match(/^(.+?): checks/);
    if (checkMatch) {
      return { player: checkMatch[1], action: 'check' };
    }

    return null;
  }

  private static getPosition(seat: number, button: number, maxPlayers: number): Position {
    // Calcular posição relativa baseada no seat e button
    // BTN = 0, SB = 1, BB = 2, etc.
    const relativePosition = (seat - button + maxPlayers) % maxPlayers;

    // Sistema adaptativo para qualquer número de jogadores (2-10+)
    switch (maxPlayers) {
      case 2: // Heads-up
        return relativePosition === 0 ? 'BTN' : 'BB'; // BTN/SB é o mesmo no heads-up

      case 3: // 3-max
        const pos3: Position[] = ['BTN', 'SB', 'BB'];
        return pos3[relativePosition] || 'BTN';

      case 4: // 4-max
        const pos4: Position[] = ['BTN', 'SB', 'BB', 'UTG'];
        return pos4[relativePosition] || 'UTG';

      case 5: // 5-max
        const pos5: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'CO'];
        return pos5[relativePosition] || 'UTG';

      case 6: // 6-max (padrão)
        const pos6: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'];
        return pos6[relativePosition] || 'UTG';

      case 7: // 7-max
        const pos7: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO'];
        return pos7[relativePosition] || 'UTG';

      case 8: // 8-max
        const pos8: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP1', 'MP2', 'CO'];
        return pos8[relativePosition] || 'UTG';

      case 9: // 9-max (full ring)
        const pos9: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP1', 'MP2', 'CO'];
        return pos9[relativePosition] || 'UTG';

      case 10: // 10-max (full ring+)
        const pos10: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP1', 'MP2', 'MP3', 'CO'];
        return pos10[relativePosition] || 'UTG';

      default: // Para mesas maiores que 10 (raras)
        if (relativePosition === 0) return 'BTN';
        if (relativePosition === 1) return 'SB';
        if (relativePosition === 2) return 'BB';
        if (relativePosition === maxPlayers - 1) return 'CO';
        if (relativePosition === maxPlayers - 2) return 'HJ';
        if (relativePosition <= 5) return 'UTG+1';
        return 'MP';
    }
  }

  /**
   * MULTI-LAYER GAME CONTEXT DETECTION
   * Critical for 100% accurate value conversion (chips vs dollars)
   *
   * Detection Strategy:
   * Layer 1: Primary indicators (Tournament # keyword)
   * Layer 2: Currency symbols and patterns
   * Layer 3: Structural analysis (blinds format)
   * Layer 4: Cross-validation and contradiction detection
   * Layer 5: Intelligent fallback with confidence scoring
   */
  private static detectGameContext(
    headerLine: string,
    site: 'PokerStars' | 'GGPoker' | 'PartyPoker' | 'Unknown' = 'Unknown'
  ): GameContext & { confidence: 'high' | 'medium' | 'low'; warnings: string[] } {
    const warnings: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'low';

    // LAYER 1: Primary Tournament Indicators
    const tournamentIndicators = {
      hasTournamentKeyword: /Tournament #\d+/i.test(headerLine),
      hasLevel: /Level [IVXLC]+/i.test(headerLine),
      hasBuyIn: /\$[\d.]+\+\$[\d.]+/i.test(headerLine),
      hasSitAndGo: /Sit & Go/i.test(headerLine),
      hasMTT: /MTT|Multi/i.test(headerLine),
      hasFreeroll: /Freeroll/i.test(headerLine)
    };

    // LAYER 2: Cash Game Indicators
    const cashGameIndicators = {
      hasCashKeyword: /Cash Game/i.test(headerLine),
      hasDirectStakes: /\(\$[\d.]+\/\$[\d.]+\s*(?:USD|EUR|GBP)?\)/i.test(headerLine),
      hasNoLevel: !/Level [IVXLC]+/i.test(headerLine),
      hasNoTournamentId: !/Tournament #\d+/i.test(headerLine)
    };

    // LAYER 3: Site-Specific Patterns
    let siteSpecificDetection: { isTournament: boolean; certainty: number } | null = null;

    switch (site) {
      case 'PokerStars':
        // PokerStars tournament: "Tournament #456, $10+$1 USD ... Level V"
        // PokerStars cash: "Hold'em No Limit ($0.25/$0.50 USD)"
        const psTournament = /Tournament #\d+,.+?Level [IVXLC]+/i.test(headerLine);
        const psCash = /Hold'em.+?\(\$[\d.]+\/\$[\d.]+\s*USD\)/i.test(headerLine) &&
                       !/Tournament #/i.test(headerLine);

        if (psTournament) {
          siteSpecificDetection = { isTournament: true, certainty: 0.95 };
        } else if (psCash) {
          siteSpecificDetection = { isTournament: false, certainty: 0.95 };
        }
        break;

      case 'GGPoker':
        // GGPoker tournament: "Tournament #123456, $10+$1 USD ... Level V"
        // GGPoker cash: "Hold'em No Limit ($0.25/$0.50)" (no Tournament keyword)
        const ggTournament = /Tournament #\d+/i.test(headerLine);
        const ggCash = /Hold'em.+?\(\$?[\d.]+\/\$?[\d.]+\)/i.test(headerLine) &&
                       !/Tournament #/i.test(headerLine);

        if (ggTournament) {
          siteSpecificDetection = { isTournament: true, certainty: 0.95 };
        } else if (ggCash) {
          siteSpecificDetection = { isTournament: false, certainty: 0.90 };
        }
        break;

      case 'PartyPoker':
        // PartyPoker tournament: "Tournament #12345, $50+$5"
        // PartyPoker cash: "Cash Game ($1/$2)"
        const ppTournament = /Tournament #\d+/i.test(headerLine);
        const ppCash = /Cash Game/i.test(headerLine);

        if (ppTournament) {
          siteSpecificDetection = { isTournament: true, certainty: 0.95 };
        } else if (ppCash) {
          siteSpecificDetection = { isTournament: false, certainty: 0.95 };
        }
        break;
    }

    // LAYER 4: Cross-Validation and Contradiction Detection
    const tournamentScore =
      (tournamentIndicators.hasTournamentKeyword ? 3 : 0) +
      (tournamentIndicators.hasLevel ? 2 : 0) +
      (tournamentIndicators.hasBuyIn ? 2 : 0) +
      (tournamentIndicators.hasSitAndGo ? 2 : 0) +
      (tournamentIndicators.hasMTT ? 2 : 0) +
      (tournamentIndicators.hasFreeroll ? 2 : 0);

    const cashGameScore =
      (cashGameIndicators.hasCashKeyword ? 3 : 0) +
      (cashGameIndicators.hasDirectStakes ? 2 : 0) +
      (cashGameIndicators.hasNoLevel ? 1 : 0) +
      (cashGameIndicators.hasNoTournamentId ? 1 : 0);

    // Detect contradictions
    if (tournamentIndicators.hasTournamentKeyword && cashGameIndicators.hasCashKeyword) {
      warnings.push('⚠️ CONTRADICTION: Both "Tournament" and "Cash Game" keywords detected');
    }

    if (tournamentIndicators.hasLevel && cashGameIndicators.hasDirectStakes && !tournamentIndicators.hasTournamentKeyword) {
      warnings.push('⚠️ AMBIGUOUS: Has Level indicator but no Tournament keyword');
    }

    // LAYER 5: Final Decision with Confidence Scoring
    let isTournament: boolean;
    let detectionMethod: string;

    // Priority 1: Site-specific detection with high certainty
    if (siteSpecificDetection && siteSpecificDetection.certainty >= 0.9) {
      isTournament = siteSpecificDetection.isTournament;
      detectionMethod = `Site-specific (${site})`;
      confidence = 'high';
    }
    // Priority 2: Strong tournament indicators
    else if (tournamentScore >= 3) {
      isTournament = true;
      detectionMethod = `Tournament indicators (score: ${tournamentScore})`;
      confidence = tournamentScore >= 5 ? 'high' : 'medium';
    }
    // Priority 3: Strong cash game indicators
    else if (cashGameScore >= 3) {
      isTournament = false;
      detectionMethod = `Cash game indicators (score: ${cashGameScore})`;
      confidence = cashGameScore >= 5 ? 'high' : 'medium';
    }
    // Priority 4: Score comparison
    else if (tournamentScore > cashGameScore) {
      isTournament = true;
      detectionMethod = `Score comparison (T:${tournamentScore} > C:${cashGameScore})`;
      confidence = 'medium';
    }
    // Priority 5: Default fallback (cash game)
    else {
      isTournament = false;
      detectionMethod = 'Fallback default';
      confidence = 'low';
      warnings.push('⚠️ LOW CONFIDENCE: Using default fallback (cash game)');
    }

    // LAYER 6: Extract specific details based on detection
    let gameContext: GameContext;

    if (isTournament) {
      // Extract tournament details
      const tourneyMatch = headerLine.match(/Tournament #(\d+),?\s*([^-]+?)\s*(?:USD|EUR|GBP)?.*?Level ([IVXLC]+)/i);
      const buyInMatch = headerLine.match(/(\$[\d.]+\+\$[\d.]+)/);
      const blindsMatch = headerLine.match(/\((\d+)\/(\d+)(?:\/(\d+))?\)/);

      const tournamentName = buyInMatch ? buyInMatch[1] : (tourneyMatch ? tourneyMatch[2].trim() : 'Unknown');
      const level = tourneyMatch ? `Level ${tourneyMatch[3]}` : 'Unknown';

      gameContext = {
        isTournament: true,
        isHighStakes: false, // Tournaments use chips, not "high stakes"
        currencyUnit: 'chips',
        conversionNeeded: false, // NO conversion for tournaments
        buyIn: tournamentName,
        level: level
      };

    } else {
      // Extract cash game details
      const stakesMatch = headerLine.match(/\([\$]?([\d.]+)\/[\$]?([\d.]+)\s*(?:USD|EUR|GBP)?\)/i);

      if (stakesMatch) {
        const smallBlind = parseFloat(stakesMatch[1]);
        const bigBlind = parseFloat(stakesMatch[2]);
        const isHighStakes = bigBlind >= 100; // $100+ BB

        gameContext = {
          isTournament: false,
          isHighStakes: isHighStakes,
          currencyUnit: 'dollars',
          conversionNeeded: true // Cash games need dollar-to-cents conversion
        };

      } else {
        // Fallback cash game with default stakes
        warnings.push('⚠️ Could not parse stakes, using default values');
        gameContext = {
          isTournament: false,
          isHighStakes: false,
          currencyUnit: 'dollars',
          conversionNeeded: true
        };
      }
    }

    // Log warnings if any
    if (warnings.length > 0) {
    }

    return { ...gameContext, confidence, warnings };
  }

  /**
   * NEW: Smart value conversion based on game context
   * CRITICAL FIX: Prevents double/triple conversion errors
   */
  private static convertValue(amount: number, gameContext: GameContext): number {
    if (gameContext.isTournament) {
      // Tournaments: values are already in chips, no conversion needed
      return amount;
    } else {
      // Cash games: convert dollars to cents
      return CurrencyUtils.dollarsToCents(amount);
    }
  }

  /**
   * PUBLIC: Expose value conversion for SnapshotBuilder
   */
  static convertValueWithContext(amount: number, gameContext: GameContext): number {
    return this.convertValue(amount, gameContext);
  }
}
