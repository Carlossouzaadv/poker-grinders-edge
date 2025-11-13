# Parser Test Suite - PokerMastery

## 📋 Overview

This directory contains comprehensive tests for the hand history parsers. The test suite covers:

1. **GGPoker** (✅ Well tested - `../../hand-parser.test.ts`)
2. **PokerStars** (⚠️ Needs more hands - `pokerstars-parser.test.ts`)
3. **PartyPoker** (⚠️ Needs implementation - `partypoker-parser.test.ts`)
4. **Edge Cases** (⚠️ Needs real hands - `edge-cases.test.ts`)

---

## 🚀 Running Tests

### Run all parser tests:
```bash
cd web
npm test
```

### Run specific test file:
```bash
npm test hand-parser.test.ts           # GGPoker tests (complete)
npm test edge-cases.test.ts            # Edge cases
npm test pokerstars-parser.test.ts     # PokerStars specific
npm test partypoker-parser.test.ts     # PartyPoker specific
```

### Run with coverage:
```bash
npm run test:coverage
```

### Watch mode (auto-rerun on changes):
```bash
npm run test:watch
```

---

## 📝 What Needs Testing

### Critical Edge Cases (High Priority)
- [ ] **Heads-up (2 players)** - Completed template, needs real hand
- [ ] **Full table (10 players)** - Not tested yet
- [ ] **Split pot (exact tie)** - Not tested yet
- [ ] **3-way all-in with side pots** - Not tested yet
- [ ] **Player names with unicode** - Template exists
- [ ] **Very large stacks (millions)** - Template exists
- [ ] **Micro stakes ($0.01/$0.02)** - Template exists
- [ ] **No showdown (all fold)** - Template exists

### PokerStars Specific (High Priority)
- [ ] Regular cash game (USD) - ✅ Template complete
- [ ] Regular cash game (EUR) - ✅ Template complete
- [ ] Tournament hand - Needs hand history
- [ ] Zoom poker - ✅ Template complete
- [ ] Spin & Go (3-max) - Needs hand history
- [ ] Knockout tournament - Needs hand history
- [ ] Multi-street complex betting - Needs hand history

### PartyPoker Specific (Medium Priority)
- [ ] Cash game - Needs hand history
- [ ] Tournament - Needs hand history
- [ ] Fast Forward - Needs hand history
- [ ] Format differences validation - Needs hands

---

## 🎯 How to Get Hand Histories

### Option 1: Play Yourself (Best)
This is the most reliable way to get hand histories you can legally use for testing.

#### **PokerStars**
1. Play a few hands on PokerStars
2. Go to: **Lobby → Tools → Hand History**
3. Select the hands you want
4. Click **"Export Selected"**
5. Copy text from exported file
6. Paste into test file

#### **GGPoker**
1. Play hands on GGPoker
2. Go to: **Menu → My Games → Hand History**
3. Find the hands you want
4. Click **"Export"** or copy directly
5. Paste into test file

#### **PartyPoker**
1. Play hands on PartyPoker
2. Go to: **Lobby → My Game → Hand History**
3. Select hands
4. Export as text
5. Paste into test file

---

### Option 2: Poker Forums (Public Hands)
Many players share hand histories for analysis. Look for:

**2+2 Poker Forums** (twoplustwo.com/forums)
- Go to strategy sections
- Look for hand analysis posts
- Copy the hand history text

**Reddit r/poker**
- Search for "hand analysis" or "hand history"
- Many players post hands for review
- Copy the text

**CardsChat Forum**
- Hand analysis section
- Players share interesting hands
- Copy the posted hand histories

---

### Option 3: Friends Who Play
Ask poker-playing friends to export some hands for you.

**What to ask for:**
```
"Hey! I'm building a poker hand analyzer. Could you export
5-10 hand histories from [PokerStars/GGPoker/PartyPoker]?
I need different scenarios:
- Regular hand
- All-in situation
- Heads-up
- Split pot (if you have one)
- Big pot

Just export them as text and send them to me. Thanks!"
```

---

## 🔧 Adding a New Test

### Step 1: Get a Hand History
Use one of the methods above to get the hand text.

### Step 2: Choose the Right Test File
- **Edge cases** → `edge-cases.test.ts`
- **PokerStars specific** → `pokerstars-parser.test.ts`
- **PartyPoker specific** → `partypoker-parser.test.ts`
- **GGPoker** → `../../hand-parser.test.ts` (already has many tests)

