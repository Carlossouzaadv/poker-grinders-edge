import { Action, Card } from './poker';

export type ReplayStep = {
  id: number;
  type: 'ACTION' | 'STREET' | 'SHOWDOWN';
  timestamp: number;
} & (ActionStep | StreetStep | ShowdownStep);

export type ActionStep = {
  id: number;
  timestamp: number;
  type: 'ACTION';
  player: string;
  action: Action['action'];
  amount?: number;
  description: string; // "PlayerOne raises to $8.00"
  potAfter: number;
  stacksAfter: Record<string, number>;
};

export type StreetStep = {
  id: number;
  timestamp: number;
  type: 'STREET';
  street: 'flop' | 'turn' | 'river';
  cards: Card[];
  description: string; // "Flop: As Kd 7h"
  potBefore: number;
};

export type ShowdownStep = {
  id: number;
  timestamp: number;
  type: 'SHOWDOWN';
  description: string; // "Showdown - Revealing hands"
  showdownInfo: string; // Texto completo do showdown
  winners: string[];
  potWon: number;
};

export type ReplayState = {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number; // milliseconds
  steps: ReplayStep[];
  streetBookmarks?: Record<string, number>; // Street name -> step index

  // Derived state
  currentStreet: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  currentPot: number;
  currentStacks: Record<string, number>;
  activePlayer: string | null;
  communityCards: Card[];
  foldedPlayers: Set<string>;
};