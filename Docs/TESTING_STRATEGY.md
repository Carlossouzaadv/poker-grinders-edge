# Testing Strategy - Poker Grinder's Edge

This document outlines the comprehensive testing strategy for the Poker Grinder's Edge application. Testing is critical for ensuring the accuracy of financial calculations, hand history parsing, and overall system reliability.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Types of Tests](#types-of-tests)
- [Test-Driven Development (TDD)](#test-driven-development-tdd)
- [Testing Financial Logic](#testing-financial-logic)
- [Testing HandParser and Parsing Logic](#testing-handparser-and-parsing-logic)
- [Testing Side Pot Calculator](#testing-side-pot-calculator)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Regression Testing Strategy](#regression-testing-strategy)
- [Code Coverage Requirements](#code-coverage-requirements)
- [Best Practices](#best-practices)

---

## Testing Philosophy

### Core Principles

1. **Accuracy First**: Financial calculations must be 100% accurate - no tolerance for rounding errors
2. **Test Before Code**: Use TDD for critical business logic (bankroll, pots, rake)
3. **Comprehensive Coverage**: Aim for 80%+ coverage on services, 100% on financial logic
4. **Real-World Scenarios**: Use actual hand histories from poker sites for testing
5. **Fast Feedback**: Tests should run quickly (<5 seconds for unit tests)

### When to Write Tests

**ALWAYS write tests for:**
- Financial calculations (pots, rake, ROI, winrate)
- Hand history parsing logic
- Authentication and authorization
- Data validation and sanitization
- Side pot calculations

**Tests are optional for:**
- Simple DTOs (just data structures)
- Basic CRUD operations with no business logic
- UI components with minimal logic

---

## Types of Tests

### 1. Unit Tests

Test individual functions, methods, and classes in isolation.

**Tools:**
- Jest (test runner)
- TypeScript support built-in

**Example Structure:**

```typescript
// sessions.service.spec.ts
describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: PrismaService;

  beforeEach(() => {
    // Mock PrismaService
    prisma = {
      session: {
        create: jest.fn(),
        findMany: jest.fn(),
        // ... other methods
      }
    } as any;

    service = new SessionsService(prisma);
  });

  describe('create', () => {
    it('should create a cash game session', async () => {
      const dto = {
        gameType: GameType.CASH,
        buyIn: 100,
        cashOut: 150,
        location: 'PokerStars'
      };

      const mockResult = { id: 'session-123', ...dto };
      (prisma.session.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.create(dto, 'user-123');

      expect(result.id).toBe('session-123');
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          gameType: GameType.CASH
        })
      });
    });

    it('should calculate profit correctly', async () => {
      const dto = {
        gameType: GameType.CASH,
        buyIn: 100,
        cashOut: 75,
        location: 'Live'
      };

      const result = await service.create(dto, 'user-123');

      expect(result.result).toBe(-25); // Loss of $25
    });
  });
});
```

### 2. Integration Tests

Test multiple components working together (service + database).

**Tools:**
- Jest
- In-memory database (SQLite) or test PostgreSQL instance
- Prisma Test Client

**Example:**

```typescript
// sessions.integration.spec.ts
describe('SessionsService Integration', () => {
  let service: SessionsService;
  let prisma: PrismaService;
  let testUser: User;

  beforeAll(async () => {
    // Setup test database
    prisma = new PrismaService({
      datasources: {
        db: {
          url: 'postgresql://test:test@localhost:5433/test_db'
        }
      }
    });

    await prisma.$connect();
    service = new SessionsService(prisma);
  });

  beforeEach(async () => {
    // Clean database
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: 'hashed',
        firstName: 'Test',
        lastName: 'User'
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create and retrieve session from database', async () => {
    const dto = {
      gameType: GameType.TOURNAMENT,
      buyIn: 50,
      prize: 200,
      tournamentName: 'Sunday Million'
    };

    const created = await service.create(dto, testUser.id);

    // Verify it was actually saved
    const retrieved = await prisma.session.findUnique({
      where: { id: created.id }
    });

    expect(retrieved).toBeDefined();
    expect(retrieved.tournamentName).toBe('Sunday Million');
    expect(retrieved.userId).toBe(testUser.id);
  });

  it('should calculate user stats from multiple sessions', async () => {
    // Create multiple sessions
    await service.create({
      gameType: GameType.CASH,
      buyIn: 100,
      cashOut: 150
    }, testUser.id);

    await service.create({
      gameType: GameType.CASH,
      buyIn: 100,
      cashOut: 80
    }, testUser.id);

    await service.create({
      gameType: GameType.CASH,
      buyIn: 100,
      cashOut: 120
    }, testUser.id);

    const stats = await service.getUserStats(testUser.id);

    expect(stats.totalSessions).toBe(3);
    expect(stats.totalProfit).toBe(50); // 50 - 20 + 20
    expect(stats.winRate).toBeCloseTo(66.67, 1); // 2 wins / 3 sessions
  });
});
```

### 3. End-to-End (E2E) Tests

Test complete user flows through the API.

**Tools:**
- Supertest (HTTP assertions)
- Test database
- Full NestJS application

**Example:**

```typescript
// sessions.e2e.spec.ts
describe('Sessions API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login to get auth token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e@test.com',
        password: 'Test123!',
        firstName: 'E2E',
        lastName: 'Test'
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e@test.com',
        password: 'Test123!'
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/sessions (POST) should create a new session', () => {
    return request(app.getHttpServer())
      .post('/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        gameType: 'CASH',
        buyIn: 100,
        cashOut: 150,
        location: 'PokerStars'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.result).toBe(50);
      });
  });

  it('/sessions (GET) should list user sessions', async () => {
    // Create a session first
    await request(app.getHttpServer())
      .post('/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        gameType: 'TOURNAMENT',
        buyIn: 50,
        prize: 200
      });

    // List sessions
    return request(app.getHttpServer())
      .get('/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/sessions (GET) should not allow unauthorized access', () => {
    return request(app.getHttpServer())
      .get('/sessions')
      .expect(401);
  });
});
```

---

## Test-Driven Development (TDD)

### TDD Workflow

For critical business logic, follow the Red-Green-Refactor cycle:

1. **RED**: Write a failing test
2. **GREEN**: Write minimal code to make it pass
3. **REFACTOR**: Clean up the code while keeping tests green

### Example: TDD for ROI Calculation

**Step 1: Write the test (RED)**

```typescript
// roi-calculator.service.spec.ts
describe('ROICalculatorService', () => {
  let calculator: ROICalculatorService;

  beforeEach(() => {
    calculator = new ROICalculatorService();
  });

  it('should calculate ROI for a tournament win', () => {
    const buyIn = 50;
    const prize = 200;

    const roi = calculator.calculateTournamentROI(buyIn, prize);

    expect(roi).toBe(300); // (200 - 50) / 50 * 100 = 300%
  });

  it('should calculate negative ROI for a loss', () => {
    const buyIn = 100;
    const prize = 0;

    const roi = calculator.calculateTournamentROI(buyIn, prize);

    expect(roi).toBe(-100); // Total loss
  });

  it('should include rebuys and add-ons in ROI calculation', () => {
    const buyIn = 50;
    const rebuys = 2; // 2 x $50 = $100
    const addOns = 1; // 1 x $50 = $50
    const prize = 400;

    const roi = calculator.calculateTournamentROI(buyIn, prize, rebuys, addOns);

    // Total investment: 50 + 100 + 50 = 200
    // Profit: 400 - 200 = 200
    // ROI: 200 / 200 * 100 = 100%
    expect(roi).toBe(100);
  });
});
```

**Step 2: Implement minimal code (GREEN)**

```typescript
// roi-calculator.service.ts
@Injectable()
export class ROICalculatorService {
  calculateTournamentROI(
    buyIn: number,
    prize: number,
    rebuys: number = 0,
    addOns: number = 0
  ): number {
    // Calculate total investment
    const totalInvestment = buyIn + (buyIn * rebuys) + (buyIn * addOns);

    // Calculate profit
    const profit = prize - totalInvestment;

    // Calculate ROI as percentage
    const roi = (profit / totalInvestment) * 100;

    return Math.round(roi * 100) / 100; // Round to 2 decimals
  }
}
```

**Step 3: Refactor (keep tests GREEN)**

```typescript
// roi-calculator.service.ts (refactored)
@Injectable()
export class ROICalculatorService {
  calculateTournamentROI(
    buyIn: number,
    prize: number,
    rebuys: number = 0,
    addOns: number = 0
  ): number {
    const totalInvestment = this.calculateTotalInvestment(buyIn, rebuys, addOns);
    const profit = prize - totalInvestment;
    const roi = (profit / totalInvestment) * 100;

    return this.roundToTwoDecimals(roi);
  }

  private calculateTotalInvestment(
    buyIn: number,
    rebuys: number,
    addOns: number
  ): number {
    return buyIn * (1 + rebuys + addOns);
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
```

---

## Testing Financial Logic

### Critical Financial Calculations

All financial logic requires 100% test coverage and must handle edge cases.

### Test Cases for Bankroll Calculations

```typescript
describe('BankrollCalculator', () => {
  let calculator: BankrollCalculator;

  beforeEach(() => {
    calculator = new BankrollCalculator();
  });

  describe('Profit/Loss Calculation', () => {
    it('should calculate profit for cash game', () => {
      const buyIn = 100;
      const cashOut = 175;

      const result = calculator.calculateProfit(buyIn, cashOut);

      expect(result).toBe(75);
    });

    it('should calculate loss for cash game', () => {
      const buyIn = 200;
      const cashOut = 150;

      const result = calculator.calculateProfit(buyIn, cashOut);

      expect(result).toBe(-50);
    });

    it('should handle zero cashout (complete loss)', () => {
      const buyIn = 100;
      const cashOut = 0;

      const result = calculator.calculateProfit(buyIn, cashOut);

      expect(result).toBe(-100);
    });

    it('should handle decimal amounts correctly', () => {
      const buyIn = 12.50;
      const cashOut = 37.75;

      const result = calculator.calculateProfit(buyIn, cashOut);

      expect(result).toBe(25.25); // No rounding errors
    });
  });

  describe('Tournament ROI', () => {
    it('should calculate ROI with bounties', () => {
      const buyIn = 50;
      const prize = 100;
      const bounties = 30;

      const roi = calculator.calculateTournamentROI(buyIn, prize, 0, 0, bounties);

      // Total prize: 100 + 30 = 130
      // ROI: (130 - 50) / 50 * 100 = 160%
      expect(roi).toBe(160);
    });

    it('should handle PKO tournaments correctly', () => {
      const buyIn = 100; // $50 prize pool + $50 bounty
      const prize = 500;
      const bounties = 150; // Collected $150 in bounties

      const roi = calculator.calculateTournamentROI(buyIn, prize, 0, 0, bounties);

      // Total return: 500 + 150 = 650
      // ROI: (650 - 100) / 100 * 100 = 550%
      expect(roi).toBe(550);
    });
  });

  describe('Bankroll Management Rules', () => {
    it('should recommend stake based on conservative bankroll', () => {
      const bankroll = 3000;
      const rule = 'CONSERVATIVE'; // 60 buy-ins

      const maxBuyIn = calculator.getRecommendedBuyIn(bankroll, rule);

      expect(maxBuyIn).toBe(50); // 3000 / 60 = 50
    });

    it('should recommend stake based on aggressive bankroll', () => {
      const bankroll = 1500;
      const rule = 'AGGRESSIVE'; // 30 buy-ins

      const maxBuyIn = calculator.getRecommendedBuyIn(bankroll, rule);

      expect(maxBuyIn).toBe(50); // 1500 / 30 = 50
    });

    it('should warn when playing above bankroll', () => {
      const bankroll = 500;
      const buyIn = 100;
      const rule = 'STANDARD'; // 40 buy-ins

      const isRisky = calculator.isAboveBankroll(bankroll, buyIn, rule);

      expect(isRisky).toBe(true); // Should have $4000 for $100 buy-in
    });
  });

  describe('Edge Cases and Precision', () => {
    it('should handle very small amounts (micro stakes)', () => {
      const buyIn = 0.01;
      const cashOut = 0.02;

      const result = calculator.calculateProfit(buyIn, cashOut);

      expect(result).toBe(0.01);
    });

    it('should handle large amounts without overflow', () => {
      const buyIn = 100000;
      const cashOut = 250000;

      const result = calculator.calculateProfit(buyIn, cashOut);

      expect(result).toBe(150000);
    });

    it('should not introduce floating point errors', () => {
      // Classic JS problem: 0.1 + 0.2 = 0.30000000000000004
      const buyIn = 10.1;
      const cashOut = 10.3;

      const result = calculator.calculateProfit(buyIn, cashOut);

      expect(result).toBe(0.2); // Should be exact
    });
  });
});
```

### Using Decimal.js for Precision

```typescript
import { Decimal } from 'decimal.js';

@Injectable()
export class BankrollCalculator {
  calculateProfit(buyIn: number, cashOut: number): number {
    // Use Decimal for precision
    const buyInDecimal = new Decimal(buyIn);
    const cashOutDecimal = new Decimal(cashOut);

    const profit = cashOutDecimal.minus(buyInDecimal);

    return profit.toNumber();
  }

  calculateROI(buyIn: number, cashOut: number): number {
    const buyInDecimal = new Decimal(buyIn);
    const cashOutDecimal = new Decimal(cashOut);

    const profit = cashOutDecimal.minus(buyInDecimal);
    const roi = profit.dividedBy(buyInDecimal).times(100);

    return roi.toDecimalPlaces(2).toNumber();
  }
}
```

---

## Testing HandParser and Parsing Logic

### Strategy Pattern Testing

Each poker site parser must be tested independently.

```typescript
describe('PokerStarsParser', () => {
  let parser: PokerStarsParser;

  beforeEach(() => {
    parser = new PokerStarsParser();
  });

  describe('Header Parsing', () => {
    it('should parse cash game header correctly', () => {
      const headerLine = "PokerStars Hand #123456789:  Hold'em No Limit ($0.25/$0.50 USD) - 2023/10/02 14:30:00 ET";

      const context = parser.detectGameContext(headerLine);

      expect(context.handId).toBe('123456789');
      expect(context.gameType).toBe('CASH');
      expect(context.variant).toBe('NLHE');
      expect(context.stakes).toEqual({ sb: 0.25, bb: 0.50 });
      expect(context.currency).toBe('USD');
    });

    it('should parse tournament header correctly', () => {
      const headerLine = "PokerStars Hand #987654321: Tournament #123456789, $50+$5 Hold'em No Limit - Level V (75/150) - 2023/10/02 15:00:00 ET";

      const context = parser.detectGameContext(headerLine);

      expect(context.handId).toBe('987654321');
      expect(context.gameType).toBe('TOURNAMENT');
      expect(context.tournamentId).toBe('123456789');
      expect(context.buyIn).toBe(50);
      expect(context.rake).toBe(5);
      expect(context.blinds).toEqual({ sb: 75, bb: 150 });
    });
  });

  describe('Player Parsing', () => {
    it('should extract all players and stacks', () => {
      const handText = `
PokerStars Hand #123: Hold'em No Limit ($0.25/$0.50)
Table 'Test' 6-max Seat #1 is the button
Seat 1: Player1 ($50 in chips)
Seat 2: Player2 ($100 in chips)
Seat 3: Player3 ($25.50 in chips)
Seat 4: Player4 ($200 in chips)
      `;

      const result = parser.parse(handText);

      expect(result.players).toHaveLength(4);
      expect(result.players[0]).toEqual({
        name: 'Player1',
        seat: 1,
        stack: 50,
        isButton: true
      });
      expect(result.players[2]).toEqual({
        name: 'Player3',
        seat: 3,
        stack: 25.50,
        isButton: false
      });
    });
  });

  describe('Action Parsing', () => {
    it('should parse preflop actions correctly', () => {
      const handText = `
PokerStars Hand #123: Hold'em No Limit ($0.25/$0.50)
Player1: posts small blind $0.25
Player2: posts big blind $0.50
*** HOLE CARDS ***
Player3: raises $1.50 to $2
Player4: folds
Player1: calls $1.75
Player2: raises $5 to $7
Player3: calls $5
Player1: folds
      `;

      const result = parser.parse(handText);

      const actions = result.streets.preflop.actions;

      expect(actions).toContainEqual({
        playerName: 'Player1',
        action: 'POST_SB',
        amount: 0.25
      });

      expect(actions).toContainEqual({
        playerName: 'Player3',
        action: 'RAISE',
        amount: 2,
        totalBet: 2
      });

      expect(actions).toContainEqual({
        playerName: 'Player2',
        action: '3BET',
        amount: 7,
        totalBet: 7
      });
    });

    it('should parse showdown correctly', () => {
      const handText = `
*** SHOW DOWN ***
Player1: shows [Ah Kh] (a pair of Aces)
Player2: shows [Qd Qc] (a pair of Queens)
Player1 collected $97.50 from pot
      `;

      const result = parser.parse(handText);

      expect(result.showdown).toBeDefined();
      expect(result.showdown.players).toContainEqual({
        name: 'Player1',
        cards: ['Ah', 'Kh'],
        handRank: 'Pair',
        handDescription: 'a pair of Aces'
      });
    });
  });

  describe('Pot Calculation', () => {
    it('should calculate total pot correctly', () => {
      const handText = `
PokerStars Hand #123: Hold'em No Limit ($0.25/$0.50)
Player1: posts small blind $0.25
Player2: posts big blind $0.50
Player3: raises $1.50 to $2
Player4: calls $2
Player1: folds
Player2: calls $1.50
*** FLOP *** [Ah 7c 2d]
Player2: checks
Player3: bets $5
Player4: calls $5
Player2: folds
*** TURN *** [Ah 7c 2d] [Ks]
Player3: bets $10
Player4: raises $20 to $30
Player3: calls $20
*** RIVER *** [Ah 7c 2d Ks] [3h]
Player3: checks
Player4: bets $50
Player3: folds
Player4 collected $97 from pot
      `;

      const result = parser.parse(handText);

      // SB + BB + Player3 (2+5+10+30) + Player4 (2+5+30)
      // 0.25 + 0.50 + 47 + 37 + Player2 (2) = 86.75
      expect(result.totalPot).toBeCloseTo(86.75, 2);
    });
  });

  describe('Real Hand History Files', () => {
    it('should parse actual PokerStars hand history', () => {
      const realHandHistory = fs.readFileSync(
        './test/fixtures/pokerstars_cash_game.txt',
        'utf-8'
      );

      const result = parser.parse(realHandHistory);

      expect(result.handId).toBeDefined();
      expect(result.players.length).toBeGreaterThan(0);
      expect(result.streets.preflop).toBeDefined();
    });
  });
});
```

### Testing with Fixtures

Create a `test/fixtures/` directory with real hand histories:

```
test/
  fixtures/
    pokerstars_cash_game.txt
    pokerstars_tournament.txt
    ggpoker_hand.txt
    partypoker_hand.txt
```

```typescript
describe('HandParser Integration', () => {
  const fixtures = [
    { file: 'pokerstars_cash_game.txt', site: 'PokerStars', expectedHands: 1 },
    { file: 'pokerstars_tournament.txt', site: 'PokerStars', expectedHands: 50 },
    { file: 'ggpoker_hand.txt', site: 'GGPoker', expectedHands: 1 }
  ];

  fixtures.forEach(({ file, site, expectedHands }) => {
    it(`should parse ${file} correctly`, () => {
      const content = fs.readFileSync(`./test/fixtures/${file}`, 'utf-8');

      const parser = ParserFactory.createParser(site);
      const results = parser.parseMultiple(content);

      expect(results).toHaveLength(expectedHands);
      results.forEach(result => {
        expect(result.handId).toBeDefined();
        expect(result.players.length).toBeGreaterThan(0);
      });
    });
  });
});
```

---

## Testing Side Pot Calculator

Side pot calculations are complex and error-prone. Comprehensive testing is essential.

```typescript
describe('SidePotCalculator', () => {
  let calculator: SidePotCalculator;

  beforeEach(() => {
    calculator = new SidePotCalculator();
  });

  describe('Simple Scenarios', () => {
    it('should calculate main pot with no side pots', () => {
      const contributions = new Map([
        ['Player1', 100],
        ['Player2', 100],
        ['Player3', 100]
      ]);

      const pots = calculator.calculate(contributions);

      expect(pots).toHaveLength(1);
      expect(pots[0]).toEqual({
        potNumber: 0,
        amount: 300,
        eligiblePlayers: ['Player1', 'Player2', 'Player3']
      });
    });

    it('should calculate one side pot', () => {
      const contributions = new Map([
        ['Short', 50],
        ['Medium', 100],
        ['Big', 100]
      ]);

      const pots = calculator.calculate(contributions);

      expect(pots).toHaveLength(2);

      // Main pot: 50 * 3 = 150
      expect(pots[0]).toEqual({
        potNumber: 0,
        amount: 150,
        eligiblePlayers: ['Short', 'Medium', 'Big']
      });

      // Side pot: 50 * 2 = 100
      expect(pots[1]).toEqual({
        potNumber: 1,
        amount: 100,
        eligiblePlayers: ['Medium', 'Big']
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle three different stack sizes', () => {
      const contributions = new Map([
        ['Short', 25],
        ['Medium', 75],
        ['Big', 150]
      ]);

      const pots = calculator.calculate(contributions);

      expect(pots).toHaveLength(3);

      // Main pot: 25 * 3 = 75
      expect(pots[0].amount).toBe(75);
      expect(pots[0].eligiblePlayers).toHaveLength(3);

      // Side pot 1: 50 * 2 = 100
      expect(pots[1].amount).toBe(100);
      expect(pots[1].eligiblePlayers).toEqual(['Medium', 'Big']);

      // Side pot 2: 75 * 1 = 75
      expect(pots[2].amount).toBe(75);
      expect(pots[2].eligiblePlayers).toEqual(['Big']);
    });

    it('should handle four players with complex all-ins', () => {
      const contributions = new Map([
        ['Player1', 10],
        ['Player2', 50],
        ['Player3', 100],
        ['Player4', 200]
      ]);

      const pots = calculator.calculate(contributions);

      expect(pots).toHaveLength(4);

      // Main pot: 10 * 4 = 40
      expect(pots[0].amount).toBe(40);

      // Side pot 1: 40 * 3 = 120 (10-50 range)
      expect(pots[1].amount).toBe(120);

      // Side pot 2: 50 * 2 = 100 (50-100 range)
      expect(pots[2].amount).toBe(100);

      // Side pot 3: 100 * 1 = 100 (100-200 range)
      expect(pots[3].amount).toBe(100);
    });

    it('should handle players with equal contributions', () => {
      const contributions = new Map([
        ['Player1', 50],
        ['Player2', 50],
        ['Player3', 100]
      ]);

      const pots = calculator.calculate(contributions);

      expect(pots).toHaveLength(2);

      // Main pot: 50 * 3 = 150
      expect(pots[0].amount).toBe(150);
      expect(pots[0].eligiblePlayers).toHaveLength(3);

      // Side pot: 50 * 1 = 50
      expect(pots[1].amount).toBe(50);
      expect(pots[1].eligiblePlayers).toEqual(['Player3']);
    });
  });

  describe('Validation', () => {
    it('should throw error if total pot doesnt match', () => {
      // This would indicate a bug in the algorithm
      const contributions = new Map([
        ['Player1', 100],
        ['Player2', 50]
      ]);

      const pots = calculator.calculate(contributions);
      const totalPot = pots.reduce((sum, pot) => sum + pot.amount, 0);
      const totalContributions = Array.from(contributions.values()).reduce((a, b) => a + b, 0);

      expect(totalPot).toBe(totalContributions);
    });

    it('should handle empty contributions', () => {
      const contributions = new Map();

      const pots = calculator.calculate(contributions);

      expect(pots).toHaveLength(0);
    });

    it('should handle single player', () => {
      const contributions = new Map([
        ['Player1', 100]
      ]);

      const pots = calculator.calculate(contributions);

      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(100);
    });
  });
});
```

---

## Integration Testing

### Database Integration Tests

```typescript
describe('HandHistorySessionsService Integration', () => {
  let service: HandHistorySessionsService;
  let prisma: PrismaService;
  let testUser: User;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
    service = new HandHistorySessionsService(prisma);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    testUser = await createTestUser(prisma);
  });

  it('should upload and parse hand history file', async () => {
    const handHistoryText = fs.readFileSync(
      './test/fixtures/pokerstars_tournament.txt',
      'utf-8'
    );

    const result = await service.uploadHandHistory({
      rawHandHistory: handHistoryText,
      name: 'Test Tournament',
      siteFormat: 'PokerStars'
    }, testUser.id);

    expect(result.id).toBeDefined();
    expect(result.totalHands).toBeGreaterThan(0);
    expect(result.firstHand).toBeDefined();

    // Verify hands were saved to database
    const hands = await prisma.handHistoryHand.findMany({
      where: { sessionId: result.id }
    });

    expect(hands).toHaveLength(result.totalHands);
  });

  it('should retrieve specific hand by index', async () => {
    const session = await uploadTestSession(service, testUser.id);

    const hand = await service.getHandByIndex(session.id, 0, testUser.id);

    expect(hand).toBeDefined();
    expect(hand.handIndex).toBe(0);
    expect(hand.parsedData).toBeDefined();
  });
});
```

---

## Regression Testing Strategy

### Creating Regression Tests

When a bug is fixed, add a regression test to prevent it from happening again.

```typescript
describe('Regression Tests', () => {
  describe('Bug #42: Side pot calculation incorrect with 3-way all-in', () => {
    it('should correctly calculate side pots (fixed)', () => {
      // This was broken before fix
      const contributions = new Map([
        ['PlayerA', 100],
        ['PlayerB', 50],
        ['PlayerC', 200]
      ]);

      const pots = calculator.calculate(contributions);

      // Main pot: 150 (50 * 3)
      expect(pots[0].amount).toBe(150);

      // Side pot: 100 (50 * 2, A and C)
      expect(pots[1].amount).toBe(100);
      expect(pots[1].eligiblePlayers).not.toContain('PlayerB');
    });
  });

  describe('Bug #67: Currency cents/dollars confusion', () => {
    it('should not treat cents as dollars', () => {
      const amount = '1250'; // 1250 cents = $12.50

      const normalized = currencyNormalizer.normalize(amount, 'cents');

      expect(normalized).toBe(12.50); // Not 1250.00
    });
  });
});
```

---

## Code Coverage Requirements

### Coverage Targets

- **Overall**: 80% minimum
- **Financial Logic**: 100% required
- **Parsers**: 90% minimum
- **Controllers**: 70% minimum
- **DTOs**: Optional (no logic)

### Running Coverage

```bash
# Unit test coverage
npm run test:cov

# E2E coverage
npm run test:e2e:cov

# View coverage report
open coverage/lcov-report/index.html
```

### Enforcing Coverage

```json
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/bankroll-calculator.service.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './src/services/side-pot-calculator.service.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
```

---

## Best Practices

### 1. Test Naming Convention

```typescript
// Good
it('should calculate ROI correctly for tournament win', () => {});
it('should throw error when buyIn is negative', () => {});
it('should handle decimal precision in currency calculations', () => {});

// Bad
it('test1', () => {});
it('works', () => {});
it('roi', () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should calculate profit correctly', () => {
  // Arrange
  const buyIn = 100;
  const cashOut = 150;

  // Act
  const result = calculator.calculateProfit(buyIn, cashOut);

  // Assert
  expect(result).toBe(50);
});
```

### 3. One Assertion Per Test (when possible)

```typescript
// Good
it('should calculate profit', () => {
  expect(calculator.calculateProfit(100, 150)).toBe(50);
});

it('should calculate loss', () => {
  expect(calculator.calculateProfit(100, 75)).toBe(-25);
});

// Less ideal (but acceptable for related assertions)
it('should handle session creation', () => {
  const session = await service.create(dto, userId);

  expect(session.id).toBeDefined();
  expect(session.userId).toBe(userId);
  expect(session.result).toBe(50);
});
```

### 4. Use Test Factories

```typescript
// test/factories/user.factory.ts
export const createTestUser = async (prisma: PrismaService, overrides?: Partial<User>) => {
  return await prisma.user.create({
    data: {
      email: 'test@test.com',
      password: await hashPassword('Test123!'),
      firstName: 'Test',
      lastName: 'User',
      ...overrides
    }
  });
};

// Usage
it('should create session for user', async () => {
  const user = await createTestUser(prisma, { plan: 'PRO' });
  // ... test logic
});
```

---

**Last Updated**: October 2025
**Version**: 1.0.0
