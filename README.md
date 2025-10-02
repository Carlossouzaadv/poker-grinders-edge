# Poker Grinder's Edge

## Atualização v2
Um ecossistema integrado para jogadores e times de poker, composto por um aplicativo móvel (B2C) e uma plataforma de gestão web (B2B SaaS).

## 🎯 Objetivo

O ecossistema Poker Grinder's Edge resolve as dores de duas pontas do mercado:

1.  **Para o Jogador:** Oferece um app completo com Gestão de Bankroll, Consultor GTO, Laboratório de Estudo e Marketplace de Coaches.
2.  **Para Times/Coaches:** Oferece uma plataforma web ("Team Pro") para gestão de atletas, análise de dados em massa e otimização do coaching.

## 🏗️ Arquitetura

### Frontend (Mobile App)
- **Framework:** React Native com TypeScript

### Frontend (Plataforma Web)
- **Framework:** Next.js (React) com TypeScript

### Backend (API Unificada)
- **Framework:** NestJS com TypeScript
- **Banco de Dados:** PostgreSQL com Prisma ORM

## 🚀 Status de Desenvolvimento: Fase 0 - Beta

Atualmente, estamos focados no desenvolvimento da **Fase 0**, uma isca de leads estratégica.

* **Funcionalidade Foco:** Hand Replayer (Versão Beta Web).
* **Objetivo:** Atrair usuários, validar o design e construir uma lista de espera para o lançamento do ecossistema completo.

(O restante do README.md, como estrutura de pastas e guias de contribuição, permanece o mesmo)

## V1:
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

## 📱 Status de Desenvolvimento

### ✅ Concluído

#### Configuração Base
- [x] Projeto React Native com TypeScript configurado
- [x] Projeto NestJS backend com TypeScript configurado
- [x] NativeWind (Tailwind CSS) para estilização
- [x] Repositório Git inicializado com Conventional Commits
- [x] Estrutura de pastas organizada e modular

#### Frontend Mobile
- [x] React Navigation configurado (Stack + Bottom Tabs)
- [x] Zustand stores para gerenciamento de estado
- [x] Tela de Login com validação básica
- [x] Dashboard principal com estatísticas mockadas
- [x] Tela de Sessões com listagem
- [x] Tipos TypeScript para toda aplicação
- [x] Tema de cores personalizado para poker

#### Backend API
- [x] Módulo de autenticação (/auth) com endpoints
- [x] Módulo de sessões (/sessions) com CRUD completo
- [x] DTOs com validação usando class-validator
- [x] Estrutura modular seguindo padrões NestJS
- [x] Endpoints básicos funcionais
- [x] Interfaces TypeScript para Session
- [x] Tipagem completa corrigida
- [x] Backend compila sem erros

#### Configuração de Ambiente
- [x] Guia de configuração criado (SETUP_GUIDE.md)
- [x] Problemas de ambiente identificados
- [ ] Android Studio + SDK configurado
- [ ] Java JDK 17+ instalado
- [ ] Emulador Android configurado

### 🚧 Em Desenvolvimento

#### Módulo 1: Gestor de Bankroll
- [ ] Tela de Nova Sessão (formulário completo)
- [ ] Integração real com API backend
- [ ] Gráficos e visualizações de dados
- [ ] Filtros avançados para análise
- [ ] Regras de bankroll configuráveis

### 📋 Planejado

#### Módulo 2: Assistente de Sessão
- [ ] Consultor GTO/ICM visual e rápido
- [ ] Registro de mãos importantes
- [ ] Análise por screenshot/OCR
- [ ] Integração com ranges GTO existentes

#### Módulo 3: Laboratório de Estudo
- [ ] Analisador de mãos salvas
- [ ] MTT Trainer com gamificação
- [ ] Sistema de ranking e pontuação
- [ ] Leaderboards e progressão

#### Módulo 4: Marketplace de Coaches
- [ ] Sistema de busca de coaches
- [ ] Perfis de coaches com avaliações
- [ ] Sistema de pagamentos integrado
- [ ] Chat/comunicação entre coach e aluno

