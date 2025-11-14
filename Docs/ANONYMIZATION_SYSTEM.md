# Sistema de Anonimização de Mãos - AI Training Database

## Visão Geral

Sistema assíncrono que anonimiza hand histories dos usuários para criar um banco de dados para treinamento de IA, sem afetar a experiência do usuário.

**Características:**
- ✅ Processamento em background (cron a cada 2h)
- ✅ Zero custo adicional (Vercel Cron grátis)
- ✅ Anonimização completa de nomes
- ✅ Categorização por rake (cash) e stakes (torneios)
- ✅ Deduplicação automática
- ✅ Tags para ML (all-in, 3-bet, multiway, etc.)

---

## Arquitetura

```
User uploads hand history
         ↓
HandHistorySession created
         ↓
AnonymizationJob created (PENDING)
         ↓
Vercel Cron (every 2h) → /api/cron/anonymize-hands
         ↓
Backend NestJS → AnonymizationService.processPendingJobs()
         ↓
Process up to 200 hands per execution
         ↓
AnonymizedHand saved to database
         ↓
AnonymizationJob marked COMPLETED
```

---

## Configuração

### 1. Variáveis de Ambiente

#### Backend (.env)
```bash
# Cron Job Secret (shared with frontend)
CRON_SECRET="your-strong-random-secret-here-change-in-production"

# Optional: Admin secret for manual triggers
ADMIN_SECRET="your-admin-secret-here"

# Database
DATABASE_URL="postgresql://..."
```

#### Frontend (web/.env.local)
```bash
# Backend API URL
NEXT_PUBLIC_API_URL="https://your-backend.railway.app"

# Cron Secret (must match backend)
CRON_SECRET="same-secret-as-backend"
```

### 2. Deploy

#### Backend (Railway)
```bash
cd backend
npm run build
# Deploy to Railway
# Add CRON_SECRET to Railway environment variables
```

#### Frontend (Vercel)
```bash
cd web
# Push to GitHub
# Vercel auto-deploys
# Add CRON_SECRET to Vercel environment variables
```

### 3. Vercel Cron Configuration

O arquivo `web/vercel.json` já está configurado:

```json
{
  "crons": [
    {
      "path": "/api/cron/anonymize-hands",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

**Schedule:** A cada 2 horas = 12 execuções/dia

**Capacidade:**
- 200 mãos por execução
- **2,400 mãos/dia** processadas
- Mais que suficiente para MVP

---

## Database Schema

### AnonymizedHand

Armazena mãos anonimizadas para treinamento de IA:

```typescript
{
  id: string
  handId: string (unique) // Original hand ID from site
  site: string // "PokerStars", "GGPoker", "PartyPoker"
  playedAt: DateTime

  // Categorization
  gameType: "CASH" | "TOURNAMENT" | "SIT_AND_GO"
  rakeTier: "MICRO" | "LOW" | "MEDIUM" | "HIGH" // Cash only
  stakesTier: "MICRO" | "LOW" | "MEDIUM" | "HIGH" | "NOSEBLEED" // Tournament only

  // Game params
  smallBlind: Decimal
  bigBlind: Decimal
  ante: Decimal?
  maxPlayers: number

  // Anonymized data
  anonymizedData: {
    players: [{position, stack, cards}],
    actions: [{player: "Player1", action, amount, street}],
    board: ["As", "Kh", ...],
    pots: [{amount, winners: ["Player1"]}],
    showdown: {...}
  }

  anonymizedText: string // Full hand text with names replaced

  // ML features
  tags: string[] // ["all-in", "3-bet-pot", "multiway", "short-stack"]
  features: JSON? // Pot odds, SPR, aggression metrics, etc.
}
```

### AnonymizationJob

Rastreia status de processamento:

```typescript
{
  id: string
  userId: string
  handHistorySessionId: string

  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  attempts: number
  maxAttempts: number (default: 3)

  handsProcessed: number
  handsSkipped: number // Duplicates
  handsFailed: number

  lastError: string?
  startedAt: DateTime?
  completedAt: DateTime?
}
```

---

## Como Funciona

### 1. Upload de Hand History (User Flow)

```typescript
// User uploads hand history
POST /hand-history-sessions
Body: { name, siteFormat, rawHandHistory }

// Backend creates:
// 1. HandHistorySession
// 2. Multiple HandHistoryHand records
// 3. AnonymizationJob (status: PENDING)

// User gets immediate response (não espera anonimização)
Response: { sessionId, handsCount }
```

### 2. Anonimização (Background)

```typescript
// Vercel Cron triggers every 2h
GET /api/cron/anonymize-hands
Headers: { Authorization: "Bearer <CRON_SECRET>" }

