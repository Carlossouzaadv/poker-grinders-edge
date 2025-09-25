# CLAUDE.md - Poker Grinder's Edge

Este documento serve como guia de desenvolvimento para a IA Claude trabalhar no projeto Poker Grinder's Edge.

## Visão Geral do Projeto

O **Poker Grinder's Edge** é um aplicativo móvel completo para jogadores de poker que resolve 4 dores centrais:

1. **Gestão de Bankroll** - Ferramenta para registrar e analisar sessões
2. **Estudo Técnico Aplicado** - Consultor GTO/ICM otimizado para celular
3. **Análise de Desempenho** - Laboratório de estudo com MTT Trainer gamificado
4. **Conexão com a Comunidade** - Marketplace seguro de coaches

## Arquitetura

```
poker-grinders-edge/
├── mobile/                 # React Native + TypeScript
├── backend/               # NestJS + TypeScript + PostgreSQL + Prisma
└── shared/               # Tipos compartilhados
```

## Tech Stack

- **Frontend:** React Native + TypeScript + Zustand + React Navigation + NativeWind
- **Backend:** NestJS + TypeScript + PostgreSQL + Prisma + JWT
- **Serviços:** Google Cloud Vision (OCR) + Stripe (pagamentos)

## Práticas de Desenvolvimento

### Código Limpo
- Nomes significativos e autoexplicativos
- Funções pequenas com responsabilidade única
- Princípio DRY (Don't Repeat Yourself)
- Comentários apenas para explicar "porquê", não "o quê"

### Commits
Seguir padrão Conventional Commits:
```
feat(bankroll): add session tracking for tournaments
fix(auth): correct password hashing bug
docs(readme): update project setup instructions
```

### Testes
- **TDD obrigatório** para lógica de negócio
- **Backend:** Jest para testes unitários e e2e
- **Frontend:** Testes para componentes complexos

## Comandos Úteis

### Projeto Completo
```bash
npm run test              # Roda todos os testes
npm run lint             # Verifica código
npm run build            # Build completo
```

### Mobile
```bash
cd mobile
npm install
npx react-native run-android
```

### Backend
```bash
cd backend
npm install
npm run start:dev
```

## Estado Atual

✅ **Concluído:**
- Configuração base completa
- Frontend mobile básico funcionando
- Backend API com autenticação e sessões

🚧 **Em desenvolvimento:**
- Módulo Gestor de Bankroll completo
- Integração real com API backend

## Diretrizes para Claude

1. **Sempre use TodoWrite** para planejar e acompanhar tarefas
2. **Siga as convenções** do código existente
3. **Teste primeiro** - implemente testes antes da funcionalidade
4. **Mantenha consistência** entre frontend e backend
5. **Documente decisões importantes** no código quando necessário