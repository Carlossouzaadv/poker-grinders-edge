import React from 'react';

interface BetChipProps {
  amount: number;
  position: 'front' | 'side';
}

const BetChip: React.FC<BetChipProps> = ({ amount, position }) => {
  const formatAmount = (amount: number): string => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  return (
    <div
      className="absolute z-30 flex flex-col items-center"
      style={{
        // Posiciona as fichas entre o jogador e o centro da mesa
        left: '50%',
        top: '-60px',
        transform: 'translateX(-50%)',
      }}
    >
      {/* Stack de fichas mais visível e simples */}
      <div className="relative">
        {/* Stack de fichas com cores distintas */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-4 border-red-900 shadow-2xl flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 shadow-inner flex items-center justify-center">
            <div className="text-xs font-bold text-red-900">$</div>
          </div>
        </div>
      </div>

      {/* Valor da aposta */}
      <div className="mt-2 px-3 py-1 bg-yellow-500 text-black text-sm font-bold rounded shadow-2xl border-2 border-yellow-600">
        ${formatAmount(amount)}
      </div>
    </div>
  );
};

export default BetChip;