#### Infraestrutura
- [ ] Banco PostgreSQL + Prisma ORM
- [ ] Autenticação JWT real
- [ ] Sistema de upload de imagens
- [ ] Deployment em produção
- [ ] Testes unitários e de integração

## 🚀 Executando o Projeto

### Pré-requisitos
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **React Native CLI** ([Setup Guide](https://reactnative.dev/docs/environment-setup))
- **Android Studio** (para Android) ou **Xcode** (para iOS)

### Configuração Inicial

1. **Clone o repositório**:
   ```bash
   git clone <repository-url>
   cd poker-grinders-edge
   ```

2. **Configure o banco de dados PostgreSQL**:
   ```bash
   # Crie um banco de dados
   createdb poker_grinders_edge

   # Configure a connection string no .env do backend
   # DATABASE_URL="postgresql://user:password@localhost:5432/poker_grinders_edge"
   ```

3. **Configure variáveis de ambiente**:
   ```bash
   # Backend (.env)
   cd backend
   cp .env.example .env
   # Edite .env com suas configurações (DATABASE_URL, JWT_SECRET, etc)
   ```

### Backend (NestJS)

```bash
cd backend

# Instalar dependências
npm install

# Executar migrations do Prisma
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# Iniciar servidor em modo desenvolvimento (hot-reload)
npm run start:dev

# Servidor rodará em http://localhost:3000
```

**Comandos úteis do backend**:
```bash
npm run build              # Build para produção
npm run test               # Rodar testes unitários
npm run test:e2e           # Rodar testes e2e
npx prisma studio          # Abrir interface visual do banco
```

### Mobile (React Native)

```bash
cd mobile

# Instalar dependências
npm install

# iOS (apenas em macOS)
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android

# Iniciar Metro Bundler separadamente
npm start
```

**Troubleshooting React Native**:
- Limpar cache: `npx react-native start --reset-cache`
- Rebuild Android: `cd android && ./gradlew clean && cd ..`
- Ver logs: `npx react-native log-android` ou `npx react-native log-ios`

### Web (Next.js)

```bash
cd web

# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm run start
```

## 📋 Estrutura do Projeto

```
poker-grinders-edge/
├── mobile/                 # App React Native (B2C)
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── screens/        # Telas principais
│   │   ├── navigation/     # Configuração de rotas
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # APIs e serviços
│   │   └── types/          # Tipos TypeScript
│
├── web/                    # Plataforma Web Next.js (B2B)
│   ├── app/                # App Router (Next.js 14+)
│   ├── components/         # Componentes React
│   └── lib/                # Utilidades e helpers
│
├── backend/                # API NestJS (compartilhada)
│   ├── src/
│   │   ├── modules/        # Módulos funcionais (auth, sessions, hand-history)
│   │   ├── common/         # Código compartilhado (guards, decorators)
│   │   ├── database/       # Prisma Service e configuração
│   │   └── main.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Schema do banco
│   │   └── migrations/     # Migrations versionadas
│   └── test/               # Testes e2e
│
├── shared/                 # Tipos TypeScript compartilhados
│
├── ARCHITECTURE.md         # 📘 Documentação da arquitetura
├── CONTRIBUTING.md         # 📘 Guia de contribuição
├── CLAUDE.md               # Diretrizes para IA Claude
└── README.md               # Este arquivo
```

📘 **Para entender a arquitetura completa, leia [ARCHITECTURE.md](./ARCHITECTURE.md)**

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

Adoramos contribuições da comunidade! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feat/nova-feature`)
3. Commit suas mudanças seguindo o padrão Conventional Commits
4. Push para a branch (`git push origin feat/nova-feature`)
5. Abra um Pull Request

📘 **Leia o guia completo de contribuição: [CONTRIBUTING.md](./CONTRIBUTING.md)**

## 📚 Documentação

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura técnica, padrões de design e fluxo de dados
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guia para novos desenvolvedores
- **[CLAUDE.md](./CLAUDE.md)** - Diretrizes para desenvolvimento assistido por IA
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Guia detalhado de configuração de ambiente

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para a comunidade de poker brasileira**