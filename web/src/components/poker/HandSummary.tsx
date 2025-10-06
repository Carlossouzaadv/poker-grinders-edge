import React from 'react';
import { HandHistory, Snapshot } from '@/types/poker';
import { CurrencyUtils } from '@/utils/currency-utils';

interface HandSummaryProps {
  handHistory: HandHistory;
  finalSnapshot: Snapshot;
}

const HandSummary: React.FC<HandSummaryProps> = ({ handHistory, finalSnapshot }) => {
  // Detect if tournament for proper formatting
  const isTournament = handHistory.gameContext?.isTournament || false;

  // Calculate pot breakdown
  const calculatePotBreakdown = () => {
    const breakdown: { label: string; value: number }[] = [];

    // Main pot and side pots
    if (finalSnapshot.pots && finalSnapshot.pots.length > 0) {
      finalSnapshot.pots.forEach((pot, index) => {
        if (index === 0) {
          breakdown.push({ label: 'Main Pot', value: pot.value });
        } else {
          breakdown.push({ label: `Side Pot ${index}`, value: pot.value });
        }
      });
    } else if (handHistory.totalPot > 0) {
      breakdown.push({ label: 'Total Pot', value: handHistory.totalPot });
    }

    return breakdown;
  };

  const potBreakdown = calculatePotBreakdown();

  // Get winner(s) information
  const getWinnerInfo = () => {
    if (!handHistory.showdown || !handHistory.showdown.winners) {
      return null;
    }

    return handHistory.showdown.winners.map(winner => {
      const player = handHistory.players.find(p => p.name === winner);

      // CRITICAL FIX: Use playerWinnings from showdown (SUMMARY section) if available
      // This is the accurate value from "and won (X)" in hand history
      let payout = 0;
      if (handHistory.showdown?.playerWinnings?.[winner]) {
        payout = handHistory.showdown.playerWinnings[winner];
      } else if (finalSnapshot.payouts?.[winner.toLowerCase().trim()]) {
        // Fallback to calculated payouts from snapshot
        payout = finalSnapshot.payouts[winner.toLowerCase().trim()];
      }

      return {
        name: winner,
        payout,
        position: player?.position || 'Unknown'
      };
    });
  };

  const winners = getWinnerInfo();

  return (
    <div className="bg-gray-900/90 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 shadow-xl">
      <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
        <span className="text-lg">📊</span>
        Hand Summary
      </h3>

      {/* Hand Info */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Hand ID:</span>
          <span className="text-gray-200 font-mono">#{handHistory.handId.slice(-12)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Game:</span>
          <span className="text-gray-200">{handHistory.stakes} {handHistory.gameType}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Players:</span>
          <span className="text-gray-200">{handHistory.players.length}</span>
        </div>
        {handHistory.gameContext.isTournament && handHistory.gameContext.buyIn && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Buy-in:</span>
            <span className="text-gray-200">{handHistory.gameContext.buyIn}</span>
          </div>
        )}
      </div>

      {/* Pot Breakdown */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Pot Breakdown
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-1.5">
          {potBreakdown.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="text-gray-400">{item.label}:</span>
              <span className="text-green-400 font-semibold">
                {CurrencyUtils.formatValue(item.value, isTournament)}
              </span>
            </div>
          ))}
          {handHistory.rake !== undefined && handHistory.rake > 0 && (
            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-700">
              <span className="text-gray-400">Rake:</span>
              <span className="text-red-400 font-semibold">
                {CurrencyUtils.formatValue(handHistory.rake, isTournament)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-700">
            <span className="text-gray-300 font-semibold">Total Pot:</span>
            <span className="text-yellow-400 font-bold">
              {CurrencyUtils.formatValue(handHistory.totalPot, isTournament)}
            </span>
          </div>
        </div>
      </div>

      {/* Winners */}
      {winners && winners.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {winners.length === 1 ? 'Winner' : 'Winners'}
          </div>
          <div className="space-y-2">
            {winners.map((winner, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-600/30 rounded-lg p-3"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-yellow-200 font-semibold text-sm">
                    🏆 {winner.name}
                  </span>
                  <span className="text-xs text-gray-400">({winner.position})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Won:</span>
                  <span className="text-green-400 font-bold text-sm">
                    {CurrencyUtils.formatValue(winner.payout, isTournament)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Showdown Info */}
      {handHistory.showdown && handHistory.showdown.info && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Showdown
          </div>
          <div className="text-xs text-gray-300 bg-gray-800/50 rounded-lg p-2 italic">
            {handHistory.showdown.info}
          </div>
        </div>
      )}
    </div>
  );
};

export default HandSummary;
