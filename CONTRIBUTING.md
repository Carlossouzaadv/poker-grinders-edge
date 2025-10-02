# Guia de Contribuição

Obrigado por considerar contribuir com o **Poker Grinder's Edge**! Este guia ajudará você a configurar o ambiente de desenvolvimento e entender nossos padrões de código.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Primeiros Passos](#primeiros-passos)
- [Configurando o Ambiente](#configurando-o-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Workflow Git](#workflow-git)
- [Testes](#testes)
- [Documentação](#documentação)
- [Pull Requests](#pull-requests)

## Código de Conduta

Ao contribuir com este projeto, você concorda em manter um ambiente respeitoso e colaborativo. Esperamos:

- ✅ Respeito mútuo entre todos os colaboradores
- ✅ Feedback construtivo e profissional
- ✅ Foco na qualidade técnica e boas práticas
- ❌ Não toleramos discriminação, assédio ou comportamento ofensivo

## Primeiros Passos

### O que você pode fazer?

- 🐛 **Reportar bugs**: Abra uma issue descrevendo o problema
- ✨ **Sugerir features**: Proponha novas funcionalidades
- 📝 **Melhorar documentação**: Corrija erros ou adicione exemplos
- 🔧 **Resolver issues**: Escolha uma issue aberta e trabalhe nela
- 🧪 **Adicionar testes**: Aumente a cobertura de testes

### Escolhendo uma Issue

1. Veja as [issues abertas](../../issues)
2. Procure por labels como `good first issue` ou `help wanted`
3. Comente na issue que você quer trabalhar nela
4. Aguarde confirmação de um mantenedor antes de começar

## Configurando o Ambiente

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **VS Code** (recomendado) com extensões:
  - ESLint
  - Prettier
  - Prisma

### Clone e Configuração

```bash
# 1. Fork o repositório no GitHub

# 2. Clone seu fork
git clone https://github.com/SEU-USUARIO/poker-grinders-edge.git
cd poker-grinders-edge

# 3. Adicione o repositório original como remote
git remote add upstream https://github.com/ORIGINAL/poker-grinders-edge.git

# 4. Configure o backend
cd backend
npm install
cp .env.example .env
# Edite .env com suas configurações locais

# 5. Configure o banco de dados
createdb poker_grinders_edge_dev
npx prisma migrate dev
npx prisma generate

# 6. Rode o backend
npm run start:dev

# 7. Em outro terminal, configure o mobile
cd ../mobile
npm install

# 8. Rode o app (escolha iOS ou Android)
npx react-native run-android
# ou
npx react-native run-ios
```

## Padrões de Código

### TypeScript

Usamos **TypeScript estrito** em todo o projeto. Sempre:

- ✅ Defina tipos explícitos para parâmetros e retornos
- ✅ Use interfaces para objetos complexos
- ✅ Evite `any` - use `unknown` ou tipos específicos
- ❌ Nunca desabilite regras do ESLint sem justificativa

**Exemplo bom**:
```typescript
interface CreateSessionDto {
  gameType: GameType;
  buyIn: number;
  result: number;
}

async function createSession(dto: CreateSessionDto): Promise<Session> {
  // ...
}
```

**Exemplo ruim**:
```typescript
function createSession(dto: any): any { // ❌ Nunca use any
  // ...
}
```

### Nomenclatura

#### Arquivos
- Componentes React: `PascalCase.tsx` (ex: `SessionCard.tsx`)
- Services: `camelCase.service.ts` (ex: `authService.ts`)
- DTOs: `kebab-case.dto.ts` (ex: `create-session.dto.ts`)
- Interfaces: `PascalCase.interface.ts` (ex: `Session.interface.ts`)

#### Código
- **Variáveis e funções**: `camelCase`
- **Classes e Interfaces**: `PascalCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Arquivos privados**: prefixo `_` (ex: `_helpers.ts`)

### Backend (NestJS)

#### Estrutura de Módulos

Cada módulo funcional deve seguir:

```
modules/feature-name/
├── dto/
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
├── interfaces/
│   └── feature.interface.ts
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
└── __tests__/
    ├── feature.controller.spec.ts
    └── feature.service.spec.ts
```

#### DTOs (Data Transfer Objects)

Use `class-validator` para validação:

```typescript
import { IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsEnum(GameType)
  gameType: GameType;

  @IsNumber()
  @Min(0, { message: 'Buy-in deve ser positivo' })
  buyIn: number;

  @IsNumber()
  result: number;
}
```

#### Services

Services devem:
- Ter **responsabilidade única** (Single Responsibility Principle)
- Injetar dependências via constructor
- Retornar tipos explícitos
- Lançar exceções do NestJS (`NotFoundException`, `BadRequestException`, etc)

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<Session> {
    const session = await this.prisma.session.findUnique({
      where: { id }
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return session;
  }
}
```

#### Controllers

Controllers devem:
- Ser enxutos (delegar lógica para services)
- Usar decorators apropriados (`@Get`, `@Post`, etc)
- Aplicar guards quando necessário (`@UseGuards(JwtAuthGuard)`)
- Retornar DTOs de resposta (não entidades direto do banco)

```typescript
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SessionResponseDto> {
    return this.sessionsService.findOne(id);
  }
}
```

### Frontend (React Native / Next.js)

#### Componentes

- Use **function components** com hooks (não class components)
- Extraia lógica complexa para custom hooks
- Memoize componentes pesados com `React.memo()`
- Componentes pequenos e focados (máximo 200 linhas)

```typescript
import React from 'react';
import { View, Text } from 'react-native';

interface SessionCardProps {
  session: Session;
  onPress: (id: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onPress }) => {
  const handlePress = () => onPress(session.id);

  return (
    <View>
      <Text>{session.gameType}</Text>
      <Text>Buy-in: ${session.buyIn}</Text>
    </View>
  );
};
```

#### State Management (Zustand)

Stores devem ser:
- Pequenos e focados em um domínio
- Ter ações claramente definidas
- Usar TypeScript para type safety

```typescript
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await authService.login(email, password);
    set({
      user: response.user,
      token: response.access_token,
      isAuthenticated: true
    });
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
```

### Comentários e Documentação

#### JSDoc

Use JSDoc para **todas** as funções e classes públicas:

```typescript
/**
 * @method uploadHandHistory
 * @description Faz upload e processa um arquivo de Hand History completo.
 *
 * @param {UploadHandHistoryDto} uploadDto - Dados do upload
 * @param {string} userId - ID do usuário
 * @returns {Promise<SessionResponseDto>} Sessão criada + primeira mão parseada
 * @throws {BadRequestException} Se nenhuma mão válida encontrada
 *
 * @example
 * ```typescript
 * const result = await service.uploadHandHistory({
 *   rawHandHistory: 'PokerStars Hand #123...',
 *   name: 'MTT Sunday'
 * }, userId);
 * ```
 */
async uploadHandHistory(
  uploadDto: UploadHandHistoryDto,
  userId: string,
): Promise<SessionResponseDto> {
  // ...
}
```

#### Comentários Inline

Use comentários inline para:
- Explicar **por que** algo é feito (não **o que** é feito)
- Lógica complexa ou não óbvia
- TODOs e FIXMEs

```typescript
// ✅ Bom: explica o "porquê"
// Usamos bcrypt com 12 rounds para balancear segurança e performance
const hashedPassword = await bcrypt.hash(password, 12);

// ❌ Ruim: explica o óbvio
// Faz hash da senha
const hashedPassword = await bcrypt.hash(password, 12);
```

## Workflow Git

### Branches

Usamos **Git Flow** simplificado:

- `main` - Código em produção (protegida)
- `develop` - Branch de desenvolvimento (protegida)
- `feat/nome-feature` - Novas funcionalidades
- `fix/nome-bug` - Correções de bugs
- `docs/nome-doc` - Melhorias na documentação
- `refactor/nome` - Refatorações
- `test/nome` - Adição de testes

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

**Formato**: `<tipo>(<escopo>): <mensagem>`

**Tipos**:
- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `docs` - Mudanças na documentação
- `style` - Formatação (não muda lógica)
- `refactor` - Refatoração de código
- `test` - Adição ou correção de testes
- `chore` - Mudanças em build, CI, etc

**Exemplos**:
```bash
feat(bankroll): add session tracking for tournaments
fix(auth): correct password hashing bug
docs(readme): update setup instructions
refactor(parser): extract PokerStars parser to Strategy Pattern
test(sessions): add unit tests for SessionsService
```

### Workflow

```bash
# 1. Atualize sua branch develop
git checkout develop
git pull upstream develop

# 2. Crie uma branch para sua feature
git checkout -b feat/minha-feature

# 3. Faça suas mudanças e commits
git add .
git commit -m "feat(module): add new feature"

# 4. Mantenha sua branch atualizada
git fetch upstream
git rebase upstream/develop

# 5. Push para seu fork
git push origin feat/minha-feature

# 6. Abra um Pull Request no GitHub
```

## Testes

### Cobertura Mínima

- **Backend**: 80% de cobertura
- **Frontend**: 60% de cobertura (componentes críticos)

### Backend (Jest)

#### Testes Unitários (Services)

```typescript
// sessions.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '@/database/prisma.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: {
            session: {
              create: jest.fn(),
              findUnique: jest.fn(),
            }
          }
        }
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a session', async () => {
    const dto = { gameType: 'CASH', buyIn: 100, result: 150 };
    const mockSession = { id: '1', ...dto };

    jest.spyOn(prisma.session, 'create').mockResolvedValue(mockSession as any);

    const result = await service.create(dto, 'user-id');

    expect(result).toEqual(mockSession);
    expect(prisma.session.create).toHaveBeenCalledWith({
      data: { ...dto, userId: 'user-id' }
    });
  });
});
```

#### Testes E2E (Endpoints)

```typescript
// sessions.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('SessionsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Login para obter token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' });

    authToken = loginResponse.body.access_token;
  });

  it('/sessions (POST)', () => {
    return request(app.getHttpServer())
      .post('/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ gameType: 'CASH', buyIn: 100, result: 150 })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.buyIn).toBe(100);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Rodando Testes

```bash
# Backend
cd backend

# Todos os testes
npm run test

# Testes em watch mode
npm run test:watch

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## Documentação

### O que documentar?

- ✅ Todas as funções e classes públicas (JSDoc)
- ✅ Lógica complexa ou não óbvia (comentários inline)
- ✅ Decisões de design importantes (ARCHITECTURE.md)
- ✅ Novos padrões ou utilitários (exemplos de uso)
- ❌ Não documente o óbvio

### Onde documentar?

- **JSDoc**: Código TypeScript (.ts, .tsx)
- **README.md**: Visão geral do projeto e setup rápido
- **ARCHITECTURE.md**: Arquitetura, padrões de design, fluxo de dados
- **CONTRIBUTING.md**: Este arquivo (guia para desenvolvedores)
- **Comentários inline**: Explicações de lógica complexa

## Pull Requests

### Antes de Abrir um PR

- ✅ Seu código compila sem erros (`npm run build`)
- ✅ Todos os testes passam (`npm run test`)
- ✅ Você seguiu os padrões de código
- ✅ Você adicionou/atualizou testes
- ✅ Você adicionou/atualizou documentação
- ✅ Você rodou o linter (`npm run lint`)

### Template de PR

```markdown
## Descrição

[Descreva brevemente o que este PR faz]

## Tipo de Mudança

- [ ] 🐛 Bug fix (mudança que corrige um problema)
- [ ] ✨ Nova feature (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 📝 Documentação

## Como Testar?

[Descreva os passos para testar suas mudanças]

1. Clone o branch
2. Execute `npm install`
3. Execute `npm run test`
4. ...

## Checklist

- [ ] Código compila sem erros
- [ ] Testes passam
- [ ] Adicionei testes para novas funcionalidades
- [ ] Atualizei a documentação
- [ ] Segui os padrões de código do projeto
- [ ] Commits seguem Conventional Commits

## Screenshots (se aplicável)

[Adicione screenshots se houver mudanças visuais]
```

### Revisão de Código

Espere feedback de mantenedores. Esteja aberto a:

- Sugestões de melhoria
- Solicitações de mudanças
- Discussões sobre abordagens alternativas

## Perguntas?

- 💬 Abra uma [Discussion](../../discussions)
- 🐛 Reporte bugs via [Issues](../../issues)
- 📧 Entre em contato: [email do projeto]

---

**Obrigado por contribuir!** 🎉

Toda contribuição, grande ou pequena, é muito apreciada e ajuda a tornar o Poker Grinder's Edge melhor para toda a comunidade.
