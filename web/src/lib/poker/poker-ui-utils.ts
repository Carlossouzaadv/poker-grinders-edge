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
          { left: '2%', bottom: '32%', transform: 'none' },             // Bottom Left - mais para fora e um pouco mais alto
          { left: '50%', top: '0%', transform: 'translateX(-50%)' },    // Top Center - mais alto
          { right: '2%', bottom: '32%', transform: 'none' }             // Bottom Right - mais para fora e um pouco mais alto
        ];
        return { position: 'absolute' as const, ...pos4[visualSeat - 1] };

      case 5: // 5-max
        const pos5 = [
          { left: '50%', bottom: '0%', transform: 'translateX(-50%)' }, // Hero - mais baixo
          { left: '10%', bottom: '50%', transform: 'none' },            // Bottom Left - bem mais pra baixo (estava dentro da mesa)
          { left: '15%', top: '10%', transform: 'none' },               // Top Left (UTG) - mais alinhado com borda lateral
          { right: '15%', top: '10%', transform: 'none' },              // Top Right (UTG+1) - mais alinhado com borda lateral
          { right: '10%', bottom: '50%', transform: 'none' }            // Bottom Right - bem mais pra baixo (estava dentro da mesa)
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
          { left: '15%', bottom: '35%', transform: 'none' },            // Bottom Left - mais pra baixo (estava dentro da mesa)
          { left: '0%', top: '33%', transform: 'none' },                // Left Mid - descer um pouco
          { left: '18%', top: '8%', transform: 'none' },                // Top Left - mais alto e ao centro
          { left: '50%', top: '0%', transform: 'translateX(-50%)' },    // Top Center - mais alto
          { right: '18%', top: '8%', transform: 'none' },               // Top Right - mais alto e ao centro
          { right: '2%', bottom: '35%', transform: 'none' }             // Bottom Right - um pouco pra fora
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
          { left: '12%', bottom: '18%', transform: 'none' },             // Bottom Left - descer um pouco
          { left: '0%', bottom: '38%', transform: 'none' },              // Left Mid-Low - colocar pra fora
          { left: '8%', top: '8%', transform: 'none' },                  // Left Mid-High - entrar mais e subir
          { left: '30%', top: '2%', transform: 'translateX(-50%)' },     // Top Left - mais perto
          { right: '30%', top: '2%', transform: 'translateX(50%)' },     // Top Right - mais perto
          { right: '8%', top: '8%', transform: 'none' },                 // Right Mid-High - entrar mais e subir
          { right: '0%', bottom: '38%', transform: 'none' },             // Right Mid-Low - colocar pra fora
          { right: '12%', bottom: '18%', transform: 'none' }             // Bottom Right - descer um pouco
        ];
        return { position: 'absolute' as const, ...pos9[visualSeat - 1] };

      case 10: // 10-max
        const pos10 = [
          { left: '50%', bottom: '-2%', transform: 'translateX(-50%)' }, // Hero - mais para fora
          { left: '14%', bottom: '14%', transform: 'none' },             // Bottom Left - descer um pouco
          { left: '2%', bottom: '28%', transform: 'none' },              // Left Mid-Low - colocar pra fora
          { left: '0%', bottom: '48%', transform: 'none' },              // Left Mid - colocar mais pra fora
          { left: '6%', top: '8%', transform: 'none' },                  // Left Mid-High - entrar mais e subir
          { left: '29%', top: '2%', transform: 'translateX(-50%)' },     // Top Left - mais perto
          { right: '29%', top: '2%', transform: 'translateX(50%)' },     // Top Right - mais perto
          { right: '6%', top: '8%', transform: 'none' },                 // Right Mid-High - entrar mais e subir
          { right: '0%', bottom: '48%', transform: 'none' },             // Right Mid - colocar mais pra fora
          { right: '14%', bottom: '14%', transform: 'none' }             // Bottom Right - descer um pouco
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
          { left: '50%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero
          { left: '50%', top: '18%', transform: 'translateX(-50%)' }     // Opponent
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos2[visualSeat - 1] };

      case 3: // 3-max
        const pos3 = [
          { left: '50%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero
          { left: '22%', bottom: '48%', transform: 'translateX(-50%)' }, // Left
          { right: '22%', bottom: '48%', transform: 'translateX(50%)' }  // Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos3[visualSeat - 1] };

      case 8: // 8-max
        const pos8 = [
          { left: '50%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero
          { left: '28%', bottom: '23%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '18%', bottom: '50%', transform: 'translateX(-50%)' }, // Left Mid-Low
          { left: '32%', top: '22%', transform: 'translateX(-50%)' },    // Left Mid-High
          { left: '50%', top: '18%', transform: 'translateX(-50%)' },    // Top Center
          { right: '32%', top: '22%', transform: 'translateX(50%)' },    // Right Mid-High
          { right: '18%', bottom: '50%', transform: 'translateX(50%)' }, // Right Mid-Low
          { right: '28%', bottom: '23%', transform: 'translateX(50%)' }  // Bottom Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos8[visualSeat - 1] };

      case 7: // 7-max
        const pos7 = [
          { left: '50%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero
          { left: '30%', bottom: '33%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '16%', bottom: '43%', transform: 'translateX(-50%)' }, // Left Mid
          { left: '30%', top: '25%', transform: 'translateX(-50%)' },    // Top Left
          { left: '50%', top: '18%', transform: 'translateX(-50%)' },    // Top Center
          { right: '30%', top: '25%', transform: 'translateX(50%)' },    // Top Right
          { right: '25%', bottom: '45%', transform: 'translateX(50%)' }  // Bottom Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos7[visualSeat - 1] };

      case 6: // 6-max
        const pos6 = [
          { left: '50%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero
          { left: '18%', bottom: '42%', transform: 'translateX(-50%)' }, // Bottom Left (SB) - corrigido pra ficar perto do player
          { left: '28%', top: '25%', transform: 'translateX(-50%)' },    // Top Left
          { left: '50%', top: '18%', transform: 'translateX(-50%)' },    // Top Center (BB)
          { right: '28%', top: '25%', transform: 'translateX(50%)' },    // Top Right
          { right: '18%', bottom: '42%', transform: 'translateX(50%)' }  // Bottom Right - corrigido também
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos6[visualSeat - 1] };

      case 5: // 5-max
        const pos5 = [
          { left: '50%', bottom: '18%', transform: 'translateX(-50%)' },
          { left: '25%', bottom: '48%', transform: 'translateX(-50%)' },
          { left: '28%', top: '25%', transform: 'translateX(-50%)' },
          { right: '28%', top: '25%', transform: 'translateX(50%)' },
          { right: '25%', bottom: '48%', transform: 'translateX(50%)' }
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos5[visualSeat - 1] };

      case 4: // 4-max
        const pos4 = [
          { left: '50%', bottom: '18%', transform: 'translateX(-50%)' },
          { left: '22%', bottom: '48%', transform: 'translateX(-50%)' },
          { left: '50%', top: '18%', transform: 'translateX(-50%)' },
          { right: '22%', bottom: '48%', transform: 'translateX(50%)' }
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos4[visualSeat - 1] };

      case 9: // 9-max
        const pos9 = [
          { left: '50%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero
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

      case 10: // 10-max
        const pos10 = [
          { left: '50%', bottom: '18%', transform: 'translateX(-50%)' }, // Hero
          { left: '32%', bottom: '22%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '20%', bottom: '38%', transform: 'translateX(-50%)' }, // Left Mid-Low
          { left: '16%', bottom: '55%', transform: 'translateX(-50%)' }, // Left Mid
          { left: '20%', top: '28%', transform: 'translateX(-50%)' },    // Left Mid-High
          { left: '38%', top: '18%', transform: 'translateX(-50%)' },    // Top Left
          { right: '38%', top: '18%', transform: 'translateX(50%)' },    // Top Right
          { right: '20%', top: '28%', transform: 'translateX(50%)' },    // Right Mid-High
          { right: '16%', bottom: '55%', transform: 'translateX(50%)' }, // Right Mid
          { right: '32%', bottom: '22%', transform: 'translateX(50%)' }  // Bottom Right
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
