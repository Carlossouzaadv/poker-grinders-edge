'use client';

import React, { useState, useEffect } from 'react';
import { calculateEquity, isValidHand, isValidBoard } from '@/lib/poker/equity-calculator';
import { EquityCalculatorProps, EquityResult } from '@/types/equity';

const EquityCalculator: React.FC<EquityCalculatorProps> = ({
  currentBoard = '',
  heroHand = '',
  onEquityCalculated
}) => {
  const [hero, setHero] = useState(heroHand);
  const [villain, setVillain] = useState('');
  const [board, setBoard] = useState(currentBoard);
  const [result, setResult] = useState<EquityResult | null>(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Update board when prop changes
  useEffect(() => {
    setBoard(currentBoard);
  }, [currentBoard]);

  // Update hero when prop changes
  useEffect(() => {
    if (heroHand) setHero(heroHand);
  }, [heroHand]);

  const handleCalculate = () => {
    setError('');
    setResult(null);

    if (!hero.trim()) {
      setError('Digite a mão do Hero');
      return;
    }

    if (!villain.trim()) {
      setError('Digite a mão do Villain');
      return;
    }

    if (!isValidHand(hero)) {
      setError('Mão do Hero inválida (ex: AhKs)');
      return;
    }

    if (!isValidHand(villain)) {
      setError('Mão do Villain inválida (ex: QdQc)');
      return;
    }

    if (board.trim() && !isValidBoard(board)) {
      setError('Board inválido (ex: Ah9s2c)');
      return;
    }

    setIsCalculating(true);

    // Run calculation in a timeout to allow UI to update
    setTimeout(() => {
      const calcResult = calculateEquity(hero, villain, board, 5000);

      if (!calcResult) {
        setError('Erro no cálculo. Verifique se não há cartas duplicadas.');
        setIsCalculating(false);
        return;
      }

      setResult(calcResult);
      setIsCalculating(false);

      if (onEquityCalculated) {
        onEquityCalculated(calcResult);
      }
    }, 10);
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Equity Calculator
      </h3>

      {/* Inputs */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Hero (ex: AhKs)</label>
          <input
            type="text"
            value={hero}
            onChange={(e) => setHero(e.target.value.toUpperCase())}
            placeholder="AhKs"
            maxLength={4}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Villain (ex: QdQc)</label>
          <input
            type="text"
            value={villain}
            onChange={(e) => setVillain(e.target.value.toUpperCase())}
            placeholder="QdQc"
            maxLength={4}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Board (ex: Ah9s2c)</label>
          <input
            type="text"
            value={board}
            onChange={(e) => setBoard(e.target.value.toUpperCase())}
            placeholder="Ah9s2c"
            maxLength={10}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={isCalculating}
        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-700 disabled:to-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
      >
        {isCalculating ? 'Calculando...' : 'Calcular Equity'}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-3 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center p-3 bg-green-900/30 rounded-lg border border-green-500/30">
            <span className="text-green-300 font-medium">Hero</span>
            <span className="text-green-400 font-bold text-xl">{result.heroEquity.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-red-900/30 rounded-lg border border-red-500/30">
            <span className="text-red-300 font-medium">Villain</span>
            <span className="text-red-400 font-bold text-xl">{result.villainEquity.toFixed(1)}%</span>
          </div>

          {result.tieEquity && result.tieEquity > 0 && (
            <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded text-sm">
              <span className="text-gray-400">Tie</span>
              <span className="text-gray-300">{result.tieEquity.toFixed(1)}%</span>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center mt-2">
            Street: {result.street} | Simulações: 5,000
          </div>
        </div>
      )}
    </div>
  );
};

export default EquityCalculator;
