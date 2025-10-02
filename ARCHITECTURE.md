# Arquitetura do Poker Grinder's Edge

## Visão Geral

O **Poker Grinder's Edge** é um ecossistema integrado composto por aplicativo móvel (B2C) e plataforma web (B2B SaaS) para jogadores e times de poker. Este documento descreve a arquitetura técnica, padrões de design e fluxo de dados do sistema.

## Stack Tecnológica

### Frontend Mobile (React Native)
- **Framework**: React Native com TypeScript
- **Navegação**: React Navigation (Stack + Bottom Tabs)
- **Estado Global**: Zustand (state management leve e performático)
- **Estilização**: NativeWind (Tailwind CSS para React Native)
- **Plataformas**: iOS e Android

### Frontend Web (Next.js)
- **Framework**: Next.js 14+ com TypeScript
- **Rendering**: Server-Side Rendering (SSR) + Static Site Generation (SSG)
- **Estado**: React Context + Zustand
- **Estilização**: Tailwind CSS
- **Plataforma**: Navegadores modernos

### Backend (NestJS)
- **Framework**: NestJS com TypeScript
- **Banco de Dados**: PostgreSQL 14+
- **ORM**: Prisma ORM
- **Autenticação**: JWT (Access + Refresh Tokens)
- **Validação**: class-validator + class-transformer
- **Testes**: Jest (unitários e e2e)

## Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAMADA DE CLIENTE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Mobile App      │              │  Web Platform    │         │
│  │  (React Native)  │              │  (Next.js)       │         │
│  │                  │              │                  │         │
│  │  - Bankroll      │              │  - Team Mgmt     │         │
│  │  - GTO Helper    │              │  - Analytics     │         │
│  │  - Study Lab     │              │  - Coach Tools   │         │
│  │  - Marketplace   │              │  - Bulk Data     │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
│           │                                 │                   │
└───────────┼─────────────────────────────────┼───────────────────┘
            │                                 │
            │        ┌────────────────────────┘
            │        │
            ▼        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DE API (Backend)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    NestJS REST API                         │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                            │ │
│  │  Auth Module     │  Sessions Module  │  Hand History     │ │
│  │  - Register      │  - CRUD           │  - Upload         │ │
│  │  - Login         │  - Analytics      │  - Parse          │ │
│  │  - JWT Tokens    │  - Stats          │  - Analyze        │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE DADOS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database (Prisma ORM)            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Users  │  Sessions  │  HandHistory  │  RefreshTokens   │  │
│  │  Teams  │  Coaches   │  Subscriptions │  Payments       │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Estrutura de Diretórios

### Backend
```
backend/
├── src/
│   ├── modules/                    # Módulos funcionais (feature modules)
│   │   ├── auth/                   # Autenticação e autorização
│   │   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── strategies/         # Passport strategies (JWT)
│   │   │   ├── auth.controller.ts  # Endpoints REST
│   │   │   ├── auth.service.ts     # Lógica de negócio
│   │   │   └── auth.module.ts      # Configuração do módulo
│   │   │
│   │   ├── sessions/               # Gestão de sessões de poker
│   │   │   ├── dto/
│   │   │   ├── interfaces/
│   │   │   ├── sessions.controller.ts
│   │   │   ├── sessions.service.ts
│   │   │   └── sessions.module.ts
│   │   │
│   │   └── hand-history-sessions/  # Análise de Hand History
│   │       ├── dto/
│   │       ├── hand-history-sessions.controller.ts
│   │       ├── hand-history-sessions.service.ts
│   │       └── hand-history-sessions.module.ts
│   │
│   ├── common/                     # Código compartilhado
│   │   ├── decorators/             # Custom decorators (@User, @RequirePlan)
│   │   ├── guards/                 # Auth guards (JWT, Plan-based)
│   │   ├── filters/                # Exception filters
│   │   ├── interceptors/           # Request/Response interceptors
│   │   └── pipes/                  # Validation pipes
│   │
│   ├── database/                   # Configuração do banco
│   │   ├── prisma.service.ts       # Serviço centralizado do Prisma
│   │   └── database.module.ts      # Módulo do banco
│   │
│   ├── app.module.ts               # Módulo raiz da aplicação
│   └── main.ts                     # Entry point (bootstrap)
│
├── prisma/
│   ├── schema.prisma               # Schema do banco de dados
│   └── migrations/                 # Histórico de migrations
│
└── test/                           # Testes e2e
```

