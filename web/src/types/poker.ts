export type Card = {
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
  suit: 'h' | 'd' | 'c' | 's'; // hearts, diamonds, clubs, spades
};

export type Position =
  | 'SB' | 'BB' | 'UTG' | 'UTG+1' | 'UTG+2' | 'MP1' | 'MP2' | 'MP3'
  | 'LJ' | 'HJ' | 'CO' | 'BTN' | 'EP' | 'MP' | 'LP';

export type Action = {
  player: string;
  action: 'fold' | 'call' | 'bet' | 'raise' | 'check' | 'all-in' | 'ante' | 'small_blind' | 'big_blind' | 'uncalled_return';
  amount?: number;
  totalBet?: number; // For raises, this is the total bet amount
  raiseBy?: number; // For raises, how much they raised by (for display)
  timestamp?: number;
};

// Normalized action type for snapshots
export type ActionType = 'post'|'bet'|'raise'|'call'|'check'|'fold'|'muck'|'show'|'reveal'|'uncalled_return';

export interface NormalizedAction {
  street: 'preflop'|'flop'|'turn'|'river'|'showdown';
  player: string;
  type: ActionType;
  amount?: number; // QUANTO foi efetivamente movido nesta ação (incremental)
  to?: number; // para raises, 'to' pode indicar total a que foi elevado
  description?: string;
}

// Pot object for side-pot logic
export interface Pot {
  value: number;
  eligiblePlayers: string[];
  isPotSide?: boolean; // true para side pots, false/undefined para main pot
}

// Snapshot que a UI consome
export interface Snapshot {
  id: number; // índice sequencial
  street: 'preflop'|'flop'|'turn'|'river'|'showdown';
  actionIndex: number; // índice da action original ou -1 para pseudo ações como "collect"
  description: string;

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
}

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type Player = {
  name: string;
  position: Position;
  stack: number;
  cards?: Card[];
  isHero: boolean;
  seat?: number; // Número do assento original
  bounty?: number; // Tournament bounty amount
  status?: 'active' | 'sitting_out' | 'disconnected'; // Player status
};

export type HandHistory = {
  handId: string;
  site: 'PokerStars' | 'GGPoker' | '888poker' | 'PartyPoker' | 'Other';
  gameType: 'Hold\'em' | 'Omaha' | 'Stud';
  limit: 'No Limit' | 'Pot Limit' | 'Fixed Limit';
  stakes: string; // e.g., "$0.25/$0.50"
  maxPlayers: number;
  buttonSeat: number;
  dealerSeat: number;
  smallBlind: number;
  bigBlind: number;
  ante?: number;
  timestamp: Date;
  players: Player[];

  // Antes (if tournament)
  antes?: Action[];

  // Streets
  preflop: Action[];
  flop?: {
    cards: Card[];
    actions: Action[];
  };
  turn?: {
    card: Card;
    actions: Action[];
  };
  river?: {
    card: Card;
    actions: Action[];
  };
  showdown?: {
    info: string; // Texto completo do showdown parseado
    winners: string[];
    potWon: number;
    rake?: number;
  };

  // Metadata
  totalPot: number;
  rake?: number;
  currency: string;
};

export type ParseResult = {
  success: boolean;
  handHistory?: HandHistory;
  error?: string;
  warnings?: string[];
};