### Step 3: Replace TODO Placeholder

**Before:**
```typescript
it('should parse regular tournament format', () => {
  // TODO: Add PokerStars tournament hand
  expect(true).toBe(true);
});
```

**After:**
```typescript
it('should parse regular tournament format', () => {
  const TOURNAMENT_HAND = `PokerStars Hand #123456789: Tournament #9876543, $5+$0.50 USD Hold'em No Limit - Level I (10/20) - 2025/01/13
  Table '9876543 1' 9-max Seat #1 is the button
  Seat 1: Player1 (1500 in chips)
  Seat 2: Hero (1500 in chips)
  ... (rest of hand history)`;

  const result = HandParser.parse(TOURNAMENT_HAND);

  expect(result.success).toBe(true);
  expect(result.handHistory).toBeDefined();

  const hand = result.handHistory as HandHistory;
  expect(hand.gameContext.isTournament).toBe(true);
  expect(hand.totalPot).toBeGreaterThan(0);
});
```

### Step 4: Run the Test
```bash
npm test pokerstars-parser.test.ts
```

### Step 5: Fix Failures
If the test fails:
1. Check if the parser is reading the format correctly
2. Check if your expectations are correct
3. Update parser code if needed (`hand-parser.ts`)
4. Re-run test

---

## 📊 Test Coverage Goals

### Minimum for MVP Release
- ✅ GGPoker: 90%+ coverage (already achieved)
- ⚠️ PokerStars: 70%+ coverage (needs work)
- ⚠️ PartyPoker: 50%+ coverage (needs work)
- ⚠️ Edge cases: 80%+ coverage (needs work)

### Priority Order
1. **Edge cases** (highest priority - affects all sites)
2. **PokerStars** (most popular site globally)
3. **GGPoker** (already good)
4. **PartyPoker** (lower priority)

---

## 🐛 Common Issues & Solutions

### Issue: "Parser failed with error..."
**Solution**: Check if the hand history format is recognized.
- Verify first line contains site identifier
- Check if format matches expected pattern
- Add debug logging to parser if needed

### Issue: "Player not found in summary"
**Solution**: Player name normalization issue.
- Check if player name has special characters
- Verify normalize-key.ts handles the characters
- Add test case for that specific name format

### Issue: "Pot calculation incorrect"
**Solution**: Side pot logic may need adjustment.
- Check if all bets are being tracked
- Verify ante handling
- Check snapshot-builder.ts pot calculations

---

## 💡 Tips for Writing Good Tests

### 1. Use Real Hands
Always prefer real hand histories over made-up ones. Real hands expose edge cases you wouldn't think of.

### 2. Test One Thing at a Time
Each test should verify one specific behavior:
```typescript
// ❌ BAD - Tests too many things
it('should parse everything correctly', () => {
  // ... tests 10 different things
});

// ✅ GOOD - Tests one thing
it('should parse tournament ID correctly', () => {
  expect(hand.tournamentId).toBe('123456');
});
```

### 3. Use Descriptive Test Names
```typescript
// ❌ BAD
it('works', () => ...);

// ✅ GOOD
it('should handle 3-way split pot with exact tie', () => ...);
```

### 4. Add Comments for Complex Scenarios
```typescript
it('should distribute winnings correctly in side pot scenario', () => {
  // Scenario: Player A (1000 chips), Player B (500), Player C (200) all go all-in
  // Expected: Main pot 600 (200×3), Side pot 1: 600 (300×2), Side pot 2: 500 (A vs B)
  // ...
});
```

---

## 📞 Need Help?

If you're stuck:
1. Check `Docs/TROUBLESHOOTING.md`
2. Look at existing passing tests as examples
3. Check the parser implementation in `hand-parser.ts`
4. Add debug logging to understand what's happening

---

## ✅ Checklist Before MVP Release

- [ ] All edge cases have real hand histories
- [ ] PokerStars cash game USD tested
- [ ] PokerStars cash game EUR tested
- [ ] PokerStars tournament tested
- [ ] At least 20 different hands tested across all sites
- [ ] All critical edge cases pass
- [ ] Test coverage > 80% overall
- [ ] No failing tests in CI/CD

---

**Last Updated**: 2025-01-13
**Maintainer**: PokerMastery Dev Team
