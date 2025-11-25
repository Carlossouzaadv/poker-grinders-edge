# 🚀 Deployment Guide - Vercel + Supabase

**PokerMastery - Production Deployment**

---

## 📋 Pré-requisitos

- [x] Conta no GitHub
- [x] Conta no Vercel
- [x] Conta no Supabase
- [x] Código commitado no GitHub

---

## ETAPA 1: Coletar Informações do Supabase

### 1.1 Acessar Projeto Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto (ou crie um novo com nome `poker-grinders-edge`)
3. Aguarde provisionamento (~2min se for novo)

### 1.2 Obter Connection Strings

Vá em **Settings → Database** e copie:

#### A. Direct Connection (para migrations)
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
```

#### B. Connection Pooling - Transaction Mode (para produção)
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Salve essas URLs! Você vai usar no passo 3.**

### 1.3 Informações Adicionais

- **Project Reference**: `[letras/números]` (ex: `abcdefghijk`)
- **Database Password**: (você definiu na criação)
- **Region**: (ex: `us-east-1`)

---

## ETAPA 2: Preparar Repositório GitHub

### 2.1 Verificar Branch

```bash
git branch
# Você deve estar em: fix/sidepot-polish ou main
```

### 2.2 Commit das Mudanças Recentes

```bash
git add .
git commit -m "feat: add blog system, hand navigation, and production configs

- Implement blog with 3 full articles
- Add hand navigation (fast forward/backward)
- Adjust layout (75/25 split)
- Add Tailwind Typography plugin
- Create .env.example files for deployment
- Configure Vercel build scripts"
```

### 2.3 Push para GitHub

**Se já existe repositório:**
```bash
git push origin fix/sidepot-polish
```

**Se NÃO existe repositório:**
```bash
# Criar repositório no GitHub (nome: poker-grinders-edge)
# Depois:
git remote add origin https://github.com/[SEU_USUARIO]/poker-grinders-edge.git
git push -u origin fix/sidepot-polish
```

---

## ETAPA 3: Deploy Backend no Vercel

### 3.1 Importar Projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Selecione `poker-grinders-edge`
4. Configure:
   - **Project Name**: `poker-grinders-edge-api`
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.2 Configurar Variáveis de Ambiente

Clique em **Environment Variables** e adicione:

#### Obrigatórias:
```bash
DATABASE_URL = [COLE A CONNECTION POOLING URL DO PASSO 1.2B]

JWT_SECRET = [GERE UM SEGREDO FORTE - veja abaixo]

JWT_REFRESH_SECRET = [GERE OUTRO SEGREDO FORTE]

JWT_EXPIRES_IN = 7d

JWT_REFRESH_EXPIRES_IN = 30d

NODE_ENV = production

PORT = 3000
```

#### Gerar Segredos Fortes:

**Windows (PowerShell):**
```powershell
# Para JWT_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Para JWT_REFRESH_SECRET (rode de novo)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

### 3.3 Deploy

1. Clique em **Deploy**
2. Aguarde ~3-5min
3. Anote a URL do backend: `https://poker-grinders-edge-api.vercel.app`

---

## ETAPA 4: Aplicar Migrations do Prisma

### 4.1 Localmente (usando Direct Connection)

Edite temporariamente `backend/.env`:
```bash
DATABASE_URL="[COLE A DIRECT CONNECTION URL DO PASSO 1.2A]"
```

Execute:
```bash
cd backend
npm run db:migrate:deploy
```

Você verá:
```
Applying migration `20240101000000_init`
Applying migration `20240101000001_add_sessions`
...
✓ All migrations applied successfully
```

### 4.2 Verificar no Supabase

1. Vá em **Table Editor** no Supabase
2. Confirme tabelas criadas:
   - `User`
   - `Session`
   - `HandHistorySession`
   - `_prisma_migrations`

---

## ETAPA 5: Deploy Frontend no Vercel

### 5.1 Importar Projeto

