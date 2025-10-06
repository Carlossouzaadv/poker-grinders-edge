'use client';

import React, { useState } from 'react';
import EquityCalculator from './EquityCalculator';
import HandNotes from './HandNotes';
import { HandHistory } from '@/types/poker';

interface TableFooterProps {
  handHistory?: HandHistory | null;
}

const TableFooter: React.FC<TableFooterProps> = ({ handHistory }) => {
  const [activeTab, setActiveTab] = useState<'equity' | 'notes'>('equity');

  // Extract current board from hand history
  const getCurrentBoard = (): string => {
    if (!handHistory) return '';

    const flop = handHistory.flop?.cards || [];
    const turn = handHistory.turn?.card;
    const river = handHistory.river?.card;

    let board = '';

    // Add flop cards
    for (const card of flop) {
      board += `${card.rank}${card.suit}`;
    }

    // Add turn card
    if (turn) {
      board += `${turn.rank}${turn.suit}`;
    }

    // Add river card
    if (river) {
      board += `${river.rank}${river.suit}`;
    }

    return board;
  };

  // Extract hero hand
  const getHeroHand = (): string => {
    if (!handHistory) return '';

    const heroPlayer = handHistory.players.find(p => p.isHero);
    if (!heroPlayer || !heroPlayer.cards || heroPlayer.cards.length !== 2) {
      return '';
    }

    const [card1, card2] = heroPlayer.cards;
    return `${card1.rank}${card1.suit}${card2.rank}${card2.suit}`;
  };

  return (
    <div className="mt-6 mb-8">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('equity')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'equity'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📊 Equity
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'notes'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📝 Notas
        </button>
      </div>

      {/* Desktop: Side by Side | Mobile: Tabbed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Equity Calculator */}
        <div className={`${activeTab === 'equity' ? 'block' : 'hidden'} lg:block`}>
          <EquityCalculator
            currentBoard={getCurrentBoard()}
            heroHand={getHeroHand()}
          />
        </div>

        {/* Hand Notes */}
        <div className={`${activeTab === 'notes' ? 'block' : 'hidden'} lg:block`}>
          <HandNotes
            handId={handHistory?.handId || 'unknown'}
          />
        </div>
      </div>
    </div>
  );
};

export default TableFooter;
