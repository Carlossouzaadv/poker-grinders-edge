# Poker Grinder's Edge

Um aplicativo móvel completo para jogadores de poker que oferece gestão de bankroll, consultor GTO, análise de mãos e marketplace de coaches.

## 🎯 Objetivo

O Poker Grinder's Edge resolve 4 dores centrais dos jogadores de poker:

1. **Gestão de Bankroll** - Ferramenta simples para registrar e analisar sessões
2. **Estudo Técnico Aplicado** - Consultor GTO/ICM otimizado para celular
3. **Análise de Desempenho** - Laboratório de estudo com MTT Trainer gamificado
4. **Conexão com a Comunidade** - Marketplace seguro de coaches

## 🏗️ Arquitetura

### Frontend (Mobile)
- **Framework:** React Native com TypeScript
- **Navegação:** React Navigation
- **Estado:** Zustand
- **Estilização:** NativeWind (Tailwind CSS)

### Backend (API)
- **Framework:** NestJS com TypeScript
- **Banco de Dados:** PostgreSQL com Prisma ORM
- **Autenticação:** JWT

## 📱 Funcionalidades Principais

### Módulo 1: Gestor de Bankroll
- Registro de sessões (Cash Games e Torneios)
- Dashboard com estatísticas e gráficos
- Regras de bankroll configuráveis

### Módulo 2: Assistente de Sessão
- Consultor GTO/ICM visual e rápido
- Registro de mãos importantes
- Análise por screenshot/OCR

### Módulo 3: Laboratório de Estudo
- Analisador de mãos salvas
- MTT Trainer com gamificação
- Sistema de ranking e pontuação

### Módulo 4: Marketplace de Coaches
- Busca de coaches por especialidade
- Sistema de avaliações
- Pagamentos integrados e seguros

## 🚀 Executando o Projeto

### Pré-requisitos
- Node.js 18+
- React Native CLI
- Android Studio / Xcode

### Mobile (React Native)
```bash
cd mobile
npm install
npx react-native run-android # ou run-ios
```

### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

## 📋 Estrutura do Projeto

```
poker-grinders-edge/
├── mobile/                 # App React Native
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── screens/        # Telas principais
│   │   ├── navigation/     # Configuração de rotas
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # APIs e serviços
│   │   └── types/          # Tipos TypeScript
├── backend/                # API NestJS
│   ├── src/
│   │   ├── modules/        # Módulos funcionais
│   │   ├── common/         # Código compartilhado
│   │   └── database/       # Configuração do banco
└── shared/                 # Tipos compartilhados
```

## 💰 Modelo de Monetização

- **Versão Gratuita:** Gestão básica de bankroll (20 sessões)
- **Versão Premium:** R$ 29,90/mês - Funcionalidades completas
- **Marketplace:** 15% de comissão nas transações de coaching

## 🧪 Testes

Seguimos práticas de TDD (Test-Driven Development):

```bash
# Backend
npm run test              # Testes unitários
npm run test:e2e         # Testes de integração

# Mobile
npm run test             # Testes unitários
```

## 📝 Commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(bankroll): add session tracking for tournaments
fix(auth): correct password hashing bug
docs(readme): update project setup instructions
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feat/nova-feature`)
3. Commit suas mudanças seguindo o padrão Conventional Commits
4. Push para a branch (`git push origin feat/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para a comunidade de poker brasileira**