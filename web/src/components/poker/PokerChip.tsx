import React from 'react';

interface PokerChipProps {
  valor: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const PokerChip: React.FC<PokerChipProps> = ({
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

  // Mapeamento de valores para posições no sprite "poker chips.png"
  // Grid 5x2: 5 colunas, 2 linhas
  const getChipSpritePosition = (valor: number) => {
    if (valor >= 10000) return '100% 100%'; // Linha 2, Coluna 5: Azul Claro
    if (valor >= 5000) return '75% 100%';   // Linha 2, Coluna 4: Rosa
    if (valor >= 1000) return '50% 100%';   // Linha 2, Coluna 3: Amarela
    if (valor >= 500) return '25% 100%';    // Linha 2, Coluna 2: Roxa
    if (valor >= 100) return '0% 100%';     // Linha 2, Coluna 1: Preta
    if (valor >= 50) return '100% 0%';      // Linha 1, Coluna 5: Azul Escuro
    if (valor >= 25) return '75% 0%';       // Linha 1, Coluna 4: Verde
    if (valor >= 10) return '50% 0%';       // Linha 1, Coluna 3: Azul
    if (valor >= 5) return '25% 0%';        // Linha 1, Coluna 2: Vermelha
    return '0% 0%';                         // Linha 1, Coluna 1: Branca
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return { width: '30px', height: '30px' };
      case 'large':
        return { width: '60px', height: '60px' };
      default:
        return { width: '45px', height: '45px' };
    }
  };

  const chipPosition = getChipSpritePosition(valor);
  const sizeStyles = getSizeClasses();

  return (
    <div className="relative flex flex-col items-center">
      {/* Ficha usando sprite */}
      <div
        className="bg-no-repeat cursor-pointer transition-transform hover:scale-110 rounded-full"
        style={{
          backgroundImage: "url('/assets/images/poker chips.png')",
          backgroundPosition: chipPosition,
          backgroundSize: '500% 200%', // 5 colunas, 2 linhas
          ...sizeStyles,
        }}
        title={`$${valor}`}
      >
        {/* Overlay para melhor visibilidade se necessário */}
        <div className="absolute inset-0 rounded-full bg-black/10" />
      </div>

      {/* Label do valor */}
      {showLabel && (
        <div
          className="mt-1 px-2 py-0.5 bg-black/80 text-white text-xs font-bold rounded-full shadow-lg border border-gray-600"
          style={{
            fontSize: size === 'small' ? '10px' : '12px',
            minWidth: size === 'small' ? '20px' : '30px',
            textAlign: 'center'
          }}
        >
          ${formatarValor(valor)}
        </div>
      )}
    </div>
  );
};

export default PokerChip;