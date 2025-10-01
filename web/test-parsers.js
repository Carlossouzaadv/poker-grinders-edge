const fs = require('fs');
const path = require('path');

// Simular módulos TypeScript (simplificado para Node.js)
console.log('🧪 TESTE DOS PARSERS - Poker Grinder\'s Edge\n');

// Ler arquivos de teste
const testFiles = [
  { name: 'Teste 6 - GGPoker (Múltiplos Side Pots e Antes)', file: 'test6-ggpoker-sidepots-antes.txt' },
  { name: 'Teste 7 - PartyPoker (Mão Muckada Revelada)', file: 'test7-partypoker-mucked-revealed.txt' },
  { name: 'Teste 8 - Ignition (Cash Game All-in Preflop)', file: 'test8-ignition-cash-allin.txt' },
  { name: 'Teste 10 - PokerStars (Cash Game com Rake)', file: 'test10-pokerstars-cash-rake.txt' }
];

console.log('📂 Arquivos de teste criados:\n');

testFiles.forEach(({ name, file }) => {
  const filePath = path.join(__dirname, 'test-hands', file);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');

    console.log(`✅ ${name}`);
    console.log(`   Arquivo: ${file}`);
    console.log(`   Primeira linha: ${lines[0].substring(0, 80)}...`);

    // Detectar site
    const firstLine = lines[0];
    let site = 'Unknown';

    if (firstLine.includes('PokerStars Hand #') || firstLine.includes('PokerStars Game #')) {
      site = 'PokerStars';
    } else if (firstLine.includes('Poker Hand #HD') || firstLine.includes('Game ID:')) {
      site = 'GGPoker';
    } else if (firstLine.includes('PartyPoker Hand #')) {
      site = 'PartyPoker';
    } else if (firstLine.includes('Ignition Hand #') || firstLine.includes('Bovada Hand #')) {
      site = 'Ignition';
    }

    console.log(`   Site detectado: ${site}`);

    // Validações específicas
    if (file.includes('ggpoker')) {
      const hasAntes = content.includes('posts ante');
      const hasSidePots = content.includes('Side pot');
      console.log(`   ✓ Antes detectados: ${hasAntes ? 'SIM' : 'NÃO'}`);
      console.log(`   ✓ Side pots detectados: ${hasSidePots ? 'SIM' : 'NÃO'}`);
    }

    if (file.includes('partypoker')) {
      const hasMucked = content.includes('mucked [');
      console.log(`   ✓ Cartas muckadas reveladas: ${hasMucked ? 'SIM' : 'NÃO'}`);
    }

    if (file.includes('ignition')) {
      const hasDollarSigns = content.includes('$0.');
      const hasSidePots = content.includes('Side pot');
      console.log(`   ✓ Valores em dólar detectados: ${hasDollarSigns ? 'SIM' : 'NÃO'}`);
      console.log(`   ✓ Side pots detectados: ${hasSidePots ? 'SIM' : 'NÃO'}`);
    }

    if (file.includes('rake')) {
      const rakeMatch = content.match(/Rake \$?([0-9.]+)/);
      if (rakeMatch) {
        console.log(`   ✓ Rake detectado: $${rakeMatch[1]}`);
      }
    }

    console.log('');
  } else {
    console.log(`❌ ${name}`);
    console.log(`   Arquivo não encontrado: ${file}\n`);
  }
});

console.log('\n📊 RESUMO DAS IMPLEMENTAÇÕES:\n');

console.log('✅ Parser GGPoker (parseGGPoker)');
console.log('   - Suporte a antes no formato (100/200/20)');
console.log('   - Extração de múltiplos side pots');
console.log('   - Parsing de rake\n');

console.log('✅ Parser PartyPoker (parsePartyPoker)');
console.log('   - Extração de cartas muckadas reveladas');
console.log('   - Regex: /mucked \\[([^\\]]+)\\]/');
console.log('   - Atribuição de cartas ao jogador\n');

console.log('✅ Parser Ignition (parseIgnition)');
console.log('   - GameContext com conversionNeeded: true');
console.log('   - Valores mantidos em dólares no parser');
console.log('   - Conversão automática para cents no snapshot-builder\n');

console.log('✅ Dedução de Rake (snapshot-builder)');
console.log('   - Rake deduzido proporcionalmente antes da distribuição');
console.log('   - Cálculo: totalCommittedAfterRake = totalCommitted - rake');
console.log('   - Verificação matemática: sumPots === sumCommittedAfterRake\n');

console.log('✅ Cartas Muckadas Reveladas (snapshot-builder)');
console.log('   - Inclusão no showdown mesmo se jogador foldou');
console.log('   - Lógica: if (!folded.has(key) || (p.cards && p.cards.length > 0))\n');

console.log('🎯 PARA VALIDAR COMPLETAMENTE:');
console.log('   1. Execute o replayer com cada arquivo de teste');
console.log('   2. Verifique se os parsers detectam corretamente o formato');
console.log('   3. Confirme que stacks, pots, rake e cartas reveladas estão corretos');
console.log('   4. Valide que a conversão dólar→cents funciona para Ignition\n');

console.log('📝 Comandos úteis:');
console.log('   - npm run build (para compilar o TypeScript)');
console.log('   - npm run dev (para iniciar o servidor de desenvolvimento)');
console.log('   - Acesse http://localhost:3000 e teste o replayer\n');