// Web forwards to backend
POST <backend>/anonymization/process
Body: { batchSize: 200 }

// Backend processa:
1. Find pending jobs (max 10)
2. For each job:
   - Get HandHistoryHands (limit 200)
   - Anonymize player names (Player1, Player2, ...)
   - Replace names in text
   - Categorize by rake/stakes
   - Generate ML tags
   - Save to AnonymizedHand
   - Update AnonymizationJob status
```

### 3. Deduplicação

Cada mão tem um `handId` único do site de poker:
- PokerStars: `Hand #123456789`
- GGPoker: `Poker Hand #TM5148170724`
- PartyPoker: `Hand #987654321`

Se uma mão já foi anonimizada, ela é **pulada** (handsSkipped++).

---

## Categorização

### Cash Games (por Rake)

| Tier | Rake Range |
|------|------------|
| MICRO | $0.01 - $0.10 |
| LOW | $0.11 - $0.50 |
| MEDIUM | $0.51 - $2.00 |
| HIGH | $2.01+ |

### Torneios (por Buy-in)

| Tier | Buy-in Range |
|------|--------------|
| MICRO | $0 - $10 |
| LOW | $11 - $50 |
| MEDIUM | $51 - $200 |
| HIGH | $201 - $1,000 |
| NOSEBLEED | $1,001+ |

---

## Tags para Machine Learning

Tags geradas automaticamente:

- **all-in**: Mão com all-in
- **3-bet-pot**: Mão com pelo menos 2 raises pré-flop
- **multiway**: 3+ jogadores viram o flop
- **short-stack**: Algum jogador com <20BB
- **showdown**: Mão foi até showdown

**Exemplo de query:**
```typescript
// Buscar todas mãos de torneios micro com all-in
const hands = await prisma.anonymizedHand.findMany({
  where: {
    gameType: 'TOURNAMENT',
    stakesTier: 'MICRO',
    tags: { has: 'all-in' }
  }
});
```

---

## Endpoints

### 1. Cron Endpoint (Vercel Cron)

```
GET /api/cron/anonymize-hands
Headers: Authorization: Bearer <CRON_SECRET>

Response:
{
  "success": true,
  "timestamp": "2025-01-15T12:00:00Z",
  "jobsProcessed": 3,
  "handsProcessed": 450,
  "errors": 0,
  "duration": "12.5s"
}
```

### 2. Manual Trigger (Backend)

```
POST <backend>/anonymization/process-manual
Headers: Authorization: Bearer <ADMIN_SECRET>
Body: { "batchSize": 500 }

Response:
{
  "success": true,
  "timestamp": "2025-01-15T14:30:00Z",
  "jobsProcessed": 5,
  "handsProcessed": 1200,
  "errors": 0
}
```

### 3. Health Check

```
POST /api/cron/anonymize-hands
Headers: Authorization: Bearer <CRON_SECRET>

Response:
{
  "status": "healthy",
  "backend": "connected",
  "cronSecret": "configured",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

---

## Testes

### 1. Criar Job Manualmente (Desenvolvimento)

```typescript
// Backend console (NestJS)
const job = await prisma.anonymizationJob.create({
  data: {
    userId: 'user-123',
    handHistorySessionId: 'session-456',
    status: 'PENDING'
  }
});
```

### 2. Trigger Manual

```bash
# Call backend directly
curl -X POST http://localhost:3000/anonymization/process-manual \
  -H "Authorization: Bearer your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 100}'
```

### 3. Simular Cron Localmente

```bash
# Call web endpoint (simulates Vercel Cron)
curl -X GET http://localhost:3001/api/cron/anonymize-hands \
  -H "Authorization: Bearer your-cron-secret"
```

### 4. Verificar Dados Anonimizados

```typescript
// Check anonymized hands
const anonymized = await prisma.anonymizedHand.findMany({
  take: 10,
  orderBy: { processedAt: 'desc' }
});

console.log('Anonymized hands:', anonymized.length);
console.log('Sample:', anonymized[0]);
```

---

## Monitoramento

### Logs do Vercel Cron

1. Acesse Vercel Dashboard
2. Vá em "Logs"
3. Filtre por "[CRON]"
4. Veja execuções:
   ```
   [CRON] Starting anonymization job...
   [CRON] Anonymization completed in 8.5s: 200 hands processed, 2 jobs completed, 0 errors
   ```

### Verificar Status dos Jobs

```sql
-- Pending jobs
SELECT * FROM anonymization_jobs WHERE status = 'PENDING';

