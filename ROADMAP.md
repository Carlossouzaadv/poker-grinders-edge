# ROADMAP - Poker Grinder's Edge

V2:

# ROADMAP - Poker Grinder's Edge

## 🎯 Visão Geral Estratégica
Nossa estratégia é iterativa. Começamos com uma ferramenta de alto valor (Replayer) para capturar o mercado, e então construímos o ecossistema completo em cima dessa base de usuários iniciais.

---

## 🚀 **FASE 0: Aquisição e Validação (Beta)** ⏱️ *1 mês*

O objetivo desta fase é lançar uma ferramenta funcional e gratuita para resolver uma dor imediata da comunidade e construir nossa base de leads.

### 0.1 Desenvolvimento do Hand Replayer (Web)
- [ ] Desenvolver parser para ler históricos de mãos (PokerStars, GGpoker).
- [ ] Criar interface gráfica para visualizar a mão passo a passo (pré-flop, flop, turn, river).
- [ ] Implementar a lógica de exibição de pot, stacks e ações.

### 0.2 Lançamento da Página Beta
- [ ] Criar landing page simples para o Replayer.
- [ ] Implementar formulário de captura de e-mail ("Seja o primeiro a saber do lançamento do app completo!").
- [ ] Deploy da aplicação web.

---

##  PHASE 1: Fundação do Ecossistema (MVP) ⏱️ *3-4 meses*

Com os leads chegando da Fase 0, iniciamos o desenvolvimento paralelo do MVP do App e da Plataforma Web.

### 1.1 Backend Unificado
- [ ] Estruturar a API para suportar ambos os clientes (App e Web).
- [ ] Implementar autenticação e sistema de permissões (Jogador vs. Manager).
- [ ] **[EM ANDAMENTO]** CRUD completo para Sessões de Jogo.

### 1.2 App B2C - MVP
- [ ] **[EM ANDAMENTO]** Módulo de Gestão de Bankroll (Registro de Sessão e Dashboard).
- [ ] Integração com a API de autenticação.
- [ ] Lançamento do app para um grupo fechado de beta testers (o time do Gabriel).

### 1.3 Plataforma Web B2B - MVP
- [ ] Tela de login para Managers/Coaches.
- [ ] Dashboard do Manager com visualização dos jogadores do seu time (dados mockados/iniciais).
- [ ] Funcionalidade de convidar/adicionar jogadores ao time.

---

##  PHASE 2: Expansão de Features (Pós-MVP) ⏱️ *Contínuo*

### 2.1 App B2C
- [ ] Implementação do Consultor GTO.
- [ ] Desenvolvimento do Laboratório de Estudo (Análise de Mãos salvas).
- [ ] Implementação do OCR para upload de screenshots.

### 2.2 Plataforma Web B2B
- [ ] Implementação do "Deep Dive" com dados reais das sessões dos jogadores.
- [ ] Desenvolvimento do "Leak Finder" (v1).
- [ ] Módulo de distribuição de conteúdo.

---

**Progresso Atual**: ⚪ **INICIANDO FASE 0**
**Foco Imediato**: Desenvolvimento do Hand Replayer.

V1:

## 🎯 **Visão Geral**
Desenvolvimento do aplicativo móvel completo baseado no PRD, seguindo modelo freemium com 4 módulos principais:
1. **Gestor de Bankroll** (Core - Free limitado)
2. **Assistente de Sessão** (Premium - GTO/ICM)
3. **Laboratório de Estudo** (Premium - MTT Trainer)
4. **Marketplace de Coaches** (Free com comissão)

---

## ✅ **FASE 1: Fundação Técnica** ⏱️ *2-3 semanas* - **CONCLUÍDA**

### 1.1 Configuração de Banco de Dados ✅
- ✅ Criar schema.prisma com entidades principais:
  - User (email, senha, tipo: player/coach, plano: free/pro)
  - Session (cash/torneio, buy-in, resultado, timestamp)
  - Hand (screenshot, análise GTO, tags)
  - Coach (verificação, especialidades, preços)
  - Booking (agendamentos de aulas)
  - RefreshToken (JWT refresh tokens)
  - GTORange (dados de range GTO)
- ✅ Configurar migrações e seed inicial
- ✅ Conectar Prisma ao NestJS com PrismaService

### 1.2 Autenticação Completa ✅
- ✅ JWT funcional com refresh tokens (7 dias)
- ✅ Guards para rotas protegidas (JwtAuthGuard)
- ✅ Middleware de verificação de plano (PlanGuard + RequirePlan decorator)
- ✅ Telas de login/registro no mobile
- ❌ Validação de email e recuperação de senha (pendente)

