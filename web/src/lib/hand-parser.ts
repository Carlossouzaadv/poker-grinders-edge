import { HandHistory, ParseResult, Card, Action, Player, Position, GameContext } from '@/types/poker';

export class HandParser {
  static parse(handText: string): ParseResult {
    try {
      // Validar se há múltiplas mãos no texto
      const multipleHandsCheck = this.validateSingleHand(handText);
      if (!multipleHandsCheck.isValid) {
        return {
          success: false,
          error: multipleHandsCheck.error
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
        case 'Ignition':
          return this.parseIgnition(handText);
        default:
          return {
            success: false,
            error: `Formato de hand history não reconhecido. Sites suportados: PokerStars, GGPoker, PartyPoker, Ignition/Bovada. Detectado: ${site}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Erro ao processar hand history: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  private static validateSingleHand(handText: string): { isValid: boolean; error?: string } {
    // Procurar por múltiplas ocorrências de headers de mãos de diferentes sites
    const pokerStarsMatches = (handText.match(/PokerStars (?:Hand|Game) #\d+/g) || []).length;
    const ggPokerMatches = (handText.match(/GGPoker Hand #/g) || []).length + (handText.match(/Game ID:/g) || []).length;
    const partyPokerMatches = (handText.match(/PartyPoker Hand #/g) || []).length;
    const ignitionMatches = (handText.match(/Ignition Hand #/g) || []).length + (handText.match(/Bovada Hand #/g) || []).length;

    const totalHands = pokerStarsMatches + ggPokerMatches + partyPokerMatches + ignitionMatches;

    if (totalHands === 0) {
      return {
        isValid: false,
        error: 'Formato de hand history não reconhecido. Sites suportados: PokerStars, GGPoker, PartyPoker, Ignition/Bovada.'
      };
    }

    if (totalHands > 1) {
      return {
        isValid: false,
        error: `Opa! Parece que você colou ${totalHands} mãos. Por enquanto, nosso Replayer analisa uma mão por vez. 😉\n\nPor favor, cole apenas o histórico de uma única mão.`
      };
    }

    return { isValid: true };
  }

  private static detectSite(handText: string): string {
    // PokerStars detection
    if (handText.includes('PokerStars Hand #') || handText.includes('PokerStars Game #')) {
      return 'PokerStars';
    }

    // GGPoker detection (multiple formats)
    if (handText.includes('GGPoker Hand #') ||
        (handText.includes('Game ID:') && handText.includes('Natural8'))) {
      return 'GGPoker';
    }

    // PartyPoker detection
    if (handText.includes('PartyPoker Hand #')) {
      return 'PartyPoker';
    }

    // Ignition/Bovada detection
    if (handText.includes('Ignition Hand #') ||
        handText.includes('Bovada Hand #') ||
        (handText.includes("Hold'em No Limit") && handText.includes('$') && handText.includes('Table \'6-max\''))) {
      return 'Ignition';
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
      const gameContext = this.detectGameContext(lines[0]);
      console.log('🎯 Game Context Detected:', gameContext);

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
          const heroPlayer = players.find(p => p.name === heroName);
          if (heroPlayer) {
            heroPlayer.isHero = true;
            heroPlayer.cards = this.parseCards(cardsStr);
          }
        }
        currentLine++;
      }

      // Parse das ações do preflop
      while (currentLine < lines.length && !lines[currentLine].includes('***')) {
        const line = lines[currentLine];

        // Check for player disconnect/reconnect status
        const disconnectMatch = line.match(/(.+?) is disconnected/);
        if (disconnectMatch) {
          const [, playerName] = disconnectMatch;
          const player = players.find(p => p.name === playerName);
          if (player) {
            player.status = 'disconnected';
          }
          currentLine++;
          continue;
        }

        const reconnectMatch = line.match(/(.+?) has returned/);
        if (reconnectMatch) {
          const [, playerName] = reconnectMatch;
          const player = players.find(p => p.name === playerName);
          if (player) {
            player.status = 'active';
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
          }
        }
        currentLine++;
      }

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
          const riverMatch = line.match(/\*\*\* RIVER \*\*\* \[.+?\] \[([^\]]+)\]/);
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

          // Parse das linhas de showdown
          while (currentLine < lines.length && !lines[currentLine].includes('***') && !lines[currentLine].includes('SUMMARY')) {
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
                const player = players.find(p => p.name === playerName);
                if (player && cards.length === 2) {
                  player.cards = cards;
                  console.log(`🎯 Cartas do showdown atribuídas: ${playerName} = [${cardsText}]`);
                }
              }
            }

            // Vilão muck: "Player 5: mucks hand"
            if (showLine.includes(': mucks hand')) {
              showdownInfo += showLine + '\n';
            }

            // Winner: "Hero collected 6200 from pot"
            const winMatch = showLine.match(/(.+?) collected (\d+(?:\.\d+)?) from pot/);
            if (winMatch) {
              winners.push(winMatch[1]);
              potWon = parseFloat(winMatch[2]);
              showdownInfo += showLine + '\n';
            }

            currentLine++;
          }

          // Se temos informações de showdown, vamos salvá-las
          if (showdownInfo) {
            console.log('🎯 SHOWDOWN parseado:', { showdownInfo, winners, potWon });
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
              console.log(`💰 Total pot: ${totalPotAmount}, Rake: ${rakeAmount}`);
            }

            // Procurar por cartas muckadas: "Seat 5: Player 5 mucked [Ks Qs]"
            const muckedMatch = summaryLine.match(/Seat (\d+): (.+?) mucked \[([^\]]+)\]/);
            if (muckedMatch) {
              const [, seat, playerName, cardsStr] = muckedMatch;
              const muckedCards = this.parseCards(cardsStr);

              // Encontrar o jogador e adicionar suas cartas
              const player = players.find(p => p.name === playerName);
              if (player) {
                player.cards = muckedCards;
                console.log(`🃏 Cartas muckadas encontradas para ${playerName}:`, muckedCards);
              }
            }

            // Cartas mostradas no summary: "Seat 3: Hero showed [Ac Jd] and won"
            const shownMatch = summaryLine.match(/Seat (\d+): (.+?) showed \[([^\]]+)\]/);
            if (shownMatch) {
              const [, seat, playerName, cardsStr] = shownMatch;
              const shownCards = this.parseCards(cardsStr);

              // Encontrar o jogador e garantir que suas cartas estejam definidas
              const player = players.find(p => p.name === playerName);
              if (player && !player.cards) {
                player.cards = shownCards;
                console.log(`🃏 Cartas mostradas encontradas para ${playerName}:`, shownCards);
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

      console.log('🔧 HandParser: Streets parseadas:', { flopData, turnData, riverData });

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
        flop: flopData || undefined,
        turn: turnData || undefined,
        river: riverData || undefined,
        showdown: showdownData || undefined,
        totalPot: totalPotAmount || 0, // Use parsed total pot
        rake: rakeAmount, // Include rake (can be 0)
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
        error: `Erro no parsing PokerStars: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  private static parseGGPoker(handText: string): ParseResult {
    const lines = handText.trim().split('\n').map(line => line.trim());
    const warnings: string[] = [];

    try {
      // GGPoker Header format: "Poker Hand #HD12345678: Tournament #123456, $10+$1 USD Hold'em No Limit - Level V (100/200/20)"
      let headerMatch = lines[0].match(/(?:Poker Hand|Game ID:) #([A-Z0-9]+):\s*Tournament #(\d+), (.+?) USD (Hold'em|Omaha|Stud)\s+(No Limit|Pot Limit|Fixed Limit) - Level ([IVXLC]+) \(([0-9]+)\/([0-9]+)(?:\/([0-9]+))?\)/);

      if (!headerMatch) {
        return { success: false, error: 'Formato de header GGPoker inválido' };
      }

      const [, handId, tourneyId, tournamentName, gameType, limit, level, sbStr, bbStr, anteStr] = headerMatch;
      const smallBlind = parseInt(sbStr);
      const bigBlind = parseInt(bbStr);
      const anteAmount = anteStr ? parseInt(anteStr) : 0;

      // Parse timestamp (GGPoker format: "2023/12/25 14:30:00 ET")
      const timestampMatch = lines[0].match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/);
      const parsedDate = timestampMatch ? new Date(timestampMatch[1]) : new Date();

      // Game context for GGPoker (tournament)
      const gameContext: GameContext = {
        isTournament: true,
        isHighStakes: false,
        currencyUnit: 'chips',
        conversionNeeded: false,
        buyIn: tournamentName,
        level: `Level ${level}`
      };

      // Parse table info - GGPoker format: "Table '123456 1' 6-max Seat #3 is the button"
      let tableMatch = lines[1].match(/Table '(.+?)' (\d+)-max Seat #(\d+) is the button/);
      if (!tableMatch) {
        return { success: false, error: 'Informações da mesa inválidas' };
      }

      const [, , maxPlayers, buttonSeat] = tableMatch;

      // Parse players (seats)
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

      // Parse antes and blinds
      const anteActions: Action[] = [];

      while (currentLine < lines.length &&
             (lines[currentLine]?.includes('posts ante') ||
              lines[currentLine]?.includes('posts small blind') ||
              lines[currentLine]?.includes('posts big blind'))) {

        const line = lines[currentLine];

        // Parse ante - GGPoker format: "PlayerD: posts ante 20"
        const anteMatch = line.match(/(.+?): posts ante (\d+)/);
        if (anteMatch) {
          const [, playerName, amount] = anteMatch;
          anteActions.push({
            player: playerName,
            action: 'ante',
            amount: parseInt(amount)
          });
        }

        // Parse blinds
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
          const heroPlayer = players.find(p => p.name === heroName);
          if (heroPlayer) {
            heroPlayer.isHero = true;
            heroPlayer.cards = this.parseCards(cardsStr);
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
          const riverMatch = line.match(/\*\*\* RIVER \*\*\* \[.+?\] \[([^\]]+)\]/);
          if (riverMatch) {
            const card = this.parseCards(riverMatch[1])[0];
            riverData = { card, actions: [] };
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
                const player = players.find(p => p.name === playerName);
                if (player && cards.length === 2) {
                  player.cards = cards;
                }
              }
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

            // Parse total pot, main pot, side pots and rake
            // GGPoker format: "Total pot 4500 Main pot 3000. Side pot 1500. | Rake 0"
            const potRakeMatch = summaryLine.match(/Total pot (\d+)(?:.+?)?\s*\|\s*Rake\s+(\d+)/);
            if (potRakeMatch) {
              totalPotAmount = parseInt(potRakeMatch[1]);
              rakeAmount = parseInt(potRakeMatch[2]);
            }

            // Parse mucked cards
            const muckedMatch = summaryLine.match(/Seat (\d+): (.+?) mucked \[([^\]]+)\]/);
            if (muckedMatch) {
              const [, seat, playerName, cardsStr] = muckedMatch;
              const muckedCards = this.parseCards(cardsStr);
              const player = players.find(p => p.name === playerName);
              if (player) {
                player.cards = muckedCards;
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
        flop: flopData || undefined,
        turn: turnData || undefined,
        river: riverData || undefined,
        showdown: showdownData || undefined,
        totalPot: totalPotAmount || 0,
        rake: rakeAmount,
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
        error: `Erro no parsing GGPoker: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  private static parsePartyPoker(handText: string): ParseResult {
    const lines = handText.trim().split('\n').map(line => line.trim());
    const warnings: string[] = [];

    try {
      // PartyPoker Header format: "PartyPoker Hand #123456789: Tournament #12345, $50+$5 Hold'em No Limit - Level III (25/50)"
      let headerMatch = lines[0].match(/PartyPoker Hand #(\d+):\s*Tournament #(\d+), (\$[\d.]+\+\$[\d.]+) (Hold'em|Omaha|Stud)\s+(No Limit|Pot Limit|Fixed Limit) - Level ([IVXLC]+) \((\d+)\/(\d+)\)/);

      if (!headerMatch) {
        return { success: false, error: 'Formato de header PartyPoker inválido' };
      }

      const [, handId, tourneyId, buyIn, gameType, limit, level, sbStr, bbStr] = headerMatch;
      const smallBlind = parseInt(sbStr);
      const bigBlind = parseInt(bbStr);

      // Parse timestamp
      const timestampMatch = lines[0].match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/);
      const parsedDate = timestampMatch ? new Date(timestampMatch[1]) : new Date();

      // Game context for PartyPoker (tournament)
      const gameContext: GameContext = {
        isTournament: true,
        isHighStakes: false,
        currencyUnit: 'chips',
        conversionNeeded: false,
        buyIn: buyIn,
        level: `Level ${level}`
      };

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
          const heroPlayer = players.find(p => p.name === heroName);
          if (heroPlayer) {
            heroPlayer.isHero = true;
            heroPlayer.cards = this.parseCards(cardsStr);
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
          const riverMatch = line.match(/\*\*\* RIVER \*\*\* \[.+?\] \[([^\]]+)\]/);
          if (riverMatch) {
            const card = this.parseCards(riverMatch[1])[0];
            riverData = { card, actions: [] };
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
                const player = players.find(p => p.name === playerName);
                if (player && cards.length === 2) {
                  player.cards = cards;
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
              const player = players.find(p => p.name === playerName);
              if (player) {
                player.cards = muckedCards;
                console.log(`🃏 PartyPoker: Cartas muckadas reveladas para ${playerName}:`, muckedCards);
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
        flop: flopData || undefined,
        turn: turnData || undefined,
        river: riverData || undefined,
        showdown: showdownData || undefined,
        totalPot: totalPotAmount || 0,
        rake: rakeAmount,
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
        error: `Erro no parsing PartyPoker: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  private static parseIgnition(handText: string): ParseResult {
    const lines = handText.trim().split('\n').map(line => line.trim());
    const warnings: string[] = [];

    try {
      // Ignition Header format: "Ignition Hand #1234567890 - Hold'em No Limit ($0.05/$0.10) - 2023/12/25 14:30:00"
      let headerMatch = lines[0].match(/(?:Ignition|Bovada) Hand #(\d+)\s*-\s*(Hold'em|Omaha|Stud)\s+(No Limit|Pot Limit|Fixed Limit)\s+\(\$([0-9.]+)\/\$([0-9.]+)\)/);

      if (!headerMatch) {
        return { success: false, error: 'Formato de header Ignition inválido' };
      }

      const [, handId, gameType, limit, sbStr, bbStr] = headerMatch;
      const smallBlind = parseFloat(sbStr);
      const bigBlind = parseFloat(bbStr);

      // Parse timestamp
      const timestampMatch = lines[0].match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/);
      const parsedDate = timestampMatch ? new Date(timestampMatch[1]) : new Date();

      // Game context for Ignition (cash game - needs dollar-to-cents conversion)
      const gameContext: GameContext = {
        isTournament: false,
        isHighStakes: bigBlind >= 1.0,
        currencyUnit: 'dollars',
        conversionNeeded: true
      };

      // Parse table info - Ignition format: "Table '6-max' Seat #3 is the button"
      let tableMatch = lines[1].match(/Table '(.+?)' (?:(\d+)-max )?Seat #(\d+) is the button/);
      if (!tableMatch) {
        return { success: false, error: 'Informações da mesa inválidas' };
      }

      const [, tableName, maxPlayersStr, buttonSeat] = tableMatch;
      const maxPlayers = maxPlayersStr ? parseInt(maxPlayersStr) : 6; // Default 6-max if not specified

      // Parse players
      const players: Player[] = [];
      let currentLine = 2;

      while (currentLine < lines.length && lines[currentLine].startsWith('Seat ')) {
        // Ignition format: "Seat 1: PlayerA ($10.50 in chips)"
        const seatMatch = lines[currentLine].match(/Seat (\d+): (.+?) \(\$([0-9.]+) in chips\)/);
        if (seatMatch) {
          const [, seat, playerName, stack] = seatMatch;
          players.push({
            name: playerName,
            position: this.getPosition(parseInt(seat), parseInt(buttonSeat), maxPlayers),
            stack: parseFloat(stack), // Keep as dollars for now, will convert in snapshot-builder
            isHero: false,
            seat: parseInt(seat),
            status: 'active'
          });
        }
        currentLine++;
      }

      // Parse blinds
      const anteActions: Action[] = [];

      while (currentLine < lines.length &&
             (lines[currentLine]?.includes('posts small blind') ||
              lines[currentLine]?.includes('posts big blind'))) {

        const line = lines[currentLine];
        // Ignition format: "PlayerA: posts small blind $0.05"
        const blindMatch = line.match(/(.+?): posts (?:small blind|big blind) \$([0-9.]+)/);
        if (blindMatch) {
          const [, playerName, amount] = blindMatch;
          const blindType = line.includes('small blind') ? 'small_blind' : 'big_blind';
          anteActions.push({
            player: playerName,
            action: blindType,
            amount: parseFloat(amount) // Keep as dollars, will convert later
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
          const heroPlayer = players.find(p => p.name === heroName);
          if (heroPlayer) {
            heroPlayer.isHero = true;
            heroPlayer.cards = this.parseCards(cardsStr);
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
          const riverMatch = line.match(/\*\*\* RIVER \*\*\* \[.+?\] \[([^\]]+)\]/);
          if (riverMatch) {
            const card = this.parseCards(riverMatch[1])[0];
            riverData = { card, actions: [] };
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
                const player = players.find(p => p.name === playerName);
                if (player && cards.length === 2) {
                  player.cards = cards;
                }
              }
            }

            // Ignition format: "PlayerA collected $15.50 from pot"
            const winMatch = showLine.match(/(.+?) collected \$([0-9.]+) from (?:main pot|side pot|pot)/);
            if (winMatch) {
              winners.push(winMatch[1]);
              potWon = parseFloat(winMatch[2]); // Keep as dollars
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

            // Parse total pot and rake - Ignition format: "Total pot $15.50 | Rake $0.75"
            const potRakeMatch = summaryLine.match(/Total pot \$([0-9.]+)\s*\|\s*Rake\s+\$([0-9.]+)/);
            if (potRakeMatch) {
              totalPotAmount = parseFloat(potRakeMatch[1]);
              rakeAmount = parseFloat(potRakeMatch[2]);
            }

            // Parse main pot and side pots - Ignition format: "Total pot $30.00 Main pot $15.00. Side pot $15.00. | Rake $0"
            const mainSideMatch = summaryLine.match(/Total pot \$([0-9.]+) Main pot \$([0-9.]+)\. Side pot \$([0-9.]+)/);
            if (mainSideMatch) {
              totalPotAmount = parseFloat(mainSideMatch[1]);
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
        site: 'Other', // Ignition is classified as 'Other' for now
        gameType: gameType as 'Hold\'em' | 'Omaha' | 'Stud',
        limit: limit as 'No Limit' | 'Pot Limit' | 'Fixed Limit',
        stakes: `$${smallBlind}/$${bigBlind}`,
        maxPlayers: maxPlayers,
        buttonSeat: parseInt(buttonSeat),
        dealerSeat: parseInt(buttonSeat),
        smallBlind,
        bigBlind,
        gameContext,
        ante: undefined,
        timestamp: parsedDate,
        players,
        antes: anteActions.length > 0 ? anteActions : undefined,
        preflop,
        flop: flopData || undefined,
        turn: turnData || undefined,
        river: riverData || undefined,
        showdown: showdownData || undefined,
        totalPot: totalPotAmount || 0,
        rake: rakeAmount,
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
        error: `Erro no parsing Ignition: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
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
   * Context-aware amount parsing with thousand separators
   * For tournaments: returns chips as integer values
   * For cash games: returns cents as integer values
   */
  private static parseAmountWithContext(rawValue: string, gameContext: GameContext): number {
    if (!rawValue) {
      console.error('ERROR parseAmountWithContext rawValue:', rawValue);
      return 0;
    }

    try {
      // Remove thousand separators (commas) and parse
      const cleanValue = rawValue.replace(/,/g, '');
      const parsed = parseFloat(cleanValue);

      if (isNaN(parsed)) {
        console.error('ERROR parseAmountWithContext rawValue:', rawValue);
        return 0;
      }

      if (gameContext.isTournament) {
        // Tournament: values are already in chips, keep as integer
        return Math.round(parsed);
      } else {
        // Cash game: convert dollars to cents to prevent floating point errors
        return Math.round(parsed * 100);
      }
    } catch (error) {
      console.error('ERROR parseAmountWithContext rawValue:', rawValue, error);
      return 0;
    }
  }

  /**
   * Legacy amount parsing (maintains compatibility)
   * Returns integer cents to prevent floating point arithmetic errors
   */
  private static parseAmount(rawValue: string): number {
    if (!rawValue) {
      console.error('ERROR parseAmount rawValue:', rawValue);
      return 0;
    }

    try {
      // Remove thousand separators (commas) and parse
      const cleanValue = rawValue.replace(/,/g, '');
      const parsed = parseFloat(cleanValue);

      if (isNaN(parsed)) {
        console.error('ERROR parseAmount rawValue:', rawValue);
        return 0;
      }

      // Convert to integer cents to prevent floating point errors
      // Store all monetary values as integer cents internally
      return Math.round(parsed * 100);
    } catch (error) {
      console.error('ERROR parseAmount rawValue:', rawValue, error);
      return 0;
    }
  }

  /**
   * Convert cents to dollars for display
   */
  public static centsToDollars(cents: number): number {
    return cents / 100;
  }

  /**
   * Convert dollars to cents for internal calculations
   */
  public static dollarsToCents(dollars: number): number {
    return Math.round(dollars * 100);
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

      let amount = this.parseAmountWithContext(callMatch[2], gameContext);
      let revealedCards: Card[] | undefined;

      // If all-in, try to extract explicit amount and check for shows
      if (isAllIn) {
        const extractedAmount = this.extractAllInAmount(callMatch[3]);
        if (extractedAmount !== undefined) {
          amount = extractedAmount;
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

      let amount = this.parseAmountWithContext(betMatch[2], gameContext);
      let revealedCards: Card[] | undefined;

      // If all-in, try to extract explicit amount
      if (isAllIn) {
        const extractedAmount = this.extractAllInAmount(betMatch[3]);
        if (extractedAmount !== undefined) {
          amount = extractedAmount;
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

    const raiseMatch = line.match(/^(.+?): raises \$?([0-9,\.]+) to \$?([0-9,\.]+)(.*)$/);
    if (raiseMatch) {
      // Check if it's an all-in
      const isAllIn = this.isAllInAction(raiseMatch[4]);
      let totalBet = this.parseAmountWithContext(raiseMatch[3], gameContext); // Total amount player bets
      const raiseBy = this.parseAmountWithContext(raiseMatch[2], gameContext); // How much they raised by
      let revealedCards: Card[] | undefined;

      // If all-in, try to extract explicit amount
      if (isAllIn) {
        const extractedAmount = this.extractAllInAmount(raiseMatch[4]);
        if (extractedAmount !== undefined) {
          totalBet = extractedAmount;
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
   * NEW: Detect game context (Tournament vs Cash Game)
   * Critical for proper value interpretation
   */
  private static detectGameContext(headerLine: string): GameContext {
    // Tournament detection patterns - capture full tournament name
    const tournamentMatch = headerLine.match(/Tournament #(\d+), (.+?) USD.+Level ([IVXLC]+) \(([0-9]+)\/([0-9]+)\)/);

    if (tournamentMatch) {
      const [, tourneyId, fullTournamentName, level, sb, bb] = tournamentMatch;
      return {
        isTournament: true,
        isHighStakes: false, // Tournaments use chips, not high stakes concept
        currencyUnit: 'chips',
        conversionNeeded: false, // NO conversion needed for tournaments
        buyIn: fullTournamentName, // Use full tournament name like "$10+$1"
        level: `Level ${level}`
      };
    }

    // Cash game detection patterns
    const cashMatch = headerLine.match(/\(\$([0-9.]+)\/\$([0-9.]+).+?\)/);

    if (cashMatch) {
      const [, sb, bb] = cashMatch;
      const smallBlind = parseFloat(sb);
      const bigBlind = parseFloat(bb);

      return {
        isTournament: false,
        isHighStakes: bigBlind >= 100, // $100+ BB is considered high stakes
        currencyUnit: 'dollars',
        conversionNeeded: true // Cash games need dollar-to-cents conversion
      };
    }

    // Default fallback (assume cash game if uncertain)
    console.warn('🚨 Could not detect game context, defaulting to cash game');
    return {
      isTournament: false,
      isHighStakes: false,
      currencyUnit: 'dollars',
      conversionNeeded: true
    };
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
      return this.dollarsToCents(amount);
    }
  }

  /**
   * PUBLIC: Expose value conversion for SnapshotBuilder
   */
  static convertValueWithContext(amount: number, gameContext: GameContext): number {
    return this.convertValue(amount, gameContext);
  }
}