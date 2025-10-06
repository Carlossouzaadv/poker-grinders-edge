# 🗄️ Supabase SQL Queries

**Queries úteis para gerenciar o banco de dados no Supabase SQL Editor**

---

## 📊 Verificação e Diagnóstico

### 1. Ver todas as tabelas criadas

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Resultado esperado (10 tabelas)**:
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

### 3. Ver ENUMs criados

```sql
SELECT typname
FROM pg_type
WHERE typtype = 'e'
ORDER BY typname;
```

**Resultado esperado (7 ENUMs)**:
- `BookingStatus`
- `CoachStatus`
- `GameType`
- `HandType`
- `SessionStatus`
- `SubscriptionPlan`
- `UserType`

---

### 4. Verificar estrutura da tabela users

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

---

### 5. Ver usuários cadastrados

```sql
SELECT
  id,
  email,
  "firstName",
  "lastName",
  plan,
  "userType",
  "createdAt",
  "updatedAt"
FROM users
ORDER BY "createdAt" DESC;
```

---

### 6. Ver sessões de poker criadas

```sql
SELECT
  s.id,
  s."gameType",
  s."buyIn",
  s."cashOut",
  s.result,
  s."createdAt",
  u.email as user_email,
  u."firstName" || ' ' || u."lastName" as user_name
FROM sessions s
JOIN users u ON s."userId" = u.id
ORDER BY s."createdAt" DESC
LIMIT 20;
```

---

### 7. Ver hand histories parseadas

```sql
SELECT
  hhs.id,
  hhs."totalHands",
  hhs."siteFormat",
  hhs."createdAt",
  u.email as user_email,
  u."firstName" || ' ' || u."lastName" as user_name
FROM hand_history_sessions hhs
JOIN users u ON hhs."userId" = u.id
ORDER BY hhs."createdAt" DESC
LIMIT 20;
```

---

## 🔧 Manutenção e Limpeza

### 8. Deletar todos os dados de teste (CUIDADO!)

```sql
-- APENAS EM DEV/STAGING - NÃO USE EM PRODUÇÃO COM DADOS REAIS!
BEGIN;

-- Ordem correta (foreign keys)
DELETE FROM hand_history_hands;
DELETE FROM hand_history_sessions;
DELETE FROM reviews;
DELETE FROM bookings;
DELETE FROM coach_profiles;
DELETE FROM hands;
DELETE FROM sessions;
DELETE FROM refresh_tokens;
DELETE FROM users;

COMMIT;
```

---

### 9. Deletar um usuário específico

```sql
-- Substitua o email
DELETE FROM users WHERE email = 'teste@example.com';

-- Ou por ID
DELETE FROM users WHERE id = 'user_id_aqui';
```

---

### 10. Resetar database completo (CUIDADO EXTREMO!)

```sql
-- ISSO APAGA TUDO E RECRIA O SCHEMA
-- USE APENAS SE PRECISAR RECRIAR DO ZERO
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Depois execute o SQL de migration do arquivo:
-- Docs/SUPABASE_MIGRATION_MANUAL.md
```

---

## 📈 Estatísticas e Análises

### 11. Total de usuários por plano

```sql
SELECT
  plan,
  COUNT(*) as total_users
FROM users
GROUP BY plan
ORDER BY total_users DESC;
```

---

### 12. Estatísticas de sessions por usuário

```sql
SELECT
  u.email,
  u."firstName" || ' ' || u."lastName" as name,
  COUNT(s.id) as total_sessions,
  SUM(s."buyIn") as total_buy_in,
  SUM(s."cashOut") as total_cash_out,
  SUM(s.result) as total_profit
FROM users u
LEFT JOIN sessions s ON u.id = s."userId"
GROUP BY u.id, u.email, u."firstName", u."lastName"
ORDER BY total_profit DESC NULLS LAST;
```

---

### 13. Sessões mais lucrativas

```sql
SELECT
  s.id,
  u.email,
  s."gameType",
  s."buyIn",
  s."cashOut",
  s.result as profit,
  s."createdAt"
FROM sessions s
JOIN users u ON s."userId" = u.id
WHERE s.result > 0
ORDER BY s.result DESC
LIMIT 10;
```

---

### 14. Usuários mais ativos (por hand histories)

```sql
SELECT
  u.email,
  u."firstName" || ' ' || u."lastName" as name,
  COUNT(hhs.id) as total_hand_sessions,
  SUM(hhs."totalHands") as total_hands_analyzed
FROM users u
LEFT JOIN hand_history_sessions hhs ON u.id = hhs."userId"
GROUP BY u.id, u.email, u."firstName", u."lastName"
ORDER BY total_hands_analyzed DESC NULLS LAST
LIMIT 10;
```

---

### 15. Top coaches por rating