### 1.3 Sistema de Design Mobile ✅
- ✅ Configurar NativeWind com tema poker (cores do PRD)
- ✅ Componentes UI base:
  - Button (primary, secondary, danger, outline)
  - Input (validação visual, senha)
  - Card (variants: default, elevated, bordered)
  - LoadingSpinner
  - FloatingActionButton
  - Header (navegação)
- ✅ Navegação completa (Stack + Bottom Tabs)
- ✅ Configuração de fontes e ícones (emojis temporários)

**Status FASE 1:** ✅ **COMPLETA** - Fundação sólida estabelecida

---

## 🏦 **FASE 2: Módulo 1 - Gestor de Bankroll (Core)** ⏱️ *2-3 semanas* - **EM ANDAMENTO**

### 2.1 Backend - API Sessões
- [ ] CRUD completo de sessões
- [ ] Validações específicas do PRD:
  - Cash Games: buy-in, cash-out
  - Torneios: buy-in, rebuys, add-ons, bounties, premiação
- [ ] Cálculos automáticos: ROI, winrate, evolução
- [ ] Regras de bankroll (conservador/padrão/agressivo)
- [ ] Limite de 20 sessões para usuários free

### 2.2 Frontend - Dashboard e Sessões
- [ ] Dashboard principal:
  - Lucro/prejuízo total
  - Gráfico de evolução
  - ROI atual
- [ ] Tela de registro de sessão:
  - Formulário cash game vs torneio
  - Timer automático início/fim
  - Validações em tempo real
- [ ] Lista de sessões com filtros básicos
- [ ] Integração completa com API backend

### 2.3 Funcionalidades Premium
- [ ] Filtros avançados (local, tipo, dia da semana)
- [ ] Exportação de dados
- [ ] Análises estatísticas detalhadas

---

## 🎯 **FASE 3: Módulo 2 - Assistente de Sessão (Premium)** ⏱️ *3-4 semanas*

### 3.1 Consultor GTO/ICM
- [ ] Importar dados do Excel "MODELOS DE RANGE - GTO.xlsx"
- [ ] Interface visual para inputs:
  - Posição, Stack Efetivo (BBs), Ação Prévia
- [ ] Output: Tabela de range visual (Raise/Call/Fold/3-bet)
- [ ] Otimização para uso durante o jogo (rápido e intuitivo)

### 3.2 Registro de Mãos
- [ ] Método A: Botão "Marcar Mão" (timestamp + detalhes depois)
- [ ] Método B: Formulário rápido (cartas, posição, ação)
- [ ] Método C: OCR de screenshots
  - Integração com Google Cloud Vision API
  - Parser de hand histories
  - Preenchimento automático de formulários

### 3.3 Análise em Tempo Real
- [ ] Integração entre registro de mãos e consultor GTO
- [ ] Feedback instantâneo sobre decisões
- [ ] Histórico de mãos salvas

---

## 🧪 **FASE 4: Módulo 3 - Laboratório de Estudo (Premium)** ⏱️ *2-3 semanas*

### 4.1 Analisador de Mãos
- [ ] Galeria de mãos salvas para revisão
- [ ] Análise GTO integrada
- [ ] Comparação: decisão tomada vs decisão ótima
- [ ] Tags e categorização de mãos

### 4.2 MTT Trainer Gamificado
- [ ] Banco de cenários de torneio (push/fold, 3-bet/shove)
- [ ] Modo quiz com feedback instantâneo
- [ ] Sistema de pontuação e progressão
- [ ] Leaderboard global e entre amigos
- [ ] Limite de 10 mãos/dia para usuários free

---

## 🤝 **FASE 5: Módulo 4 - Marketplace de Coaches** ⏱️ *3-4 semanas*

### 5.1 Sistema de Coaches
- [ ] Processo de verificação rigoroso:
  - Perfil detalhado obrigatório
  - Link para redes sociais profissionais
  - Resultados comprovados (Hendon Mob/SharkScope)
- [ ] Painel exclusivo do coach
- [ ] Gestão de especialidades e preços (BRL/USD)
- [ ] Sistema de avaliações e reviews

### 5.2 Sistema de Reservas e Pagamentos
- [ ] Calendário de disponibilidade
- [ ] Integração com gateway de pagamento (Stripe)
- [ ] Sistema de comissões (15% → 10% após 50h)
- [ ] Gestão de cancelamentos e reembolsos

### 5.3 Funcionalidades de Aula
- [ ] Chat integrado coach-aluno
- [ ] Compartilhamento de mãos e análises
- [ ] Histórico de aulas e progresso

