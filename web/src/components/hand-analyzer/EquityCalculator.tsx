'use client';

import React, { useState, useEffect } from 'react';
import { calculateEquity, isValidHand, isValidBoard } from '@/lib/poker/equity-calculator';
import { EquityCalculatorProps, EquityResult } from '@/types/equity';
import Card from '@/components/poker/Card';
import { CardUtils } from '@/lib/poker/card-utils';
import { Card as CardType } from '@/types/poker';

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

  // Visual state
  const [heroCards, setHeroCards] = useState<CardType[]>([]);
  const [villainCards, setVillainCards] = useState<CardType[]>([]);
  const [boardCards, setBoardCards] = useState<CardType[]>([]);

  useEffect(() => {
    setBoard(currentBoard);
  }, [currentBoard]);

  useEffect(() => {
    if (heroHand) setHero(heroHand);
  }, [heroHand]);

  // Update visual cards when inputs change
  useEffect(() => {
    setHeroCards(CardUtils.parseCards(hero));
  }, [hero]);

  useEffect(() => {
    setVillainCards(CardUtils.parseCards(villain));
  }, [villain]);

  useEffect(() => {
    setBoardCards(CardUtils.parseCards(board));
  }, [board]);

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

    setTimeout(() => {
      const calcResult = calculateEquity(hero, villain, board, 5000);

      if (!calcResult) {
        setError('Erro no cálculo. Verifique cartas duplicadas.');
        setIsCalculating(false);
        return;
      }

      setResult(calcResult);
      setIsCalculating(false);

      if (onEquityCalculated) {
        onEquityCalculated(calcResult);
      }
    }, 50);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <span className="text-2xl">📊</span>
        </div>
        <div>
          <h3 className="text-white font-bold text-xl tracking-tight">Equity Calculator</h3>
          <p className="text-gray-400 text-xs">Simulador de probabilidades em tempo real</p>
        </div>
      </div>

      {/* Main Battle Area */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8 items-start">

        {/* Hero Section */}
        <div className="md:col-span-3 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-green-400">HERO</label>
            <span className="text-xs text-gray-500">{hero.length}/4</span>
          </div>

          <div className="relative group">
            <input
              type="text"
              value={hero}
              onChange={(e) => setHero(e.target.value.toUpperCase())}
              placeholder="AhKs"
              maxLength={4}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all font-mono tracking-wider text-lg"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
              {heroCards.length === 0 && <span className="text-gray-700 text-xs">Ex: AhKs</span>}
            </div>
          </div>

          {/* Visual Cards Hero */}
          <div className="h-24 flex gap-2 items-center justify-center bg-black/20 rounded-xl border border-white/5 p-2">
            {heroCards.length > 0 ? (
              heroCards.map((card, i) => (
                <Card key={i} card={card} size="medium" />
              ))
            ) : (
              <div className="text-gray-700 text-sm italic">Aguardando cartas...</div>
            )}
          </div>
        </div>

        {/* VS Badge */}
        <div className="md:col-span-1 flex flex-col items-center justify-center h-full pt-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center shadow-lg z-10">
            <span className="text-gray-400 font-bold text-xs">VS</span>
          </div>
          <div className="h-full w-px bg-gradient-to-b from-transparent via-white/5 to-transparent -mt-5 mb-5 hidden md:block"></div>
        </div>

        {/* Villain Section */}
        <div className="md:col-span-3 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-red-400">VILLAIN</label>
            <span className="text-xs text-gray-500">{villain.length}/4</span>
          </div>

          <div className="relative group">
            <input
              type="text"
              value={villain}
              onChange={(e) => setVillain(e.target.value.toUpperCase())}
              placeholder="QdQc"
              maxLength={4}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono tracking-wider text-lg"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
              {villainCards.length === 0 && <span className="text-gray-700 text-xs">Ex: QdQc</span>}
            </div>
          </div>

          {/* Visual Cards Villain */}
          <div className="h-24 flex gap-2 items-center justify-center bg-black/20 rounded-xl border border-white/5 p-2">
            {villainCards.length > 0 ? (
              villainCards.map((card, i) => (
                <Card key={i} card={card} size="medium" />
              ))
            ) : (
              <div className="text-gray-700 text-sm italic">Aguardando cartas...</div>
            )}
          </div>
        </div>
      </div>

      {/* Board Section */}
      <div className="mb-8 space-y-3">
        <label className="text-sm font-medium text-blue-400">BOARD (Opcional)</label>
        <div className="relative">
          <input
            type="text"
            value={board}
            onChange={(e) => setBoard(e.target.value.toUpperCase())}
            placeholder="Ah9s2c..."
            maxLength={10}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono tracking-wider text-lg"
          />
        </div>

        {/* Visual Cards Board */}
        <div className="h-24 flex gap-2 items-center justify-start bg-black/20 rounded-xl border border-white/5 p-2 px-4 overflow-x-auto">
          {boardCards.length > 0 ? (
            boardCards.map((card, i) => (
              <Card key={i} card={card} size="medium" />
            ))
          ) : (
            <div className="text-gray-700 text-sm italic">Nenhuma carta comunitária</div>
          )}
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={isCalculating}
        className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 p-px focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all hover:scale-[1.01]"
      >
        <div className="relative flex items-center justify-center gap-2 rounded-xl bg-gray-900/10 px-8 py-4 transition-all group-hover:bg-transparent">
          <span className="font-bold text-white text-lg">
            {isCalculating ? 'Calculando...' : 'Calcular Probabilidades'}
          </span>
          {!isCalculating && <span className="text-xl">🚀</span>}
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 animate-fadeIn">
          <span>⚠️</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="mt-8 space-y-6 animate-slideUp">
          <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-wider font-semibold">
            <span>Resultado</span>
            <span>{result.street}</span>
          </div>

          {/* Hero Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-green-400 font-bold">Hero Equity</span>
              <span className="text-2xl font-bold text-white">{result.heroEquity.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${result.heroEquity}%` }}
              />
            </div>
          </div>

          {/* Villain Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-red-400 font-bold">Villain Equity</span>
              <span className="text-2xl font-bold text-white">{result.villainEquity.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${result.villainEquity}%` }}
              />
            </div>
          </div>

          {/* Tie Bar (if any) */}
          {result.tieEquity !== undefined && result.tieEquity > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-gray-400 font-bold">Empate</span>
                <span className="text-xl font-bold text-gray-300">{result.tieEquity.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${result.tieEquity}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EquityCalculator;
