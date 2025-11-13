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
          { left: '5%', top: '35%', transform: 'none' },                // Left - mais para fora
          { right: '5%', top: '35%', transform: 'none' }                // Right - mais para fora
        ];
        return { position: 'absolute' as const, ...pos3[visualSeat - 1] };

      case 4: // 4-max
        const pos4 = [
          { left: '50%', bottom: '0%', transform: 'translateX(-50%)' }, // Hero - mais baixo
          { left: '5%', bottom: '35%', transform: 'none' },             // Bottom Left - mais para fora
          { left: '50%', top: '0%', transform: 'translateX(-50%)' },    // Top Center - mais alto
          { right: '5%', bottom: '35%', transform: 'none' }             // Bottom Right - mais para fora
        ];
        return { position: 'absolute' as const, ...pos4[visualSeat - 1] };

      case 5: // 5-max
        const pos5 = [
          { left: '50%', bottom: '0%', transform: 'translateX(-50%)' }, // Hero - mais baixo
          { left: '5%', bottom: '35%', transform: 'none' },             // Bottom Left - mais para fora
          { left: '18%', top: '15%', transform: 'none' },               // Top Left - mais ao meio e mais alto
          { right: '18%', top: '15%', transform: 'none' },              // Top Right - mais ao meio e mais alto
          { right: '5%', bottom: '35%', transform: 'none' }             // Bottom Right - mais para fora
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
          { left: '5%', bottom: '20%', transform: 'none' },             // Bottom Left - mais para fora e separado
          { left: '5%', top: '50%', transform: 'none' },                // Left Mid - separado do player 2
          { left: '18%', top: '8%', transform: 'none' },                // Top Left - mais alto e ao centro
          { left: '50%', top: '0%', transform: 'translateX(-50%)' },    // Top Center - mais alto
          { right: '18%', top: '8%', transform: 'none' },               // Top Right - mais alto e ao centro
          { right: '5%', bottom: '35%', transform: 'none' }             // Bottom Right - mais baixo e ao meio
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
          { left: '5%', bottom: '18%', transform: 'none' },              // Bottom Left - separado
          { left: '0%', bottom: '40%', transform: 'none' },              // Left Mid-Low - mais espaço
          { left: '5%', top: '22%', transform: 'none' },                 // Left Mid-High - mais espaço
          { left: '25%', top: '-2%', transform: 'translateX(-50%)' },    // Top Left - mais alto
          { right: '25%', top: '-2%', transform: 'translateX(50%)' },    // Top Right - mais alto
          { right: '5%', top: '22%', transform: 'none' },                // Right Mid-High - mais espaço
          { right: '0%', bottom: '40%', transform: 'none' },             // Right Mid-Low - mais espaço
          { right: '5%', bottom: '18%', transform: 'none' }              // Bottom Right - separado
        ];
        return { position: 'absolute' as const, ...pos9[visualSeat - 1] };

      case 10: // 10-max
        const pos10 = [
          { left: '50%', bottom: '-2%', transform: 'translateX(-50%)' }, // Hero - mais para fora
          { left: '5%', bottom: '15%', transform: 'none' },              // Bottom Left - bem separado
          { left: '2%', bottom: '32%', transform: 'none' },              // Left Mid-Low - espaço adequado
          { left: '0%', bottom: '50%', transform: 'none' },              // Left Mid - mais separado
          { left: '5%', top: '20%', transform: 'none' },                 // Left Mid-High - mais espaço
          { left: '25%', top: '-2%', transform: 'translateX(-50%)' },    // Top Left - mais alto
          { right: '25%', top: '-2%', transform: 'translateX(50%)' },    // Top Right - mais alto
          { right: '5%', top: '20%', transform: 'none' },                // Right Mid-High - mais espaço
          { right: '0%', bottom: '50%', transform: 'none' },             // Right Mid - mais separado
          { right: '5%', bottom: '15%', transform: 'none' }              // Bottom Right - bem separado
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
      case 8: // 8-max
        const pos8 = [
          { left: '50%', bottom: '25%', transform: 'translateX(-50%)' }, // Hero
          { left: '28%', bottom: '30%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '18%', bottom: '45%', transform: 'translateX(-50%)' }, // Left Mid-Low
          { left: '34%', top: '25%', transform: 'translateX(-50%)' },    // Left Mid-High
          { left: '50%', top: '25%', transform: 'translateX(-50%)' },    // Top Center
          { right: '34%', top: '25%', transform: 'translateX(50%)' },    // Right Mid-High
          { right: '18%', bottom: '45%', transform: 'translateX(50%)' }, // Right Mid-Low
          { right: '28%', bottom: '30%', transform: 'translateX(50%)' }  // Bottom Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos8[visualSeat - 1] };

      case 7: // 7-max
        const pos7 = [
          { left: '50%', bottom: '23%', transform: 'translateX(-50%)' }, // Hero
          { left: '28%', bottom: '35%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '23%', bottom: '52%', transform: 'translateX(-50%)' }, // Left Mid
          { left: '30%', top: '30%', transform: 'translateX(-50%)' },    // Top Left
          { left: '50%', top: '25%', transform: 'translateX(-50%)' },    // Top Center
          { right: '30%', top: '30%', transform: 'translateX(50%)' },    // Top Right
          { right: '28%', bottom: '35%', transform: 'translateX(50%)' }  // Bottom Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos7[visualSeat - 1] };

      case 6: // 6-max
        const pos6 = [
          { left: '50%', bottom: '25%', transform: 'translateX(-50%)' }, // Hero
          { left: '25%', bottom: '40%', transform: 'translateX(-50%)' }, // Bottom Left
          { left: '25%', top: '40%', transform: 'translateX(-50%)' },    // Top Left
          { left: '50%', top: '25%', transform: 'translateX(-50%)' },    // Top Center
          { right: '25%', top: '40%', transform: 'translateX(50%)' },    // Top Right
          { right: '25%', bottom: '40%', transform: 'translateX(50%)' }  // Bottom Right
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos6[visualSeat - 1] };

      case 5: // 5-max
        const pos5 = [
          { left: '50%', bottom: '25%', transform: 'translateX(-50%)' },
          { left: '25%', bottom: '40%', transform: 'translateX(-50%)' },
          { left: '20%', top: '35%', transform: 'translateX(-50%)' },
          { right: '20%', top: '35%', transform: 'translateX(50%)' },
          { right: '25%', bottom: '40%', transform: 'translateX(50%)' }
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos5[visualSeat - 1] };

      case 4: // 4-max
        const pos4 = [
          { left: '50%', bottom: '25%', transform: 'translateX(-50%)' },
          { left: '25%', bottom: '50%', transform: 'translateX(-50%)' },
          { left: '50%', top: '25%', transform: 'translateX(-50%)' },
          { right: '25%', bottom: '50%', transform: 'translateX(50%)' }
        ];
        return { position: 'absolute' as const, zIndex: 25, ...pos4[visualSeat - 1] };

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