### Mobile
```
mobile/
├── src/
│   ├── screens/                    # Telas principais
│   │   ├── auth/                   # Login, Register
│   │   ├── bankroll/               # Dashboard, Sessions
│   │   ├── study/                  # Hand Analyzer, Trainer
│   │   └── marketplace/            # Coach Marketplace
│   │
│   ├── components/                 # Componentes reutilizáveis
│   │   ├── ui/                     # Botões, Inputs, Cards
│   │   └── shared/                 # Header, Footer, Modals
│   │
│   ├── navigation/                 # Configuração de rotas
│   │   ├── AppNavigator.tsx        # Navigator principal
│   │   └── AuthNavigator.tsx       # Rotas de autenticação
│   │
│   ├── store/                      # Zustand stores
│   │   ├── authStore.ts            # Estado de autenticação
│   │   ├── sessionStore.ts         # Estado de sessões
│   │   └── userStore.ts            # Dados do usuário
│   │
│   ├── services/                   # Serviços e APIs
│   │   ├── api.ts                  # Cliente HTTP (axios)
│   │   ├── authService.ts          # Chamadas de autenticação
│   │   └── sessionService.ts       # Chamadas de sessões
│   │
│   └── types/                      # Tipos TypeScript compartilhados
│       ├── session.ts
│       ├── user.ts
│       └── api.ts
```

## Padrões de Design Implementados

### 1. Strategy Pattern (Hand History Parsers)

Implementado para parsing de Hand History de diferentes sites de poker.

**Interface**: `IPokerSiteParser`

```typescript
export interface IPokerSiteParser {
  parse(handText: string): ParseResult;
  detectGameContext(headerLine: string): GameContext;
  validateFormat(handText: string): boolean;
  getSiteName(): string;
}
```

**Implementações**:
- `PokerStarsParser`: Parser para PokerStars
- `GGPokerParser`: Parser para GGPoker
- `PartyPokerParser`: Parser para PartyPoker

**Factory Method**: `ParserFactory.createParser(siteName)`

**Benefícios**:
- ✅ Separação de responsabilidades (cada parser é independente)
- ✅ Fácil adicionar novos sites sem modificar código existente
- ✅ Testabilidade (cada parser pode ser testado isoladamente)
- ✅ Type safety (interface formal garante contrato)

### 2. Repository Pattern (Prisma Services)

Toda interação com o banco de dados é feita através do `PrismaService`, centralizando:
- Conexão/desconexão automática
- Gerenciamento de transações
- Shutdown hooks

**Exemplo**:
```typescript
@Injectable()
export class HandHistorySessionsService {
  constructor(private prisma: PrismaService) {}

  async uploadHandHistory(dto, userId) {
    // Usa transação para garantir atomicidade
    return await this.prisma.$transaction(async (tx) => {
      const session = await tx.handHistorySession.create({...});
      await tx.handHistoryHand.createMany({...});
      return session;
    });
  }
}
```

### 3. Dependency Injection (NestJS)

Todo o backend usa DI do NestJS para:
- Inversão de controle
- Facilitar testes (mocking)
- Gerenciamento automático de ciclo de vida

**Exemplo**:
```typescript
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,      // Injetado automaticamente
    private jwtService: JwtService,     // Injetado automaticamente
  ) {}
}
```

### 4. DTO Pattern (Data Transfer Objects)

Validação e transformação de dados usando DTOs com decorators:

```typescript
export class CreateSessionDto {
  @IsNotEmpty()
  @IsEnum(GameType)
  gameType: GameType;

  @IsNumber()
  @Min(0)
  buyIn: number;

  @IsNumber()
  result: number;
}
```

### 5. Guard Pattern (Autorização)

Guards do NestJS para proteção de rotas:

**JwtAuthGuard**: Valida JWT e injeta usuário
```typescript
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  @Post()
  create(@User() user, @Body() dto) {
    return this.sessionsService.create(dto, user.id);
  }
}
```

**PlanGuard**: Valida plano do usuário (FREE/PREMIUM)
```typescript
@Get('advanced-analytics')
@UseGuards(JwtAuthGuard, PlanGuard)
@RequirePlan('PREMIUM')
advancedAnalytics(@User() user) {
  // Apenas usuários PREMIUM
}
```

## Fluxo de Dados

### Autenticação (Login)

```
1. User → Mobile App: Digita email/senha
2. Mobile App → Backend: POST /auth/login { email, password }
3. Backend → Database: SELECT * FROM users WHERE email = ?
4. Backend: Valida senha com bcrypt.compare()
5. Backend: Gera JWT tokens (access + refresh)
6. Backend → Database: INSERT refresh_token
7. Backend → Mobile App: { access_token, refresh_token, user }
8. Mobile App: Armazena tokens no Zustand + SecureStore
9. Mobile App: Redireciona para Dashboard
```

### Upload de Hand History

```
1. User → Mobile App: Seleciona arquivo .txt de Hand History
2. Mobile App → Backend: POST /hand-history/upload
   { rawHandHistory, name?, siteFormat? }
3. Backend: Valida formato e detecta site
4. Backend: Chama HandParser.parseMultipleHands()
5. HandParser: Detecta site → Factory → PokerStarsParser.parse()
6. Parser: Divide texto em mãos individuais
7. Parser: Parseia cada mão (header, players, actions, showdown)
8. Backend → Database: BEGIN TRANSACTION
   - INSERT hand_history_session
   - INSERT hand_history_hand (múltiplas)
   COMMIT
9. Backend → Mobile App: { sessionId, totalHands, firstHand }
10. Mobile App: Exibe primeira mão no Hand Replayer
```

