import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokerTable from './PokerTable';
import { HandHistory, Snapshot, Player, Pot } from '@/types/poker';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'replayer.pot': `Pot: $${params?.amount}`,
        'replayer.winner': '🏆 WINNER',
        'table.sb': `SB: $${params?.amount}`,
        'table.bb': `BB: $${params?.amount}`,
        'table.ante': `Ante: $${params?.amount}`,
        'table.mainPot': 'Main Pot',
        'table.sidePot': `Side Pot ${params?.number}`,
        'streets.preflop': 'Pre-flop',
        'streets.flop': 'Flop',
        'streets.turn': 'Turn',
        'streets.river': 'River',
        'streets.showdown': 'Showdown',
        'replayer.street': `Street: ${params?.street}`,
        'table.waitingFlop': 'Waiting for the flop...',
        'table.revealingCards': 'Revealing the cards...'
      };
      return translations[key] || key;
    }
  })
}));

// Mock child components to focus on PokerTable logic
jest.mock('./PlayerSeat', () => {
  return function MockPlayerSeat({ player, isActive, hasFolded, currentBet }: any) {
    return (
      <div data-testid={`player-seat-${player.name}`} className={`player-seat ${isActive ? 'active' : ''} ${hasFolded ? 'folded' : ''}`}>
        <span data-testid="player-name">{player.name}</span>
        <span data-testid="player-stack">${player.stack}</span>
        {player.isHero && <span data-testid="hero-marker">HERO</span>}
        {currentBet > 0 && <span data-testid="current-bet">${currentBet}</span>}
      </div>
    );
  };
});

jest.mock('./Card', () => {
  return function MockCard({ card }: any) {
    return <div data-testid="community-card">{card.rank}{card.suit}</div>;
  };
});

jest.mock('./ChipStack', () => {
  return function MockChipStack({ valor, showLabel }: any) {
    return (
      <div data-testid="chip-stack">
        {showLabel && <span>${valor}</span>}
      </div>
    );
  };
});

jest.mock('./DealerButton', () => {
  return function MockDealerButton() {
    return <div data-testid="dealer-button">D</div>;
  };
});