---

## 🧪 **FASE 6: Testes e Qualidade** ⏱️ *2 semanas*

### 6.1 Backend
- [ ] Testes unitários (services) - cobertura > 80%
- [ ] Testes e2e (controllers) - cenários críticos
- [ ] Testes de carga para APIs principais

### 6.2 Mobile
- [ ] Configuração completa do Jest
- [ ] Testes de componentes críticos
- [ ] Testes de integração com APIs
- [ ] Testes de navegação

### 6.3 Modelo Freemium
- [ ] Validação de limites free em todos os módulos
- [ ] Fluxo completo de upgrade para Pro
- [ ] Testes de pagamento e cobrança

---

## 🚀 **FASE 7: Deploy e Monitoramento** ⏱️ *1-2 semanas*

### 7.1 Infraestrutura
- [ ] Deploy backend (Railway/Heroku/GCP)
- [ ] Configuração banco PostgreSQL produção
- [ ] Configuração de variáveis de ambiente

### 7.2 Mobile
- [ ] Build e publicação Android (Google Play)
- [ ] Build e publicação iOS (App Store)
- [ ] Configuração de CI/CD automatizado

### 7.3 Monitoramento
- [ ] Logs estruturados e alertas
- [ ] Analytics básico de uso
- [ ] Monitoramento de performance

---

## 📊 **Métricas de Sucesso**

### Técnicas
- ✅ Cobertura de testes > 80%
- ✅ Tempo de resposta API < 200ms
- ✅ Crash rate < 1%
- ✅ Build automatizado funcionando

### Produto
- 🎯 1000 downloads no primeiro mês
- 🎯 Taxa de conversão free → pro: 5%
- 🎯 Pelo menos 10 coaches verificados
- 🎯 NPS > 50

---

## ⚡ **Status Atual e Próximos Passos**

### ✅ **CONCLUÍDO (FASE 1):**
- ✅ Backend NestJS + PostgreSQL + Prisma totalmente configurado
- ✅ Autenticação JWT com refresh tokens
- ✅ Sistema de guards e middlewares
- ✅ Frontend React Native + NativeWind
- ✅ Componentes UI completos
- ✅ Navegação funcional
- ✅ Telas de auth (login/registro)
- ✅ PostgreSQL 17.6 instalado no sistema

### 🔄 **EM ANDAMENTO:**
- 🔄 Configuração final do banco de dados
- 🔄 Criação do database `poker_grinders_edge`
- 🔄 Ajuste da senha no arquivo `.env`

### 🚀 **PRÓXIMA SESSÃO:**
1. **Finalizar setup do banco:**
   - Criar database `poker_grinders_edge` no pgAdmin
   - Atualizar senha no `.env`
   - Executar `npm run db:push` e `npm run db:seed`

2. **Iniciar FASE 2.1:** Implementar CRUD de sessões no backend

### 📋 **Ações Manuais Necessárias:**

#### Backend:
1. **Configurar PostgreSQL local:** ✅ **CONCLUÍDO**
   ```bash
   ✅ PostgreSQL 17.6 instalado
   ✅ pgAdmin 4 configurado
   🔄 Criar database: poker_grinders_edge (em andamento)
   🔄 Ajustar senha no .env (pendente)
   ```

2. **Executar migração inicial:** ⏳ **PRÓXIMO PASSO**
   ```bash
   cd backend
   npm run db:push    # Aplicar schema ao banco
   npm run db:seed    # Popular dados de teste
   ```

#### Mobile:
3. **Configurar React Native:**
   ```bash
   cd mobile
   # Instalar pods (iOS): cd ios && pod install
   # Configurar Android se necessário
   ```

4. **Testar build:**
   ```bash
   cd mobile
   npx react-native run-android
   # ou
   npx react-native run-ios
   ```

**Tempo Total Estimado**: 4-6 meses para MVP completo
**Progresso**: 🟢 **FASE 1 COMPLETA** (20% do projeto)
**Status**: 🟡 **Setup de banco em andamento**
**Desenvolvedor**: 1 full-stack + designer (opcional)

---

## 📝 **Log da Sessão (24/09/2025):**
- ✅ Implementada toda a FASE 1 (Fundação Técnica)
- ✅ Schema Prisma completo com todas as entidades
- ✅ Sistema de autenticação JWT + refresh tokens
- ✅ Guards e middlewares funcionais
- ✅ Componentes UI base React Native
- ✅ Navegação completa configurada
- ✅ PostgreSQL 17.6 instalado com pgAdmin 4
- 🔄 Pendente: Criar database e configurar conexão