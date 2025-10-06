# Troubleshooting - Layout Redesign

## ⚠️ Problema: Mudanças não aparecem após reiniciar servidor

### 🔍 Diagnóstico

**Sintoma**: Layout antigo ainda aparece mesmo após reiniciar `npm run dev`

**Causas Possíveis**:

1. **❌ Porta incorreta** - Servidor rodando em porta diferente
2. **❌ Cache do Next.js** - Build cache não limpo
3. **❌ Cache do Browser** - Browser servindo versão antiga
4. **❌ Hot Reload não funciona** - Turbopack não detecta mudanças

---

## ✅ Soluções (Ordem de Prioridade)

### 1. **VERIFICAR PORTA DO SERVIDOR** ⭐ (Mais Comum)

**Problema**: Servidor rodando na porta **3002** mas você está acessando **3000**

```bash
# Verificar qual porta está sendo usada
cd web
npm run dev

# Saída mostrará:
# ⚠ Port 3000 is in use by process 29220, using available port 3002
# - Local:        http://localhost:3002  <-- USAR ESTA URL
```

**Solução**:
```
❌ NÃO ACESSAR: http://localhost:3000
✅ ACESSAR: http://localhost:3002
```

**Como Verificar**:
- Olhar no terminal a mensagem `- Local: http://localhost:XXXX`
- Acessar a porta correta no browser

---

### 2. **LIMPAR CACHE DO NEXT.JS**

```bash
cd web

# Parar servidor (Ctrl+C)

# Limpar cache
rm -rf .next

# Reiniciar
npm run dev
```

**Quando Usar**: Se mudanças de código não aparecem mesmo na porta correta

---

### 3. **HARD REFRESH NO BROWSER**

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Ou**:
- Abrir DevTools (F12)
- Clicar com botão direito no botão Refresh
- Selecionar "Empty Cache and Hard Reload"

**Quando Usar**: Se o layout antigo persiste mesmo com servidor correto

---

### 4. **VERIFICAR SE ARQUIVO FOI SALVO**

```bash
# Verificar última modificação do arquivo
ls -l src/components/sections/HeroSection.tsx

# Saída deve mostrar timestamp recente:
# -rw-r--r-- 1 user group 15234 Oct  3 22:52 HeroSection.tsx
```

**Se timestamp está antigo**: Arquivo não foi salvo pelo editor

**Solução**:
- Salvar manualmente (Ctrl+S)
- Verificar se editor tem auto-save habilitado

---

### 5. **REINICIAR SERVIDOR COMPLETAMENTE**

```bash
cd web

# Parar TODOS os processos Node (Windows)
taskkill /F /IM node.exe

# Ou Linux/Mac
pkill node

# Limpar tudo
rm -rf .next
rm -rf node_modules/.cache

# Reinstalar (só se necessário)
# npm install

# Reiniciar
npm run dev
```

**Quando Usar**: Última tentativa se nada mais funcionar

---

## 🧪 Teste de Validação

### Como Confirmar que Layout Novo Está Ativo

**1. Abrir a página no browser**
```
http://localhost:3002/hand-analyzer
```

**2. Inspecionar elemento (F12)**
```html
<!-- Procurar por este comentário no código: -->
<!-- Replayer Interface - REDESIGNED: Mesa dominante, controles compactos */}
```

**3. Verificar estrutura visual**

**Layout ANTIGO** (não deve aparecer):
```
┌────────────────────────────┐
│  Mesa │ Action Log lateral │
└────────────────────────────┘
```

**Layout NOVO** (deve aparecer):
```
┌──────────────────────────────┐
│  🎬 Banner Ação (superior)   │
├──────────────────────────────┤
│  Mesa grande │ Controles →   │
└──────────────────────────────┘
```

**4. Buscar elementos únicos do novo layout**

No DevTools, procurar por:
```css
/* Banner de ação */
.bg-gradient-to-r.from-blue-900\/60.to-purple-900\/60

/* Layout responsivo */
.flex.flex-col.lg\:flex-row

/* Mesa dominante */
.lg\:flex-1.lg\:max-w-5xl
```

Se encontrar esses elementos = ✅ **Novo layout ativo**

---

## 📝 Checklist Completo

Antes de reportar problema, verificar:

- [ ] ✅ Servidor rodando na porta correta (verificar terminal)
- [ ] ✅ Acessando URL correta no browser
- [ ] ✅ Cache do Next.js limpo (`rm -rf .next`)
- [ ] ✅ Hard refresh no browser (Ctrl+Shift+R)
- [ ] ✅ Arquivo HeroSection.tsx foi salvo
- [ ] ✅ Timestamp do arquivo é recente
- [ ] ✅ DevTools mostra estrutura HTML nova

---

## 🐛 Problemas Conhecidos

### Turbopack vs Webpack

**Aviso no console**:
```
⚠ Webpack is configured while Turbopack is not
```

**Impacto**: Hot reload pode ser mais lento

**Solução Temporária**: Ignorar (não afeta funcionalidade)

**Solução Permanente**: Configurar Turbopack no `next.config.js`

---

### Porta em Uso

**Erro**:
```
⚠ Port 3000 is in use by process XXXXX, using available port 3002
```

**Solução 1** (Usar porta alternativa):
```
Acessar http://localhost:3002
```

**Solução 2** (Liberar porta 3000):
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## 🚀 Verificação Final

### Comando Rápido de Validação

```bash
cd web

# Limpar tudo
rm -rf .next

# Verificar arquivo modificado
grep -n "REDESIGNED: Mesa dominante" src/components/sections/HeroSection.tsx

# Se retornar linha 320, arquivo está correto!

# Reiniciar
npm run dev

# Aguardar mensagem:
# ✓ Ready in X.Xs
# - Local: http://localhost:XXXX

# Abrir URL no browser
# Hard refresh (Ctrl+Shift+R)
```

**Resultado Esperado**:
- ✅ Banner de ação no topo
- ✅ Mesa grande centralizada
- ✅ Controles compactos na lateral
- ✅ **SEM** Action Log

---

## 📞 Se Problema Persistir

**Informações para Debug**:

1. **Porta do servidor**: (verificar no terminal)
2. **URL acessada**: (copiar da barra de endereço)
3. **Timestamp do arquivo**: `ls -l src/components/sections/HeroSection.tsx`
4. **Screenshot do DevTools** mostrando HTML

**Reportar Issue**:
- GitHub com tag `layout-bug`
- Incluir informações acima
- Anexar screenshot

---

## ✅ Sucesso - Confirmar Layout Novo

**Quando ver**:
1. 🎬 Banner azul/roxo no topo com ação atual
2. Mesa poker ocupando ~80% da largura
3. Controles compactos (16rem) na lateral direita
4. **ZERO** action log histórico

**= Layout redesenhado funcionando!** 🎉

---

**Última Atualização**: 2025-10-03
**Versão**: 1.0.0
