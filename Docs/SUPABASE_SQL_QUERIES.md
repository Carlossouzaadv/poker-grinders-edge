# 🗄️ Supabase SQL Queries

**Queries úteis para gerenciar o banco de dados no Supabase SQL Editor**

---

## 📊 Verificação e Diagnóstico

### 1. Ver todas as tabelas criadas

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Resultado esperado:**
- `_prisma_migrations`
- `HandHistorySession`
- `Session`
- `User`

---

### 2. Ver migrations aplicadas

```sql
SELECT
  migration_name,
  finished_at,
  applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at DESC;
```

---

### 3. Verificar estrutura da tabela User

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;
```

---

### 4. Ver usuários cadastrados

```sql
SELECT
  id,
  email,
  name,
  plan,
  "createdAt",
  "updatedAt"
FROM "User"
ORDER BY "createdAt" DESC;
```

---

### 5. Ver sessões de poker criadas

```sql
SELECT
  s.id,
  s."gameType",
  s."buyIn",
  s."cashOut",
  s.result,
  s."createdAt",
  u.email as user_email,
  u.name as user_name
FROM "Session" s
JOIN "User" u ON s."userId" = u.id
ORDER BY s."createdAt" DESC
LIMIT 20;
```

---

### 6. Ver hand histories parseadas

```sql
SELECT
  hhs.id,
  hhs."handCount",
  hhs."pokerSite",
  hhs."createdAt",
  u.email as user_email
FROM "HandHistorySession" hhs
JOIN "User" u ON hhs."userId" = u.id
ORDER BY hhs."createdAt" DESC
LIMIT 20;
```

---

## 🔧 Manutenção e Limpeza

### 7. Deletar todos os dados de teste (CUIDADO!)

```sql
-- APENAS EM DEV/STAGING - NÃO USE EM PRODUÇÃO COM DADOS REAIS!
BEGIN;

DELETE FROM "HandHistorySession";
DELETE FROM "Session";
DELETE FROM "User";

COMMIT;
```

---

### 8. Deletar um usuário específico

```sql
-- Substitua o email
DELETE FROM "User" WHERE email = 'teste@example.com';
```

---

### 9. Resetar database completo (CUIDADO EXTREMO!)

```sql
-- ISSO APAGA TUDO E RECRIA O SCHEMA
-- USE APENAS SE PRECISAR RECRIAR DO ZERO
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Depois rode: npm run db:migrate:deploy
```

---

## 📈 Estatísticas e Análises

### 10. Total de usuários por plano

```sql
SELECT
  plan,
  COUNT(*) as total_users
FROM "User"
GROUP BY plan
ORDER BY total_users DESC;
```

---

### 11. Estatísticas de sessions por usuário

```sql
SELECT
  u.email,
  u.name,
  COUNT(s.id) as total_sessions,
  SUM(s."buyIn") as total_buy_in,
  SUM(s."cashOut") as total_cash_out,
  SUM(s.result) as total_profit
FROM "User" u
LEFT JOIN "Session" s ON u.id = s."userId"
GROUP BY u.id, u.email, u.name
ORDER BY total_profit DESC NULLS LAST;
```

---

### 12. Sessões mais lucrativas

```sql
SELECT
  s.id,
  u.email,
  s."gameType",
  s."buyIn",
  s."cashOut",
  s.result as profit,
  s."createdAt"
FROM "Session" s
JOIN "User" u ON s."userId" = u.id
WHERE s.result > 0
ORDER BY s.result DESC
LIMIT 10;
```

---

### 13. Usuários mais ativos (por hand histories)

```sql
SELECT
  u.email,
  u.name,
  COUNT(hhs.id) as total_hand_sessions,
  SUM(hhs."handCount") as total_hands_analyzed
FROM "User" u
LEFT JOIN "HandHistorySession" hhs ON u.id = hhs."userId"
GROUP BY u.id, u.email, u.name
ORDER BY total_hands_analyzed DESC NULLS LAST
LIMIT 10;
```

---

## 🔐 Segurança e Permissões

### 14. Ver políticas de RLS (Row Level Security)

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public';
```

---

### 15. Habilitar RLS em todas as tabelas (recomendado)

```sql
-- Habilita Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HandHistorySession" ENABLE ROW LEVEL SECURITY;

-- Cria políticas básicas (exemplo para User)
CREATE POLICY "Users can view their own data"
  ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data"
  ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id);
```

**NOTA**: Ajuste conforme sua estratégia de autenticação (JWT vs Supabase Auth)

---

## 🧪 Queries de Teste

### 16. Criar usuário de teste

```sql
INSERT INTO "User" (id, email, name, password, plan)
VALUES (
  gen_random_uuid()::text,
  'teste@pokergrinders.com',
  'Usuário Teste',
  '$2b$10$abcdefghijklmnopqrstuv', -- Hash bcrypt fake
  'FREE'
)
RETURNING id, email, name, plan;
```

---

### 17. Criar sessão de teste

```sql
-- Primeiro, pegue o ID de um usuário
SELECT id FROM "User" LIMIT 1;

-- Depois, insira a sessão (substitua USER_ID_AQUI)
INSERT INTO "Session" (
  id,
  "userId",
  "gameType",
  "buyIn",
  "cashOut",
  result,
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid()::text,
  'USER_ID_AQUI', -- Cole o ID do usuário
  'TOURNAMENT',
  100.00,
  250.00,
  150.00,
  NOW(),
  NOW()
)
RETURNING *;
```

---

## 🔍 Debugging e Troubleshooting

### 18. Ver erros de migration

```sql
SELECT
  migration_name,
  logs,
  rolled_back_at
FROM _prisma_migrations
WHERE rolled_back_at IS NOT NULL
OR logs IS NOT NULL;
```

---

### 19. Ver tamanho das tabelas

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

### 20. Ver conexões ativas

```sql
SELECT
  datname,
  usename,
  application_name,
  client_addr,
  state,
  query
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY query_start DESC;
```

---

## 📝 Como Usar

### No Supabase SQL Editor:

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de código)
4. Clique em **New query**
5. Cole a query desejada
6. Clique em **Run** (ou Ctrl+Enter)

### Exportar Resultados:

- Clique em **Download CSV** após executar
- Ou copie diretamente da tabela de resultados

---

**Última Atualização**: 2025-10-05
**Versão**: 1.0.0
