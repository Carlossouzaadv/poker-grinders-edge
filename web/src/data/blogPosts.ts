export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: 'os-5-maiores-leaks-de-jogadores-de-torneio',
    title: 'Os 5 Maiores Leaks de Jogadores de Torneio',
    excerpt: 'Descubra os erros mais comuns que custam dinheiro aos jogadores de MTT e como o Hand Replayer ajuda a identificá-los.',
    date: '2025-09-30',
    category: 'Estratégia',
    readTime: '5 min',
    author: 'PokerMastery Team',
    content: `
# Os 5 Maiores Leaks de Jogadores de Torneio

Depois de analisar **milhares de hand histories** de jogadores de MTT, identificamos os 5 erros mais comuns que custam dinheiro aos grinders. A boa notícia? Todos são corrigíveis com estudo e uso do **Hand Replayer**.

## 1. Overcalling no Button vs SB Open

**O Erro**: Muitos jogadores defendem demais no button contra open raise do small blind, especialmente em torneios.

**Por que é ruim?**:
- SB ranges são mais apertados que você pensa
- Você joga fora de posição pós-flop
- ICM pressure te obriga a fazer folds difíceis

**Solução com Hand Replayer**:
Revise todas as suas mãos com call no button vs SB. Filtre por tag "Button Defense" e analise quais mãos você deveria ter foldado.

## 2. Não Ajustar Stack Sizes

**O Erro**: Jogar o mesmo range com 20bb, 30bb e 50bb.

**Por que é ruim?**:
- Cada stack depth tem ranges ideais diferentes
- 3-bet/fold só funciona com stacks específicos
- Você perde oportunidades de value ou arrisca demais

**Solução**: Use as tags "20bb", "30bb", "50bb" no Hand Replayer para revisar suas decisões por profundidade de stack.

## 3. Blefar Demais no River

**O Erro**: Triple barrel bluff sem considerar o board e range do oponente.

**Por que é ruim?**:
- A maioria dos oponentes não folda o suficiente no river
- Você queima fichas em spots marginais
- ICM torna esses bleffs ainda mais caros

**Solução**: Revise todas as mãos tagged "River Bluff" e calcule sua taxa de sucesso real.

## 4. Não Roubar Blinds o Suficiente

**O Erro**: Foldar demais no button e cutoff quando os blinds estão apertados.

**Por que é ruim?**:
- Você perde fichas grátis
- Seu stack diminui passivamente
- Oponentes te exploram foldando demais

**Solução**: Use o Equity Calculator do Hand Replayer para ver quando você tem equity suficiente para abrir.

## 5. Ignorar ICM em Bolhas

**O Erro**: Jogar como se fosse cash game quando perto do dinheiro.

**Por que é ruim?**:
- Cada ficha perdida vale mais que cada ficha ganha
- Você pode perder value esperando um spot melhor
- Stacks curtos te exploram

**Solução**: Revise todas as mãos próximas à bubble (tag "Bubble Play") e compare suas decisões com ranges ICM-aware.

---

## Como o Hand Replayer Ajuda

1. **Visualização Clara**: Veja cada street exatamente como aconteceu
2. **Sistema de Tags**: Organize mãos por leak (Overcall, River Bluff, etc.)
3. **Notas Personalizadas**: Anote o que aprendeu em cada mão
4. **Equity Calculator**: Calcule se suas decisões foram corretas matematicamente

## Próximos Passos

1. Importe suas últimas 50 mãos no Hand Replayer
2. Tag cada mão por tipo (Button Defense, River Bluff, etc.)
3. Revise 10 mãos por dia focando em 1 leak por vez
4. Anote padrões que você identifica

**Lembre-se**: Corrigir 1 leak vale mais que aprender 10 conceitos novos. Foque em eliminar seus maiores erros primeiro.

---

*Tem dúvidas sobre algum desses leaks? Entre em contato conosco!*
    `,
  },
  {
    id: 2,
    slug: 'como-fazer-gestao-de-bankroll-profissional',
    title: 'Como Fazer uma Gestão de Bankroll Profissional',
    excerpt: 'Aprenda os princípios fundamentais de gerenciamento de banca e prepare-se para o nosso módulo de Gestor de Bankroll.',
    date: '2025-09-25',
    category: 'Bankroll',
    readTime: '8 min',
    author: 'PokerMastery Team',
    content: `
# Como Fazer uma Gestão de Bankroll Profissional

**Gerenciamento de Bankroll (BRM)** é a diferença entre um hobby caro e uma carreira lucrativa. Neste guia, você aprenderá os princípios que separam amadores de profissionais.

## O Que É Bankroll Management?

Bankroll Management é o conjunto de regras que determinam:
- **Quanto do seu dinheiro** você pode arriscar em uma sessão
- **Quais stakes** você deve jogar
- **Quando fazer** move-up ou move-down

## Princípios Fundamentais

### 1. Separação Total

**Regra de Ouro**: Seu bankroll de poker **NUNCA** se mistura com dinheiro pessoal.

- ✅ Crie uma conta bancária separada para poker
- ✅ Defina um valor inicial realista (ex: $500-$1000)
- ✅ Retire apenas lucros acima do seu roll inicial

### 2. Buy-ins Mínimos

**Para Cash Games**:
- **Conservador**: 50 buy-ins para o stake
- **Padrão**: 30 buy-ins
- **Agressivo**: 20 buy-ins (só se você for winner comprovado)

**Para Torneios**:
- **MTT Regular**: 100 buy-ins
- **Turbo/Hyper**: 150 buy-ins
- **High Roller**: 200 buy-ins

**Exemplo**:
- Você tem $3000 de bankroll
- Stake conservador cash: $3000 / 50 = NL60 ($60 buy-in)
- Torneio padrão: $3000 / 100 = $30 tournaments

### 3. Move-Up e Move-Down

**Move-Up (Subir de Stake)**:
- Só suba quando tiver o bankroll COMPLETO para o novo stake
- Exemplo: De NL50 para NL100, precisa de $5000 (50 buy-ins de $100)

**Move-Down (Descer de Stake)**:
- Desça imediatamente se perder 25% do bankroll
- Exemplo: Roll caiu de $3000 para $2250? Volte um stake

### 4. Shot-Taking (Tentativas)

Se você é winner consistente, pode fazer "shots" (tentativas) em stakes maiores:

**Regras**:
- No máximo 5% do bankroll
- Máximo 3 buy-ins por sessão
- Se perder, volte para seu stake imediatamente

**Exemplo**:
- Bankroll: $5000 (jogando NL100)
- Shot em NL200: Máximo $250 (5% de $5000)
- 2-3 buy-ins de $200

## Erros Comuns

### ❌ "Só Vou Tentar Stake Maior Uma Vez"
Você perde 10 buy-ins em 2 dias e precisa de 2 meses para recuperar.

### ❌ "Meu Jogo É Bom, Não Preciso de Tanto Roll"
Variância não se importa com skill. Até pros têm downswings de 30+ buy-ins.

### ❌ "Vou Depositar Mais Se Perder"
Isso se chama "Bankroll Fantasma". Se você não pode perder o dinheiro atual, não deveria estar jogando esse stake.

## Sistema de 3 Pilares

### Pilar 1: Bankroll de Jogo (80%)
- Dinheiro que você joga ativamente
- Nunca toque nisso para despesas pessoais

### Pilar 2: Reserva de Emergência (15%)
- Para downswings severos
- Só use se perder 40% do roll principal

### Pilar 3: Lucros para Saque (5%)
- Retire pequenos lucros mensalmente
- Celebre vitórias sem arriscar o roll

**Exemplo com $10,000**:
- $8,000 = Bankroll de jogo
- $1,500 = Reserva
- $500 = Saques/celebração

## Tracking Essencial

**O que você DEVE trackear**:
1. **Lucro/Prejuízo** por sessão
2. **Variância**: Quantos buy-ins de swing?
3. **Win-rate**: bb/100 (cash) ou ROI% (torneio)
4. **Volume**: Quantas mãos/torneios por mês?

## Prepare-se: Gestor de Bankroll Chegando

Em breve, o **PokerMastery** terá um módulo completo de Gestão de Bankroll com:

- 📊 **Tracking automático** de sessões
- 📈 **Gráficos de crescimento** do bankroll
- ⚠️ **Alertas de move-down** automáticos
- 🎯 **Recomendações de stakes** baseadas no seu roll
- 💰 **Simulador de crescimento** de banca

## Ação Imediata

1. **Calcule seu bankroll atual** (dinheiro separado para poker)
2. **Descubra seu stake ideal** usando as regras acima
3. **Faça move-down se necessário** (sem ego!)
4. **Comece a trackear** sessões em uma planilha simples

## Quiz Rápido

**Você tem $4,000. Qual stake você deve jogar?**

a) NL200 (conservador)
b) NL100 (padrão)
c) NL50 (super safe)

**Resposta**:
- Conservador (50 buy-ins): $4000/50 = **NL80** → Jogue **NL50**
- Padrão (30 buy-ins): $4000/30 = **NL133** → Jogue **NL100**

---

## Conclusão

Bankroll Management não é sexy. Não ganha torneios. Mas **garante que você sobreviva** para jogar amanhã, semana que vem, ano que vem.

Profissionais respeitam o roll. Amadores vão broke.

**Qual você quer ser?**

---

*Dúvidas sobre BRM? Comente ou entre em contato!*
    `,
  },
  {
    id: 3,
    slug: 'gto-vs-exploitativo-qual-estrategia-usar',
    title: 'GTO vs Exploitativo: Qual Estratégia Usar?',
    excerpt: 'Entenda quando aplicar Game Theory Optimal e quando desviar para explorar seus oponentes de forma lucrativa.',
    date: '2025-09-20',
    category: 'GTO',
    readTime: '6 min',
    author: 'PokerMastery Team',
    content: `
# GTO vs Exploitativo: Qual Estratégia Usar?

A guerra entre **GTO (Game Theory Optimal)** e **Exploitative Play** divide a comunidade do poker. A verdade? **Você precisa dos dois**.

## O Que É GTO?

**GTO** é uma estratégia matematicamente balanceada que:
- ✅ Não pode ser explorada
- ✅ Funciona contra qualquer oponente
- ✅ Garante lucro em longo prazo

**Exemplo GTO**:
- 3-bet 12% do range no BB vs BTN open
- C-bet 60% flop, 45% turn, 30% river
- Bleff:Value ratio de 1:2 no river

## O Que É Exploitative?

**Exploitative** é se desviar do GTO para **explorar erros específicos** dos oponentes.

**Exemplo Exploitative**:
- Oponente folda demais? Aumente c-bet frequency de 60% → 80%
- Oponente nunca blefa river? Fold top pair quando ele aposta
- Oponente 3-bets light? 4-bet mais com value hands

## A Verdade Inconveniente

**Nenhuma das duas é "melhor"**. Cada uma tem seu lugar:

| Situação | Use GTO | Use Exploitative |
|----------|---------|------------------|
| Desconhecido | ✅ | ❌ |
| High Stakes | ✅ | Cuidado |
| Micro/Low Stakes | ❌ | ✅✅✅ |
| Oponente fraco conhecido | ❌ | ✅✅✅ |
| Final Table importante | ✅ | Ajustes pequenos |
| Cash game recreativo | ❌ | ✅✅✅ |

## Quando Usar GTO

### 1. Contra Desconhecidos
**Por quê?**: Você não tem reads. GTO garante que você não seja explorado.

**Como?**:
- Siga ranges padrão
- C-bet frequencies balanceadas
- Bluff:Value ratios corretos

### 2. Em High Stakes
**Por quê?**: Oponentes são bons e se ajustam rapidamente.

**Como?**:
- Estude solvers (PioSolver, GTO+)
- Balanceie todos os ranges
- Randomize decisões marginais

### 3. Em Spots ICM-Heavy
**Por quê?**: Pressão de torneio exige precisão matemática.

**Como?**:
- Use ICM calculators
- Seja mais tight em bubbles
- Ajuste ranges por stack depth

## Quando Usar Exploitative

### 1. Contra Calling Stations
**Leak**: Eles dão call demais, não blefam.

**Exploits**:
- ❌ Pare de blefar (waste of money)
- ✅ Value bet thinner (top pair = nuts para eles)
- ✅ Bluff menos no flop, mais no river (quando eles desistem)

### 2. Contra Nits (Jogadores Tight)
**Leak**: Foldams demais, só jogam nuts.

**Exploits**:
- ✅ Blefe mais (eles foldaram range médio)
- ✅ 3-bet light (fold pre > 60%)
- ❌ Pague menos quando eles apostam grande (só têm nuts)

### 3. Contra LAGs Agressivos
**Leak**: Blefam demais, overbet sem value.

**Exploits**:
- ✅ Call down lighter (eles têm ar 50% do tempo)
- ✅ Trap com mãos fortes (deixe eles blefar)
- ❌ Não blefe de volta (eles não respeitam)

## O Equilíbrio Perfeito: GTO como Base, Exploits como Tempero

### Passo 1: Aprenda GTO (A Base)
- Estude ranges padrão
- Entenda frequencies (c-bet, 3-bet, etc.)
- Pratique no Hand Replayer

### Passo 2: Identifique Leaks (Observação)
- Oponente c-bets 90% (GTO = 60-70%)? **Leak: overbet**
- Oponente folda 70% ao 3-bet (GTO = 45%)? **Leak: too tight**

### Passo 3: Aplique Exploits (Ajuste)
- Se ele overfolds ao 3-bet → 3-bet mais light
- Se ele overcalls flop → Bleff menos, value bet mais

### Passo 4: Volte ao GTO (Segurança)
- Se oponente se ajustar, volte ao GTO
- Nunca fique "exploitado" demais

## Erros Comuns

### ❌ "GTO É Só Para Pros"
Falso. GTO é a **baseline** que todos devem conhecer. Você não precisa ser solver-perfect, mas precisa entender ranges balanceados.

### ❌ "Exploitative Sempre Ganha Mais"
Temporariamente, sim. Mas se você **só** joga exploitative:
- Fica previsível
- Bons jogadores te contra-exploitam
- Você não evolui

### ❌ "GTO É Chato, Prefiro Feel"
"Feel" sem base teórica = **spewy**. GTO te dá a estrutura. Feel te ajuda a aplicar.

## Frameworks para Tomar Decisão

### Framework 1: "Default to GTO"
1. Começo jogando GTO
2. Observo oponente por 30-50 mãos
3. Identifico leaks claros
4. Aplico exploit específico
5. Se ele se ajustar, volto ao GTO

### Framework 2: "Exploit First, Adjust Later"
(Para low stakes com reads imediatos)
1. Assumo que oponente tem leaks óbvios (micro/low)
2. Aplico exploits padrão (bleff nits, value bet stations)
3. Se não funcionar, ajusto para GTO

### Framework 3: "Balanced Aggression"
(Para high stakes ou unknowns bons)
1. Jogo GTO com 10-15% de desvio
2. Desvios são pequenos e reversíveis
3. Nunca me coloco em spots "unexploitable"

## Teste Prático

**Situação**: NL100, 100bb effective. Você no CO com AhKh.

**Ação**: BTN (unknown) 3-bets você.

**GTO Play**:
- 4-bet 25% do range (AK, QQ+, A5s, etc.)
- Call 35% (AQ, JJ, suited broadways)
- Fold 40% (weak hands)

**Exploitative Adjustments**:
- Se BTN 3-bets 8% (nit) → **Fold AK** (ele só tem KK+)
- Se BTN 3-bets 20% (LAG) → **4-bet AK** (ele tem bluffs)

**Viu a diferença?** Mesma mão, decisão oposta baseada no oponente.

## Como Praticar

1. **Estude GTO**:
   - Use solvers (GTO Wizard, PioSolver)
   - Revise ranges padrão (RedChipPoker, Upswing)

2. **Identifique Padrões**:
   - Use o Hand Replayer para tag leaks
   - Anote tendências dos oponentes (HUD stats)

3. **Teste Exploits**:
   - Experimente desvios pequenos
   - Trackeie se funcionam (ROI %, win-rate)

4. **Ajuste**:
   - Se exploit falhar, volte ao GTO
   - Se funcionar, mantenha até oponente se ajustar

---

## Conclusão

**GTO = Seu chão**. Você nunca cai abaixo disso.
**Exploitative = Seu teto**. Você sobe quando identifica leaks.

**Melhores jogadores?** Sabem GTO de cor e aplicam exploits cirurgicamente.

**Seu objetivo?**
1. Aprenda GTO como baseline
2. Identifique leaks específicos
3. Aplique exploits com precisão
4. Volte ao GTO se der errado

---

*Quer aprender a identificar leaks com o Hand Replayer? Teste grátis agora!*
    `,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}
