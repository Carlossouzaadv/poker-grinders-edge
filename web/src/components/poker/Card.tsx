import React from 'react';
import { Card as CardType } from '@/types/poker';

interface CardProps {
  card: CardType;
  size?: 'small' | 'medium' | 'large';
  faceDown?: boolean;
}

const Card: React.FC<CardProps> = ({ card, size = 'medium', faceDown = false }) => {
  const getSuitSymbol = (suit: string) => {
    const symbols = { c: '♣', d: '♦', h: '♥', s: '♠' };
    return symbols[suit as keyof typeof symbols] || '♠';
  };

  const getSuitColor = (suit: string) => {
    return (suit === 'd' || suit === 'h') ? 'text-red-600' : 'text-gray-900';
  };

  const getRankDisplay = (rank: string) => {
    return rank === 'T' ? '10' : rank;
  };

  const sizeClasses = {
    small: { width: 35, height: 49, fontSize: 'text-xs', cornerSize: 'text-xs' },
    medium: { width: 50, height: 70, fontSize: 'text-sm', cornerSize: 'text-xs' },
    large: { width: 70, height: 97, fontSize: 'text-lg', cornerSize: 'text-sm' }
  };

  const currentSize = sizeClasses[size];

  if (faceDown) {
    return (
      <div
        className="bg-gradient-to-br from-blue-800 to-blue-900 border-2 border-blue-700 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform relative overflow-hidden"
        style={{
          width: currentSize.width,
          height: currentSize.height,
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.1) 2px,
                rgba(255,255,255,0.1) 4px
              )
            `
          }}
        />
        <div className="text-blue-200 opacity-60" style={{ fontSize: currentSize.width * 0.3 }}>
          ♠
        </div>
      </div>
    );
  }

  const suitSymbol = getSuitSymbol(card.suit);
  const suitColor = getSuitColor(card.suit);
  const rankDisplay = getRankDisplay(card.rank);

  return (
    <div
      className="bg-white border border-gray-300 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 relative overflow-hidden cursor-pointer"
      style={{
        width: currentSize.width,
        height: currentSize.height,
      }}
    >
      {/* Top-left corner */}
      <div className={`absolute top-1 left-1 flex flex-col items-center ${suitColor} ${currentSize.cornerSize} font-bold leading-none`}>
        <div>{rankDisplay}</div>
        <div style={{ marginTop: '-2px' }}>{suitSymbol}</div>
      </div>

      {/* Center symbol */}
      <div className={`absolute inset-0 flex items-center justify-center ${suitColor}`}>
        <div style={{ fontSize: currentSize.width * 0.4 }}>
          {suitSymbol}
        </div>
      </div>

      {/* Bottom-right corner (upside down) */}
      <div className={`absolute bottom-1 right-1 flex flex-col items-center ${suitColor} ${currentSize.cornerSize} font-bold leading-none transform rotate-180`}>
        <div>{rankDisplay}</div>
        <div style={{ marginTop: '-2px' }}>{suitSymbol}</div>
      </div>

      {/* Card border highlight */}
      <div className="absolute inset-0 rounded-lg border border-gray-200 pointer-events-none" />
    </div>
  );
};

export default Card;