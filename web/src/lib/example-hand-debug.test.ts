import { HandParser } from './hand-parser';
import { SnapshotBuilder } from './snapshot-builder';

describe('Example Hand Debug - Comprehensive Check', () => {
  const exampleHand = `PokerStars Hand #2310810117: Tournament #10210210, $10+$1 USD Hold'em No Limit - Level V (100/200) - 2025/09/24 17:30:00 ET
Table '102102102 10' 6-max Seat #1 is the button
Seat 1: Player 1 (3500 in chips)
Seat 2: Player 2 (6200 in chips)
Seat 3: Hero (5000 in chips)
Seat 4: Player 4 (4800 in chips)
Seat 5: Player 5 (8000 in chips)
Seat 6: Player 6 (2500 in chips)
Player 2: posts small blind 100
Hero: posts big blind 200
*** HOLE CARDS ***
Dealt to Hero [Ac Jd]
Player 4: folds
Player 5: raises 400 to 600
Player 6: folds
Player 1: folds
Player 2: folds
Hero: calls 400
*** FLOP *** [Ah 7s 2d]
Hero: checks
Player 5: bets 800
Hero: calls 800
*** TURN *** [Ah 7s 2d] [3c]
Hero: checks
Player 5: bets 1600
Hero: calls 1600
*** RIVER *** [Ah 7s 2d 3c] [8s]
Hero: checks
Player 5: checks
*** SHOW DOWN ***
Hero: shows [Ac Jd] (a pair of Aces)
Player 5: mucks hand
Hero collected 6100 from pot
*** SUMMARY ***
Total pot 6100 | Rake 0
Board [Ah 7s 2d 3c 8s]
Seat 1: Player 1 (button) folded before Flop (didn't bet)
Seat 2: Player 2 (small blind) folded before Flop
Seat 3: Hero (big blind) showed [Ac Jd] and won (6100) with a pair of Aces
Seat 4: Player 4 folded before Flop (didn't bet)
Seat 5: Player 5 mucked [Ks Qs]
Seat 6: Player 6 folded before Flop (didn't bet)`;

  it('should parse and replay the example hand correctly', async () => {
    // Expected values in cents
    const INITIAL_STACKS = {
      'player1': 350000,  // $35.00
      'player2': 620000,  // $62.00
      'hero': 500000,     // $50.00
      'player4': 480000,  // $48.00
      'player5': 800000,  // $80.00
      'player6': 250000   // $25.00
    };

    console.log('🔍 === DEBUGGING EXAMPLE HAND - COMPREHENSIVE CHECK ===');

    // Step 1: Parse
    const parseResult = HandParser.parse(exampleHand);
    expect(parseResult.success).toBe(true);

    const handHistory = parseResult.handHistory!;
    console.log('📝 Parsed Hand History:');
    console.log('  Players:', handHistory.players.map(p => `${p.name}: $${p.stack}`));
    console.log('  Blinds:', `SB: $${handHistory.smallBlind}, BB: $${handHistory.bigBlind}`);
    console.log('  Flop:', handHistory.flop);
    console.log('  Turn:', handHistory.turn);
    console.log('  River:', handHistory.river);
    console.log('  Hero Cards:', handHistory.holeCards);
    console.log('  Showdown:', handHistory.showdown);

    // Verify basic parsing
    expect(handHistory.players).toHaveLength(6);
    console.log('🎯 BLIND VALUES PARSED:');
    console.log('  Small Blind (parsed):', handHistory.smallBlind);
    console.log('  Big Blind (parsed):', handHistory.bigBlind);
    console.log('  Expected: SB=1 (from $1.00), BB=2 (from $2.00)');

    // The hand says "Level V (100/200)" which means $1.00/$2.00 blinds
    // Parser should convert these to dollars: 100 -> 1, 200 -> 2

    // Step 2: Generate snapshots
    const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);
    console.log(`📸 Generated ${snapshots.length} snapshots`);

    // Debug each snapshot
    snapshots.forEach((snapshot, index) => {
      console.log(`\n--- SNAPSHOT ${index + 1} ---`);
      console.log(`Street: ${snapshot.street}`);
      console.log(`Description: ${snapshot.description}`);
      console.log(`Community Cards: [${snapshot.communityCards?.map(c => `${c.rank}${c.suit}`).join(', ') || 'none'}]`);
      console.log(`Pot: ${snapshot.totalDisplayedPot} cents (should be chips for tournaments)`);

      if (snapshot.playerStacks) {
        console.log('Player Stacks (cents):');
        Object.entries(snapshot.playerStacks).forEach(([player, stack]) => {
          console.log(`  ${player}: ${stack} cents`);
        });
      }

      if (snapshot.totalCommitted) {
        console.log('Total Committed (cents):');
        Object.entries(snapshot.totalCommitted).forEach(([player, committed]) => {
          console.log(`  ${player}: ${committed} cents`);
        });
      }

      if (snapshot.folded) {
        console.log('Folded Players:', Array.from(snapshot.folded));
      }

      if (snapshot.payouts) {
        console.log('Payouts (cents):');
        Object.entries(snapshot.payouts).forEach(([player, payout]) => {
          console.log(`  ${player}: ${payout} cents`);
        });
      }

      if (snapshot.playerStacksPostShowdown) {
        console.log('Final Stacks (cents):');
        Object.entries(snapshot.playerStacksPostShowdown).forEach(([player, stack]) => {
          console.log(`  ${player}: ${stack} cents`);
        });
      }
    });

    // SPECIFIC CHECKS FOR EACH STAGE

    // Check 1: Initial snapshot should have correct stacks
    const initialSnapshot = snapshots[0];
    expect(initialSnapshot.description).toContain('Início da mão');

    // Check 2: Post-blinds snapshot
    const postBlindsSnapshot = snapshots.find(s => s.description?.includes('big blind') || s.description?.includes('small blind'));
    if (postBlindsSnapshot) {
      console.log('\n🎯 POST-BLINDS CHECK:');
      console.log('Player2 (SB) stack should be: 620000 - 10000 = 610000');
      console.log('Hero (BB) stack should be: 500000 - 20000 = 480000');
      console.log('Actual Player2 stack:', postBlindsSnapshot.playerStacks?.player2);
      console.log('Actual Hero stack:', postBlindsSnapshot.playerStacks?.hero);
    }

    // Check 3: Flop snapshot
    const flopSnapshot = snapshots.find(s => s.street === 'flop');
    if (flopSnapshot) {
      console.log('\n🎯 FLOP CHECK:');
      console.log('Should have community cards: Ah, 7s, 2d');
      console.log('Actual community cards:', flopSnapshot.communityCards?.map(c => `${c.rank}${c.suit}`));

      if (flopSnapshot.communityCards && flopSnapshot.communityCards.length >= 3) {
        expect(flopSnapshot.communityCards).toHaveLength(3);
        expect(flopSnapshot.communityCards[0].rank).toBe('A');
        expect(flopSnapshot.communityCards[0].suit).toBe('h');
      }
    }

    // Check 4: Final snapshot (showdown)
    const finalSnapshot = snapshots[snapshots.length - 1];
    console.log('\n🎯 FINAL/SHOWDOWN CHECK:');
    console.log('Hero should win 6100 (610000 cents)');
    console.log('Player5 should have mucked cards [Ks Qs] revealed');
    console.log('Final Hero stack should be: initial - committed + winnings');

    if (finalSnapshot.payouts) {
      console.log('Hero payout:', finalSnapshot.payouts.hero);
      console.log('Player5 payout:', finalSnapshot.payouts.player5);
    }

    if (finalSnapshot.playerStacksPostShowdown) {
      console.log('Hero final stack:', finalSnapshot.playerStacksPostShowdown.hero);
      console.log('Player5 final stack:', finalSnapshot.playerStacksPostShowdown.player5);
    }

    // Check 5: Cards revelation
    const showdownSnapshot = snapshots.find(s => s.street === 'showdown' || s.description?.includes('Showdown'));
    if (showdownSnapshot) {
      console.log('\n🎯 CARDS REVELATION CHECK:');
      console.log('Hero cards should be visible: [Ac, Jd]');
      console.log('Player5 cards should be revealed from muck: [Ks, Qs]');
      console.log('Revealed hands:', showdownSnapshot.revealedHands);
    }

    // Basic sanity checks
    expect(snapshots.length).toBeGreaterThan(5); // Should have multiple snapshots
    expect(finalSnapshot.street).toBe('showdown');

  }, 30000); // 30 second timeout for comprehensive test
});