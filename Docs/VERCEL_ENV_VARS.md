# 🔐 Variáveis de Ambiente para Vercel

**IMPORTANTE**: Copie e cole no Vercel Dashboard ao fazer deploy

---

## 🔹 Backend (poker-grinders-edge-api)

Copie essas variáveis ao importar o projeto backend:

```bash
# Database (Connection Pooling)
DATABASE_URL=postgresql://postgres.fazhfnhmemgwwvisiftz:Pokergrindersedge%402909@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# JWT Secrets (GERAR NOVOS FORTES EM PRODUÇÃO!)
JWT_SECRET=poker-grinders-edge-production-jwt-secret-2025-ultra-secure
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=poker-grinders-edge-production-refresh-secret-2025-ultra-secure
JWT_REFRESH_EXPIRES_IN=30d

# Application
NODE_ENV=production
PORT=3000

# CORS (atualizar depois do deploy do frontend)
ALLOWED_ORIGINS=https://poker-grinders-edge-web.vercel.app,http://localhost:3000
```

### **Gerar Segredos Fortes:**

**No PowerShell (Windows):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Execute 2x e substitua `JWT_SECRET` e `JWT_REFRESH_SECRET`

---

## 🔹 Frontend (poker-grinders-edge-web)

Copie essas variáveis ao importar o projeto web:

```bash
# Backend API (atualizar depois do deploy do backend)
NEXT_PUBLIC_API_URL=https://poker-grinders-edge-api.vercel.app

# Application
NODE_ENV=production
```

---

## 📝 Observações Importantes

### ⚠️ Sobre a Senha no DATABASE_URL

A senha tem `@` que precisa ser URL-encoded como `%40`:
- **Senha original**: `Pokergrindersedge@2909`
- **Senha encoded**: `Pokergrindersedge%402909`

### 🔄 Ordem de Deploy

1. **Primeiro**: Deploy do Backend
   - Anote a URL: `https://poker-grinders-edge-api-XXXXX.vercel.app`

2. **Depois**: Atualize `ALLOWED_ORIGINS` no backend
   - Adicione a URL do frontend quando souber
   - Re-deploy o backend

3. **Por fim**: Deploy do Frontend
   - Use a URL do backend em `NEXT_PUBLIC_API_URL`

---

## 🗄️ Aplicar Migrations (Opção SQL Editor)

Se a migration automática falhar no Vercel, use o SQL Editor do Supabase:

### Acesse:
1. https://app.supabase.com/project/fazhfnhmemgwwvisiftz
2. **SQL Editor** → **New query**

### Execute este SQL:

```sql
-- ============================================
-- MIGRATIONS DO PRISMA
-- ============================================

-- Tabela: _prisma_migrations
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

-- Tabela: User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Tabela: Session
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "gameType" TEXT NOT NULL,
    "buyIn" DOUBLE PRECISION NOT NULL,
    "cashOut" DOUBLE PRECISION NOT NULL,
    "result" DOUBLE PRECISION NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- Tabela: HandHistorySession
CREATE TABLE IF NOT EXISTS "HandHistorySession" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "rawHandHistory" TEXT NOT NULL,
    "pokerSite" TEXT NOT NULL,
    "handCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "HandHistorySession_userId_idx" ON "HandHistorySession"("userId");

-- Registrar migration
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
    '',
    '20240101000000_init',
    1,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## ✅ Verificação Pós-Migration

Execute no SQL Editor:

```sql
-- Ver tabelas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Ver migrations aplicadas
SELECT migration_name, finished_at FROM "_prisma_migrations";

-- Testar criação de usuário
INSERT INTO "User" (id, email, name, password, plan)
VALUES (
    gen_random_uuid()::text,
    'teste@pokergrinders.com',
    'Usuário Teste',
    '$2b$10$FAKEHASHFORTESTING',
    'FREE'
)
RETURNING id, email, name, plan;
```

---

**Criado em**: 2025-10-05
**Project Ref**: fazhfnhmemgwwvisiftz