describe('PokerTable', () => {
  // Helper to create basic hand history
  const createHandHistory = (players: Partial<Player>[] = []): HandHistory => ({
    handId: '123456789',
    site: 'PokerStars',
    gameType: 'Hold\'em',
    limit: 'No Limit',
    stakes: '$0.25/$0.50',
    maxPlayers: 6,
    buttonSeat: 1,
    dealerSeat: 1,
    smallBlind: 0.25,
    bigBlind: 0.50,
    timestamp: new Date(),
    players: [
      { name: 'Hero', position: 'BTN', stack: 50, isHero: true, seat: 1 },
      { name: 'Villain1', position: 'SB', stack: 45, isHero: false, seat: 2 },
      { name: 'Villain2', position: 'BB', stack: 100, isHero: false, seat: 3 },
      ...players
    ].slice(0, 6), // Max 6 players
    preflop: [],
    totalPot: 0,
    currency: 'USD'
  });

  // Helper to create basic snapshot
  const createSnapshot = (overrides: Partial<Snapshot> = {}): Snapshot => ({
    id: 0,
    street: 'preflop',
    actionIndex: 0,
    description: 'Hand starts',
    pots: [{ value: 0, eligiblePlayers: ['Hero', 'Villain1', 'Villain2'], isPotSide: false }],
    collectedPot: 0,
    pendingContribs: {},
    totalDisplayedPot: 0,
    playerStacks: { Hero: 50, Villain1: 45, Villain2: 100 },
    playersOrder: ['Hero', 'Villain1', 'Villain2'],
    folded: new Set(),
    communityCards: [],
    ...overrides
  });

  describe('Component Rendering', () => {
    test('should render without crashing', () => {
      const handHistory = createHandHistory();
      const snapshot = createSnapshot();

      render(<PokerTable handHistory={handHistory} snapshot={snapshot} />);

      expect(screen.getByText('Pre-flop')).toBeInTheDocument();
    });

    test('should show loading state when hand history or snapshot is null', () => {
      render(<PokerTable handHistory={null as any} snapshot={null as any} />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      render(<PokerTable handHistory={createHandHistory()} snapshot={null as any} />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('should display basic hand information', () => {
      const handHistory = createHandHistory();
      const snapshot = createSnapshot();

      render(<PokerTable handHistory={handHistory} snapshot={snapshot} />);

      // Hand number should be displayed
      expect(screen.getByText('#123456789'.slice(-8))).toBeInTheDocument();

      // Stakes and game type
      expect(screen.getByText('$0.25/$0.50 Hold\'em')).toBeInTheDocument();

      // Blinds info
      expect(screen.getByText('SB: $0.25')).toBeInTheDocument();
      expect(screen.getByText('BB: $0.5')).toBeInTheDocument();
    });

    test('should display ante when present', () => {
      const handHistory = createHandHistory();
      handHistory.ante = 0.05;
      const snapshot = createSnapshot();

      render(<PokerTable handHistory={handHistory} snapshot={snapshot} />);

      expect(screen.getByText('Ante: $0.05')).toBeInTheDocument();
    });
  });

  describe('Hero-Centric Positioning System', () => {
    test('should position Hero in seat 1 (bottom center) regardless of original seat', () => {
      const players = [
        { name: 'Villain1', position: 'UTG' as const, stack: 50, isHero: false, seat: 1 },
        { name: 'Villain2', position: 'BTN' as const, stack: 50, isHero: false, seat: 2 },
        { name: 'Hero', position: 'SB' as const, stack: 50, isHero: true, seat: 3 }, // Hero in seat 3
        { name: 'Villain3', position: 'BB' as const, stack: 50, isHero: false, seat: 4 },
      ];

      const handHistory = createHandHistory(players);
      const snapshot = createSnapshot({
        playerStacks: { Villain1: 50, Villain2: 50, Hero: 50, Villain3: 50 },
        playersOrder: ['Villain1', 'Villain2', 'Hero', 'Villain3']
      });

      render(<PokerTable handHistory={handHistory} snapshot={snapshot} />);

      const heroSeat = screen.getByTestId('player-seat-Hero');
      const heroMarker = within(heroSeat).getByTestId('hero-marker');

      expect(heroSeat).toBeInTheDocument();
      expect(heroMarker).toHaveTextContent('HERO');

      // Hero should be positioned as visual seat 1 (check class)
      expect(heroSeat).toHaveClass('player-seat-1');
    });

    test('should correctly calculate visual positions for different table sizes', () => {
      // Test 4-max table
      const players4max = [
        { name: 'Hero', position: 'BTN' as const, stack: 50, isHero: true, seat: 1 },
        { name: 'Player2', position: 'SB' as const, stack: 50, isHero: false, seat: 2 },
        { name: 'Player3', position: 'BB' as const, stack: 50, isHero: false, seat: 3 },
        { name: 'Player4', position: 'CO' as const, stack: 50, isHero: false, seat: 4 },
      ];

      const handHistory4max = createHandHistory(players4max);
      handHistory4max.maxPlayers = 4;

      const snapshot4max = createSnapshot({
        playerStacks: { Hero: 50, Player2: 50, Player3: 50, Player4: 50 },
        playersOrder: ['Hero', 'Player2', 'Player3', 'Player4']
      });

      render(<PokerTable handHistory={handHistory4max} snapshot={snapshot4max} />);

      expect(screen.getByTestId('player-seat-Hero')).toHaveClass('player-seat-1');
      expect(screen.getByTestId('player-seat-Player2')).toHaveClass('player-seat-2');
      expect(screen.getByTestId('player-seat-Player3')).toHaveClass('player-seat-3');
      expect(screen.getByTestId('player-seat-Player4')).toHaveClass('player-seat-4');
    });

    test('should handle hero detection when no explicit hero is set', () => {
      const players = [
        { name: 'Player1', position: 'BTN' as const, stack: 50, isHero: false, seat: 1 },
        { name: 'Player2', position: 'SB' as const, stack: 50, isHero: false, seat: 2 },
      ];

      const handHistory = createHandHistory(players);
      const snapshot = createSnapshot({
        playerStacks: { Player1: 50, Player2: 50 },
        playersOrder: ['Player1', 'Player2']
      });

      render(<PokerTable handHistory={handHistory} snapshot={snapshot} />);

      // First player should become hero automatically
      const firstPlayerSeat = screen.getByTestId('player-seat-Player1');
      expect(within(firstPlayerSeat).getByTestId('hero-marker')).toBeInTheDocument();
    });
  });

  describe('Multi-Pot System Rendering', () => {
    test('should render multiple pots with correct labels', () => {
      const pots: Pot[] = [
        { value: 30, eligiblePlayers: ['Hero', 'Villain1', 'Villain2'], isPotSide: false },
        { value: 20, eligiblePlayers: ['Hero', 'Villain2'], isPotSide: true },
        { value: 10, eligiblePlayers: ['Hero'], isPotSide: true }
      ];

      const snapshot = createSnapshot({
        pots,
        totalDisplayedPot: 60
      });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      // Should display total pot
      expect(screen.getByText('Pot: $60')).toBeInTheDocument();

      // Should display pot labels
      expect(screen.getByText('Main Pot')).toBeInTheDocument();
      expect(screen.getByText('Side Pot 1')).toBeInTheDocument();
      expect(screen.getByText('Side Pot 2')).toBeInTheDocument();

      // Should display eligible players count
      expect(screen.getByText('(3 players)')).toBeInTheDocument();
      expect(screen.getByText('(2 players)')).toBeInTheDocument();
      expect(screen.getByText('(1 player)')).toBeInTheDocument();
    });

    test('should only show pots with value > 0', () => {
      const pots: Pot[] = [
        { value: 30, eligiblePlayers: ['Hero', 'Villain1'], isPotSide: false },
        { value: 0, eligiblePlayers: ['Hero'], isPotSide: true } // Empty side pot
      ];

      const snapshot = createSnapshot({ pots });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      expect(screen.getByText('Main Pot')).toBeInTheDocument();
      expect(screen.queryByText('Side Pot 1')).not.toBeInTheDocument();
    });

    test('should hide pot display when no pots exist', () => {
      const snapshot = createSnapshot({
        pots: [],
        totalDisplayedPot: 0
      });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      expect(screen.queryByText(/Pot:/)).not.toBeInTheDocument();
      expect(screen.queryByText('Main Pot')).not.toBeInTheDocument();
    });
  });

  describe('Player State Rendering', () => {
    test('should highlight active player', () => {
      const snapshot = createSnapshot({
        activePlayer: 'Hero'
      });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      const heroSeat = screen.getByTestId('player-seat-Hero');
      expect(heroSeat).toHaveClass('is-acting');
    });

    test('should show folded players correctly', () => {
      const snapshot = createSnapshot({
        folded: new Set(['Villain1'])
      });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      const villain1Seat = screen.getByTestId('player-seat-Villain1');
      expect(villain1Seat).toHaveClass('is-folded');

      const heroSeat = screen.getByTestId('player-seat-Hero');
      expect(heroSeat).not.toHaveClass('is-folded');
    });

    test('should display current bets for players', () => {
      const snapshot = createSnapshot({
        pendingContribs: { Hero: 10, Villain2: 5 }
      });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      const heroSeat = screen.getByTestId('player-seat-Hero');
      expect(within(heroSeat).getByTestId('current-bet')).toHaveTextContent('$10');

      const villain2Seat = screen.getByTestId('player-seat-Villain2');
      expect(within(villain2Seat).getByTestId('current-bet')).toHaveTextContent('$5');

      const villain1Seat = screen.getByTestId('player-seat-Villain1');
      expect(within(villain1Seat).queryByTestId('current-bet')).not.toBeInTheDocument();
    });

    test('should show dealer button on correct player', () => {
      const handHistory = createHandHistory();
      handHistory.buttonSeat = 2; // Villain1 has button

      const snapshot = createSnapshot();

      render(<PokerTable handHistory={handHistory} snapshot={snapshot} />);

      // Should find dealer button
      expect(screen.getByTestId('dealer-button')).toBeInTheDocument();
    });

    test('should update player stacks correctly', () => {
      const snapshot = createSnapshot({
        playerStacks: { Hero: 35, Villain1: 40, Villain2: 95 }
      });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      expect(within(screen.getByTestId('player-seat-Hero')).getByTestId('player-stack')).toHaveTextContent('$35');
      expect(within(screen.getByTestId('player-seat-Villain1')).getByTestId('player-stack')).toHaveTextContent('$40');
      expect(within(screen.getByTestId('player-seat-Villain2')).getByTestId('player-stack')).toHaveTextContent('$95');
    });
  });

  describe('Community Cards and Streets', () => {
    test('should display community cards correctly', () => {
      const snapshot = createSnapshot({
        street: 'flop',
        communityCards: [
          { rank: 'A', suit: 's' },
          { rank: 'K', suit: 'h' },
          { rank: '7', suit: 'c' }
        ]
      });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      const communityCards = screen.getAllByTestId('community-card');
      expect(communityCards).toHaveLength(3);
      expect(communityCards[0]).toHaveTextContent('As');
      expect(communityCards[1]).toHaveTextContent('Kh');
      expect(communityCards[2]).toHaveTextContent('7c');
    });

    test('should show waiting message for preflop', () => {
      const snapshot = createSnapshot({
        street: 'preflop',
        communityCards: []
      });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      expect(screen.getByText('Pre-flop')).toBeInTheDocument();
      expect(screen.getByText('Waiting for the flop...')).toBeInTheDocument();
    });

    test('should show revealing message for showdown', () => {
      const snapshot = createSnapshot({
        street: 'showdown',
        communityCards: []
      });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      expect(screen.getByText('Showdown')).toBeInTheDocument();
      expect(screen.getByText('Revealing the cards...')).toBeInTheDocument();
    });

    test('should display current street correctly', () => {
      const snapshot = createSnapshot({
        street: 'turn'
      });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      expect(screen.getByText('Street: Turn')).toBeInTheDocument();
    });
  });

  describe('Showdown Rendering', () => {
    test('should show winner announcement', () => {
      const handHistory = createHandHistory();
      handHistory.showdown = {
        info: 'Hero shows [Ac Kd]',
        winners: ['Hero'],
        potWon: 45.50
      };

      const snapshot = createSnapshot({
        street: 'showdown',
        winners: ['Hero']
      });

      render(<PokerTable handHistory={handHistory} snapshot={snapshot} />);

      // Winner badge should be displayed for Hero
      expect(screen.getByText('🏆 WINNER')).toBeInTheDocument();
    });

    test('should calculate showdown winnings correctly with multiple pots', () => {
      const handHistory = createHandHistory();
      handHistory.showdown = {
        info: 'Hero wins',
        winners: ['Hero'],
        potWon: 50
      };

      const pots: Pot[] = [
        { value: 30, eligiblePlayers: ['Hero', 'Villain1'], isPotSide: false },
        { value: 15, eligiblePlayers: ['Hero'], isPotSide: true }
      ];

      const snapshot = createSnapshot({
        street: 'showdown',
        winners: ['Hero'],
        pots
      });

      render(<PokerTable handHistory={handHistory} snapshot={snapshot} />);

      expect(screen.getByText('🏆 WINNER')).toBeInTheDocument();
      // ChipStack component should be rendered with the won amount
      expect(screen.getByTestId('chip-stack')).toBeInTheDocument();
    });
  });

  describe('Accessibility and User Experience', () => {
    test('should provide snapshot progress information', () => {
      const snapshot = createSnapshot({ id: 5 });

      render(<PokerTable handHistory={createHandHistory()} snapshot={snapshot} />);

      expect(screen.getByText('Snapshot: 6')).toBeInTheDocument(); // id + 1
    });

    test('should handle showAllCards prop correctly', () => {
      const handHistory = createHandHistory();
      const snapshot = createSnapshot();

      const { rerender } = render(
        <PokerTable handHistory={handHistory} snapshot={snapshot} showAllCards={false} />
      );

      // Initially showAllCards is false
      let playerSeats = screen.getAllByTestId(/player-seat-/);
      expect(playerSeats).toHaveLength(3);

      // Re-render with showAllCards true
      rerender(<PokerTable handHistory={handHistory} snapshot={snapshot} showAllCards={true} />);

      playerSeats = screen.getAllByTestId(/player-seat-/);
      expect(playerSeats).toHaveLength(3);
    });

    test('should handle missing optional data gracefully', () => {
      const minimalHandHistory: HandHistory = {
        handId: '123',
        site: 'PokerStars',
        gameType: 'Hold\'em',
        limit: 'No Limit',
        stakes: '$1/$2',
        maxPlayers: 6,
        buttonSeat: 1,
        dealerSeat: 1,
        smallBlind: 1,
        bigBlind: 2,
        timestamp: new Date(),
        players: [{ name: 'Hero', position: 'BTN', stack: 100, isHero: true, seat: 1 }],
        preflop: [],
        totalPot: 0,
        currency: 'USD'
      };

      const minimalSnapshot = createSnapshot({
        playerStacks: { Hero: 100 },
        playersOrder: ['Hero']
      });

      render(<PokerTable handHistory={minimalHandHistory} snapshot={minimalSnapshot} />);

      expect(screen.getByText('Pre-flop')).toBeInTheDocument();
      expect(screen.getByTestId('player-seat-Hero')).toBeInTheDocument();
    });
  });
});