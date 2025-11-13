'use client';

import React, { useState } from 'react';
import PokerTable from '@/components/poker/PokerTable';
import { HandHistory, Snapshot, Player, Card as CardType } from '@/types/poker';

/**
 * TEST LAYOUTS PAGE
 *
 * Purpose: Visual validation of player positioning for 2-10 player tables
 *
 * This page renders mock poker hands for different table sizes to ensure:
 * - Hero is always positioned at visual seat #1 (bottom center)
 * - All other players are positioned correctly around the table
 * - No overlapping seats or visual glitches
 * - Action areas (chips) don't overlap with player seats
 * - Dealer button renders in the correct position
 */

export default function TestLayoutsPage() {
  const [selectedSize, setSelectedSize] = useState<number | 'all'>('all');
  const tableSizes = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Table Layout Testing - PokerMastery</h1>
          <p className="text-gray-300 mb-4">
            Visual validation tool for player positioning across different table sizes (2-10 players).
          </p>

          {/* Size selector */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm text-gray-400">Show:</span>
            <button
              onClick={() => setSelectedSize('all')}
              className={`px-4 py-2 rounded ${
                selectedSize === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Sizes
            </button>
            {tableSizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded ${
                  selectedSize === size
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {size}-max
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded">
            <h3 className="font-bold mb-2">🔍 What to Check:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              <li><strong>Hero Position:</strong> Should always be at bottom center (visual seat #1)</li>
              <li><strong>Player Distribution:</strong> Players should be evenly distributed around table</li>
              <li><strong>No Overlaps:</strong> Check that no players overlap each other</li>
              <li><strong>Dealer Button:</strong> Should appear next to the correct player</li>
              <li><strong>Chip Stacks:</strong> Should not overlap with player seats</li>
              <li><strong>Readability:</strong> All player info should be clearly visible</li>
            </ul>
          </div>
        </div>

        {/* Test tables */}
        <div className="space-y-12">
          {tableSizes
            .filter(size => selectedSize === 'all' || selectedSize === size)
            .map(size => (
              <TableSizeTest key={size} maxPlayers={size} />
            ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Component to test a specific table size
 */
function TableSizeTest({ maxPlayers }: { maxPlayers: number }) {
  const { handHistory, snapshot } = generateMockHand(maxPlayers);

  return (
    <div className="border border-gray-700 rounded-lg p-6 bg-gray-800">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {maxPlayers}-Max Table
          <span className="ml-4 text-sm text-gray-400">
            ({maxPlayers} seats, Hero always at visual seat #1)
          </span>
        </h2>
        <div className="flex gap-4 text-sm text-gray-400">
          <span>Players: {handHistory.players.length}</span>
          <span>Button: Seat #{handHistory.buttonSeat}</span>
          <span>Hero: Seat #{handHistory.players.find(p => p.isHero)?.seat}</span>
        </div>
      </div>

      {/* Poker table */}
      <div className="flex justify-center">
        <PokerTable
          handHistory={handHistory}
          snapshot={snapshot}
          showAllCards={true}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-700/50 rounded">
        <h4 className="font-semibold text-white mb-2">Seat Mapping (Original → Visual):</h4>
        <div className="grid grid-cols-5 gap-2 text-sm">
          {handHistory.players.map(player => {
            const heroSeat = handHistory.players.find(p => p.isHero)?.seat || 1;
            let visualSeat = player.seat - (heroSeat - 1);
            if (visualSeat <= 0) visualSeat += maxPlayers;

            return (
              <div
                key={player.name}
                className={`p-2 rounded ${player.isHero ? 'bg-green-600' : 'bg-gray-600'} text-white`}
              >
                <div className="font-bold">{player.name}</div>
                <div className="text-xs">Seat {player.seat} → Visual {visualSeat}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Generate a mock hand history for testing
 */
function generateMockHand(maxPlayers: number): { handHistory: HandHistory; snapshot: Snapshot } {
  // Generate players
  const players: Player[] = [];
  const positions = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'MP+1', 'CO', 'HJ', 'LJ'] as const;

  for (let i = 1; i <= maxPlayers; i++) {
    const isHero = i === 1; // Hero is always seat 1 in original seating
    const position = positions[i - 1] || 'MP';

    players.push({
      name: isHero ? 'Hero' : `Player${i}`,
      position,
      stack: 1000 + (i * 100), // Varying stacks
      seat: i,
      isHero,
      cards: isHero ? [
        { rank: 'A', suit: 's' } as CardType,
        { rank: 'K', suit: 's' } as CardType
      ] : undefined
    });
  }

  // Button position (varies based on table size)
  const buttonSeat = Math.ceil(maxPlayers / 2);

  const handHistory: HandHistory = {
    handId: `TEST-${maxPlayers}MAX-${Date.now()}`,
    site: 'TestSite',
    gameType: "Hold'em",
    limit: 'No Limit',
    stakes: '$0.50/$1.00',
    maxPlayers,
    buttonSeat,
    dealerSeat: buttonSeat,
    smallBlind: 0.5,
    bigBlind: 1,
    timestamp: new Date(),
    players,
    preflop: [],
    totalPot: 100,
    currency: 'USD',
    gameContext: {
      isTournament: false,
      isHighStakes: false,
      currencyUnit: 'dollars',
      conversionNeeded: false,
    },
    flop: {
      cards: [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'd' },
        { rank: 'Q', suit: 'c' }
      ],
      actions: []
    },
    turn: { card: { rank: 'J', suit: 's' }, actions: [] },
    river: { card: { rank: 'T', suit: 'h' }, actions: [] },
  };

  // Create snapshot
  const playerStacks: Record<string, number> = {};
  players.forEach(p => {
    playerStacks[p.name] = p.stack;
  });

  const snapshot: Snapshot = {
    id: 0,
    street: 'flop',
    actionIndex: 0,
    description: 'Testing table layout',
    pots: [{ value: 100, eligiblePlayers: players.map(p => p.name), isPotSide: false }],
    collectedPot: 0,
    pendingContribs: {
      [players[0].name]: 10, // SB visual chip
      [players[1].name]: 20, // BB visual chip
    },
    totalDisplayedPot: 100,
    playerStacks,
    playersOrder: players.map(p => p.name),
    folded: new Set(),
    communityCards: [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' },
      { rank: 'Q', suit: 'c' }
    ],
  };

  return { handHistory, snapshot };
}
