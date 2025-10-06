# 🚀 Vercel Backend Deploy - Configuração Correta

## ⚙️ Configurações do Projeto

Ao importar o projeto backend no Vercel, use exatamente estas configurações:

### **General Settings**
```
Project Name: poker-grinders-edge-api
Framework Preset: Other (ou Node.js)
Root Directory: backend
```

### **Build & Development Settings**
```
Build Command: npm run build
Output Directory: dist (DEIXE VAZIO ou use "dist")
Install Command: npm install
Development Command: npm run start:dev
```

### **IMPORTANTE**:
- ❌ **NÃO** use `npm run vercel-build` como Build Command
- ❌ **NÃO** configure Output Directory como "public"
- ✅ **USE** apenas `npm run build`
- ✅ **Output Directory** deve estar VAZIO ou "dist"

---

## 🔐 Environment Variables

Copie e cole estas variáveis (uma por linha):

```
DATABASE_URL=postgresql://postgres.fazhfnhmemgwwvisiftz:Pokergrindersedge%402909@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

JWT_SECRET=poker-grinders-edge-production-jwt-secret-2025-ultra-secure

JWT_REFRESH_SECRET=poker-grinders-edge-production-refresh-secret-2025-ultra-secure

JWT_EXPIRES_IN=7d

JWT_REFRESH_EXPIRES_IN=30d

NODE_ENV=production

PORT=3000

ALLOWED_ORIGINS=https://poker-grinders-edge-web.vercel.app,http://localhost:3000
```

### 🔒 Gerar Segredos Fortes (Recomendado)

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Execute 2x e substitua `JWT_SECRET` e `JWT_REFRESH_SECRET`

---

## 🐛 Troubleshooting

### Erro: "No Output Directory named 'public' found"
**Solução**:
1. Vá em **Settings → General**
2. Seção **Build & Development Settings**
3. Output Directory: **DEIXE VAZIO** ou coloque `dist`
4. Build Command: `npm run build` (SEM vercel-build)

### Erro: "MODULE_NOT_FOUND: @prisma/client"
**Solução**:
1. Verifique que `package.json` tem `"postinstall": "prisma generate"`
2. Re-deploy o projeto

### Erro: "Authentication failed against database"
**Solução**:
1. Verifique `DATABASE_URL` tem senha URL-encoded (`@` = `%40`)
2. Use Connection Pooling URL (porta 6543)
3. Formato correto:
   ```
   postgresql://postgres.REF:SENHA%40ENCODED@HOST:6543/postgres?pgbouncer=true
   ```

---

## ✅ Verificação Pós-Deploy

### 1. Verificar Logs
```
Vercel Dashboard → Deployments → [Último deploy] → Logs
```

Deve mostrar:
```
✓ Compiled successfully
🚀 Backend running on http://localhost:3000
```

### 2. Testar Endpoint
```bash
curl https://sua-api.vercel.app
```

Resposta esperada (404 ou 200 - depende da rota raiz)

### 3. Testar Health (se tiver endpoint)
```bash
curl https://sua-api.vercel.app/health
```

---

**Última Atualização**: 2025-10-05
