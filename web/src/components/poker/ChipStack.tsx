import React from 'react';
import './ChipStack.css';

interface ChipStackProps {
  valor: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  enableRealisticStacking?: boolean; // Nova prop para empilhamento realista
}

const ChipStack: React.FC<ChipStackProps> = React.memo(({
  valor,
  size = 'medium',
  showLabel = true,
  enableRealisticStacking = false
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

  // Otimized chip positioning system inspired by PokerStars professional standards
  const getSmallChipStyles = (chipClass: string) => {
    if (size !== 'small') return {};

    // Professional chip dimensions with precise positioning
    const baseStyles = {
      width: '30px',
      height: '27.5px',
      backgroundImage: `url('/assets/images/chips-sprite.png')`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '150px 137.5px',
      backgroundColor: 'transparent',
      border: 'none',
      boxSizing: 'border-box' as const,
      // Ensure crisp rendering
      imageRendering: 'crisp-edges' as const,
    };

    // Scaled positions for small chips (150px × 137.5px sprite)
    // Proportionally scaled from medium (240px × 220px) by factor of 0.625
    const positions: Record<string, string> = {
      // Row 1 (Y = 0px scaled)
      'chip-1': '-1.25px 1.25px',           // White $1
      'chip-100': '-25.625px 1.25px',       // Black $100
      'chip-1b': '-50.625px 1.25px',        // $1B
      'chip-25b': '-75.625px 1.25px',       // $25B

      // Row 2 (Y = -25.5px * 0.625 = -15.9375px)
      'chip-100k': '-1.25px -15.9375px',    // $100k
      'chip-100m': '-25.625px -15.9375px',  // $100M
      'chip-1c': '-50.625px -15.9375px',    // 1c
      'chip-25c': '-75.625px -15.9375px',   // 25c

      // Row 3 (Y = -53px * 0.625 = -33.125px)
      'chip-1k': '-1.25px -33.125px',       // $1k
      'chip-1m': '-25.625px -33.125px',     // $1M
      'chip-25': '-50.625px -33.125px',     // Green $25
      'chip-25k': '-75.625px -33.125px',    // $25k

      // Row 4 (Y = -80.5px * 0.625 = -50.3125px)
      'chip-25m': '-1.25px -50.3125px',     // $25M
      'chip-5': '-25.625px -50.3125px',     // Red $5
      'chip-500': '-50.625px -50.3125px',   // Purple $500
      'chip-500k': '-75.625px -50.3125px',  // $500k

      // Row 5 (Y = -108px * 0.625 = -67.5px)
      'chip-5m': '-1.25px -67.5px',         // $5M

      // Fallback chips
      'chip-50': '-50.625px -33.125px',     // Using green $25 position
      'chip-500m': '-50.625px -50.3125px',  // Using 500 position
    };

    const position = positions[chipClass] || '-2px 2px';

    return {
      ...baseStyles,
      backgroundPosition: position,
    };
  };

  const inlineStyles = getSmallChipStyles(chipClass);

  // PokerStars-style realistic chip breakdown and stacking
  const getChipBreakdown = (amount: number): { denomination: number; count: number; chipClass: string }[] => {
    // Denominações ordenadas da maior para menor
    const denominations = [
      { value: 25000000000, class: 'chip-25b' },   // 25 Billion
      { value: 1000000000, class: 'chip-1b' },    // 1 Billion
      { value: 500000000, class: 'chip-500m' },   // 500 Million
      { value: 100000000, class: 'chip-100m' },   // 100 Million
      { value: 25000000, class: 'chip-25m' },     // 25 Million
      { value: 5000000, class: 'chip-5m' },       // 5 Million
      { value: 1000000, class: 'chip-1m' },       // 1 Million
      { value: 500000, class: 'chip-500k' },      // 500k
      { value: 100000, class: 'chip-100k' },      // 100k
      { value: 25000, class: 'chip-25k' },        // 25k
      { value: 1000, class: 'chip-1k' },          // 1k
      { value: 500, class: 'chip-500' },          // 500
      { value: 100, class: 'chip-100' },          // 100
      { value: 25, class: 'chip-25' },            // 25
      { value: 5, class: 'chip-5' },              // 5
      { value: 1, class: 'chip-1' },              // 1
    ];

    const breakdown: { denomination: number; count: number; chipClass: string }[] = [];
    let remaining = amount;

    for (const denom of denominations) {
      if (remaining >= denom.value) {
        const count = Math.floor(remaining / denom.value);
        if (count > 0) {
          breakdown.push({
            denomination: denom.value,
            count: Math.min(count, 10), // Máximo 10 fichas por denominação para evitar pilhas muito altas
            chipClass: denom.class
          });
          remaining -= count * denom.value;
        }
      }
    }

    return breakdown;
  };

  const renderRealisticChipStack = () => {
    const breakdown = getChipBreakdown(valor);

    if (breakdown.length === 0) return null;

    // Offset entre fichas para empilhamento vertical
    const stackOffset = size === 'small' ? 1.5 : size === 'medium' ? 4 : 5;

    // Criar array com todas as fichas em ordem (maiores embaixo, menores em cima)
    const allChips: { chipClass: string; denomination: number; stackIndex: number }[] = [];
    let currentStackIndex = 0;

    // Inverter ordem para que maiores denominações fiquem embaixo
    const sortedBreakdown = [...breakdown].reverse();

    for (const chipGroup of sortedBreakdown) {
      for (let i = 0; i < chipGroup.count; i++) {
        allChips.push({
          chipClass: chipGroup.chipClass,
          denomination: chipGroup.denomination,
          stackIndex: currentStackIndex++
        });
      }
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'relative',
          display: 'inline-block'
        }}>
          {allChips.map((chip, index) => (
            <div
              key={`${chip.chipClass}-${index}`}
              className={size === 'small' ? 'chip' : `chip ${chip.chipClass} ${sizeClass}`}
              style={{
                ...(size === 'small' ? getSmallChipStyles(chip.chipClass) : {}),
                position: index > 0 ? 'absolute' : 'relative',
                bottom: index > 0 ? `${index * stackOffset}px` : '0',
                left: '0',
                zIndex: 10 + index,
                // Remove apenas a cor de fundo, mantém background-image do sprite
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
              }}
              title={`$${chip.denomination}`}
            />
          ))}
        </div>
        {showLabel && (
          <div className={`money-label ${labelClass}`} style={{ marginTop: '6px' }}>
            ${valor}
          </div>
        )}
      </div>
    );
  };

  // Se empilhamento realista estiver ativo e o valor for >= 10, usar o sistema novo
  if (enableRealisticStacking && valor >= 10) {
    return renderRealisticChipStack();
  }

  // Professional $50 chip rendering (two stacked $25 chips like PokerStars)
  if (valor === 50) {
    const stackOffset = size === 'small' ? { top: '-1.5px', left: '1px' } :
                       size === 'medium' ? { top: '-4px', left: '2px' } :
                       { top: '-6px', left: '3px' };

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'relative'
        }}>
          {/* Bottom $25 chip */}
          <div
            className={size === 'small' ? 'chip' : `chip chip-25 ${sizeClass}`}
            style={{
              ...(size === 'small' ? getSmallChipStyles('chip-25') : {}),
              // Remove apenas a cor de fundo, mantém background-image do sprite
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
            }}
            title={`Aposta de $${valor} (2x $25)`}
          />
          {/* Top $25 chip - professionally stacked */}
          <div
            className={size === 'small' ? 'chip' : `chip chip-25 ${sizeClass}`}
            style={{
              ...(size === 'small' ? getSmallChipStyles('chip-25') : {}),
              position: 'absolute',
              top: stackOffset.top,
              left: stackOffset.left,
              zIndex: 2,
              // Remove apenas a cor de fundo, mantém background-image do sprite
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
            }}
            title={`Aposta de $${valor} (2x $25)`}
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none'
    }}>
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
});

export default ChipStack;