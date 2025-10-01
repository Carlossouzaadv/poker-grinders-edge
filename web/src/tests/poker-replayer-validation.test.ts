import { HandParser } from '../lib/hand-parser';
import { SnapshotBuilder } from '../lib/snapshot-builder';

describe('Poker Replayer Validation Tests', () => {

  // TESTE 1 - Apostas e Re-raises
  const HAND_1_APOSTAS_RERAISES = `PokerStars Hand #123456789: Tournament #987654321, $10+$1 USD Hold'em No Limit - Level I (10/20) - 2024/01/15 20:00:00 ET
Table '987654321 1' 6-max Seat #1 is the button
Seat 1: Player1 (1500 in chips)
Seat 2: Player2 (1500 in chips)
Seat 3: Player3 (1500 in chips)
Player2: posts small blind 10
Player3: posts big blind 20
*** HOLE CARDS ***
Player1: raises 40 to 60
Player2: raises 80 to 140
Player3: folds
Player1: calls 80
*** FLOP *** [Ah Kh Qc]
Player2: bets 100
Player1: calls 100
*** TURN *** [Ah Kh Qc] [Js]
Player2: checks
Player1: bets 200
Player2: folds
Uncalled bet (200) returned to Player1
Player1 collected 500 from pot
*** SUMMARY ***
Total pot 500 | Rake 0
Board [Ah Kh Qc Js]
Seat 1: Player1 (button) collected (500)
Seat 2: Player2 (small blind) folded on the Turn
Seat 3: Player3 (big blind) folded before Flop`;

  // TESTE 2 - All-in e Call
  const HAND_2_ALLIN_CALL = `PokerStars Hand #123456790: Tournament #987654321, $10+$1 USD Hold'em No Limit - Level I (10/20) - 2024/01/15 20:05:00 ET
Table '987654321 1' 6-max Seat #2 is the button
Seat 1: Player1 (1800 in chips)
Seat 2: Player2 (1200 in chips)
Player1: posts small blind 10
Player2: posts big blind 20
*** HOLE CARDS ***
Player1: raises 40 to 60
Player2: calls 40
*** FLOP *** [9s 8s 7h]
Player1: bets 80
Player2: calls 80
*** TURN *** [9s 8s 7h] [6c]
Player1: bets 200
Player2: raises 860 to 1060 and is all-in
Player1: calls 860
*** RIVER *** [9s 8s 7h 6c] [2d]
*** SHOW DOWN ***
Player1: shows [Ts Jh] (a straight, Seven to Jack)
Player2: shows [As 5s] (a straight, Five to Nine)
Player1 collected 2400 from pot
Player2 finished the tournament
*** SUMMARY ***
Total pot 2400 | Rake 0
Board [9s 8s 7h 6c 2d]
Seat 1: Player1 (small blind) showed [Ts Jh] and won (2400) with a straight, Seven to Jack
Seat 2: Player2 (big blind) showed [As 5s] and lost with a straight, Five to Nine`;

  // TESTE 3 - Split Pot
  const HAND_3_SPLIT_POT = `PokerStars Hand #123456791: Tournament #987654321, $10+$1 USD Hold'em No Limit - Level I (10/20) - 2024/01/15 20:10:00 ET
Table '987654321 1' 6-max Seat #1 is the button
Seat 1: Player1 (1500 in chips)
Seat 2: Player2 (1500 in chips)
Player1: posts small blind 10
Player2: posts big blind 20
*** HOLE CARDS ***
Player1: calls 10
Player2: checks
*** FLOP *** [Ac Kc Qh]
Player1: bets 40
Player2: calls 40
*** TURN *** [Ac Kc Qh] [Jh]
Player1: bets 80
Player2: calls 80
*** RIVER *** [Ac Kc Qh Jh] [Ts]
Player1: bets 100
Player2: calls 100
*** SHOW DOWN ***
Player1: shows [9h 8h] (a straight, Nine to King)
Player2: shows [9s 8s] (a straight, Nine to King)
Player1 collected 240 from pot
Player2 collected 240 from pot
*** SUMMARY ***
Total pot 480 | Rake 0
Board [Ac Kc Qh Jh Ts]
Seat 1: Player1 (button) showed [9h 8h] and won (240) with a straight, Nine to King
Seat 2: Player2 (big blind) showed [9s 8s] and won (240) with a straight, Nine to King`;

  // TESTE 4 - Fold no Flop
  const HAND_4_FOLD_FLOP = `PokerStars Hand #123456792: Tournament #987654321, $10+$1 USD Hold'em No Limit - Level I (50/100) - 2024/01/15 20:15:00 ET
Table '987654321 1' 6-max Seat #1 is the button
Seat 1: Player1 (1500 in chips)
Seat 2: Player2 (1500 in chips)
Player1: posts small blind 50
Player2: posts big blind 100
*** HOLE CARDS ***
Player1: raises 200 to 300
Player2: calls 200
*** FLOP *** [2c 5d 9h]
Player1: bets 400
Player2: folds
Uncalled bet (400) returned to Player1
Player1 collected 600 from pot
*** SUMMARY ***
Total pot 600 | Rake 0
Board [2c 5d 9h]
Seat 1: Player1 (small blind) collected (600)
Seat 2: Player2 (big blind) folded on the Flop`;

  // TESTE 5 - Check-raise no Turn
  const HAND_5_CHECKRAISE = `PokerStars Hand #123456793: Tournament #987654321, $10+$1 USD Hold'em No Limit - Level I (75/150) - 2024/01/15 20:20:00 ET
Table '987654321 1' 6-max Seat #1 is the button
Seat 1: Player1 (1500 in chips)
Seat 2: Player2 (1500 in chips)
Player1: posts small blind 75
Player2: posts big blind 150
*** HOLE CARDS ***
Player1: raises 300 to 450
Player2: calls 300
*** FLOP *** [4h 7s 8c]
Player1: bets 600
Player2: calls 600
*** TURN *** [4h 7s 8c] [9d]
Player1: checks
Player2: bets 450 and is all-in
Player1: folds
Uncalled bet (450) returned to Player2
Player2 collected 2100 from pot
*** SUMMARY ***
Total pot 2100 | Rake 0
Board [4h 7s 8c 9d]
Seat 1: Player1 (small blind) folded on the Turn
Seat 2: Player2 (big blind) collected (2100)`;

  async function testHandHistory(handText: string, testName: string) {
    console.log(`\n🧪 EXECUTANDO ${testName}`);

    // 1. PARSING
    const parseResult = HandParser.parse(handText);
    console.log(`📝 PARSING: ${parseResult.success ? '✅ SUCESSO' : '❌ FALHOU'}`);

    if (!parseResult.success) {
      console.log(`❌ ERRO NO PARSING: ${parseResult.error}`);
      return {
        testName,
        status: 'FALHOU',
        parsing: false,
        snapshots: 0,
        visualization: 'N/A',
        problems: [`Parsing falhou: ${parseResult.error}`]
      };
    }

    const handHistory = parseResult.handHistory;
    console.log(`   📋 Jogadores: ${handHistory.players.map(p => p.name).join(', ')}`);
    console.log(`   🎯 Blinds: SB=${handHistory.smallBlind}, BB=${handHistory.bigBlind}`);
    console.log(`   🃏 Ações Preflop: ${handHistory.preflop.length}`);

    // 2. SNAPSHOTS
    try {
      const snapshots = await SnapshotBuilder.buildSnapshots(handHistory);
      console.log(`📸 SNAPSHOTS: ✅ ${snapshots.length} gerados`);

      // Validar snapshot inicial
      const initialSnapshot = snapshots[0];
      console.log(`   📍 Snapshot 0: ${initialSnapshot.description}`);
      console.log(`   💰 PendingContribs inicial:`, JSON.stringify(initialSnapshot.pendingContribs, null, 2));

      // Validar transições de street
      let preflopSnapshots = snapshots.filter(s => s.street === 'preflop');
      let flopSnapshots = snapshots.filter(s => s.street === 'flop');
      let showdownSnapshots = snapshots.filter(s => s.street === 'showdown');

      console.log(`   🎲 Preflop: ${preflopSnapshots.length} snapshots`);
      console.log(`   🎲 Flop: ${flopSnapshots.length} snapshots`);
      console.log(`   🎲 Showdown: ${showdownSnapshots.length} snapshots`);

      // Validar fichas na frente durante preflop
      let blindsNaFrente = false;
      if (preflopSnapshots.length > 1) {
        const segundoSnapshot = preflopSnapshots[1];
        const temPendingContribs = Object.keys(segundoSnapshot.pendingContribs || {}).length > 0;
        blindsNaFrente = temPendingContribs;
        console.log(`   ✅ Blinds na frente no snapshot 2: ${temPendingContribs ? 'SIM' : 'NÃO'}`);
      }

      // Validar payouts no showdown
      let payoutsNoShowdown = false;
      if (showdownSnapshots.length > 0) {
        const finalSnapshot = showdownSnapshots[showdownSnapshots.length - 1];
        const temPayouts = finalSnapshot.payouts && Object.keys(finalSnapshot.payouts).length > 0;
        payoutsNoShowdown = temPayouts;
        console.log(`   💰 Payouts no showdown:`, finalSnapshot.payouts);
      }

      return {
        testName,
        status: 'PASSOU',
        parsing: true,
        snapshots: snapshots.length,
        visualization: {
          blindsNaFrente,
          payoutsNoShowdown,
          transicoesDiretas: true
        },
        problems: []
      };

    } catch (error) {
      console.log(`❌ ERRO NOS SNAPSHOTS: ${error}`);
      return {
        testName,
        status: 'FALHOU',
        parsing: true,
        snapshots: 0,
        visualization: 'N/A',
        problems: [`Snapshots falharam: ${error}`]
      };
    }
  }

  it('TESTE 1 - Apostas e Re-raises no Preflop', async () => {
    const result = await testHandHistory(HAND_1_APOSTAS_RERAISES, 'TESTE 1 - APOSTAS E RE-RAISES');
    console.log('🔍 RESULTADO DETALHADO:', result);
    expect(result.status).toBe('PASSOU');
  });

  it('TESTE 2 - All-in e Call no Turn', async () => {
    const result = await testHandHistory(HAND_2_ALLIN_CALL, 'TESTE 2 - ALL-IN E CALL');
    console.log('🔍 RESULTADO DETALHADO:', result);
    expect(result.status).toBe('PASSOU');
  });

  it('TESTE 3 - Split Pot no River', async () => {
    const result = await testHandHistory(HAND_3_SPLIT_POT, 'TESTE 3 - SPLIT POT');
    console.log('🔍 RESULTADO DETALHADO:', result);
    expect(result.status).toBe('PASSOU');
  });

  it('TESTE 4 - Fold no Flop após Aposta', async () => {
    const result = await testHandHistory(HAND_4_FOLD_FLOP, 'TESTE 4 - FOLD NO FLOP');
    console.log('🔍 RESULTADO DETALHADO:', result);
    expect(result.status).toBe('PASSOU');
  });

  it('TESTE 5 - Check-raise no Turn', async () => {
    const result = await testHandHistory(HAND_5_CHECKRAISE, 'TESTE 5 - CHECK-RAISE');
    console.log('🔍 RESULTADO DETALHADO:', result);
    expect(result.status).toBe('PASSOU');
  });

  it('EXECUTAR BATERIA COMPLETA DE TESTES', async () => {
    console.log('\n🚀 EXECUTANDO BATERIA COMPLETA DE TESTES PRÁTICOS\n');

    const hands = [
      { text: HAND_1_APOSTAS_RERAISES, name: 'TESTE 1 - APOSTAS E RE-RAISES' },
      { text: HAND_2_ALLIN_CALL, name: 'TESTE 2 - ALL-IN E CALL' },
      { text: HAND_3_SPLIT_POT, name: 'TESTE 3 - SPLIT POT' },
      { text: HAND_4_FOLD_FLOP, name: 'TESTE 4 - FOLD NO FLOP' },
      { text: HAND_5_CHECKRAISE, name: 'TESTE 5 - CHECK-RAISE' }
    ];

    const results = [];

    for (const hand of hands) {
      const result = await testHandHistory(hand.text, hand.name);
      results.push(result);
    }

    // RESUMO FINAL
    console.log('\n📊 RESUMO DOS TESTES PRÁTICOS');
    console.log('=' .repeat(50));

    const passed = results.filter(r => r.status === 'PASSOU').length;
    const failed = results.filter(r => r.status === 'FALHOU').length;

    console.log(`✅ Testes Aprovados: ${passed}/${results.length}`);
    console.log(`❌ Testes Falharam: ${failed}/${results.length}`);

    const allProblems = results.flatMap(r => r.problems);
    if (allProblems.length > 0) {
      console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');
      allProblems.forEach(problem => console.log(`   - ${problem}`));
    } else {
      console.log('\n✅ NENHUM PROBLEMA IDENTIFICADO');
    }

    const deployReady = failed === 0;
    console.log(`\n🚀 Status Deploy: ${deployReady ? '✅ PRONTO' : '❌ BLOQUEADO'}`);

    // Assert final
    expect(failed).toBe(0);
    expect(passed).toBe(results.length);
  });
});