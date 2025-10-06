/**
 * Types for Equity Calculator
 */

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export interface EquityResult {
  heroEquity: number;
  villainEquity: number;
  heroHand: string;
  villainRange: string;
  board: string;
  street: Street;
  tieEquity?: number;
}

export interface EquityCalculatorProps {
  currentBoard?: string;
  heroHand?: string;
  onEquityCalculated?: (result: EquityResult) => void;
}

export interface HandEquity {
  hand: string;
  equity: number;
  wins: number;
  ties: number;
  total: number;
}
