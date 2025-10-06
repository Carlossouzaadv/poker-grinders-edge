export type Card = {
  readonly rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
  readonly suit: 'h' | 'd' | 'c' | 's'; // hearts, diamonds, clubs, spades
};

export interface GameContext {
  readonly isTournament: boolean;
  readonly isHighStakes: boolean;
  readonly currencyUnit: 'chips' | 'dollars';
  readonly conversionNeeded: boolean;
  readonly buyIn?: string; // For tournaments: "$10+$1"
  readonly level?: string;  // For tournaments: "Level V"
}

export type Position =
  | 'SB' | 'BB' | 'UTG' | 'UTG+1' | 'UTG+2' | 'MP1' | 'MP2' | 'MP3'
  | 'LJ' | 'HJ' | 'CO' | 'BTN' | 'EP' | 'MP' | 'LP';

export type ActionType = 'fold' | 'call' | 'bet' | 'raise' | 'check' | 'all-in' | 'ante' | 'small_blind' | 'big_blind' | 'uncalled_return';

export type Action = {
  readonly player: string;
  readonly action: ActionType;
  readonly amount?: number;
  readonly totalBet?: number; // For raises, this is the total bet amount
  readonly raiseBy?: number; // For raises, how much they raised by (for display)
  readonly timestamp?: number;
  readonly reveals?: boolean; // Para all-in: se deve revelar cartas imediatamente
  readonly revealedCards?: readonly Card[]; // Cartas reveladas associadas à ação
};

// Normalized action type for snapshots
export type NormalizedActionType = 'post'|'bet'|'raise'|'call'|'check'|'fold'|'muck'|'show'|'reveal'|'uncalled_return';

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface NormalizedAction {
  readonly street: Street;
  readonly player: string;
  readonly type: NormalizedActionType;
  readonly amount?: number; // QUANTO foi efetivamente movido nesta ação (incremental)
  readonly to?: number; // para raises, 'to' pode indicar total a que foi elevado
  readonly description?: string;
}

// Pot object for side-pot logic
export interface Pot {
  readonly value: number;
  readonly eligiblePlayers: readonly string[];
  readonly isPotSide?: boolean; // true para side pots, false/undefined para main pot
}

// Snapshot que a UI consome
export interface Snapshot {
  readonly id: number; // índice sequencial
  readonly street: Street;
  readonly actionIndex: number; // índice da action original ou -1 para pseudo ações como "collect"
  readonly description: string;

  // cores do estado - REFATORADO para side-pots:
  pots: Pot[]; // array de potes (main pot + side pots)
  collectedPot: number; // fichas já recolhidas no centro antes das contribuições atuais (DEPRECATED - usar pots)
  pendingContribs: Record<string, number>; // fichas em frente a cada jogador (apostas desta street)
  totalDisplayedPot: number; // sum de todos os pots + sum(pendingContribs)

  playerStacks: Record<string, number>; // stacks REMANESCENTES no player (após subtrair aportes já realizados)
  playersOrder: string[]; // ordem para renderização (visual seats)
  folded: Set<string>;
  activePlayer?: string;
  lastAggressor?: string;

  communityCards: Card[]; // conforme street
  revealedHands?: Record<string, Card[] | null>;
  winners?: string[]; // no showdown

  // Campos adicionados para evitar double-count e tracking preciso
  totalCommitted?: Record<string, number>; // total que cada jogador colocou na mão
  payouts?: Record<string, number>; // quanto cada jogador ganhou no showdown
  playerStacksPostShowdown?: Record<string, number>; // stacks finais após showdown
  isAllIn?: Record<string, boolean>; // jogadores que estão all-in neste snapshot
}

export type Player = {
  readonly name: string;
  readonly position: Position;
  readonly stack: number;
  readonly cards?: readonly Card[];
  readonly isHero: boolean;
  readonly seat?: number; // Número do assento original
  readonly bounty?: number; // Tournament bounty amount
  readonly status?: 'active' | 'sitting_out' | 'disconnected'; // Player status
};

export type HandHistory = {
  readonly handId: string;
  readonly site: 'PokerStars' | 'GGPoker' | '888poker' | 'PartyPoker' | 'Other';
  readonly gameType: 'Hold\'em' | 'Omaha' | 'Stud';
  readonly limit: 'No Limit' | 'Pot Limit' | 'Fixed Limit';
  readonly stakes: string; // e.g., "$0.25/$0.50"
  readonly maxPlayers: number;
  readonly buttonSeat: number;
  readonly dealerSeat: number;
  readonly smallBlind: number;
  readonly bigBlind: number;
  readonly ante?: number;
  readonly timestamp: Date;
  readonly players: readonly Player[];
  readonly gameContext: GameContext; // REQUIRED: Context for proper value interpretation

  // Antes (if tournament)
  readonly antes?: readonly Action[];

  // Streets - Always defined, may have empty cards array
  readonly preflop: readonly Action[];
  readonly flop: {
    readonly cards: readonly Card[];
    readonly actions: readonly Action[];
  };
  readonly turn: {
    readonly card: Card | null;
    readonly actions: readonly Action[];
  };
  readonly river: {
    readonly card: Card | null;
    readonly actions: readonly Action[];
  };
  readonly showdown?: {
    readonly info: string; // Texto completo do showdown parseado
    readonly winners: readonly string[];
    readonly potWon: number;
    readonly rake?: number;
    readonly playerWinnings?: Record<string, number>; // Individual player winnings from SUMMARY section
  };

  // Metadata
  readonly totalPot: number;
  readonly rake?: number;
  readonly currency: string;
  readonly originalText?: string; // NEW: Original raw hand history text for debugging/storage
};

export type ParseResult = {
  readonly success: boolean;
  readonly data?: HandHistory; // Renamed from handHistory for consistency
  readonly handHistory?: HandHistory; // Keep for backward compatibility
  readonly error?: string;
  readonly warnings?: readonly string[];
  // NEW: Structured error and warning tracking
  readonly errors?: readonly import('./errors').AppError[];
  readonly structuredWarnings?: readonly import('./errors').AppError[];
};