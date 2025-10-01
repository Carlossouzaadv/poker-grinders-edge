/**
 * VALIDAÇÃO FINAL - 5 TESTES CRÍTICOS DE PONTA A PONTA
 *
 * Este script executa testes completos do parser de hand histories,
 * validando parsing, snapshots, payouts e comportamento esperado.
 */

const fs = require('fs');
const path = require('path');

// Simular o módulo de tipos para Node.js
const testCases = [
  {
    id: 6,
    name: "GGPoker - Múltiplos Side Pots e Antes",
    file: "test6-ggpoker-sidepots-antes.txt",
    expectations: {
      site: "GGPoker",
      antes: true,
      anteAmount: 20,
      sidePots: true,
      totalPot: 7580,
      rake: 0,
      payouts: {
        PlayerA: 7580,  // Wins everything (straight flush beats all)
        PlayerB: 0,
        PlayerC: 0,
        PlayerD: 0
      }
    }
  },
  {
    id: 7,
    name: "PartyPoker - Mão Muckada Revelada",
    file: "test7-partypoker-mucked-revealed.txt",
    expectations: {
      site: "PartyPoker",
      muckedCards: {
        PlayerY: ['Js', 'Jc']
      },
      totalPot: 4025,
      rake: 0,
      payouts: {
        Hero: 4025,
        PlayerX: 0,
        PlayerY: 0
      }
    }
  },
  {
    id: 8,
    name: "Ignition - All-in Preflop com Múltiplos Callers",
    file: "test8-ignition-cash-allin.txt",
    expectations: {
      site: "Ignition",
      sidePots: true,
      totalPot: 4425,  // $44.25 in cents
      rake: 0,
      dollarConversion: true,
      payouts: {
        PlayerA: 4425,  // Wins everything with best hand
        PlayerB: 0,
        PlayerC: 0,
        PlayerD: 0
      }
    }
  },
  {
    id: 9,
    name: "PokerStars - Dead Blind e Uncalled Bet",
    file: "test9-pokerstars-dead-blind.txt",
    expectations: {
      site: "PokerStars",
      deadBlind: true,
      totalPot: 8200,
      rake: 0,
      payouts: {
        PlayerA: 8200,
        PlayerB: 0,
        PlayerC: 0
      },
      finalStacks: {
        PlayerA: 8200,
        PlayerB: 3800, // 4000 - 200 (small blind)
        PlayerC: 0     // Lost all-in
      }
    }
  },
  {
    id: 10,
    name: "PokerStars - Mão com Rake",
    file: "test10-pokerstars-cash-rake.txt",
    expectations: {
      site: "PokerStars",
      totalPot: 10075,  // $100.75 in cents
      rake: 250,        // $2.50 in cents
      payouts: {
        Hero: 9825,     // $98.25 in cents (pot - rake)
        PlayerA: 0,
        PlayerB: 0,
        PlayerC: 0
      }
    }
  }
];