```sql
SELECT
  cp.id,
  u.email,
  u."firstName" || ' ' || u."lastName" as coach_name,
  cp.status,
  cp.rating,
  cp."reviewCount",
  cp."totalHours",
  cp."hourlyRateUSD"
FROM coach_profiles cp
JOIN users u ON cp."userId" = u.id
WHERE cp.status = 'APPROVED'
ORDER BY cp.rating DESC, cp."reviewCount" DESC
LIMIT 10;
```

---

## 🔐 Segurança e Permissões

### 16. Ver políticas de RLS (Row Level Security)

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

### 17. Habilitar RLS em todas as tabelas (recomendado)

```sql
-- Habilita Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hand_history_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Exemplo de políticas básicas (ajuste conforme sua estratégia de auth)
-- NOTA: Use apenas se estiver usando Supabase Auth, não JWT próprio

-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id);

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id);
```

**NOTA**: Ajuste conforme sua estratégia de autenticação (JWT vs Supabase Auth)

---

## 🧪 Queries de Teste

### 18. Criar usuário de teste

```sql
INSERT INTO users (
  id,
  email,
  "firstName",
  "lastName",
  password,
  plan,
  "updatedAt"
)
VALUES (
  gen_random_uuid()::text,
  'teste@pokergrinders.com',
  'Teste',
  'User',
  '$2b$10$abcdefghijklmnopqrstuv', -- Hash bcrypt fake
  'FREE',
  NOW()
)
RETURNING id, email, "firstName", "lastName", plan;
```

---

### 19. Criar sessão de teste

```sql
-- Primeiro, pegue o ID de um usuário
SELECT id, email FROM users LIMIT 1;

-- Depois, insira a sessão (substitua USER_ID_AQUI)
INSERT INTO sessions (
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

### 20. Criar hand history session de teste

```sql
-- Pegue o ID de um usuário primeiro
SELECT id, email FROM users LIMIT 1;

-- Insira a hand history session
INSERT INTO hand_history_sessions (
  id,
  "userId",
  name,
  "siteFormat",
  "totalHands",
  "rawHandHistory",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid()::text,
  'USER_ID_AQUI',
  'Test Session 2025-10-06',
  'PokerStars',
  5,
  'PokerStars Hand #123: ...',
  NOW(),
  NOW()
)
RETURNING id, name, "siteFormat", "totalHands";
```

---

## 🔍 Debugging e Troubleshooting

### 21. Ver erros de migration

```sql
SELECT
  migration_name,
  logs,
  rolled_back_at,
  finished_at
FROM _prisma_migrations
WHERE rolled_back_at IS NOT NULL
   OR logs IS NOT NULL
ORDER BY started_at DESC;
```

---

### 22. Ver tamanho das tabelas

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

### 23. Ver conexões ativas

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

### 24. Ver contadores de cada tabela

```sql
SELECT
  'users' as table_name,
  COUNT(*) as row_count
FROM users
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'hands', COUNT(*) FROM hands
UNION ALL
SELECT 'hand_history_sessions', COUNT(*) FROM hand_history_sessions
UNION ALL
SELECT 'hand_history_hands', COUNT(*) FROM hand_history_hands
UNION ALL
SELECT 'coach_profiles', COUNT(*) FROM coach_profiles
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens
ORDER BY row_count DESC;
```

---

### 25. Verificar integridade referencial

```sql
-- Verificar se há sessions órfãs (sem user)
SELECT COUNT(*) as orphaned_sessions
FROM sessions s
LEFT JOIN users u ON s."userId" = u.id
WHERE u.id IS NULL;

-- Verificar se há hands órfãs
SELECT COUNT(*) as orphaned_hands
FROM hands h
LEFT JOIN users u ON h."userId" = u.id
WHERE u.id IS NULL;

-- Verificar se há hand_history_sessions órfãs
SELECT COUNT(*) as orphaned_hhs
FROM hand_history_sessions hhs
LEFT JOIN users u ON hhs."userId" = u.id
WHERE u.id IS NULL;
```

---

## 📝 Como Usar

### No Supabase SQL Editor:

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto (`fazhfnhmemgwwvisiftz`)
3. Vá em **SQL Editor** (ícone de código no menu lateral)
4. Clique em **New query**
5. Cole a query desejada
6. Clique em **Run** (ou Ctrl+Enter)

### Exportar Resultados:

- Clique em **Download CSV** após executar
- Ou copie diretamente da tabela de resultados

---

## 📚 Documentação Relacionada

- **Migration manual**: `Docs/SUPABASE_MIGRATION_MANUAL.md`
- **Variáveis de ambiente**: `Docs/VERCEL_ENV_VARS.md`
- **Schema completo**: `Docs/DATABASE_SCHEMA.md`

---

**Última Atualização**: 2025-10-06
**Versão**: 2.0.0 (Atualizado para novo schema)
