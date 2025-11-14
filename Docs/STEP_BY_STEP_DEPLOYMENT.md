# 🚀 Guia Passo-a-Passo: Deploy do Sistema de Anonimização

## ✅ README Atualizado

O README.md foi atualizado com todo o histórico do projeto. Próximos passos:

---

## 📋 Pré-requisitos

Antes de começar, tenha instalado:
- ✅ Git
- ✅ Node.js 18+
- ✅ VSCode (ou seu editor preferido)
- ✅ Conta no Railway (backend)
- ✅ Conta no Vercel (frontend)

---

# PARTE 1: PUXAR MUDANÇAS PARA O VSCODE LOCAL

## Passo 1.1: Abrir Terminal no VSCode

```bash
# Abra o VSCode
# Pressione Ctrl+` (ou Cmd+` no Mac) para abrir o terminal integrado
# Ou vá em: Terminal > New Terminal
```

**✋ PARE AQUI - Me responda: "Terminal aberto, próximo passo"**

---

## Passo 1.2: Navegar até a pasta do projeto

```bash
cd /caminho/para/poker-grinders-edge

# Exemplo Windows:
# cd C:\Users\SeuNome\Documents\poker-grinders-edge

# Exemplo Mac/Linux:
# cd ~/Documents/poker-grinders-edge
```

**✋ PARE AQUI - Me responda: "Estou na pasta do projeto, próximo passo"**

---

## Passo 1.3: Verificar status do Git

```bash
git status
```

**Resultado esperado:**
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

**Se aparecer arquivos modificados**, me avise para resolvermos antes de continuar.

**✋ PARE AQUI - Me responda o output do `git status`**

---

## Passo 1.4: Buscar todas as branches do remoto

```bash
git fetch origin
```

**Resultado esperado:**
```
From github.com:Carlossouzaadv/poker-grinders-edge
 * [new branch]      claude/poker-mastery-rebrand-mvp-011CV5zjXfE4a22yhqY8NTX8 -> origin/claude/poker-mastery-rebrand-mvp-011CV5zjXfE4a22yhqY8NTX8
```

**✋ PARE AQUI - Me responda: "Fetch completo, próximo passo"**

---

## Passo 1.5: Ver lista de branches

```bash
git branch -a
```

**Resultado esperado:**
Você verá algo como:
```
* main
  remotes/origin/main
  remotes/origin/claude/poker-mastery-rebrand-mvp-011CV5zjXfE4a22yhqY8NTX8
```

**✋ PARE AQUI - Me responda: "Vejo a branch do Claude, próximo passo"**

---

## Passo 1.6: Fazer checkout da branch do Claude

```bash
git checkout claude/poker-mastery-rebrand-mvp-011CV5zjXfE4a22yhqY8NTX8
```

**Resultado esperado:**
```
Switched to branch 'claude/poker-mastery-rebrand-mvp-011CV5zjXfE4a22yhqY8NTX8'
Your branch is up to date with 'origin/claude/poker-mastery-rebrand-mvp-011CV5zjXfE4a22yhqY8NTX8'.
```

**✋ PARE AQUI - Me responda: "Checkout feito, próximo passo"**

---

## Passo 1.7: Puxar as últimas mudanças

```bash
git pull origin claude/poker-mastery-rebrand-mvp-011CV5zjXfE4a22yhqY8NTX8
```

**Resultado esperado:**
```
Already up to date.
```

Ou:
```
Updating abc1234..def5678
Fast-forward
 backend/src/modules/anonymization/... | 100 +++++++
 ...
```

**✋ PARE AQUI - Me responda: "Pull completo, próximo passo"**

---

## Passo 1.8: Verificar arquivos novos

```bash
ls -la backend/src/modules/anonymization
ls -la web/app/api/cron
cat Docs/ANONYMIZATION_SYSTEM.md | head -20
```

**Resultado esperado:**
Você deve ver:
- `backend/src/modules/anonymization/anonymization.service.ts`
- `backend/src/modules/anonymization/anonymization.controller.ts`
- `backend/src/modules/anonymization/anonymization.module.ts`
- `web/app/api/cron/anonymize-hands/route.ts`
- `web/vercel.json`
- `Docs/ANONYMIZATION_SYSTEM.md`

**✋ PARE AQUI - Me responda: "Arquivos novos verificados, próximo passo"**

---

# PARTE 2: MERGE COM MAIN BRANCH

## Passo 2.1: Voltar para branch main

```bash
git checkout main
```

**Resultado esperado:**
```
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
```

**✋ PARE AQUI - Me responda: "Estou no main, próximo passo"**

---

## Passo 2.2: Puxar últimas atualizações do main

```bash
git pull origin main
```

**Resultado esperado:**
```
Already up to date.
```

Ou se houver updates:
```
Updating abc1234..xyz9876
```

**✋ PARE AQUI - Me responda: "Main atualizado, próximo passo"**

---

## Passo 2.3: Fazer merge da branch do Claude no main

```bash
git merge claude/poker-mastery-rebrand-mvp-011CV5zjXfE4a22yhqY8NTX8
```

**Resultado esperado (sucesso):**
```
Updating abc1234..def5678
Fast-forward
 backend/src/modules/anonymization/... | 100 +++++++
 backend/prisma/schema.prisma          | 119 +++++++
 ...
 10 files changed, 1340 insertions(+)
```

**⚠️ SE APARECER CONFLITOS:**
```
CONFLICT (content): Merge conflict in backend/prisma/schema.prisma
Automatic merge failed; fix conflicts and then commit the result.
```

**Se tiver conflito, me avise IMEDIATAMENTE com o output completo.**

**✅ Se NÃO tiver conflito:**

**✋ PARE AQUI - Me responda: "Merge completo sem conflitos, próximo passo"**

---

## Passo 2.4: Verificar status após merge

```bash
git status
```

**Resultado esperado:**
```
On branch main
Your branch is ahead of 'origin/main' by 3 commits.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
```

**✋ PARE AQUI - Me responda: "Status ok, próximo passo"**

---

## Passo 2.5: Ver commits que serão enviados

```bash
git log --oneline -5
```

**Resultado esperado:**
Você verá algo como:
```
15cbb61 docs(readme): add comprehensive project overview
ec73887 feat(anonymization): complete AI training database system
d5c2e1e feat(database): add anonymized hands schema
...
```

**✋ PARE AQUI - Me responda: "Log ok, próximo passo"**

---

# PARTE 3: PREPARAR MIGRATIONS E SECRETS

## Passo 3.1: Instalar dependências do backend (caso necessário)

```bash
cd backend
npm install
```

**Aguarde instalação... pode demorar 1-2 minutos.**

**✋ PARE AQUI - Me responda: "Dependências instaladas, próximo passo"**

---

## Passo 3.2: Gerar secret para o CRON

```bash
# Windows (PowerShell):
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Mac/Linux:
openssl rand -base64 32

# Alternativa universal (Node.js):
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Copie o resultado** e guarde em local seguro.

**Exemplo de resultado:**
```
Xk7m9P2vQ8nL5cH3jR6wT4fY1gB0sD9eA8uI7oK5mN3pZ
```

**✋ PARE AQUI - Me responda: "Secret gerado: [cole aqui]"**

---

## Passo 3.3: Gerar secret para ADMIN

```bash
# Mesmo comando, mas execute novamente para gerar um secret diferente

# Mac/Linux:
openssl rand -base64 32

# Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Copie e guarde este também.**

**✋ PARE AQUI - Me responda: "Admin secret gerado: [cole aqui]"**

---

## Passo 3.4: Atualizar .env do backend

```bash
# Abra o arquivo backend/.env no VSCode
code backend/.env
```

**Adicione estas linhas no final:**
```bash
# Cron Jobs (cole os secrets que você gerou)
CRON_SECRET="cole-aqui-o-primeiro-secret-que-voce-gerou"
ADMIN_SECRET="cole-aqui-o-segundo-secret"
```

**Salve o arquivo (Ctrl+S ou Cmd+S).**

**✋ PARE AQUI - Me responda: ".env do backend atualizado, próximo passo"**

---

## Passo 3.5: Criar/atualizar .env.local do web

```bash
# Se não existe, crie:
cd ../web
cp .env.local.example .env.local

# Abra o arquivo
code .env.local
```

**Conteúdo do arquivo:**
```bash
# Backend API URL (local)
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Cron Secret (DEVE SER O MESMO DO BACKEND!)
CRON_SECRET="cole-aqui-o-PRIMEIRO-secret-igual-ao-backend"
```

**IMPORTANTE:** O `CRON_SECRET` deve ser **exatamente igual** ao que você colocou no backend.

**Salve o arquivo.**

**✋ PARE AQUI - Me responda: ".env.local do web criado, próximo passo"**

---

## Passo 3.6: Rodar migration do Prisma

```bash
cd ../backend
npx prisma migrate dev --name add-anonymization-tables
```

**Resultado esperado:**
```
Applying migration `20250115_add_anonymization_tables`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250115_add_anonymization_tables/
      └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

**⚠️ SE DER ERRO**, me mande o erro completo.

**✋ PARE AQUI - Me responda: "Migration aplicada com sucesso, próximo passo"**

---

## Passo 3.7: Gerar Prisma Client

```bash
npx prisma generate
```

**Resultado esperado:**
```
✔ Generated Prisma Client
```

**✋ PARE AQUI - Me responda: "Prisma Client gerado, próximo passo"**

---

## Passo 3.8: Testar build do backend

```bash
npm run build
```

**Aguarde o build... pode demorar 30-60 segundos.**

**Resultado esperado:**
```
Successfully compiled
```

**⚠️ SE DER ERRO DE BUILD**, me mande o erro completo com stack trace.

**✋ PARE AQUI - Me responda o resultado do build**

---

## Passo 3.9: Testar build do web

```bash
cd ../web
npm install
npm run build
```

**Aguarde o build... pode demorar 1-2 minutos.**

**Resultado esperado:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
...
```

**⚠️ SE DER ERRO**, me mande o erro completo.

**✋ PARE AQUI - Me responda: "Build do web ok, próximo passo"**

---

# PARTE 4: PUSH PARA PRODUÇÃO

## Passo 4.1: Voltar para a raiz e fazer push do main

```bash
cd ..
git status
```

**Verifique que está no branch main e tudo está committed.**

**✋ PARE AQUI - Me responda: "Estou pronto para push, próximo passo"**

---

## Passo 4.2: Push para origin main

```bash
git push origin main
```

**Resultado esperado:**
```
Enumerating objects: 50, done.
Counting objects: 100% (50/50), done.
Delta compression using up to 8 threads
Compressing objects: 100% (30/30), done.
Writing objects: 100% (35/35), 45.67 KiB | 5.08 MiB/s, done.
Total 35 (delta 20), reused 0 (delta 0)
To github.com:Carlossouzaadv/poker-grinders-edge.git
   abc1234..def5678  main -> main
```

**✋ PARE AQUI - Me responda: "Push completo, próximo passo"**

---

## Passo 4.3: Configurar Railway (Backend)

### 4.3.1: Acessar Railway Dashboard
1. Vá para: https://railway.app/dashboard
2. Selecione seu projeto `poker-grinders-edge-backend`

**✋ PARE AQUI - Me responda: "Estou no dashboard do Railway, próximo passo"**

---

### 4.3.2: Adicionar variáveis de ambiente

1. Clique em **"Variables"** no menu lateral
2. Adicione as seguintes variáveis:

```bash
CRON_SECRET=cole-aqui-o-secret-que-voce-gerou
ADMIN_SECRET=cole-aqui-o-admin-secret
```

3. Clique em **"Save"** ou **"Deploy"**

**✋ PARE AQUI - Me responda: "Variáveis adicionadas no Railway, próximo passo"**

---

### 4.3.3: Aguardar deploy do Railway

O Railway vai detectar as mudanças no GitHub e fazer o deploy automaticamente.

**Aguarde 2-3 minutos...**

**Verifique:**
- No Railway, veja se o status mudou para "Deployed" (verde)
- Copie a URL do backend (algo como: `https://poker-grinders-edge-backend.railway.app`)

**✋ PARE AQUI - Me responda: "Backend deployed, URL: [cole aqui]"**

---

## Passo 4.4: Configurar Vercel (Frontend)

### 4.4.1: Acessar Vercel Dashboard
1. Vá para: https://vercel.com/dashboard
2. Selecione seu projeto `poker-grinders-edge-web`

**✋ PARE AQUI - Me responda: "Estou no dashboard da Vercel, próximo passo"**

---

### 4.4.2: Atualizar variáveis de ambiente

1. Clique em **"Settings"**
2. Clique em **"Environment Variables"** no menu lateral
3. Adicione/atualize estas variáveis:

```bash
NEXT_PUBLIC_API_URL=cole-aqui-a-url-do-railway-backend
CRON_SECRET=cole-aqui-o-MESMO-secret-do-backend
```

**IMPORTANTE:** O `CRON_SECRET` deve ser exatamente igual ao do Railway.

4. Clique em **"Save"**

**✋ PARE AQUI - Me responda: "Variáveis adicionadas na Vercel, próximo passo"**

---

### 4.4.3: Forçar novo deploy na Vercel

1. Vá para a aba **"Deployments"**
2. Clique nos 3 pontinhos (...) do último deployment
3. Clique em **"Redeploy"**

Ou simplesmente espere o auto-deploy do GitHub push.

**Aguarde 1-2 minutos...**

**✋ PARE AQUI - Me responda: "Deploy da Vercel iniciado, próximo passo"**

---

# PARTE 5: VERIFICAÇÃO E TESTES

## Passo 5.1: Testar backend health

```bash
# Substitua pela URL real do seu Railway
curl https://seu-backend.railway.app/health
```

**Resultado esperado:**
```json
{"status":"ok"}
```

**✋ PARE AQUI - Me responda o resultado**

---

## Passo 5.2: Testar cron endpoint (health check)

```bash
# Substitua com:
# - Sua URL do Vercel
# - Seu CRON_SECRET real

curl -X POST https://seu-app.vercel.app/api/cron/anonymize-hands \
  -H "Authorization: Bearer seu-cron-secret-aqui"
```

**Resultado esperado:**
```json
{
  "status": "healthy",
  "backend": "connected",
  "cronSecret": "configured",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

**✋ PARE AQUI - Me responda o resultado**

---

## Passo 5.3: Verificar Cron na Vercel

1. No dashboard da Vercel, vá em **"Settings"** > **"Cron Jobs"**
2. Você deve ver:
   - **Path:** `/api/cron/anonymize-hands`
   - **Schedule:** `0 */2 * * *` (Every 2 hours)
   - **Status:** Enabled

**✋ PARE AQUI - Me responda: "Cron configurado e ativo na Vercel, próximo passo"**

---

## Passo 5.4: Verificar logs do Railway

1. No dashboard do Railway, clique em **"Logs"**
2. Verifique se não há erros de startup
3. Procure por:
   ```
   [Nest] Application successfully started
   ```

**✋ PARE AQUI - Me responda: "Backend rodando sem erros, próximo passo"**

---

## Passo 5.5: Verificar logs da Vercel

1. No dashboard da Vercel, clique em **"Logs"**
2. Verifique o último deployment
3. Procure por erros (se houver)

**✋ PARE AQUI - Me responda: "Frontend rodando sem erros, próximo passo"**

---

# ✅ CONCLUSÃO

## Status Final

Se você chegou até aqui com sucesso, parabéns! 🎉

**O que está funcionando:**
- ✅ Código atualizado no seu VSCode local
- ✅ Merge feito no branch main
- ✅ Migration do banco de dados aplicada
- ✅ Secrets gerados e configurados
- ✅ Backend deployed no Railway
- ✅ Frontend deployed na Vercel
- ✅ Cron job configurado (executa a cada 2h)

---

## Monitoramento

### Verificar se cron está rodando (após 2h do deploy):

```bash
# Vercel Logs
# Vá em: https://vercel.com/dashboard > seu-projeto > Logs
# Procure por: "[CRON] Starting anonymization job..."

# Railway Logs
# Vá em: https://railway.app/dashboard > seu-projeto > Logs
# Procure por: "Processing anonymization jobs via cron"
```

### Queries para verificar dados:

```sql
-- Ver jobs pendentes
SELECT * FROM anonymization_jobs WHERE status = 'PENDING';

-- Ver total de mãos anonimizadas
SELECT COUNT(*) FROM anonymized_hands;

-- Ver distribuição por site
SELECT site, COUNT(*) FROM anonymized_hands GROUP BY site;
```

---

## Próximos Testes (quando tiver dados)

### 1. Upload de Hand History

Faça upload de um hand history pela sua aplicação web.

**O que deve acontecer:**
1. HandHistorySession criado ✅
2. HandHistoryHands criados ✅
3. AnonymizationJob criado com status PENDING ✅

### 2. Aguardar Cron (max 2h)

O cron vai processar automaticamente.

**Verificar:**
```sql
-- Job deve mudar para COMPLETED
SELECT * FROM anonymization_jobs WHERE status = 'COMPLETED';

-- Mãos anonimizadas devem aparecer
SELECT * FROM anonymized_hands ORDER BY processed_at DESC LIMIT 10;
```

---

## Troubleshooting

Se algo der errado, consulte:
- `Docs/ANONYMIZATION_SYSTEM.md` - Seção Troubleshooting
- `Docs/TROUBLESHOOTING.md` - Problemas gerais

**Ou me chame que eu te ajudo!** 😊

---

## Comandos Úteis

```bash
# Ver status dos branches
git branch -a

# Ver commits recentes
git log --oneline -10

# Verificar diferenças
git diff main origin/main

# Rebuild backend
cd backend && npm run build

# Rebuild frontend
cd web && npm run build

# Test local
cd backend && npm run start:dev
cd web && npm run dev
```

---

**Última atualização:** Janeiro 2025
**Autor:** Claude + Carlos Souza

---

**Dúvidas?** Me chame a qualquer momento! 🚀
