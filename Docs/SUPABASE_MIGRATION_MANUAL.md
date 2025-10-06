# 🗄️ Aplicar Migrations Manualmente no Supabase

**Por que manual?** Migrations do Prisma não funcionam com Connection Pooling (pgbouncer). Por isso, aplicamos diretamente no banco via SQL Editor.

---

## 📋 Pré-requisitos

✅ Conta Supabase ativa
✅ Projeto: `fazhfnhmemgwwvisiftz`
✅ Acesso ao SQL Editor

---

## 🚀 Passo a Passo

### 1️⃣ Acessar SQL Editor

1. Acesse: https://app.supabase.com/project/fazhfnhmemgwwvisiftz
2. Menu lateral → **SQL Editor**
3. Clique em **+ New query**

---

### 2️⃣ Copiar e Executar Migration

Copie o SQL completo abaixo e cole no editor:

```sql
-- ==============================================================================
-- POKER GRINDER'S EDGE - DATABASE SCHEMA
-- Migration: 20250930154933_add_hand_history_sessions
-- ==============================================================================

-- ==============================================================================
-- LIMPAR SCHEMA ANTIGO (se necessário)
-- ==============================================================================

-- Drop tabelas antigas (ordem reversa devido a foreign keys)
DROP TABLE IF EXISTS "HandHistorySession" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ==============================================================================
-- CRIAR ENUMS
-- ==============================================================================

-- Drop enums se existirem
DROP TYPE IF EXISTS "UserType" CASCADE;
DROP TYPE IF EXISTS "SubscriptionPlan" CASCADE;
DROP TYPE IF EXISTS "GameType" CASCADE;
DROP TYPE IF EXISTS "SessionStatus" CASCADE;
DROP TYPE IF EXISTS "HandType" CASCADE;
DROP TYPE IF EXISTS "CoachStatus" CASCADE;
DROP TYPE IF EXISTS "BookingStatus" CASCADE;

-- Criar enums
CREATE TYPE "UserType" AS ENUM ('PLAYER', 'COACH');
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO');
CREATE TYPE "GameType" AS ENUM ('CASH', 'TOURNAMENT', 'SIT_AND_GO');
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED');
CREATE TYPE "HandType" AS ENUM ('PREFLOP', 'FLOP', 'TURN', 'RIVER');
CREATE TYPE "CoachStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- ==============================================================================
-- CRIAR TABELAS
-- ==============================================================================

-- users
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "userType" "UserType" NOT NULL DEFAULT 'PLAYER',
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "dailyTrainerHands" INTEGER NOT NULL DEFAULT 0,
    "lastTrainerReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- refresh_tokens
CREATE TABLE "refresh_tokens" (
    "id" TEXT PRIMARY KEY,
    "token" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- sessions
CREATE TABLE "sessions" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "location" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "buyIn" DECIMAL(10,2),
    "cashOut" DECIMAL(10,2),
    "tournamentName" TEXT,
    "rebuys" INTEGER DEFAULT 0,
    "addOns" INTEGER DEFAULT 0,
    "bounties" DECIMAL(10,2),
    "prize" DECIMAL(10,2),
    "result" DECIMAL(10,2),
    "roi" DOUBLE PRECISION,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- hands
CREATE TABLE "hands" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "position" TEXT,
    "myCards" TEXT,
    "boardCards" TEXT,
    "stackSize" INTEGER,
    "potSize" DECIMAL(10,2),
    "actionTaken" TEXT,
    "betAmount" DECIMAL(10,2),
    "gtoAction" TEXT,
    "gtoAnalysis" JSONB,
    "isOptimal" BOOLEAN,
    "screenshot" TEXT,
    "ocrData" JSONB,
    "isTrainingHand" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" INTEGER,
    "scenario" TEXT,
    "handType" "HandType",
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE SET NULL
);

-- coach_profiles
CREATE TABLE "coach_profiles" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "status" "CoachStatus" NOT NULL DEFAULT 'PENDING',
    "verificationDoc" TEXT,
    "socialLink" TEXT,
    "hendonMobLink" TEXT,
    "bio" TEXT,
    "specialties" TEXT[],
    "languages" TEXT[],
    "experience" INTEGER,
    "hourlyRateUSD" DECIMAL(8,2),
    "hourlyRateBRL" DECIMAL(8,2),
    "totalHours" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- bookings
CREATE TABLE "bookings" (
    "id" TEXT PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "amount" DECIMAL(8,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "commission" DECIMAL(8,2) NOT NULL,
    "topic" TEXT,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE
);

-- reviews
CREATE TABLE "reviews" (
    "id" TEXT PRIMARY KEY,
    "bookingId" TEXT NOT NULL UNIQUE,
    "coachId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE,
    FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE
);

-- gto_ranges
CREATE TABLE "gto_ranges" (
    "id" TEXT PRIMARY KEY,
    "position" TEXT NOT NULL,
    "stackBBs" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "frequency" DOUBLE PRECISION NOT NULL,
    "scenario" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'custom',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    UNIQUE ("position", "stackBBs", "action", "scenario")
);

-- hand_history_sessions
CREATE TABLE "hand_history_sessions" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "siteFormat" TEXT NOT NULL,
    "totalHands" INTEGER NOT NULL,
    "rawHandHistory" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- hand_history_hands
CREATE TABLE "hand_history_hands" (
    "id" TEXT PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "handIndex" INTEGER NOT NULL,
    "handText" TEXT NOT NULL,
    "parsedData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("sessionId") REFERENCES "hand_history_sessions"("id") ON DELETE CASCADE,
    UNIQUE ("sessionId", "handIndex")
);

-- ==============================================================================
-- CRIAR ÍNDICES
-- ==============================================================================

-- hand_history_sessions
CREATE INDEX "hand_history_sessions_userId_createdAt_idx"
    ON "hand_history_sessions"("userId", "createdAt" DESC);

-- hand_history_hands
CREATE INDEX "hand_history_hands_sessionId_handIndex_idx"
    ON "hand_history_hands"("sessionId", "handIndex");

-- ==============================================================================
-- REGISTRAR MIGRATION NO PRISMA
-- ==============================================================================

-- Criar tabela de migrations do Prisma (se não existir)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Limpar registros antigos
DELETE FROM "_prisma_migrations";

-- Registrar a migration
INSERT INTO "_prisma_migrations" (
    "id",
    "checksum",
    "migration_name",
    "applied_steps_count",
    "started_at",
    "finished_at"
)
VALUES (
    gen_random_uuid()::text,
    '20250930154933_add_hand_history_sessions',
    '20250930154933_add_hand_history_sessions',
    1,
    NOW(),
    NOW()
);
```

