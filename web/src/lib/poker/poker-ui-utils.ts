import { CSSProperties } from 'react';

/**
 * POKER UI UTILITIES
 *
 * Funções puras para calcular posicionamentos de UI de elementos de poker.
 * Estas funções devem receber visualSeat e maxPlayers e retornar estilos CSS.
 */

export class PokerUIUtils {
  /**
   * Calcula a posição visual de um jogador na mesa
   * @param visualSeat - Assento visual do jogador (1-indexed)
   * @param maxPlayers - Número máximo de jogadores na mesa
   * @returns Objeto com propriedades CSS para posicionamento
   */
  static getPlayerPosition(visualSeat: number, maxPlayers: number): CSSProperties {
    // Layouts otimizados para diferentes números de jogadores
    // Hero sempre na posição visual 1 (bottom center)

    switch (maxPlayers) {
      case 2: // Heads-up
        const pos2 = [
          { left: '50%', bottom: '0%', transform: 'translateX(-50%)' }, // Hero - mais baixo
          { left: '50%', top: '0%', transform: 'translateX(-50%)' }    // Oponente - mais alto
        ];
        return { position: 'absolute' as const, ...pos2[visualSeat - 1] };

      case 3: // 3-max
        const pos3 = [
          { left: '50%', bottom: '0%', transform: 'translateX(-50%)' }, // Hero - mais baixo
          { left: '2%', top: '35%', transform: 'none' },                // Left - mais para fora ainda
          { right: '2%', top: '35%', transform: 'none' }                // Right - mais para fora ainda
        ];
        return { position: 'absolute' as const, ...pos3[visualSeat - 1] };

      case 4: // 4-max
        const pos4 = [
          { left: '50%', bottom: '0%', transform: 'translateX(-50%)' }, // Hero - mais baixo
          { left: '0%', bottom: '40%', transform: 'none' },             // Player 2 - base no player 3 do 8-max (perfeito)
          { left: '50%', top: '0%', transform: 'translateX(-50%)' },    // Top Center - mais alto
          { right: '0%', bottom: '40%', transform: 'none' }             // Player 4 - base no player 7 do 8-max (perfeito)
        ];
        return { position: 'absolute' as const, ...pos4[visualSeat - 1] };

      case 5: // 5-max
        const pos5 = [
          { left: '50%', bottom: '0%', transform: 'translateX(-50%)' }, // Hero - mais baixo
          { left: '10%', top: '65%', transform: 'none' },               // Bottom Left - bem mais pra baixo na borda
          { left: '15%', top: '10%', transform: 'none' },               // Top Left (UTG) - mais alinhado com borda lateral
          { right: '15%', top: '10%', transform: 'none' },              // Top Right (UTG+1) - mais alinhado com borda lateral
          { right: '10%', top: '65%', transform: 'none' }               // Bottom Right - bem mais pra baixo na borda
        ];
        return { position: 'absolute' as const, ...pos5[visualSeat - 1] };

      case 6: // 6-max (padrão)
        const pos6 = [
          { left: '50%', bottom: '0%', transform: 'translateX(-50%)' }, // Hero (visual 1) - mais baixo
          { left: '6%', top: '60%', transform: 'none' },                // Visual 2 (Bottom Left) - mais para fora
          { left: '15%', top: '10%', transform: 'none' },               // Visual 3 (Top Left) - mais ao centro
          { left: '50%', top: '0%', transform: 'translateX(-50%)' },    // Visual 4 (Top Center) - mais alto
          { right: '15%', top: '10%', transform: 'none' },              // Visual 5 (Top Right) - mais ao centro
          { right: '6%', top: '60%', transform: 'none' }                // Visual 6 (Bottom Right) - mais para fora
        ];
        return { position: 'absolute' as const, ...pos6[visualSeat - 1] };

      case 7: // 7-max
        const pos7 = [
          { left: '50%', bottom: '0%', transform: 'translateX(-50%)' }, // Hero - mais baixo
          { left: '15%', top: '65%', transform: 'none' },               // Player 2 - Bottom Left
          { left: '0%', bottom: '40%', transform: 'none' },             // Player 3 - base no player 3 do 8-max (perfeito)
          { left: '18%', top: '8%', transform: 'none' },                // Player 4 - Top Left
          { left: '50%', top: '0%', transform: 'translateX(-50%)' },    // Player 5 - Top Center
          { right: '18%', top: '8%', transform: 'none' },               // Player 6 - Top Right
          { right: '0%', bottom: '40%', transform: 'none' }             // Player 7 - base no player 7 do 8-max (perfeito)
        ];
        return { position: 'absolute' as const, ...pos7[visualSeat - 1] };

      case 8: // 8-max
        const pos8 = [
          { left: '50%', bottom: '-2%', transform: 'translateX(-50%)' }, // Hero - mais para fora
          { left: '12%', bottom: '12%', transform: 'none' },             // Bottom Left - mais para fora
          { left: '0%', bottom: '40%', transform: 'none' },              // Left Mid-Low - mais para fora
          { left: '18%', top: '5%', transform: 'none' },                 // Left Mid-High - mais para fora
          { left: '50%', top: '-2%', transform: 'translateX(-50%)' },    // Top Center - mais para fora
          { right: '18%', top: '5%', transform: 'none' },                // Right Mid-High - mais para fora
          { right: '0%', bottom: '40%', transform: 'none' },             // Right Mid-Low - mais para fora
          { right: '12%', bottom: '12%', transform: 'none' }             // Bottom Right - mais para fora
        ];
        return { position: 'absolute' as const, ...pos8[visualSeat - 1] };

      case 9: // 9-max (full ring)
        const pos9 = [
          { left: '50%', bottom: '-2%', transform: 'translateX(-50%)' }, // Hero - mais para fora
          { left: '18%', bottom: '8%', transform: 'none' },              // Player 2 - base no player 2 do 10-max
          { left: '0%', bottom: '38%', transform: 'none' },              // Player 3 (Left Mid-Low) - colocar pra fora
          { left: '12%', top: '8%', transform: 'none' },                 // Player 4 - aproximar mais
          { left: '38%', top: '2%', transform: 'translateX(-50%)' },     // Player 5 - MAIS perto entre si
          { right: '38%', top: '2%', transform: 'translateX(50%)' },     // Player 6 - MAIS perto entre si
          { right: '12%', top: '8%', transform: 'none' },                // Player 7 - aproximar mais
          { right: '0%', bottom: '38%', transform: 'none' },             // Player 8 (Right Mid-Low) - colocar pra fora
          { right: '18%', bottom: '8%', transform: 'none' }              // Player 9 - base no player 10 do 10-max
        ];
        return { position: 'absolute' as const, ...pos9[visualSeat - 1] };

      case 10: // 10-max (distribuição simétrica e equidistante)
        const pos10 = [
          { left: '50%', bottom: '-2%', transform: 'translateX(-50%)' }, // Player 1 (Hero) - bottom center
          { left: '22%', bottom: '8%', transform: 'none' },              // Player 2 - espelhado do P10 (mesma distância do hero)
          { left: '5%', bottom: '23%', transform: 'none' },              // Player 3 - espelhado do P9 (perfeito)
          { left: '7%', top: '18%', transform: 'none' },                 // Player 4 - MEIO entre P3 e P5
          { left: '25%', top: '5%', transform: 'none' },                 // Player 5 - MAIS perto do P6
          { left: '50%', top: '-2%', transform: 'translateX(-50%)' },    // Player 6 - top center (espelhado do Hero)
          { right: '25%', top: '5%', transform: 'none' },                // Player 7 - MAIS perto do P6 (espelhado do P5)
          { right: '7%', top: '18%', transform: 'none' },                // Player 8 - MEIO entre P9 e P7 (espelhado do P4)
          { right: '5%', bottom: '23%', transform: 'none' },             // Player 9 - perfeito
          { right: '22%', bottom: '8%', transform: 'none' }              // Player 10 - perfeito
        ];
        return { position: 'absolute' as const, ...pos10[visualSeat - 1] };

      default: // Fallback para mesas com mais de 10 jogadores (raro)
        const angle = ((visualSeat - 1) / maxPlayers) * 2 * Math.PI - Math.PI / 2;
        const radiusX = 42;
        const radiusY = 28;
        const x = 50 + radiusX * Math.cos(angle);
        const y = 50 + radiusY * Math.sin(angle);
        return {
          position: 'absolute' as const,
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
        };
    }
  }

