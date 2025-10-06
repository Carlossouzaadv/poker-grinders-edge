# Troubleshooting Guide - Poker Grinder's Edge

This comprehensive troubleshooting guide covers common issues, debugging strategies, and solutions for the Poker Grinder's Edge application. Use this guide to diagnose and resolve problems efficiently.

## Table of Contents

- [Recent Fixes](#recent-fixes)
- [Hand History Parsing Issues](#hand-history-parsing-issues)
- [Side Pot Calculation Problems](#side-pot-calculation-problems)
- [Pot Accuracy Issues](#pot-accuracy-issues)
- [Currency Conversion (Cents vs Dollars)](#currency-conversion-cents-vs-dollars)
- [Empty Snapshots Debugging](#empty-snapshots-debugging)
- [Authentication and JWT Issues](#authentication-and-jwt-issues)
- [Database Connection Problems](#database-connection-problems)
- [Performance Issues](#performance-issues)
- [Common Error Messages](#common-error-messages)

---

## Recent Fixes

### GGPoker Parser Comprehensive Fixes (2025-10-04)

**Critical fixes implemented for GGPoker hand history parsing:**

✅ **Buy-in Display**: Tournament buy-in now extracts and displays correctly (e.g., "$2.50")
✅ **Winner Winnings**: Values now match SUMMARY section exactly (uses `playerWinnings` from "and won (X)")
✅ **Pot Initial with Antes**: Antes now included in initial pot calculation (e.g., 2,040 instead of 1,200)
✅ **Visual Improvement**: Antes go directly to central pot, only blinds show next to players
✅ **Console Cleanup**: Removed 50+ debug logs, console now clean during parsing

**For complete details, see**: [`GGPOKER_PARSER_FIXES_2025-10-04.md`](./GGPOKER_PARSER_FIXES_2025-10-04.md)

**Files Modified**:
- `web/src/lib/hand-parser.ts` - Parser logic fixes
- `web/src/types/poker.ts` - Added playerWinnings type
- `web/src/components/poker/HandSummary.tsx` - Winnings display
- `web/src/components/poker/PokerTable.tsx` - Table replay winnings
- `web/src/lib/snapshot-builder.ts` - Antes visualization

---

## Hand History Parsing Issues

### Problem: "Failed to parse hand history" Error

Hand history parsing failures are the most common issue when users upload .txt files from poker sites.

#### Symptoms
```
BadRequestException: Failed to parse hand history: Invalid format detected
```

#### Common Causes

1. **Unsupported Site Format**: The parser doesn't recognize the poker site format
2. **Corrupted File**: The file was truncated or modified
3. **Mixed Formats**: Multiple site formats in one file
4. **Encoding Issues**: Non-UTF8 characters in the file

#### Debugging Steps

**Step 1: Enable Debug Logging**

Add logging to `hand-history-sessions.service.ts`:

```typescript
async uploadHandHistory(uploadDto: UploadHandHistoryDto, userId: string) {
  const { rawHandHistory, name, siteFormat } = uploadDto;

  // Log the first 500 characters to identify format
  console.log('[DEBUG] First 500 chars:', rawHandHistory.substring(0, 500));
  console.log('[DEBUG] Total length:', rawHandHistory.length);
  console.log('[DEBUG] Site hint:', siteFormat);

  try {
    const parsedHands = await this.parseMultipleHands(rawHandHistory, siteFormat);
    // ... rest of code
  } catch (error) {
    console.error('[ERROR] Parsing failed:', error.message);
    console.error('[ERROR] Stack trace:', error.stack);
    throw error;
  }
}
```

**Step 2: Validate File Format**

Check the header line to identify the site:

```typescript
// Add to hand-history-sessions.service.ts
private detectPokerSite(rawText: string): string {
  const firstLine = rawText.split('\n')[0];

  console.log('[DEBUG] First line:', firstLine);

  if (firstLine.includes('PokerStars Hand')) {
    return 'PokerStars';
  } else if (firstLine.includes('GGPoker Hand')) {
    return 'GGPoker';
  } else if (firstLine.includes('PartyPoker Hand')) {
    return 'PartyPoker';
  } else if (firstLine.includes('Ignition Hand')) {
    return 'Ignition';
  }

  throw new Error(`Unknown poker site format. First line: ${firstLine}`);
}
```

**Step 3: Analyze Individual Hand Boundaries**

```typescript
// Split by hand boundaries
const handTexts = rawHandHistory.split(/\n\n\n/); // PokerStars uses triple newlines
console.log('[DEBUG] Total hands found:', handTexts.length);
console.log('[DEBUG] First hand preview:', handTexts[0].substring(0, 200));
```

#### Solutions

**Solution 1: Add Site-Specific Parser**

If the site is not supported, create a new parser following the Strategy Pattern:

```typescript
// Create parsers/ignition-parser.ts
export class IgnitionParser implements IPokerSiteParser {
  getSiteName(): string {
    return 'Ignition';
  }

  validateFormat(handText: string): boolean {
    return handText.includes('Ignition Hand');
  }

  parse(handText: string): ParseResult {
    // Site-specific parsing logic
    const lines = handText.split('\n');
    const headerLine = lines[0];

    // Parse header: "Ignition Hand #123456789 TBL#12345 - RING NO_LIMIT HOLD'EM $0.25/$0.50"
    const handIdMatch = headerLine.match(/Hand #(\d+)/);
    const handId = handIdMatch ? handIdMatch[1] : null;

    // ... continue parsing

    return {
      handId,
      site: 'Ignition',
      // ... other fields
    };
  }

  detectGameContext(headerLine: string): GameContext {
    // Extract game type, stakes, etc.
    return {
      gameType: 'CASH',
      stakes: '$0.25/$0.50',
      variant: 'NLHE'
    };
  }
}
```

**Solution 2: Handle Encoding Issues**

```typescript
// Add encoding validation
private validateEncoding(text: string): string {
  // Remove non-UTF8 characters
  return text.replace(/[^\x00-\x7F]/g, '');
}
```

**Solution 3: Retry with Auto-Detection**

```typescript
async uploadHandHistory(uploadDto: UploadHandHistoryDto, userId: string) {
  let { siteFormat } = uploadDto;

  // If site not provided, auto-detect
  if (!siteFormat) {
    siteFormat = this.detectPokerSite(uploadDto.rawHandHistory);
    console.log('[INFO] Auto-detected site:', siteFormat);
  }

  // Continue with parsing...
}
```

---

## Side Pot Calculation Problems

### Problem: Incorrect Side Pot Distribution

Side pots occur when players have different stack sizes and go all-in. Calculating them correctly is crucial for accurate hand analysis.

#### Symptoms
- Side pot amounts don't match the actual hand history
- Players showing incorrect winnings
- Total pot doesn't equal sum of main + side pots

#### Example of Problematic Scenario

```
Hero (100 BB) - All-in for 100 BB
Villain1 (50 BB) - All-in for 50 BB
Villain2 (200 BB) - Calls 100 BB

Expected:
- Main Pot: 150 BB (50 x 3 players)
- Side Pot 1: 100 BB (50 x 2 players: Hero + Villain2)

Common Error:
- Main Pot: 100 BB (incorrect)
- Side Pot: 150 BB (incorrect)
```

#### Debugging Steps

**Step 1: Log All Betting Actions**

```typescript
// In parser logic
private calculatePots(actions: BettingAction[], players: Player[]) {
  console.log('[POT DEBUG] All betting actions:', JSON.stringify(actions, null, 2));
  console.log('[POT DEBUG] Player stacks:', players.map(p => ({
    name: p.name,
    stack: p.stack
  })));

  // Track contributions per player
  const contributions = new Map<string, number>();

  actions.forEach(action => {
    if (['BET', 'CALL', 'RAISE', 'ALL_IN'].includes(action.type)) {
      const current = contributions.get(action.playerName) || 0;
      contributions.set(action.playerName, current + action.amount);

      console.log(`[POT DEBUG] ${action.playerName} total contribution: ${current + action.amount}`);
    }
  });

  return this.calculateSidePots(contributions, players);
}
```

**Step 2: Implement Correct Side Pot Algorithm**

```typescript
interface PotDistribution {
  potNumber: number;
  amount: number;
  eligiblePlayers: string[];
}

private calculateSidePots(
  contributions: Map<string, number>,
  players: Player[]
): PotDistribution[] {
  const pots: PotDistribution[] = [];

  // Convert to array and sort by contribution amount (ascending)
  const sortedContributions = Array.from(contributions.entries())
    .sort((a, b) => a[1] - b[1]);

  console.log('[SIDE POT] Sorted contributions:', sortedContributions);

  let remainingPlayers = sortedContributions.map(c => c[0]);
  let previousLevel = 0;

  sortedContributions.forEach(([playerName, totalContribution], index) => {
    if (totalContribution === previousLevel) {
      // Same contribution as previous player, add to same pot
      return;
    }

    const levelDiff = totalContribution - previousLevel;
    const potAmount = levelDiff * remainingPlayers.length;

    console.log(`[SIDE POT] Creating pot ${index}: ${potAmount} chips`);
    console.log(`[SIDE POT] Eligible players:`, remainingPlayers);

    pots.push({
      potNumber: index,
      amount: potAmount,
      eligiblePlayers: [...remainingPlayers]
    });

    // Remove this player from future pots (they're all-in)
    remainingPlayers = remainingPlayers.filter(p => p !== playerName);
    previousLevel = totalContribution;
  });

  return pots;
}
```

**Step 3: Validate Total Pot**

```typescript
private validatePotCalculation(pots: PotDistribution[], expectedTotal: number) {
  const calculatedTotal = pots.reduce((sum, pot) => sum + pot.amount, 0);

  if (Math.abs(calculatedTotal - expectedTotal) > 0.01) {
    console.error('[POT ERROR] Pot mismatch!');
    console.error(`  Expected: ${expectedTotal}`);
    console.error(`  Calculated: ${calculatedTotal}`);
    console.error(`  Difference: ${Math.abs(calculatedTotal - expectedTotal)}`);
    console.error(`  Pots breakdown:`, pots);

    throw new Error(`Pot calculation mismatch: ${calculatedTotal} !== ${expectedTotal}`);
  }

  console.log('[POT VALIDATION]  Total pot matches:', calculatedTotal);
  return true;
}
```

#### Solutions

**Solution 1: Use Tested Side Pot Calculator**

Create a dedicated service:

```typescript
// services/side-pot-calculator.service.ts
@Injectable()
export class SidePotCalculatorService {
  calculate(playerBets: Map<string, number>): PotDistribution[] {
    // Implement tested algorithm
    // Include extensive unit tests
    return this.calculateWithValidation(playerBets);
  }

  private calculateWithValidation(playerBets: Map<string, number>): PotDistribution[] {
    const pots = this.calculateSidePots(playerBets);

    // Validate
    const totalBets = Array.from(playerBets.values()).reduce((a, b) => a + b, 0);
    const totalPots = pots.reduce((sum, pot) => sum + pot.amount, 0);

    if (totalBets !== totalPots) {
      throw new Error('Side pot calculation failed validation');
    }

    return pots;
  }
}
```

**Solution 2: Add Comprehensive Tests**

```typescript
// side-pot-calculator.service.spec.ts
describe('SidePotCalculatorService', () => {
  it('should calculate simple all-in scenario', () => {
    const bets = new Map([
      ['Player1', 100],
      ['Player2', 50],
      ['Player3', 100]
    ]);

    const pots = calculator.calculate(bets);

    expect(pots).toHaveLength(2);
    expect(pots[0].amount).toBe(150); // Main pot: 50 * 3
    expect(pots[0].eligiblePlayers).toHaveLength(3);
    expect(pots[1].amount).toBe(100); // Side pot: 50 * 2
    expect(pots[1].eligiblePlayers).toHaveLength(2);
  });

  it('should handle three-way all-in with different stacks', () => {
    const bets = new Map([
      ['Short', 25],
      ['Medium', 75],
      ['Big', 150]
    ]);

    const pots = calculator.calculate(bets);

    expect(pots).toHaveLength(3);
    expect(pots[0].amount).toBe(75);  // 25 * 3 players
    expect(pots[1].amount).toBe(100); // 50 * 2 players
    expect(pots[2].amount).toBe(75);  // 75 * 1 player
  });
});
```

---

## Pot Accuracy Issues

### Problem: Pot Total Doesn't Match Hand History

#### Symptoms
```
Expected pot: $125.50
Calculated pot: $125.00
Difference: $0.50 (rake not accounted for)
```

#### Common Causes

1. **Rake Not Parsed**: Some sites include rake in the pot total
2. **Decimal Precision**: Rounding errors in calculations
3. **Ante Not Included**: Tournament antes not added to pot
4. **Bounties Separate**: PKO bounties counted separately

#### Debugging Steps

**Step 1: Log Pot Components**

```typescript
interface PotComponents {
  blinds: number;
  antes: number;
  bets: number;
  rake: number;
  bounty: number;
  total: number;
}

private analyzePotComponents(handData: ParsedHand): PotComponents {
  const components: PotComponents = {
    blinds: 0,
    antes: 0,
    bets: 0,
    rake: 0,
    bounty: 0,
    total: 0
  };

  // Parse blinds
  handData.actions.forEach(action => {
    if (action.type === 'POST_BLIND') {
      components.blinds += action.amount;
      console.log(`[POT] Blind posted: ${action.amount}`);
    } else if (action.type === 'POST_ANTE') {
      components.antes += action.amount;
      console.log(`[POT] Ante posted: ${action.amount}`);
    } else if (['BET', 'CALL', 'RAISE'].includes(action.type)) {
      components.bets += action.amount;
      console.log(`[POT] Bet: ${action.amount}`);
    }
  });

  // Check for rake
  const rakeMatch = handData.rawText.match(/Rake \$?([0-9.]+)/i);
  if (rakeMatch) {
    components.rake = parseFloat(rakeMatch[1]);
    console.log(`[POT] Rake detected: ${components.rake}`);
  }

  components.total = components.blinds + components.antes + components.bets;

  console.log('[POT] Components breakdown:', components);

  return components;
}
```

**Step 2: Handle Decimal Precision**

```typescript
// Use Decimal.js for accurate currency calculations
import { Decimal } from 'decimal.js';

class PotCalculator {
  calculateTotal(components: number[]): number {
    // Use Decimal for precision
    let total = new Decimal(0);

    components.forEach(amount => {
      total = total.plus(new Decimal(amount));
    });

    // Round to 2 decimal places
    return total.toDecimalPlaces(2).toNumber();
  }
}
```

#### Solutions

**Solution 1: Separate Rake Tracking**

```typescript
interface PotResult {
  mainPot: number;
  sidePots: SidePot[];
  totalPot: number;
  rake: number;
  netPot: number; // Total minus rake
}

private calculatePotWithRake(handData: ParsedHand): PotResult {
  const totalBets = this.sumAllBets(handData.actions);
  const rake = this.extractRake(handData.rawText);

  return {
    mainPot: totalBets - rake,
    sidePots: this.calculateSidePots(handData),
    totalPot: totalBets,
    rake: rake,
    netPot: totalBets - rake
  };
}
```

**Solution 2: Tournament Ante Handling**

```typescript
private parseTournamentAntes(handData: ParsedHand): number {
  let totalAntes = 0;

  // Check for button ante (GGPoker style)
  const buttonAnteMatch = handData.rawText.match(/posts button ante \$?([0-9.]+)/i);
  if (buttonAnteMatch) {
    totalAntes = parseFloat(buttonAnteMatch[1]);
    console.log('[POT] Button ante:', totalAntes);
    return totalAntes;
  }

  // Check for regular antes (each player)
  const anteMatches = handData.rawText.matchAll(/posts ante \$?([0-9.]+)/gi);
  for (const match of anteMatches) {
    totalAntes += parseFloat(match[1]);
  }

  console.log('[POT] Total antes:', totalAntes);
  return totalAntes;
}
```

---

## Currency Conversion (Cents vs Dollars)

### Problem: Amounts in Wrong Units (Cents vs Dollars)

This is a critical issue that can cause 100x errors in calculations.

#### Symptoms
```
Expected: $12.50
Displayed: $1250.00 (cents treated as dollars)

Or:

Expected: $125.00
Displayed: $1.25 (dollars treated as cents)
```

#### Root Cause Analysis

Different poker sites use different formats:
- **PokerStars**: Uses dollars with decimals ($12.50)
- **Some sites**: Use cents as integers (1250)
- **Database**: Stores as Decimal(10,2)

#### Debugging Steps

**Step 1: Add Unit Validation**

```typescript
enum CurrencyUnit {
  CENTS = 'CENTS',
  DOLLARS = 'DOLLARS'
}

interface AmountWithUnit {
  value: number;
  unit: CurrencyUnit;
  displayValue: string; // "$12.50"
}

private parseAmount(amountString: string, siteFormat: string): AmountWithUnit {
  const cleanAmount = amountString.replace(/[$,]/g, '');
  const numericValue = parseFloat(cleanAmount);

  // Detect unit based on site format and decimal point
  const hasDot = amountString.includes('.');
  const unit = hasDot ? CurrencyUnit.DOLLARS : CurrencyUnit.CENTS;

  console.log(`[CURRENCY] Parsed: "${amountString}" -> ${numericValue} ${unit}`);

  return {
    value: numericValue,
    unit: unit,
    displayValue: this.formatCurrency(numericValue, unit)
  };
}
```

**Step 2: Normalize to Database Format**

```typescript
class CurrencyNormalizer {
  // Always store in database as dollars (Decimal 10,2)
  normalizeToDollars(amount: AmountWithUnit): number {
    if (amount.unit === CurrencyUnit.CENTS) {
      const dollars = amount.value / 100;
      console.log(`[CURRENCY] Converting ${amount.value} cents -> $${dollars}`);
      return dollars;
    }

    console.log(`[CURRENCY] Already in dollars: $${amount.value}`);
    return amount.value;
  }

  // Format for display
  formatForDisplay(dbAmount: number): string {
    return `$${dbAmount.toFixed(2)}`;
  }

  // Validate reasonable range (catch 100x errors)
  validate(amount: number, context: string): void {
    if (amount > 1000000) {
      console.error(`[CURRENCY ERROR] Suspiciously large amount: ${amount} in ${context}`);
      console.error('This might be cents treated as dollars!');
      throw new Error(`Invalid amount: ${amount} seems too large`);
    }

    if (amount < 0.01 && amount !== 0) {
      console.error(`[CURRENCY ERROR] Suspiciously small amount: ${amount} in ${context}`);
      console.error('This might be dollars treated as cents!');
      throw new Error(`Invalid amount: ${amount} seems too small`);
    }
  }
}
```

#### Solutions

**Solution 1: Site-Specific Currency Handling**

```typescript
// In each parser
class PokerStarsParser implements IPokerSiteParser {
  getCurrencyUnit(): CurrencyUnit {
    return CurrencyUnit.DOLLARS; // PokerStars always uses dollars
  }

  parseAmount(amountString: string): number {
    const cleaned = amountString.replace(/[$,]/g, '');
    const amount = parseFloat(cleaned);

    // PokerStars amounts are already in dollars
    return amount;
  }
}

class GGPokerParser implements IPokerSiteParser {
  getCurrencyUnit(): CurrencyUnit {
    // GGPoker might use cents in some formats
    return CurrencyUnit.CENTS;
  }

  parseAmount(amountString: string): number {
    const cleaned = amountString.replace(/[$,]/g, '');
    const cents = parseInt(cleaned);

    // Convert to dollars for database
    return cents / 100;
  }
}
```

**Solution 2: Add Validation Layer**

```typescript
@Injectable()
export class SessionsService {
  async create(createSessionDto: CreateSessionDto, userId: string) {
    // Validate currency amounts before saving
    this.validateCurrencyAmounts(createSessionDto);

    // Normalize to database format
    const normalized = this.normalizeCurrency(createSessionDto);

    // Save to database
    return this.prisma.session.create({
      data: {
        ...normalized,
        userId
      }
    });
  }

  private validateCurrencyAmounts(dto: CreateSessionDto): void {
    const validator = new CurrencyNormalizer();

    if (dto.buyIn) {
      validator.validate(dto.buyIn, 'buyIn');
    }

    if (dto.cashOut) {
      validator.validate(dto.cashOut, 'cashOut');
    }

    if (dto.result) {
      validator.validate(Math.abs(dto.result), 'result');
    }
  }
}
```

**Solution 3: Add Tests**

```typescript
describe('Currency Conversion', () => {
  it('should correctly parse PokerStars amounts', () => {
    const parser = new PokerStarsParser();

    expect(parser.parseAmount('$12.50')).toBe(12.50);
    expect(parser.parseAmount('$1,234.56')).toBe(1234.56);
    expect(parser.parseAmount('$0.01')).toBe(0.01);
  });

  it('should detect cents treated as dollars', () => {
    const validator = new CurrencyNormalizer();

    // This should throw - 125000 is likely cents
    expect(() => validator.validate(125000, 'test')).toThrow();
  });

  it('should detect dollars treated as cents', () => {
    const validator = new CurrencyNormalizer();

    // This should throw - 0.001 is too small
    expect(() => validator.validate(0.001, 'test')).toThrow();
  });
});
```

---

## Empty Snapshots Debugging

### Problem: Hand History Session Contains No Hands

#### Symptoms
```json
{
  "id": "session-abc-123",
  "name": "PokerStars Session",
  "totalHands": 0,
  "hands": []
}
```

#### Common Causes

1. **Incorrect Hand Delimiter**: Parser can't split individual hands
2. **Format Not Recognized**: Site format unknown
3. **Empty File**: User uploaded empty content
4. **Whitespace Issues**: Extra newlines confusing parser

#### Debugging Steps

**Step 1: Log Raw Input**

```typescript
async uploadHandHistory(uploadDto: UploadHandHistoryDto, userId: string) {
  const { rawHandHistory } = uploadDto;

  console.log('[SNAPSHOT DEBUG] ===== RAW INPUT ANALYSIS =====');
  console.log('[SNAPSHOT DEBUG] Total length:', rawHandHistory.length);
  console.log('[SNAPSHOT DEBUG] First 100 chars:', rawHandHistory.substring(0, 100));
  console.log('[SNAPSHOT DEBUG] Last 100 chars:', rawHandHistory.substring(rawHandHistory.length - 100));

  // Check for common delimiters
  console.log('[SNAPSHOT DEBUG] Contains "PokerStars Hand":', rawHandHistory.includes('PokerStars Hand'));
  console.log('[SNAPSHOT DEBUG] Contains "GGPoker Hand":', rawHandHistory.includes('GGPoker Hand'));
  console.log('[SNAPSHOT DEBUG] Newline count:', (rawHandHistory.match(/\n/g) || []).length);
  console.log('[SNAPSHOT DEBUG] Double newline count:', (rawHandHistory.match(/\n\n/g) || []).length);
  console.log('[SNAPSHOT DEBUG] Triple newline count:', (rawHandHistory.match(/\n\n\n/g) || []).length);

  // ... continue with parsing
}
```

**Step 2: Test Hand Splitting**

```typescript
private splitHandTexts(rawHandHistory: string, siteFormat: string): string[] {
  console.log('[SPLIT DEBUG] Attempting to split hands for:', siteFormat);

  let delimiter: RegExp;
  let handTexts: string[];

  switch (siteFormat) {
    case 'PokerStars':
      delimiter = /\n\n\n/; // PokerStars uses triple newline
      break;
    case 'GGPoker':
      delimiter = /\n\n/; // GGPoker uses double newline
      break;
    default:
      // Try to auto-detect
      delimiter = /\n\n+/; // One or more double newlines
  }

  handTexts = rawHandHistory.split(delimiter).filter(text => text.trim().length > 0);

  console.log('[SPLIT DEBUG] Delimiter used:', delimiter);
  console.log('[SPLIT DEBUG] Total hands found:', handTexts.length);

  if (handTexts.length === 0) {
    console.error('[SPLIT DEBUG] No hands found! Trying alternative delimiters...');

    // Try alternative: split by "Hand #"
    const altHandTexts = this.splitByHandMarker(rawHandHistory);
    console.log('[SPLIT DEBUG] Alternative split found:', altHandTexts.length, 'hands');

    if (altHandTexts.length > 0) {
      return altHandTexts;
    }
  }

  return handTexts;
}

private splitByHandMarker(rawHandHistory: string): string[] {
  // Try to split by hand marker (e.g., "PokerStars Hand #", "Hand #", etc.)
  const handMarkers = [
    /PokerStars Hand #/,
    /GGPoker Hand #/,
    /PartyPoker Hand #/,
    /Hand #/
  ];

  for (const marker of handMarkers) {
    const parts = rawHandHistory.split(marker);

    if (parts.length > 1) {
      console.log(`[SPLIT DEBUG] Found ${parts.length - 1} hands using marker: ${marker}`);

      // Reconstruct hands with marker
      const hands = parts.slice(1).map((part, index) => {
        const markerText = marker.source.replace(/\\/g, '');
        return markerText + part;
      });

      return hands;
    }
  }

  return [];
}
```

**Step 3: Validate Each Hand**

```typescript
private parseMultipleHands(rawHandHistory: string, siteFormat?: string): ParsedHand[] {
  const handTexts = this.splitHandTexts(rawHandHistory, siteFormat);
  const parsedHands: ParsedHand[] = [];

  handTexts.forEach((handText, index) => {
    console.log(`[PARSE DEBUG] Parsing hand ${index + 1}/${handTexts.length}`);
    console.log(`[PARSE DEBUG] Hand length: ${handText.length}`);
    console.log(`[PARSE DEBUG] First line: ${handText.split('\n')[0]}`);

    try {
      const parsed = this.parseIndividualHand(handText, siteFormat);

      if (this.validateParsedHand(parsed)) {
        parsedHands.push(parsed);
        console.log(`[PARSE DEBUG]  Hand ${index + 1} parsed successfully`);
      } else {
        console.warn(`[PARSE DEBUG]  Hand ${index + 1} failed validation`);
      }
    } catch (error) {
      console.error(`[PARSE DEBUG]  Hand ${index + 1} parsing failed:`, error.message);
      // Continue with next hand instead of failing completely
    }
  });

  console.log(`[PARSE DEBUG] Successfully parsed ${parsedHands.length}/${handTexts.length} hands`);

  return parsedHands;
}

private validateParsedHand(hand: ParsedHand): boolean {
  if (!hand.handId) {
    console.error('[VALIDATION] Missing handId');
    return false;
  }

  if (!hand.players || hand.players.length === 0) {
    console.error('[VALIDATION] No players found');
    return false;
  }

  if (!hand.actions || hand.actions.length === 0) {
    console.error('[VALIDATION] No actions found');
    return false;
  }

  console.log('[VALIDATION]  Hand valid:', {
    handId: hand.handId,
    players: hand.players.length,
    actions: hand.actions.length
  });

  return true;
}
```

#### Solutions

**Solution 1: Robust Hand Splitting**

```typescript
@Injectable()
export class HandSplitterService {
  split(rawHandHistory: string, siteFormat?: string): string[] {
    // Try multiple strategies
    const strategies = [
      () => this.splitByTripleNewline(rawHandHistory),
      () => this.splitByDoubleNewline(rawHandHistory),
      () => this.splitByHandMarker(rawHandHistory),
      () => this.splitByCustomRegex(rawHandHistory, siteFormat)
    ];

    for (const strategy of strategies) {
      const result = strategy();

      if (result.length > 0) {
        console.log(`[SPLITTER] Strategy succeeded: ${strategy.name}, found ${result.length} hands`);
        return result;
      }
    }

    console.error('[SPLITTER] All strategies failed');
    return [];
  }
}
```

**Solution 2: Graceful Error Handling**

```typescript
async uploadHandHistory(uploadDto: UploadHandHistoryDto, userId: string) {
  try {
    const parsedHands = await this.parseMultipleHands(
      uploadDto.rawHandHistory,
      uploadDto.siteFormat
    );

    if (!parsedHands || parsedHands.length === 0) {
      // Still create session, but with detailed error
      throw new BadRequestException({
        message: 'No valid hands found in the provided hand history',
        details: {
          rawLength: uploadDto.rawHandHistory.length,
          siteFormat: uploadDto.siteFormat,
          suggestions: [
            'Check if the file format is correct',
            'Ensure the file is not empty',
            'Try specifying the poker site explicitly'
          ]
        }
      });
    }

    // Continue with normal flow
    // ...
  } catch (error) {
    console.error('[UPLOAD ERROR] Full error:', error);
    throw error;
  }
}
```

---

## Authentication and JWT Issues

### Problem: "Unauthorized" or "Token Expired" Errors

#### Symptoms
```
401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Common Causes

1. **Token Expired**: JWT access token expired (default 7 days)
2. **Invalid Signature**: Token was modified or wrong secret key
3. **Missing Token**: Authorization header not sent
4. **Refresh Token Issues**: Refresh token expired or invalidated

#### Debugging Steps

**Step 1: Verify Token Format**

```typescript
// Add logging to JWT strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    console.log('[JWT DEBUG] Token payload:', payload);
    console.log('[JWT DEBUG] Token exp:', new Date(payload.exp * 1000));
    console.log('[JWT DEBUG] Current time:', new Date());
    console.log('[JWT DEBUG] Token valid for:', payload.exp * 1000 - Date.now(), 'ms');

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user) {
      console.error('[JWT DEBUG] User not found:', payload.sub);
      throw new UnauthorizedException('User not found');
    }

    console.log('[JWT DEBUG]  User validated:', user.email);
    return user;
  }
}
```

**Step 2: Check Token in Database**

```typescript
async validateRefreshToken(refreshToken: string) {
  console.log('[REFRESH DEBUG] Validating refresh token:', refreshToken.substring(0, 20) + '...');

  const tokenRecord = await this.prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  });

  if (!tokenRecord) {
    console.error('[REFRESH DEBUG] Token not found in database');
    throw new UnauthorizedException('Invalid refresh token');
  }

  console.log('[REFRESH DEBUG] Token found, expires:', tokenRecord.expiresAt);
  console.log('[REFRESH DEBUG] Token user:', tokenRecord.user.email);

  if (new Date() > tokenRecord.expiresAt) {
    console.error('[REFRESH DEBUG] Token expired');
    throw new UnauthorizedException('Refresh token expired');
  }

  console.log('[REFRESH DEBUG]  Token valid');
  return tokenRecord;
}
```

---

## Database Connection Problems

### Problem: "Cannot connect to database" or "Too many connections"

#### Symptoms
```
Error: Can't reach database server at `localhost:5432`
P1001: Can't reach database server
```

#### Solutions

**Solution 1: Health Check Endpoint**

```typescript
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async checkHealth() {
    try {
      // Check database
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}
```

---

## Common Error Messages

### Quick Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `BadRequestException: Failed to parse hand history` | Invalid format or unsupported site | Check file format, add site-specific parser |
| `ForbiddenException: You do not have access` | User trying to access another user's data | Verify ownership checks in service |
| `NotFoundException: Session not found` | Invalid session ID or deleted session | Validate session ID before operations |
| `401 Unauthorized` | Expired or invalid JWT token | Refresh token or re-authenticate |
| `P2002: Unique constraint failed` | Duplicate entry in database | Check for existing records before insert |
| `P1001: Can't reach database server` | Database connection failed | Verify DATABASE_URL and database status |
| `Side pot mismatch` | Incorrect pot calculation | Use tested SidePotCalculator service |
| `Currency too large/small` | Cents/dollars confusion | Validate and normalize currency units |

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check Logs**: Enable debug logging first
2. **Search Issues**: Check GitHub issues for similar problems
3. **Create Issue**: Provide full error logs and reproduction steps
4. **Test Environment**: Try reproducing in a clean environment

---

**Last Updated**: October 2025
**Version**: 1.0.0