---

### 3️⃣ Executar

1. Clique em **Run** (ou `Ctrl+Enter`)
2. Aguarde a mensagem: **"Success. No rows returned"**
3. Se houver erro, leia a seção de Troubleshooting abaixo

---

### 4️⃣ Verificar

Execute para confirmar que tudo está OK:

```sql
-- 1. Ver tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Ver ENUMs criados
SELECT typname
FROM pg_type
WHERE typtype = 'e'
ORDER BY typname;

-- 3. Ver migrations aplicadas
SELECT migration_name, finished_at
FROM "_prisma_migrations"
ORDER BY finished_at DESC;

-- 4. Testar criação de usuário (OPCIONAL)
INSERT INTO "users" (id, email, "firstName", "lastName", password, plan, "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'teste@pokergrinders.com',
    'Teste',
    'User',
    '$2b$10$FAKEHASHFORTESTING',
    'FREE',
    NOW()
)
RETURNING id, email, "firstName", "lastName", plan;
```

---

## ✅ Resultado Esperado

Você deve ver:

### Tabelas (10):
- `_prisma_migrations`
- `bookings`
- `coach_profiles`
- `gto_ranges`
- `hand_history_hands`
- `hand_history_sessions`
- `hands`
- `refresh_tokens`
- `reviews`
- `sessions`
- `users`

### ENUMs (7):
- `BookingStatus`
- `CoachStatus`
- `GameType`
- `HandType`
- `SessionStatus`
- `SubscriptionPlan`
- `UserType`

---

## 🔄 Próximo Passo: Deploy no Vercel

Agora que o banco está pronto, você pode fazer o deploy do backend:

1. **Vercel Dashboard** → Import Project
2. Repository: `Carlossouzaadv/poker-grinders-edge`
3. Root Directory: `backend`
4. Build Command: `npm run build` ✅ (já atualizado no package.json)
5. Environment Variables: Copie de `Docs/VERCEL_ENV_VARS.md`

---

## 🐛 Troubleshooting

### Erro: "type already exists"

Se você ver erros sobre tipos já existentes, use `DROP TYPE IF EXISTS` antes:

```sql
DROP TYPE IF EXISTS "UserType" CASCADE;
DROP TYPE IF EXISTS "SubscriptionPlan" CASCADE;
-- ... etc
```

### Erro: "table already exists"

Remova as tabelas antigas primeiro:

```sql
-- Drop em ordem reversa (foreign keys)
DROP TABLE IF EXISTS "hand_history_hands" CASCADE;
DROP TABLE IF EXISTS "hand_history_sessions" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "bookings" CASCADE;
DROP TABLE IF EXISTS "coach_profiles" CASCADE;
DROP TABLE IF EXISTS "hands" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "refresh_tokens" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "gto_ranges" CASCADE;
```

### Erro: "relation does not exist"

A migration não foi aplicada completamente. Execute o SQL completo novamente do início.

---

## ⚠️ Importante

- **Não use** `prisma migrate deploy` no Vercel - ele não funciona com pgbouncer
- **Não use** `prisma db push` em produção - pode causar perda de dados
- **Use sempre** migrations manuais via SQL Editor para produção
- **Para desenvolvimento local**, use `npm run db:migrate` normalmente com conexão direta (porta 5432)

---

## 📚 Documentação Relacionada

- **Variáveis de ambiente**: `Docs/VERCEL_ENV_VARS.md`
- **Queries úteis**: `Docs/SUPABASE_SQL_QUERIES.md`
- **Schema completo**: `Docs/DATABASE_SCHEMA.md`

---

**Criado em**: 2025-10-06
**Atualizado em**: 2025-10-06
**Migration**: `20250930154933_add_hand_history_sessions`
**Project Ref**: `fazhfnhmemgwwvisiftz`