### Navegação entre Mãos

```
1. User → Mobile App: Clica "Próxima Mão" (índice 5 → 6)
2. Mobile App → Backend: GET /hand-history/session/:id/hand/6
3. Backend → Database: SELECT * FROM hand_history_hand
   WHERE sessionId = ? AND handIndex = 6
4. Backend: Valida ownership (userId)
5. Backend → Mobile App: { handIndex: 6, parsedData: {...} }
6. Mobile App: Renderiza nova mão no Replayer
```

## Segurança

### Autenticação e Autorização

1. **JWT Tokens**:
   - Access Token: Curta duração (env: `JWT_EXPIRES_IN`)
   - Refresh Token: 30 dias, armazenado no banco
   - Rotação de tokens (refresh token é invalidado ao renovar)

2. **Password Hashing**:
   - bcrypt com 12 salt rounds
   - Nunca armazenar senhas em plain text
   - Sanitização de User (remove password antes de retornar)

3. **Validação de Ownership**:
   - Todos os endpoints validam que o usuário tem acesso ao recurso
   - Exemplo: Sessão só pode ser acessada pelo owner

4. **Guards e Decorators**:
   - `@UseGuards(JwtAuthGuard)`: Requer autenticação
   - `@RequirePlan('PREMIUM')`: Requer plano específico
   - `@User()`: Injeta usuário autenticado

### Validação de Dados

1. **DTOs com class-validator**:
   - Validação automática de tipos, formatos e regras de negócio
   - Retorna erros claros para o cliente

2. **Sanitização**:
   - Remoção de campos sensíveis antes de retornar ao cliente
   - Validação de inputs para prevenir SQL Injection (Prisma protege automaticamente)

## Performance

### Backend

1. **Transações Atômicas**:
   - Uso de `$transaction` para operações múltiplas
   - Garante consistência de dados

2. **Queries Otimizadas**:
   - Seleção apenas de campos necessários (`select`)
   - Paginação em listagens grandes
   - Índices no banco de dados (definidos no schema.prisma)

3. **Caching** (Planejado):
   - Redis para sessões e dados frequentemente acessados
   - Cache de resultados de parsing

### Frontend Mobile

1. **State Management Leve**:
   - Zustand (menor footprint que Redux)
   - Estado local para UI efêmera

2. **Lazy Loading**:
   - Componentes carregados sob demanda
   - Navegação otimizada com React Navigation

3. **Otimizações React Native**:
   - FlatList para listas longas (virtualização)
   - Memoização de componentes pesados

## Testes

### Backend (NestJS + Jest)

1. **Testes Unitários**:
   - Services isolados (mock de Prisma)
   - Coverage mínimo: 80%

2. **Testes E2E**:
   - Endpoints completos (request → response)
   - Banco de dados de teste (SQLite/PostgreSQL)

3. **Exemplo**:
```typescript
describe('AuthService', () => {
  it('should register a new user', async () => {
    const dto = { email: 'test@test.com', password: '123' };
    const result = await authService.register(dto);
    expect(result.user.email).toBe('test@test.com');
    expect(result.access_token).toBeDefined();
  });
});
```

### Mobile (Jest + React Native Testing Library)

1. **Testes de Componentes**:
   - Rendering correto
   - Interações do usuário

2. **Testes de Integração**:
   - Navegação entre telas
   - Integração com stores

## Deployment

### Backend (Produção)

- **Plataforma**: Railway / Heroku / AWS
- **Banco de Dados**: PostgreSQL gerenciado
- **Variáveis de Ambiente**:
  ```env
  DATABASE_URL=postgresql://...
  JWT_SECRET=...
  JWT_REFRESH_SECRET=...
  JWT_EXPIRES_IN=7d
  JWT_REFRESH_EXPIRES_IN=30d
  ```

### Mobile (Produção)

- **iOS**: App Store (TestFlight para beta)
- **Android**: Google Play Store
- **CI/CD**: GitHub Actions / Fastlane

## Próximos Passos

### Fase Atual: Hand Replayer Beta (Fase 0)
- [x] Parser de Hand History (Strategy Pattern)
- [x] Backend API (upload, listagem, navegação)
- [ ] Frontend Web (Hand Replayer visual)
- [ ] Integração completa

### Fase 1: MVP Mobile
- [ ] Módulo de Bankroll Management
- [ ] Dashboard com estatísticas
- [ ] Autenticação completa

### Fase 2: Funcionalidades Avançadas
- [ ] GTO Consultant
- [ ] MTT Trainer gamificado
- [ ] Marketplace de Coaches

### Fase 3: Plataforma B2B (Team Pro)
- [ ] Dashboard Web para times
- [ ] Análise de dados em massa
- [ ] Gestão de atletas

## Referências

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Strategy Pattern - Refactoring Guru](https://refactoring.guru/design-patterns/strategy)

---

**Última atualização**: Outubro 2025
**Versão**: 1.0.0
