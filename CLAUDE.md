# CLAUDE.md - PokerMastery

**AI Development Guide for Claude**

This document serves as the primary guide for Claude AI to understand, maintain, and develop the PokerMastery project efficiently. It provides context, conventions, and key information needed for effective collaboration.

---

## Recent Updates

### GGPoker Parser Fixes (2025-10-04) ⭐

Comprehensive improvements to GGPoker hand history parsing:
- **Buy-in extraction**: Now correctly displayed in summaries
- **Winnings accuracy**: Uses exact values from SUMMARY section (`playerWinnings`)
- **Ante handling**: Properly included in initial pot and displayed in central pot
- **Console cleanup**: Removed 50+ debug logs for cleaner output

**See**: [`Docs/GGPOKER_PARSER_FIXES_2025-10-04.md`](./Docs/GGPOKER_PARSER_FIXES_2025-10-04.md) for complete details.

---

## Table of Contents

- [Recent Updates](#recent-updates)
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Key Files Reference](#key-files-reference)
- [Common Commands](#common-commands)
- [Coding Conventions](#coding-conventions)
- [Testing Guidelines](#testing-guidelines)
- [Deployment](#deployment)

---

## Project Overview

### Mission

**PokerMastery** is a comprehensive ecosystem for poker players and teams, providing tools for bankroll management, GTO study, hand analysis, and coaching.

### Two-Pronged Approach

1. **B2C Mobile App** - Player-focused tools (bankroll, GTO, study lab, marketplace)
2. **B2B Web Platform (Team Pro)** - Team management for coaches and managers

### Current Phase: Beta (Hand Replayer)

Building the foundation with a web-based Hand History Replayer to:
- Validate market demand
- Capture email leads
- Test core parsing technology
- Generate organic buzz

---

## Technology Stack

### Backend (NestJS)

```
Framework: NestJS (TypeScript)
Database: PostgreSQL 14+
ORM: Prisma
Auth: JWT (Access + Refresh Tokens)
Validation: class-validator
Testing: Jest
```

**Why NestJS?**
- TypeScript-first architecture
- Dependency Injection built-in
- Excellent scalability
- Matches frontend tech (TypeScript)

### Frontend Mobile (React Native)

```
Framework: React Native + TypeScript
State: Zustand
Navigation: React Navigation
Styling: NativeWind (Tailwind for RN)
Platforms: iOS + Android
```

**Why React Native?**
- Single codebase for iOS/Android
- Fast development cycle
- Large ecosystem

### Frontend Web (Next.js)

```
Framework: Next.js 14+ (TypeScript)
Rendering: SSR + SSG
State: React Context + Zustand
Styling: Tailwind CSS
```

**Why Next.js?**
- Share components with React Native
- SEO-friendly (important for beta launch)
- Excellent DX (Developer Experience)

### Infrastructure

```
Database: PostgreSQL (managed service recommended)
Hosting: Vercel (frontend) / Railway or Heroku (backend)
File Storage: AWS S3 or Google Cloud Storage
OCR: Google Cloud Vision API (or built-in solution)
Payments: Stripe
```

---

## Project Structure

```
poker-grinders-edge/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # JWT authentication
│   │   │   ├── sessions/      # Poker session management
│   │   │   ├── hand-history-sessions/  # Hand history analysis
│   │   │   └── users/         # User management
│   │   ├── common/            # Shared code
│   │   │   ├── decorators/    # Custom decorators (@User, @RequirePlan)
│   │   │   ├── guards/        # Auth guards (JWT, Plan)
│   │   │   └── pipes/         # Validation pipes
│   │   ├── database/          # Prisma service
│   │   └── main.ts           # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Migration history
│   ├── test/                 # E2E tests
│   └── package.json
│
├── mobile/                    # React Native app (future)
│   ├── src/
│   │   ├── screens/          # App screens
│   │   ├── components/       # Reusable components
│   │   ├── navigation/       # Navigation config
│   │   ├── store/           # Zustand stores
│   │   └── services/        # API services
│   └── package.json
│
├── web/                      # Next.js web app (future)
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   └── lib/            # Utilities
│   └── package.json
│
└── Docs/                     # Documentation
    ├── PRD - PokerMastery.md
    ├── ARCHITECTURE.md
    ├── TROUBLESHOOTING.md
    ├── TESTING_STRATEGY.md
    ├── API_REFERENCE.md
    └── DATABASE_SCHEMA.md
```

---

## Development Workflow

### 1. Planning (Before Coding)

**Always check these documents first:**

1. **PRD** (`Docs/PRD - PokerMastery.md`) - Feature requirements
2. **ARCHITECTURE.md** - System design and patterns
3. **DATABASE_SCHEMA.md** - Database structure

**For new features:**
- Read PRD to understand business requirements
- Check ARCHITECTURE.md for design patterns to follow
- Review existing code for similar implementations

### 2. Development Process

**ALWAYS use Test-Driven Development (TDD) for:**
- Financial calculations (ROI, profit/loss, bankroll)
- Hand history parsing
- Side pot calculations
- Authentication logic

**TDD Workflow:**

```typescript
// 1. RED: Write failing test
describe('BankrollCalculator', () => {
  it('should calculate profit correctly', () => {
    const result = calculator.calculateProfit(100, 150);
    expect(result).toBe(50); // FAILS - function not implemented
  });
});

// 2. GREEN: Make it pass
calculateProfit(buyIn: number, cashOut: number): number {
  return cashOut - buyIn;
}

// 3. REFACTOR: Clean up while keeping tests green
calculateProfit(buyIn: number, cashOut: number): number {
  const buyInDecimal = new Decimal(buyIn);
  const cashOutDecimal = new Decimal(cashOut);
  return cashOutDecimal.minus(buyInDecimal).toNumber();
}
```

### 3. Code Review Checklist

Before committing:

- [ ] Tests pass (`npm test`)
- [ ] Code follows conventions (see below)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Documentation updated if needed
- [ ] Commit message follows convention

---

## Key Files Reference

### Essential Files to Read

**When working on authentication:**
```
backend/src/modules/auth/auth.service.ts
backend/src/common/guards/jwt-auth.guard.ts
backend/src/common/decorators/user.decorator.ts
```

**When working on sessions:**
```
backend/src/modules/sessions/sessions.service.ts
backend/src/modules/sessions/dto/session.dto.ts
backend/prisma/schema.prisma (Session model)
```

**When working on hand history:**
```
backend/src/modules/hand-history-sessions/hand-history-sessions.service.ts
Docs/TROUBLESHOOTING.md (Parsing section)
```

**When fixing bugs:**
```
Docs/TROUBLESHOOTING.md (First stop for debugging)
Docs/TESTING_STRATEGY.md (Regression tests)
```

### Configuration Files

```
backend/.env                    # Environment variables (DO NOT COMMIT)
backend/prisma/schema.prisma    # Database schema
backend/nest-cli.json          # NestJS config
backend/tsconfig.json          # TypeScript config
```

**Critical Environment Variables:**

```bash
# Database
DATABASE_URL="postgresql://..."

# JWT Secrets (MUST be strong in production)
JWT_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-change-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Node
NODE_ENV="development"  # or "production"
PORT="3000"
```

---

## Common Commands

### Backend

```bash
# Development
cd backend
npm install                    # Install dependencies
npm run start:dev             # Start dev server with hot-reload
npm run start:debug           # Start with debugger

# Database (Prisma)
npx prisma generate           # Generate Prisma client
npx prisma db push            # Push schema to database (dev)
npx prisma migrate dev        # Create new migration
npx prisma migrate deploy     # Apply migrations (production)
npx prisma studio             # Open database GUI

# Testing
npm test                      # Run unit tests
npm run test:watch           # Run tests in watch mode
npm run test:cov             # Generate coverage report
npm run test:e2e             # Run E2E tests

# Build & Deploy
npm run build                # Build for production
npm run start:prod           # Start production server
```

### Mobile (Future)

```bash
cd mobile
npm install
npx react-native run-android  # Run on Android
npx react-native run-ios      # Run on iOS
npm test                      # Run tests
```

### Web (Future)

```bash
cd web
npm install
npm run dev                   # Start dev server
npm run build                # Build for production
npm run start                # Start production server
```

---

## Coding Conventions

### File Naming

```
✅ CORRECT:
sessions.service.ts           # Service
sessions.controller.ts        # Controller
sessions.module.ts           # Module
session.dto.ts               # DTO
create-session.dto.ts        # Specific DTO
sessions.service.spec.ts     # Test
session.interface.ts         # Interface

❌ INCORRECT:
SessionsService.ts           # PascalCase for files
sessions-service.ts          # Alternative kebab-case
sessions_service.ts          # snake_case
```

### TypeScript Conventions

```typescript
// Interfaces: PascalCase with 'I' prefix (backend) or no prefix (frontend)
interface IPokerSiteParser {
  parse(handText: string): ParseResult;
}

// Classes: PascalCase
class SessionsService {
  // Methods: camelCase
  async create(dto: CreateSessionDto): Promise<Session> {
    // ...
  }
}

// Constants: UPPER_SNAKE_CASE
const MAX_FREE_SESSIONS = 20;
const DEFAULT_RAKE_PERCENTAGE = 0.05;

// Variables: camelCase
const totalProfit = 100;
const userSessions = await this.prisma.session.findMany();

// Enums: PascalCase
enum GameType {
  CASH = 'CASH',
  TOURNAMENT = 'TOURNAMENT'
}
```

### NestJS Patterns

**Controllers** (thin - just route handling):

```typescript
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @CurrentUser() user: User
  ) {
    return this.sessionsService.create(createSessionDto, user.id);
  }
}
```

**Services** (fat - business logic here):

```typescript
@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSessionDto, userId: string): Promise<Session> {
    // Validate
    this.validateSessionData(dto);

    // Calculate
    const result = this.calculateProfit(dto);

    // Save
    return await this.prisma.session.create({
      data: { ...dto, userId, result }
    });
  }

  private validateSessionData(dto: CreateSessionDto): void {
    // Validation logic
  }

  private calculateProfit(dto: CreateSessionDto): number {
    // Calculation logic
  }
}
```

**DTOs** (validation with class-validator):

```typescript
export class CreateSessionDto {
  @IsNotEmpty()
  @IsEnum(GameType)
  gameType: GameType;

  @IsNumber()
  @Min(0)
  buyIn: number;

  @IsNumber()
  cashOut: number;

  @IsString()
  @IsOptional()
  location?: string;
}
```

### Comments

**DO comment:**
- Complex algorithms
- Business logic reasons ("why", not "what")
- API contracts
- TODOs with context

```typescript
// GOOD: Explains WHY
// We use Decimal.js here to avoid floating-point precision errors
// which are critical for financial calculations
const profit = new Decimal(cashOut).minus(buyIn);

// BAD: Explains WHAT (obvious from code)
// Calculate profit
const profit = cashOut - buyIn;

// GOOD: TODO with context
// TODO: Integrate real HandParser when Strategy Pattern is complete
// Currently using placeholder mock data
const parsedHands = await this.parseMultipleHandsPlaceholder(rawHandHistory);
```

**DON'T comment:**
- Obvious code
- Commented-out code (delete it instead)
- Auto-generated comments

---

## Testing Guidelines

### Coverage Requirements

```
Overall: 80% minimum
Financial logic: 100% required
Parsers: 90% minimum
Controllers: 70% minimum
```

### Test Structure

```typescript
describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: PrismaService;

  beforeEach(() => {
    // Setup
    prisma = mockPrismaService();
    service = new SessionsService(prisma);
  });

  describe('create', () => {
    it('should create a cash game session', async () => {
      // Arrange
      const dto = {
        gameType: GameType.CASH,
        buyIn: 100,
        cashOut: 150
      };

      // Act
      const result = await service.create(dto, 'user-123');

      // Assert
      expect(result.result).toBe(50);
    });
  });
});
```

### What to Test

**ALWAYS test:**
- Financial calculations
- Authentication/authorization
- Data validation
- Business logic

**Optional to test:**
- Simple DTOs
- Basic getters/setters
- Auto-generated code

---

## Deployment

### Environment Setup

**Development:**
```bash
NODE_ENV=development
DATABASE_URL="postgresql://localhost:5432/poker_dev"
```

**Production:**
```bash
NODE_ENV=production
DATABASE_URL="postgresql://prod_server/poker_prod?sslmode=require"
JWT_SECRET="strong-random-secret"  # MUST be different from dev
```

### Deployment Checklist

- [ ] All tests pass
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Build succeeds
- [ ] Health check endpoint working

### CI/CD Pipeline (Future)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - run: npm run build
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

---

## Important Reminders for Claude

### When Starting a Task

1. **Read relevant documentation first**:
   - PRD for feature requirements
   - ARCHITECTURE.md for design patterns
   - Existing code for implementation examples

2. **Check for existing solutions**:
   - Use Grep to search for similar code
   - Don't reinvent the wheel

3. **Plan before coding**:
   - Break down into smaller tasks
   - Identify what needs tests
   - Consider edge cases

### When Writing Code

1. **Follow TDD for critical code**:
   - Write test first
   - Make it pass
   - Refactor

2. **Use existing patterns**:
   - Strategy Pattern for parsers
   - Repository Pattern for database
   - Dependency Injection everywhere

3. **Think about edge cases**:
   - What if input is null?
   - What if user has no permissions?
   - What about currency precision?

### When Debugging

1. **Check TROUBLESHOOTING.md first**:
   - Common issues documented
   - Debug logging examples
   - Solution patterns

2. **Add debug logging**:
   - Use structured logs
   - Log input/output
   - Track execution flow

3. **Write regression test**:
   - After fixing bug, add test
   - Prevent same bug in future

---

## Commit Message Convention

Follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactor
- `test`: Add/update tests
- `chore`: Maintenance

**Examples:**

```bash
feat(bankroll): add tournament ROI calculation

Implements ROI calculation for tournaments including
rebuys, add-ons, and bounties.

Closes #42
```

```bash
fix(parser): correct side pot calculation for 3-way all-in

Fixed incorrect pot distribution when three players
with different stack sizes go all-in.

Bug #67
```

```bash
test(sessions): add comprehensive tests for session creation

Covers cash games, tournaments, and edge cases.
```

---

## Quick Reference Card

**Starting a new feature:**
1. Read PRD section
2. Check ARCHITECTURE.md patterns
3. Write tests first (TDD)
4. Implement minimal code
5. Refactor

**Fixing a bug:**
1. Check TROUBLESHOOTING.md
2. Add debug logging
3. Write regression test
4. Fix bug
5. Verify test passes

**Working with database:**
1. Update schema.prisma
2. Run `npx prisma migrate dev`
3. Update DTOs if needed
4. Run tests

**Before committing:**
1. Run tests (`npm test`)
2. Check build (`npm run build`)
3. Write conventional commit message
4. Push to feature branch

---

## Contact & Resources

- **PRD**: `Docs/PRD - PokerMastery.md`
- **Architecture**: `ARCHITECTURE.md`
- **Troubleshooting**: `Docs/TROUBLESHOOTING.md`
- **API Docs**: `Docs/API_REFERENCE.md`
- **Database**: `Docs/DATABASE_SCHEMA.md`
- **Testing**: `Docs/TESTING_STRATEGY.md`

---

**Last Updated**: October 2025
**Version**: 1.0.0

---

**Remember**: Quality over speed. Write tests. Document decisions. Ask if unsure.
