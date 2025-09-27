import { HandHistory, ParseResult, Card, Action, Player, Position } from '@/types/poker';

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
        default:
          return {
            success: false,
            error: 'Site não suportado ou formato inválido'
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
    // Procurar por múltiplas ocorrências de headers de mãos
    const pokerStarsMatches = (handText.match(/PokerStars (?:Hand|Game) #\d+/g) || []).length;
    const ggPokerMatches = (handText.match(/Game ID:/g) || []).length;

    const totalHands = pokerStarsMatches + ggPokerMatches;

    if (totalHands === 0) {
      return {
        isValid: false,
        error: 'Formato de hand history não reconhecido. Verifique se você copiou corretamente do PokerStars ou GGPoker.'
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
    if (handText.includes('PokerStars Hand #') || handText.includes('PokerStars Game #')) {
      return 'PokerStars';
    }
    if (handText.includes('Game ID:') && handText.includes('Natural8')) {
      return 'GGPoker';
    }
    return 'Unknown';
  }

  private static parsePokerStars(handText: string): ParseResult {
    const lines = handText.trim().split('\n').map(line => line.trim());
    const warnings: string[] = [];

    try {
      // Linha 1: Header com ID da mão - regex mais específica para torneios
      let headerMatch = lines[0].match(/PokerStars (?:Hand|Game) #(\d+):\s*Tournament #\d+, .+? USD (Hold'em|Omaha|Stud)\s+(No Limit|Pot Limit|Fixed Limit) - Level .+ \(([0-9.]+)\/([0-9.]+)\) - (.+)/);

      let handId: string, gameType: string, limit: string, stakes: string, smallBlind: number, bigBlind: number;

      if (headerMatch) {
        // É um torneio
        [, handId, gameType, limit] = headerMatch;
        smallBlind = parseFloat(headerMatch[4]);
        bigBlind = parseFloat(headerMatch[5]);
        stakes = `${smallBlind}/${bigBlind}`;
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

      // Pular linha "*** HOLE CARDS ***"
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

        const action = this.parseAction(line);
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
      let flopData = null;
      let turnData = null;
      let riverData = null;
      let showdownData = null;
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
            const action = this.parseAction(lines[currentLine]);
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
            const action = this.parseAction(lines[currentLine]);
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
            const action = this.parseAction(lines[currentLine]);
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
        stakes: `$${smallBlind}/$${bigBlind}`,
        maxPlayers: parseInt(maxPlayers),
        buttonSeat: parseInt(buttonSeat),
        dealerSeat: parseInt(buttonSeat),
        smallBlind,
        bigBlind,
        ante: anteAmount > 0 ? anteAmount : undefined, // Include ante if present
        timestamp: parsedDate,
        players,
        antes: anteActions.length > 0 ? anteActions : undefined, // Include ante actions
        preflop,
        flop: flopData,
        turn: turnData,
        river: riverData,
        showdown: showdownData,
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
    // Implementação básica para GGPoker - pode ser expandida depois
    return {
      success: false,
      error: 'Parser GGPoker ainda não implementado'
    };
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

  // Patterns para detectar all-in em diferentes formatos
  private static ALL_IN_PATTERNS = [
    /and\s+is\s+all-?in/i,
    /is\s+all-?in\s*\(\$?[\d,\.]+\)/i,
    /is\s+all-?in$/i,
    /\(all-?in\)/i
  ];

  private static isAllInAction(text: string): boolean {
    return this.ALL_IN_PATTERNS.some(pattern => pattern.test(text));
  }

  private static parseAction(line: string): Action | null {
    // Parse de ações: "PlayerName: folds", "PlayerName: calls $X", etc.
    const foldMatch = line.match(/^(.+?): folds/);
    if (foldMatch) {
      return { player: foldMatch[1], action: 'fold' };
    }

    const callMatch = line.match(/^(.+?): calls \$?([0-9.]+)(.*)$/);
    if (callMatch) {
      // Check if it's an all-in call
      const isAllIn = this.isAllInAction(callMatch[3]);

      return {
        player: callMatch[1],
        action: isAllIn ? 'all-in' : 'call',
        amount: parseFloat(callMatch[2])
      };
    }

    const betMatch = line.match(/^(.+?): bets \$?([0-9.]+)(.*)$/);
    if (betMatch) {
      // Check if it's an all-in
      const isAllIn = this.isAllInAction(betMatch[3]);

      return {
        player: betMatch[1],
        action: isAllIn ? 'all-in' : 'bet',
        amount: parseFloat(betMatch[2])
      };
    }

    const raiseMatch = line.match(/^(.+?): raises \$?([0-9.]+) to \$?([0-9.]+)(.*)$/);
    if (raiseMatch) {
      // Check if it's an all-in
      const isAllIn = this.isAllInAction(raiseMatch[4]);
      const totalBet = parseFloat(raiseMatch[3]); // Total amount player bets

      return {
        player: raiseMatch[1],
        action: isAllIn ? 'all-in' : 'raise',
        amount: totalBet, // Total amount added to pot
        raiseBy: parseFloat(raiseMatch[2]), // How much they raised by (for display)
        totalBet: totalBet // Store total bet for reference
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
}