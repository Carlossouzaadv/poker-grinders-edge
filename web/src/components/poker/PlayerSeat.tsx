import React from 'react';
import { Player } from '@/types/poker';
import Card from './Card';

interface PlayerSeatProps {
  player: Player;
  isActive?: boolean;
  showCards?: boolean;
  currentBet?: number;
  hasFolded?: boolean;
  isWinner?: boolean;
  isShowdown?: boolean;
}

const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isActive = false,
  showCards = false,
  currentBet = 0,
  hasFolded = false,
  isWinner = false,
  isShowdown = false
}) => {
  return (
    <div className={`seat-pod relative flex flex-col items-center transition-all duration-500 ${
      hasFolded
        ? 'opacity-40 filter grayscale-[80%]'
        : isShowdown && !isWinner
        ? 'opacity-60 filter grayscale-[50%] brightness-75'
        : isShowdown && isWinner
        ? 'opacity-100 filter drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]'
        : 'opacity-100'
    }`} style={{ fontFamily: 'Roboto, sans-serif' }}>

      {/* Seat Chrome - CSS-only styling */}
      <div className="seat-chrome relative">
        <div
          className={`relative rounded-xl shadow-lg transition-all duration-500 ${
            isShowdown && isWinner
              ? 'bg-gradient-to-b from-yellow-600/30 to-yellow-800/30 border-3 border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.4)]'
              : isActive
              ? 'bg-gradient-to-b from-yellow-600/20 to-yellow-800/20 border-2 border-yellow-400/50'
              : player.isHero
                ? 'bg-gradient-to-b from-blue-600/20 to-blue-800/20 border-2 border-blue-400/50'
                : 'bg-gradient-to-b from-gray-700/80 to-gray-800/80 border-2 border-gray-600/50'
          }`}
          style={{
            width: '120px',
            minHeight: '80px',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Active indicator */}
          {isActive && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-pulse shadow-lg border-2 border-yellow-300/50"></div>
            </div>
          )}

          <div className="p-2 flex flex-col items-center">
            {/* Nome do jogador */}
            <div className="text-center mb-2">
              <div className={`px-2 py-1 rounded-md backdrop-blur-sm ${
                player.isHero
                  ? 'bg-blue-500/20 border border-blue-400/30'
                  : 'bg-gray-500/20 border border-gray-400/30'
              }`}>
                <div className={`font-medium text-xs tracking-wide ${
                  player.isHero ? 'text-blue-200' : 'text-gray-100'
                }`}>
                  {player.name}
                </div>
                {player.isHero && (
                  <div className="text-xs text-blue-300 mt-0.5">
                    (Hero)
                  </div>
                )}
              </div>
            </div>

            {/* Cartas */}
            <div className="flex justify-center space-x-1 mb-2">
              {hasFolded ? (
                <div className="text-red-400 text-xs font-bold bg-red-900/30 px-2 py-1 rounded border border-red-600/30">
                  FOLDED
                </div>
              ) : player.isHero && player.cards ? (
                player.cards.map((card, index) => (
                  <Card key={index} card={card} size="small" />
                ))
              ) : showCards && player.cards ? (
                player.cards.map((card, index) => (
                  <Card key={index} card={card} size="small" />
                ))
              ) : showCards ? (
                <>
                  <Card card={{ rank: '2', suit: 'h' }} size="small" faceDown />
                  <Card card={{ rank: '2', suit: 'h' }} size="small" faceDown />
                </>
              ) : (
                <div className="w-16 h-4"></div>
              )}
            </div>

            {/* Stack */}
            <div className="text-center mb-1">
              <div className="px-2 py-1 rounded-md bg-green-500/20 border border-green-400/30 backdrop-blur-sm">
                <div className="text-xs text-green-300 font-medium">
                  ${player.stack.toFixed(0)}
                </div>
              </div>
            </div>

            {/* Posição - mais sutil */}
            <div className="text-center">
              <div className="text-xs text-gray-400 opacity-70">
                {player.position}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aposta atual (fichas) - REMOVIDO para usar BetChip separadamente */}
      {/*
      {currentBet > 0 && (
        <div className="mt-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          ${currentBet}
        </div>
      )}
      */}
    </div>
  );
};

export default PlayerSeat;