1. Acesse [vercel.com/new](https://vercel.com/new) novamente
2. Selecione `poker-grinders-edge` (mesmo repo)
3. Configure:
   - **Project Name**: `poker-grinders-edge-web`
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: (deixe padrão - `next build`)
   - **Output Directory**: (deixe padrão)

### 5.2 Configurar Variáveis de Ambiente

Clique em **Environment Variables** e adicione:

```bash
NEXT_PUBLIC_API_URL = https://poker-grinders-edge-api.vercel.app

NODE_ENV = production
```

### 5.3 Deploy

1. Clique em **Deploy**
2. Aguarde ~2-3min
3. Anote a URL do frontend: `https://poker-grinders-edge-web.vercel.app`

---

## ETAPA 6: Configurar CORS no Backend

### 6.1 Adicionar Variável no Vercel

Vá no projeto **poker-grinders-edge-api** no Vercel:

1. **Settings → Environment Variables**
2. Adicione:
   ```bash
   ALLOWED_ORIGINS = https://poker-grinders-edge-web.vercel.app,http://localhost:3000
   ```

### 6.2 Atualizar Código CORS (se necessário)

Verifique `backend/src/main.ts` tem:
```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
});
```

### 6.3 Re-deploy

1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. **Redeploy**

---

## ETAPA 7: Testar em Produção

### 7.1 Acesse o Frontend

Abra: `https://poker-grinders-edge-web.vercel.app`

### 7.2 Teste Básico

1. **Homepage**: Deve carregar corretamente
2. **Login**: Vá para `/login`
   - Tente criar uma conta
   - Confirme no Supabase (Table Editor → User)
3. **Dashboard**: Acesse `/dashboard`
4. **Hand Analyzer**: Teste `/hand-analyzer/new`
5. **Blog**: Acesse `/blog` e clique em um artigo

### 7.3 Verificar Logs

**Backend:**
```bash
# No Vercel, vá em:
Deployments → [último deploy] → Logs
```

**Frontend:**
```bash
# Console do navegador (F12)
# Deve conectar com backend sem erros de CORS
```

---

## 🔧 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique `DATABASE_URL` no Vercel está correta
2. Confirme que usou **Connection Pooling** (porta 6543)
3. Teste conexão localmente:
   ```bash
   psql "[DIRECT_CONNECTION_URL]"
   ```

### Erro: "CORS policy blocked"

**Solução:**
1. Adicione `ALLOWED_ORIGINS` no backend
2. Re-deploy o backend
3. Limpe cache do navegador

### Erro: "JWT malformed"

**Solução:**
1. Gere novos segredos JWT fortes
2. Atualize variáveis no Vercel
3. Re-deploy

### Erro: "Migrations not applied"

**Solução:**
```bash
cd backend
DATABASE_URL="[DIRECT_CONNECTION]" npm run db:migrate:deploy
```

---

## 📊 SQL Queries para Supabase

### Verificar Tabelas Criadas

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Verificar Migrations Aplicadas

```sql
SELECT * FROM _prisma_migrations ORDER BY finished_at DESC;
```

### Ver Usuários Cadastrados

```sql
SELECT id, email, name, created_at FROM "User";
```

### Resetar Database (CUIDADO!)

```sql
-- APENAS EM DEV/TESTES
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

---

## 🎯 Checklist Final

- [ ] Supabase project criado
- [ ] Database URLs coletadas
- [ ] Código commitado no GitHub
- [ ] Backend deployed no Vercel
- [ ] Frontend deployed no Vercel
- [ ] Migrations aplicadas no Supabase
- [ ] CORS configurado
- [ ] Teste de login funcionando
- [ ] Hand Analyzer funcionando
- [ ] Blog carregando

---

## 📝 URLs de Referência

- **Frontend Prod**: https://poker-grinders-edge-web.vercel.app
- **Backend Prod**: https://poker-grinders-edge-api.vercel.app
- **Supabase Dashboard**: https://app.supabase.com/project/[PROJECT_REF]
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**Última Atualização**: 2025-10-05
**Versão**: 1.0.0
