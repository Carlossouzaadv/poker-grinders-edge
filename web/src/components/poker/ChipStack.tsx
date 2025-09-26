import React from 'react';
import './ChipStack.css';

interface ChipStackProps {
  valor: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ChipStack: React.FC<ChipStackProps> = ({
  valor,
  size = 'medium',
  showLabel = true
}) => {
  const formatarValor = (valor: number): string => {
    if (valor >= 1000) {
      return `${(valor / 1000).toFixed(1)}K`;
    }
    return valor.toString();
  };

  // Função para determinar qual ficha usar baseado no valor (maior denominação)
  const getChipClass = (valor: number): string => {
    // A ordem aqui é crucial! Do maior para o menor.
    if (valor >= 25000000000) return 'chip-25b';   // 25 Billion
    if (valor >= 1000000000) return 'chip-1b';     // 1 Billion
    if (valor >= 500000000) return 'chip-500m';    // 500 Million
    if (valor >= 100000000) return 'chip-100m';    // 100 Million
    if (valor >= 25000000) return 'chip-25m';      // 25 Million
    if (valor >= 5000000) return 'chip-5m';        // 5 Million
    if (valor >= 1000000) return 'chip-1m';        // 1 Million
    if (valor >= 500000) return 'chip-500k';       // 500k
    if (valor >= 100000) return 'chip-100k';       // 100k
    if (valor >= 25000) return 'chip-25k';         // 25k
    if (valor >= 1000) return 'chip-1k';           // 1k
    if (valor >= 500) return 'chip-500';           // 500
    if (valor >= 100) return 'chip-100';           // 100
    if (valor >= 50) return 'chip-50';             // 50
    if (valor >= 25) return 'chip-25';             // 25
    if (valor >= 5) return 'chip-5';               // 5
    if (valor >= 1) return 'chip-1';               // 1
    return 'chip-1'; // Default
  };

  const chipClass = getChipClass(valor);
  const sizeClass = size === 'small' ? 'chip-small' : size === 'large' ? 'chip-large' : '';
  const labelClass = size === 'small' ? 'money-label-small' : size === 'large' ? 'money-label-large' : '';

  // Get inline styles for small chips - direct approach with fallback
  const getSmallChipStyles = (chipClass: string) => {
    if (size !== 'small') return {};

    // Fallback colors if sprite fails
    const chipColors: Record<string, string> = {
      'chip-1': '#FFFFFF',      // Branca
      'chip-5': '#FF0000',      // Vermelha
      'chip-25': '#228B22',     // Verde
      'chip-50': '#483D8B',     // Azul Escuro
      'chip-100': '#000000',    // Preta
      'chip-500': '#8A2BE2',    // Roxa
      'chip-1k': '#FFD700',     // Amarela
      'chip-5m': '#FF1493',     // Rosa
    };

    const baseStyles = {
      width: '30px',
      height: '27.5px',
      backgroundImage: `url('/assets/images/chips-sprite.png')`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '158px 137.5px', // Ajustado para valor correto do DOM
      backgroundColor: 'transparent', // Fundo transparente para se misturar com o feltro
      border: 'none', // Remove borda branca
      backgroundPosition: 'center',
    };

    // Posições recalculadas para background-size: 158x137.5px
    // Com fichas individuais de ~39.5px width
    const positions: Record<string, string> = {
      // Linha 1: 1, 100, 1B, 25B (Y=0)
      'chip-1': '5px 5px',              // Posição 0,0 - ficha branca $1 - centralizada
      'chip-100': '-34px 5px',          // Posição 1,0 - ficha preta $100 - centralizada
      'chip-1b': '-74px 5px',           // Posição 2,0 - ficha $1B - centralizada
      'chip-25b': '-114px 5px',         // Posição 3,0 - ficha $25B - centralizada

      // Linha 2: 100k, 100M, 1c, 25c (Y=-27.5px)
      'chip-100k': '5px -22.5px',       // Posição 0,1 - ficha $100k - centralizada
      'chip-100m': '-34px -22.5px',     // Posição 1,1 - ficha $100M - centralizada
      'chip-1c': '-74px -22.5px',       // Posição 2,1 - ficha 1c - centralizada
      'chip-25c': '-114px -22.5px',     // Posição 3,1 - ficha 25c - centralizada

      // Linha 3: 1k, 1M, 25, 25k (Y=-55px) - ajustado baseado no sucesso da chip-100
      'chip-1k': '5px -50px',           // Posição 0,2 - ficha $1k - centralizada
      'chip-1m': '-34px -50px',         // Posição 1,2 - ficha $1M - centralizada
      'chip-25': '-74px -50px',         // Posição 2,2 - ficha verde $25 - centralizada
      'chip-25k': '-114px -50px',       // Posição 3,2 - ficha $25k - centralizada

      // Linha 4: 25M, 5, 500, 500k (Y=-82.5px) - ajustado baseado no sucesso da chip-100
      'chip-25m': '5px -77.5px',        // Posição 0,3 - ficha $25M - centralizada
      'chip-5': '-34px -77.5px',        // Posição 1,3 - ficha vermelha $5 - centralizada
      'chip-500': '-74px -77.5px',      // Posição 2,3 - ficha roxa $500 - centralizada
      'chip-500k': '-114px -77.5px',    // Posição 3,3 - ficha $500k - centralizada

      // Linha 5: 5M (Y=-110px)
      'chip-5m': '5px -105px',          // Posição 0,4 - ficha $5M - centralizada

      // Fallbacks
      'chip-50': '-114px -22.5px',      // Using 25c as substitute for $50 - centralizada
      'chip-500m': '-74px -77.5px',     // Using 500 as substitute for $500M - centralizada
    };

    const position = positions[chipClass] || '0px 0px';

    return {
      ...baseStyles,
      backgroundPosition: position,
    };
  };

  const inlineStyles = getSmallChipStyles(chipClass);

  // Renderização especial para ficha de 50 (duas fichas de 25 empilhadas)
  if (valor === 50) {
    return (
      <div className="chip-stack-container">
        <div className="relative">
          {/* Ficha de 25 de baixo */}
          <div
            className={size === 'small' ? 'chip' : `chip chip-25 ${sizeClass}`}
            style={size === 'small' ? getSmallChipStyles('chip-25') : {}}
            title={`Aposta de $${valor}`}
          />
          {/* Ficha de 25 de cima - empilhada */}
          <div
            className={size === 'small' ? 'chip' : `chip chip-25 ${sizeClass}`}
            style={{
              ...(size === 'small' ? getSmallChipStyles('chip-25') : {}),
              position: 'absolute',
              top: size === 'small' ? '-2px' : '-5px',
              left: size === 'small' ? '0px' : '3px', // Centraliza melhor
              zIndex: 1
            }}
            title={`Aposta de $${valor}`}
          />
        </div>
        {showLabel && (
          <div className={`money-label ${labelClass}`}>
            ${valor}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="chip-stack-container">
      <div
        className={size === 'small' ? 'chip' : `chip ${chipClass} ${sizeClass}`}
        style={inlineStyles}
        title={`Aposta de $${valor}`}
      />
      {showLabel && (
        <div className={`money-label ${labelClass}`}>
          ${valor}
        </div>
      )}
    </div>
  );
};

export default ChipStack;