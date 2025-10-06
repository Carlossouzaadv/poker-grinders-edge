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
          { left: '50%', bottom: '5%', transform: 'translateX(-50%)' }, // Hero
          { left: '50%', top: '5%', transform: 'translateX(-50%)' }    // Oponente
        ];
        return { position: 'absolute' as const, ...pos2[visualSeat - 1] };

      case 3: // 3-max
        const pos3 = [
          { left: '50%', bottom: '5%', transform: 'translateX(-50%)' }, // Hero
          { left: '15%', top: '35%', transform: 'none' },               // Left
          { right: '15%', top: '35%', transform: 'none' }               // Right
        ];
        return { position: 'absolute' as const, ...pos3[visualSeat - 1] };

      case 4: // 4-max
        const pos4 = [
          { left: '50%', bottom: '5%', transform: 'translateX(-50%)' }, // Hero
          { left: '12%', bottom: '35%', transform: 'none' },            // Bottom Left
          { left: '50%', top: '5%', transform: 'translateX(-50%)' },    // Top Center
          { right: '12%', bottom: '35%', transform: 'none' }            // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos4[visualSeat - 1] };

      case 5: // 5-max
        const pos5 = [
          { left: '50%', bottom: '5%', transform: 'translateX(-50%)' }, // Hero
          { left: '12%', bottom: '35%', transform: 'none' },            // Bottom Left
          { left: '12%', top: '35%', transform: 'none' },               // Top Left
          { right: '12%', top: '35%', transform: 'none' },              // Top Right
          { right: '12%', bottom: '35%', transform: 'none' }            // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos5[visualSeat - 1] };

      case 6: // 6-max (padrão)
        const pos6 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero (visual 1)
          { left: '9%', top: '60%', transform: 'none' },                // Visual 2 (Bottom Left) - LATERAL INFERIOR
          { left: '9%', top: '10%', transform: 'none' },                // Visual 3 (Top Left) - LATERAL SUPERIOR
          { left: '50%', top: '3%', transform: 'translateX(-50%)' },    // Visual 4 (Top Center)
          { right: '9%', top: '10%', transform: 'none' },               // Visual 5 (Top Right) - LATERAL SUPERIOR
          { right: '9%', top: '60%', transform: 'none' }                // Visual 6 (Bottom Right) - LATERAL INFERIOR
        ];
        return { position: 'absolute' as const, ...pos6[visualSeat - 1] };

      case 7: // 7-max
        const pos7 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero
          { left: '8%', bottom: '25%', transform: 'none' },             // Bottom Left
          { left: '8%', top: '45%', transform: 'none' },                // Left Mid
          { left: '8%', top: '18%', transform: 'none' },                // Top Left
          { left: '50%', top: '3%', transform: 'translateX(-50%)' },    // Top Center
          { right: '8%', top: '18%', transform: 'none' },               // Top Right
          { right: '8%', bottom: '25%', transform: 'none' }             // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos7[visualSeat - 1] };

      case 8: // 8-max
        const pos8 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero
          { left: '15%', bottom: '15%', transform: 'none' },            // Bottom Left
          { left: '3%', bottom: '42%', transform: 'none' },             // Left Mid-Low
          { left: '20%', top: '8%', transform: 'none' },                // Left Mid-High
          { left: '50%', top: '3%', transform: 'translateX(-50%)' },    // Top Center
          { right: '20%', top: '8%', transform: 'none' },               // Right Mid-High
          { right: '3%', bottom: '42%', transform: 'none' },            // Right Mid-Low
          { right: '15%', bottom: '15%', transform: 'none' }            // Bottom Right
        ];
        return { position: 'absolute' as const, ...pos8[visualSeat - 1] };

      case 9: // 9-max (full ring)
        const pos9 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero
          { left: '8%', bottom: '22%', transform: 'none' },             // Bottom Left - AJUSTADO
          { left: '8%', bottom: '45%', transform: 'none' },             // Left Mid-Low - MAIOR espaçamento
          { left: '8%', top: '28%', transform: 'none' },                // Left Mid-High - MAIOR espaçamento
          { left: '25%', top: '3%', transform: 'translateX(-50%)' },    // Top Left
          { right: '25%', top: '3%', transform: 'translateX(50%)' },    // Top Right
          { right: '8%', top: '28%', transform: 'none' },               // Right Mid-High - MAIOR espaçamento
          { right: '8%', bottom: '45%', transform: 'none' },            // Right Mid-Low - MAIOR espaçamento
          { right: '8%', bottom: '22%', transform: 'none' }             // Bottom Right - AJUSTADO
        ];
        return { position: 'absolute' as const, ...pos9[visualSeat - 1] };

      case 10: // 10-max
        const pos10 = [
          { left: '50%', bottom: '3%', transform: 'translateX(-50%)' }, // Hero
          { left: '8%', bottom: '20%', transform: 'none' },             // Bottom Left - AJUSTADO
          { left: '8%', bottom: '38%', transform: 'none' },             // Left Mid-Low - MAIOR espaçamento
          { left: '8%', bottom: '56%', transform: 'none' },             // Left Mid - MAIOR espaçamento
          { left: '8%', top: '25%', transform: 'none' },                // Left Mid-High - MAIOR espaçamento
          { left: '25%', top: '3%', transform: 'translateX(-50%)' },    // Top Left
          { right: '25%', top: '3%', transform: 'translateX(50%)' },    // Top Right
          { right: '8%', top: '25%', transform: 'none' },               // Right Mid-High - MAIOR espaçamento
          { right: '8%', bottom: '56%', transform: 'none' },            // Right Mid - MAIOR espaçamento
          { right: '8%', bottom: '20%', transform: 'none' }             // Bottom Right - AJUSTADO
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