-- Failed jobs (need retry)
SELECT * FROM anonymization_jobs WHERE status = 'FAILED';

-- Completed today
SELECT COUNT(*) FROM anonymization_jobs
WHERE status = 'COMPLETED' AND completed_at > NOW() - INTERVAL '1 day';

-- Total hands anonymized
SELECT COUNT(*) FROM anonymized_hands;

-- Breakdown by site
SELECT site, COUNT(*) FROM anonymized_hands GROUP BY site;

-- Breakdown by game type
SELECT game_type, COUNT(*) FROM anonymized_hands GROUP BY game_type;
```

---

## Troubleshooting

### ❌ Cron não está executando

**Problema:** Vercel Cron só funciona em plano Pro ou em production deployments.

**Solução:**
1. Deploy para produção (branch main)
2. Ou use manual trigger endpoint para testes

### ❌ "Unauthorized" error

**Problema:** CRON_SECRET não está configurado ou não coincide.

**Solução:**
1. Adicione CRON_SECRET nas env vars da Vercel
2. Adicione CRON_SECRET nas env vars do Railway (backend)
3. Certifique-se que são **exatamente iguais**

### ❌ Backend unreachable

**Problema:** Backend não está acessível ou URL incorreta.

**Solução:**
1. Verifique `NEXT_PUBLIC_API_URL` na Vercel
2. Teste: `curl https://your-backend.railway.app/health`
3. Certifique-se que backend está rodando

### ❌ Jobs ficam em PENDING forever

**Problema:** Cron não está processando ou está falhando.

**Solução:**
1. Verifique logs do Vercel
2. Trigger manualmente: `POST /anonymization/process-manual`
3. Verifique `lastError` nos jobs:
   ```sql
   SELECT id, status, last_error FROM anonymization_jobs WHERE status = 'FAILED';
   ```

---

## Próximos Passos (Futuro)

### 1. AI Training API

```typescript
// Exportar dataset para treinamento
GET /api/ml/export-dataset
Query: {
  gameType: "TOURNAMENT",
  stakesTier: "MICRO",
  tags: ["all-in", "showdown"],
  limit: 10000
}

Response: JSON array com mãos anonimizadas
```

### 2. Feature Extraction

Adicionar cálculo de features automáticas:
- Pot odds
- SPR (Stack-to-Pot Ratio)
- Aggression frequency
- VPIP (Voluntarily Put money In Pot)
- PFR (Pre-Flop Raise)

### 3. Data Insights

Dashboard mostrando:
- Total de mãos anonimizadas
- Distribuição por stakes
- Tags mais comuns
- Growth over time

---

## Custos

**Zero custo adicional! 🎉**

- ✅ Vercel Cron: Grátis (hobby plan)
- ✅ PostgreSQL: Já está sendo usado
- ✅ Backend: Railway (já rodando)

**Capacidade gratuita:**
- 2,400 mãos/dia
- 72,000 mãos/mês
- 864,000 mãos/ano

Mais que suficiente para o MVP e fase inicial!

---

## Segurança & Privacidade

### Anonimização

✅ **Nomes de jogadores**: Substituídos por Player1, Player2, etc.
✅ **IDs de usuário**: Não armazenados no AnonymizedHand
✅ **Estrutura da mão**: Preservada (actions, board, pots)
✅ **Cartas**: Preservadas (necessário para IA)

### Dados NÃO Anonimizados

O sistema mantém:
- Site de poker (PokerStars, GGPoker, etc.)
- Timestamp da mão
- Estrutura de ações e apostas
- Board cards
- Resultados (quem ganhou)

### GDPR Compliance

Para conformidade com GDPR:
1. ✅ Dados anonimizados (não identificam pessoas)
2. ✅ Usuários podem solicitar exclusão de dados originais
3. ⚠️ Considerar adicionar "opt-out" no futuro

---

## Resumo

| Aspecto | Detalhe |
|---------|---------|
| **Frequência** | A cada 2 horas (12x/dia) |
| **Capacidade** | 200 mãos/execução = 2,400 mãos/dia |
| **Custo** | Zero (Vercel free tier) |
| **Latência** | Máx 4h entre upload e anonimização |
| **Impacto UX** | Zero (processamento em background) |
| **Segurança** | Protected by CRON_SECRET |
| **Deduplicação** | Sim (por handId) |
| **Retry** | Sim (até 3 tentativas) |

---

**Última atualização:** 2025-01-15
**Versão:** 1.0.0
