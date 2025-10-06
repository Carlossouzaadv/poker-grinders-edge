# 🚀 Deploy Rápido - Vercel

**Branch Principal**: `main`

---

## ⚡ Guia Rápido (3 Passos)

### **1️⃣ Migrations no Supabase** (5min)

1. Acesse: https://app.supabase.com/project/fazhfnhmemgwwvisiftz
2. **SQL Editor** → **New query**
3. Copie e cole o SQL de `Docs/VERCEL_ENV_VARS.md` (seção "Aplicar Migrations")
4. **Run** → Verifique "Success"

---

### **2️⃣ Deploy Backend** (5min)

#### Importar Projeto:
- URL: https://vercel.com/new
- Repository: `Carlossouzaadv/poker-grinders-edge`
- **Branch**: `main` ← IMPORTANTE!

#### Configurações:
```
Project Name: poker-grinders-edge-api
Framework: Other
Root Directory: backend
Build Command: npm run build
Output Directory: (DEIXE VAZIO)
```

#### Environment Variables:
```
DATABASE_URL=postgresql://postgres.fazhfnhmemgwwvisiftz:Pokergrindersedge%402909@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

JWT_SECRET=poker-grinders-edge-production-jwt-secret-2025-ultra-secure

JWT_REFRESH_SECRET=poker-grinders-edge-production-refresh-secret-2025-ultra-secure

JWT_EXPIRES_IN=7d

JWT_REFRESH_EXPIRES_IN=30d

NODE_ENV=production

PORT=3000

ALLOWED_ORIGINS=http://localhost:3000
```

**Deploy** → Aguarde 3-5min → **Anote a URL do backend**

---

### **3️⃣ Deploy Frontend** (5min)

#### Importar Projeto:
- URL: https://vercel.com/new
- Repository: `Carlossouzaadv/poker-grinders-edge` (mesmo)
- **Branch**: `main`

#### Configurações:
```
Project Name: poker-grinders-edge-web
Framework: Next.js
Root Directory: web
Build Command: (padrão)
Output Directory: (padrão)
```

#### Environment Variables:
```
NEXT_PUBLIC_API_URL=https://[SUA-URL-BACKEND].vercel.app

NODE_ENV=production
```
*(Substitua pela URL do backend do passo 2)*

**Deploy** → Aguarde 2-3min → **Anote a URL do frontend**

---

### **4️⃣ Atualizar CORS** (2min)

1. Projeto backend no Vercel → **Settings** → **Environment Variables**
2. Edite `ALLOWED_ORIGINS`:
   ```
   https://[SUA-URL-FRONTEND].vercel.app,http://localhost:3000
   ```
3. **Deployments** → Último → **...** → **Redeploy**

---

## ✅ Testar

Acesse: `https://[SUA-URL-FRONTEND].vercel.app`

- ✅ Homepage
- ✅ Login/Register
- ✅ Dashboard
- ✅ Hand Analyzer
- ✅ Blog

---

## 📚 Documentação Completa

- **Detalhes completos**: `Docs/DEPLOYMENT_GUIDE.md`
- **Variáveis de ambiente**: `Docs/VERCEL_ENV_VARS.md`
- **Config backend**: `Docs/VERCEL_BACKEND_CONFIG.md`
- **SQL Queries**: `Docs/SUPABASE_SQL_QUERIES.md`

---

**Última Atualização**: 2025-10-05
**Branch Ativa**: `main`
