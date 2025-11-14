/**
 * Debug script to identify why specific hands fail to parse
 */

const { HandParser } = require('./src/lib/hand-parser.ts');

// Hand #4 from tests - simplified tournament format (FAILING)
const PS_TOURNAMENT_HAND_1 = `PokerStars Hand #123456789003: Tournament #555555 NLHE Level II (50/100)
Hero (4980)
V1 (6000)
V2 (5100)
*** HOLE CARDS ***
Hero dealt [Ah Kh]
V1 raises to 250
Hero 3-bets to 750
V1 calls
*** FLOP *** [Kd 6h 2h]
Hero bets 900
V1 calls
*** TURN *** [4s]
Hero bets 1600
V1 folds
Hero wins 2150`;

// Spin & Go (also failing)
const PS_SPINGO_3MAX = `PokerStars Hand #334455667788: Tournament #998877665, $5.00+$0.50 USD Hold'em No Limit - Level III (25/50) - 2025/11/14 10:30:00 ET
Table '998877665 1' 3-max Seat #1 is the button
Seat 1: Hero ($1500 in chips)
Seat 2: Player2 ($1450 in chips)
Seat 3: Player3 ($1550 in chips)
Hero: posts small blind 25
Player2: posts big blind 50
*** HOLE CARDS ***
Dealt to Hero [Ad Qh]
Player3: folds
Hero: raises 75 to 125
Player2: calls 75
*** FLOP *** [Ah 8c 3d]
Hero: bets 100
Player2: calls 100
*** TURN *** [Ah 8c 3d] [Qs]
Hero: bets 225
Player2: calls 225
*** RIVER *** [Ah 8c 3d Qs] [2h]
Hero: bets 450
Player2: folds
Uncalled bet (450) returned to Hero
Hero collected 900 from pot
Hero: doesn't show hand
*** SUMMARY ***
Total pot 900 | Rake 0
Board [Ah 8c 3d Qs 2h]
Seat 1: Hero (button) (small blind) collected (900)
Seat 2: Player2 (big blind) folded on the River
Seat 3: Player3 folded before Flop (didn't bet)`;

console.log('=== Testing Hand #4 (Simplified Tournament Format) ===\n');
const result1 = HandParser.parse(PS_TOURNAMENT_HAND_1);
console.log('Success:', result1.success);
console.log('Error:', result1.error);
console.log('\n');

console.log('=== Testing Spin & Go (Full Format) ===\n');
const result2 = HandParser.parse(PS_SPINGO_3MAX);
console.log('Success:', result2.success);
console.log('Error:', result2.error);
if (result2.success && result2.handHistory) {
  console.log('Site:', result2.handHistory.site);
  console.log('TotalPot:', result2.handHistory.totalPot);
  console.log('Rake:', result2.handHistory.rake);
  console.log('Snapshots:', result2.handHistory.snapshots?.length || 0);
}
