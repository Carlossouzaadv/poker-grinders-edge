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

## 🗄️ Aplicar Migrations no Supabase

⚠️ **IMPORTANTE**: Migrations devem ser aplicadas **MANUALMENTE** no Supabase SQL Editor.

**Por quê?** Prisma Migrate não funciona com Connection Pooling (pgbouncer). O Vercel usa a porta 6543 (pooling), mas migrations precisam da porta 5432 (conexão direta).

### 📖 Guia Completo de Migration

**Consulte o documento completo**:
```
Docs/SUPABASE_MIGRATION_MANUAL.md
```

Este documento contém:
- ✅ SQL completo do schema atualizado (10 tabelas + 7 ENUMs)
- ✅ Passo a passo detalhado
- ✅ Comandos de verificação
- ✅ Troubleshooting

### ⚡ Resumo Rápido

1. Acesse: https://app.supabase.com/project/fazhfnhmemgwwvisiftz
2. **SQL Editor** → **New query**
3. Copie e cole o SQL completo de `SUPABASE_MIGRATION_MANUAL.md`
4. Execute e verifique sucesso

---

**Criado em**: 2025-10-05
**Project Ref**: fazhfnhmemgwwvisiftz