  /**
   * Calcula a posição da área de ação (apostas) para um jogador
   * @param visualSeat - Assento visual do jogador (1-indexed)
   * @param maxPlayers - Número máximo de jogadores na mesa
   * @returns Objeto com propriedades CSS para posicionamento
   */
  static getActionAreaPosition(visualSeat: number, maxPlayers: number): CSSProperties {
    // Posições específicas para cada asiento visual para evitar sobreposição
    switch (maxPlayers) {
      case 2: // Heads-up
        const pos2 = [
          { left: '55%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero - mais pra direita
          { left: '45%', top: '18%', transform: 'translateX(-50%)' }     // Opponent - mais pra esquerda
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos2[visualSeat - 1] };

      case 3: // 3-max
        const pos3 = [
          { left: '55%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero - mais pra direita
          { left: '22%', bottom: '48%', transform: 'translateX(-50%)' }, // Left
          { right: '22%', bottom: '48%', transform: 'translateX(50%)' }  // Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos3[visualSeat - 1] };

      case 8: // 8-max
        const pos8 = [
          { left: '55%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero - mais pra direita
          { left: '28%', bottom: '23%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '18%', bottom: '50%', transform: 'translateX(-50%)' }, // Left Mid-Low
          { left: '32%', top: '22%', transform: 'translateX(-50%)' },    // Left Mid-High
          { left: '45%', top: '18%', transform: 'translateX(-50%)' },    // Top Center - mais pra esquerda
          { right: '32%', top: '22%', transform: 'translateX(50%)' },    // Right Mid-High
          { right: '18%', bottom: '50%', transform: 'translateX(50%)' }, // Right Mid-Low
          { right: '28%', bottom: '23%', transform: 'translateX(50%)' }  // Bottom Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos8[visualSeat - 1] };

      case 7: // 7-max
        const pos7 = [
          { left: '55%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero - mais pra direita
          { left: '30%', bottom: '33%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '16%', bottom: '43%', transform: 'translateX(-50%)' }, // Left Mid
          { left: '30%', top: '25%', transform: 'translateX(-50%)' },    // Top Left
          { left: '45%', top: '18%', transform: 'translateX(-50%)' },    // Top Center - mais pra esquerda
          { right: '30%', top: '25%', transform: 'translateX(50%)' },    // Top Right
          { right: '25%', bottom: '45%', transform: 'translateX(50%)' }  // Bottom Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos7[visualSeat - 1] };

      case 6: // 6-max
        const pos6 = [
          { left: '55%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero - mais pra direita
          { left: '18%', bottom: '42%', transform: 'translateX(-50%)' }, // Bottom Left (SB) - corrigido pra ficar perto do player
          { left: '28%', top: '25%', transform: 'translateX(-50%)' },    // Top Left
          { left: '45%', top: '18%', transform: 'translateX(-50%)' },    // Top Center (BB) - mais pra esquerda
          { right: '28%', top: '25%', transform: 'translateX(50%)' },    // Top Right
          { right: '18%', bottom: '42%', transform: 'translateX(50%)' }  // Bottom Right - corrigido também
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos6[visualSeat - 1] };

      case 5: // 5-max
        const pos5 = [
          { left: '55%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero - mais pra direita
          { left: '22%', top: '68%', transform: 'translateX(-50%)' },    // SB - descer as fichas (usar top pra descer)
          { left: '28%', top: '25%', transform: 'translateX(-50%)' },
          { right: '28%', top: '25%', transform: 'translateX(50%)' },
          { right: '25%', bottom: '48%', transform: 'translateX(50%)' }
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos5[visualSeat - 1] };

      case 4: // 4-max
        const pos4 = [
          { left: '55%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero - mais pra direita
          { left: '22%', bottom: '48%', transform: 'translateX(-50%)' },
          { left: '45%', top: '18%', transform: 'translateX(-50%)' },    // Top Center - mais pra esquerda
          { right: '22%', bottom: '48%', transform: 'translateX(50%)' }
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos4[visualSeat - 1] };

      case 9: // 9-max
        const pos9 = [
          { left: '55%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero - mais pra direita
          { left: '28%', bottom: '25%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '18%', bottom: '50%', transform: 'translateX(-50%)' }, // Left Mid-Low
          { left: '20%', top: '28%', transform: 'translateX(-50%)' },    // Left Mid-High
          { left: '40%', top: '18%', transform: 'translateX(-50%)' },    // Top Left
          { right: '40%', top: '18%', transform: 'translateX(50%)' },    // Top Right
          { right: '20%', top: '28%', transform: 'translateX(50%)' },    // Right Mid-High
          { right: '18%', bottom: '50%', transform: 'translateX(50%)' }, // Right Mid-Low
          { right: '28%', bottom: '25%', transform: 'translateX(50%)' }  // Bottom Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos9[visualSeat - 1] };

      case 10: // 10-max (distribuição simétrica e equidistante)
        const pos10 = [
          { left: '55%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero - mais pra direita
          { left: '32%', bottom: '22%', transform: 'translateX(-50%)' }, // Player 2 - espelhado do P10 (mesma distância do hero)
          { left: '20%', bottom: '38%', transform: 'translateX(-50%)' }, // Player 3 - espelhado do P9 (perfeito)
          { left: '16%', bottom: '55%', transform: 'translateX(-50%)' }, // Player 4 - MEIO entre P3 e P5
          { left: '20%', top: '28%', transform: 'translateX(-50%)' },    // Player 5 - MAIS perto do P6
          { left: '38%', top: '18%', transform: 'translateX(-50%)' },    // Player 6 - top center (espelhado do Hero)
          { right: '38%', top: '18%', transform: 'translateX(50%)' },    // Player 7 - MAIS perto do P6 (espelhado do P5)
          { right: '20%', top: '28%', transform: 'translateX(50%)' },    // Player 8 - MEIO entre P9 e P7 (espelhado do P4)
          { right: '16%', bottom: '55%', transform: 'translateX(50%)' }, // Player 9 - perfeito
          { right: '32%', bottom: '22%', transform: 'translateX(50%)' }  // Player 10 - perfeito
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos10[visualSeat - 1] };

      default:
        // Fallback para outros números
        const angle = ((visualSeat - 1) / maxPlayers) * 2 * Math.PI - Math.PI / 2;
        const radiusX = 22;
        const radiusY = 16;
        const x = 50 + radiusX * Math.cos(angle);
        const y = 50 + radiusY * Math.sin(angle);
        return {
          position: 'absolute' as const,
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 25
        };
    }
  }

  /**
   * Calcula a posição do botão do dealer
   * @param visualSeat - Assento visual do jogador com o botão (1-indexed)
   * @param maxPlayers - Número máximo de jogadores na mesa
   * @returns Objeto com propriedades CSS para posicionamento
   */
  static getDealerButtonPosition(visualSeat: number, maxPlayers: number): CSSProperties {
    // Botão posicionado relativo ao jogador (offset padrão)
    return {
      position: 'absolute' as const,
      left: '85%',
      top: '15%',
      zIndex: 40
    };
  }

  /**
   * Calcula os assentos visuais hero-cêntricos
   * @param heroSeat - Assento original do hero na mesa
   * @param maxPlayers - Número máximo de jogadores na mesa
   * @returns Map com mapeamento de seat original -> visual seat
   */
  static calculateVisualSeats(heroSeat: number, maxPlayers: number): Map<number, number> {
    const visualSeats = new Map<number, number>();
    const offset = heroSeat - 1;

    for (let seat = 1; seat <= maxPlayers; seat++) {
      let visualSeat = seat - offset;
      if (visualSeat <= 0) {
        visualSeat += maxPlayers;
      }
      visualSeats.set(seat, visualSeat);
    }

    return visualSeats;
  }
}