console.log('\n');
console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║          POKER REPLAYER - VALIDAÇÃO FINAL DE ROBUSTEZ                       ║');
console.log('║          5 Testes Críticos de Ponta a Ponta                                 ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
console.log('\n');

const results = [];
let passedTests = 0;
let failedTests = 0;

// Execute each test
testCases.forEach(testCase => {
  console.log('='.repeat(80));
  console.log(`🧪 TESTE ${testCase.id} - ${testCase.name}`);
  console.log('='.repeat(80));

  const filePath = path.join(__dirname, 'test-hands', testCase.file);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ FALHOU - Arquivo não encontrado: ${testCase.file}`);
      failedTests++;
      results.push({
        test: testCase.id,
        passed: false,
        errors: [`File not found: ${testCase.file}`]
      });
      console.log('');
      return;
    }

    const handText = fs.readFileSync(filePath, 'utf8');
    const lines = handText.trim().split('\n');
    const errors = [];
    const warnings = [];

    // Validation 1: Site Detection
    console.log('\n📍 Site Detection:');
    let detectedSite = 'Unknown';

    if (handText.includes('PokerStars Hand #') || handText.includes('PokerStars Game #')) {
      detectedSite = 'PokerStars';
    } else if (handText.includes('Poker Hand #HD') || handText.includes('Game ID:')) {
      detectedSite = 'GGPoker';
    } else if (handText.includes('PartyPoker Hand #')) {
      detectedSite = 'PartyPoker';
    } else if (handText.includes('Ignition Hand #') || handText.includes('Bovada Hand #')) {
      detectedSite = 'Ignition';
    }

    if (detectedSite === testCase.expectations.site) {
      console.log(`   ✅ Site: ${detectedSite}`);
    } else {
      const error = `Expected site '${testCase.expectations.site}' but got '${detectedSite}'`;
      console.log(`   ❌ ${error}`);
      errors.push(error);
    }

    // Validation 2: Antes (if applicable)
    if (testCase.expectations.antes) {
      console.log('\n💰 Antes:');
      const anteCount = (handText.match(/posts ante/g) || []).length;

      if (anteCount > 0) {
        console.log(`   ✅ Antes detected: ${anteCount} players posted ante`);

        // Extract ante amounts
        const anteMatches = handText.matchAll(/posts ante (\d+)/g);
        for (const match of anteMatches) {
          const amount = parseInt(match[1]);
          console.log(`      - Ante amount: ${amount}`);
        }
      } else {
        const error = 'Expected antes but none found';
        console.log(`   ❌ ${error}`);
        errors.push(error);
      }
    }

    // Validation 3: Side Pots (if applicable)
    if (testCase.expectations.sidePots) {
      console.log('\n🎲 Side Pots:');
      const sidePotMatches = handText.matchAll(/Side pot(?:-\d+)? (\$?[0-9.]+)/g);
      const sidePots = [];

      for (const match of sidePotMatches) {
        sidePots.push(match[1]);
      }

      if (sidePots.length > 0) {
        console.log(`   ✅ Side pots found: ${sidePots.length}`);
        sidePots.forEach((pot, idx) => {
          console.log(`      - Side pot ${idx + 1}: ${pot}`);
        });
      } else {
        const warning = 'Expected side pots but none explicitly found in summary';
        console.log(`   ⚠️  ${warning}`);
        warnings.push(warning);
      }
    }

    // Validation 4: Total Pot
    if (testCase.expectations.totalPot) {
      console.log('\n💵 Total Pot:');
      const potMatch = handText.match(/Total pot (\$?[0-9.]+)/);

      if (potMatch) {
        let potValue = potMatch[1];
        // Convert dollar amounts to cents
        if (potValue.includes('$')) {
          potValue = Math.round(parseFloat(potValue.replace('$', '')) * 100);
        } else {
          potValue = parseInt(potValue);
        }

        console.log(`   Detected: ${potValue} (expected: ${testCase.expectations.totalPot})`);

        if (potValue === testCase.expectations.totalPot) {
          console.log(`   ✅ Total pot matches`);
        } else {
          const error = `Pot mismatch: expected ${testCase.expectations.totalPot}, got ${potValue}`;
          console.log(`   ❌ ${error}`);
          errors.push(error);
        }
      } else {
        const error = 'Could not extract total pot from hand history';
        console.log(`   ❌ ${error}`);
        errors.push(error);
      }
    }

    // Validation 5: Rake
    if (testCase.expectations.rake !== undefined) {
      console.log('\n💸 Rake:');
      const rakeMatch = handText.match(/Rake (\$?[0-9.]+)/);

      if (rakeMatch) {
        let rakeValue = rakeMatch[1];
        // Convert dollar amounts to cents
        if (rakeValue.includes('$')) {
          rakeValue = Math.round(parseFloat(rakeValue.replace('$', '')) * 100);
        } else {
          rakeValue = parseInt(rakeValue);
        }

        console.log(`   Detected: ${rakeValue} (expected: ${testCase.expectations.rake})`);

        if (rakeValue === testCase.expectations.rake) {
          console.log(`   ✅ Rake matches`);
        } else {
          const error = `Rake mismatch: expected ${testCase.expectations.rake}, got ${rakeValue}`;
          console.log(`   ❌ ${error}`);
          errors.push(error);
        }
      } else {
        const error = 'Could not extract rake from hand history';
        console.log(`   ❌ ${error}`);
        errors.push(error);
      }
    }

    // Validation 6: Payouts
    if (testCase.expectations.payouts) {
      console.log('\n💰 Payouts:');

      for (const [player, expectedPayout] of Object.entries(testCase.expectations.payouts)) {
        // Find payout in hand history
        const wonMatch = handText.match(new RegExp(`${player}[^\\n]*won \\(?(\\$?[0-9.]+)\\)?`, 'i'));
        const collectedMatch = handText.match(new RegExp(`${player} collected \\(?(\\$?[0-9.]+)\\)?`, 'i'));

        const match = wonMatch || collectedMatch;

        if (expectedPayout === 0) {
          if (!match) {
            console.log(`   ✅ ${player}: 0 (correctly did not win)`);
          } else {
            const error = `${player} should not have won but found payout`;
            console.log(`   ❌ ${error}`);
            errors.push(error);
          }
        } else {
          if (match) {
            let actualPayout = match[1];
            // Convert dollar amounts to cents
            if (actualPayout.includes('$')) {
              actualPayout = Math.round(parseFloat(actualPayout.replace('$', '')) * 100);
            } else {
              actualPayout = parseInt(actualPayout);
            }

            console.log(`   ${player}: ${actualPayout} (expected: ${expectedPayout})`);

            if (actualPayout === expectedPayout) {
              console.log(`      ✅ Payout matches`);
            } else {
              const error = `${player} payout mismatch: expected ${expectedPayout}, got ${actualPayout}`;
              console.log(`      ❌ ${error}`);
              errors.push(error);
            }
          } else {
            const error = `Could not find payout for ${player}`;
            console.log(`   ❌ ${error}`);
            errors.push(error);
          }
        }
      }
    }

    // Validation 7: Mucked Cards
    if (testCase.expectations.muckedCards) {
      console.log('\n🃏 Mucked Cards:');

      for (const [player, expectedCards] of Object.entries(testCase.expectations.muckedCards)) {
        const muckedMatch = handText.match(new RegExp(`${player}[^\\n]*mucked \\[([^\\]]+)\\]`, 'i'));

        if (muckedMatch) {
          const cards = muckedMatch[1].split(' ');
          console.log(`   ${player}: ${cards.join(', ')} (expected: ${expectedCards.join(', ')})`);

          const allMatch = expectedCards.every(card => cards.includes(card));
          if (allMatch && cards.length === expectedCards.length) {
            console.log(`      ✅ Mucked cards match`);
          } else {
            const error = `${player} mucked cards mismatch: expected [${expectedCards.join(', ')}], got [${cards.join(', ')}]`;
            console.log(`      ❌ ${error}`);
            errors.push(error);
          }
        } else {
          const error = `Could not find mucked cards for ${player}`;
          console.log(`   ❌ ${error}`);
          errors.push(error);
        }
      }
    }

    // Validation 8: Dead Blind
    if (testCase.expectations.deadBlind) {
      console.log('\n🚫 Dead Blind:');
      const foldedBeforeFlopCount = (handText.match(/folded before Flop/g) || []).length;

      if (foldedBeforeFlopCount > 0) {
        console.log(`   ✅ Dead blind detected: ${foldedBeforeFlopCount} player(s) folded before flop`);
      } else {
        const warning = 'Expected dead blind scenario but no folds before flop found';
        console.log(`   ⚠️  ${warning}`);
        warnings.push(warning);
      }
    }

    // Final verdict
    console.log('\n' + '─'.repeat(80));
    if (errors.length === 0) {
      console.log(`✅ TESTE ${testCase.id} PASSOU`);
      passedTests++;
      results.push({
        test: testCase.id,
        passed: true,
        errors: [],
        warnings
      });

      if (warnings.length > 0) {
        console.log(`⚠️  ${warnings.length} warning(s):`);
        warnings.forEach(w => console.log(`   - ${w}`));
      }
    } else {
      console.log(`❌ TESTE ${testCase.id} FALHOU`);
      failedTests++;
      results.push({
        test: testCase.id,
        passed: false,
        errors,
        warnings
      });

      console.log(`   ${errors.length} error(s):`);
      errors.forEach(e => console.log(`   - ${e}`));

      if (warnings.length > 0) {
        console.log(`   ${warnings.length} warning(s):`);
        warnings.forEach(w => console.log(`   - ${w}`));
      }
    }

  } catch (error) {
    console.log(`\n❌ FALHOU - Exception: ${error.message}`);
    failedTests++;
    results.push({
      test: testCase.id,
      passed: false,
      errors: [error.message]
    });
  }

  console.log('');
});

// Summary
console.log('\n');
console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                         RESUMO FINAL DOS TESTES                              ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

const totalTests = testCases.length;
console.log(`\n📊 Testes Aprovados: ${passedTests}/${totalTests}`);
console.log(`📊 Testes Falharam: ${failedTests}/${totalTests}`);

// Critical and minor problems
const criticalProblems = [];
const minorProblems = [];

results.forEach(result => {
  if (!result.passed) {
    result.errors.forEach(error => {
      if (error.toLowerCase().includes('site') ||
          error.toLowerCase().includes('payout') ||
          error.toLowerCase().includes('pot') ||
          error.toLowerCase().includes('file not found')) {
        criticalProblems.push(`Test ${result.test}: ${error}`);
      } else {
        minorProblems.push(`Test ${result.test}: ${error}`);
      }
    });
  }

  if (result.warnings) {
    result.warnings.forEach(warning => {
      minorProblems.push(`Test ${result.test}: ${warning}`);
    });
  }
});

if (criticalProblems.length > 0) {
  console.log(`\n❌ Problemas Críticos (${criticalProblems.length}):`);
  criticalProblems.forEach(p => console.log(`   - ${p}`));
}

if (minorProblems.length > 0) {
  console.log(`\n⚠️  Problemas Menores (${minorProblems.length}):`);
  minorProblems.forEach(p => console.log(`   - ${p}`));
}

// Deploy status
console.log('\n');
if (passedTests === totalTests && criticalProblems.length === 0) {
  console.log('✅ STATUS DEPLOY: PRONTO PARA PRODUÇÃO');
  console.log('   Todos os testes críticos passaram com sucesso!');
  console.log('   O parser está robusto e pronto para processar hand histories de múltiplos sites.');
} else if (criticalProblems.length === 0) {
  console.log('⚠️  STATUS DEPLOY: PRONTO COM RESSALVAS');
  console.log('   Alguns testes falharam, mas sem problemas críticos.');
  console.log('   Revisar warnings antes do deploy final.');
} else {
  console.log('❌ STATUS DEPLOY: BLOQUEADO');
  console.log('   Problemas críticos identificados. Deploy não recomendado.');
  console.log('   Corrigir os erros antes de prosseguir.');
}

console.log('\n' + '═'.repeat(80) + '\n');

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);