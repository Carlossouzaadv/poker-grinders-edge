const { HandParser } = require('./src/lib/hand-parser');
const { SnapshotBuilder } = require('./src/lib/snapshot-builder');

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

async function debugExampleHand() {
  console.log('🔍 === DEBUGGING EXAMPLE HAND ===');

  try {
    // Parse the hand
    console.log('📝 Step 1: Parsing hand history...');
    const parseResult = HandParser.parse(exampleHand);

    if (!parseResult.success) {
      console.error('❌ Parse failed:', parseResult.error);
      return;
    }

    const handHistory = parseResult.handHistory;
    console.log('✅ Hand parsed successfully');
    console.log('Players:', handHistory.players.map(p => `${p.name}: $${p.stack}`));
    console.log('Blinds:', `SB: $${handHistory.smallBlind}, BB: $${handHistory.bigBlind}`);
    console.log('Flop:', handHistory.flop);
    console.log('Turn:', handHistory.turn);
    console.log('River:', handHistory.river);
    console.log('Hero cards:', handHistory.holeCards);
    console.log('Showdown:', handHistory.showdown);

    // Build snapshots
    console.log('\n📸 Step 2: Building snapshots...');
    const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);

    console.log(`✅ Generated ${snapshots.length} snapshots`);

    // Analyze each snapshot
    snapshots.forEach((snapshot, index) => {
      console.log(`\n--- SNAPSHOT ${index + 1} ---`);
      console.log(`Street: ${snapshot.street}`);
      console.log(`Description: ${snapshot.description}`);
      console.log(`Community Cards: [${snapshot.communityCards?.map(c => `${c.rank}${c.suit}`).join(', ') || 'none'}]`);
      console.log(`Pot: ${snapshot.pot} cents`);

      if (snapshot.playerStacks) {
        console.log('Player Stacks (cents):');
        Object.entries(snapshot.playerStacks).forEach(([player, stack]) => {
          console.log(`  ${player}: ${stack}`);
        });
      }

      if (snapshot.totalCommitted) {
        console.log('Total Committed (cents):');
        Object.entries(snapshot.totalCommitted).forEach(([player, committed]) => {
          console.log(`  ${player}: ${committed}`);
        });
      }

      if (snapshot.payouts) {
        console.log('Payouts (cents):');
        Object.entries(snapshot.payouts).forEach(([player, payout]) => {
          console.log(`  ${player}: ${payout}`);
        });
      }

      if (snapshot.playerStacksPostShowdown) {
        console.log('Final Stacks (cents):');
        Object.entries(snapshot.playerStacksPostShowdown).forEach(([player, stack]) => {
          console.log(`  ${player}: ${stack}`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Critical error:', error);
  }
}

debugExampleHand();