# CLAUDE.md - Backend (NestJS API)

Diretrizes específicas para desenvolvimento do backend da API Poker Grinder's Edge.

## Arquitetura Backend

### Stack Tecnológico
- **Framework:** NestJS + TypeScript
- **Banco de Dados:** PostgreSQL + Prisma ORM
- **Autenticação:** JWT (JSON Web Tokens)
- **Validação:** class-validator + class-transformer
- **Testes:** Jest (unitários e e2e)

### Estrutura de Pastas
```
backend/src/
├── modules/              # Módulos funcionais
│   ├── auth/            # Autenticação e autorização
│   ├── sessions/        # Gestão de sessões de poker
│   ├── users/           # Gestão de usuários
│   └── coaches/         # Marketplace de coaches
├── common/              # Código compartilhado
│   ├── decorators/      # Decorators customizados
│   ├── filters/         # Exception filters
│   ├── guards/          # Guards de autenticação
│   ├── interceptors/    # Interceptors
│   └── pipes/           # Validation pipes
├── database/            # Configuração Prisma
│   └── schema.prisma    # Schema do banco
└── main.ts              # Entry point
```

## Padrões de Desenvolvimento

### Módulos NestJS
Cada módulo deve seguir a estrutura:
```
module/
├── dto/                 # Data Transfer Objects
├── entities/            # Entidades do banco
├── module.controller.ts # Endpoints REST
├── module.service.ts    # Lógica de negócio
├── module.module.ts     # Configuração do módulo
└── __tests__/          # Testes
```

### DTOs e Validação
```typescript
// create-session.dto.ts
import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsEnum(GameType)
  gameType: GameType;

  @IsNumber()
  buyIn: number;

  @IsNumber()
  result: number;
}
```

### Services
```typescript
@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSessionDto: CreateSessionDto, userId: string) {
    // Lógica de negócio aqui
    return this.prisma.session.create({
      data: { ...createSessionDto, userId }
    });
  }
}
```

### Controllers
```typescript
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto, @User() user) {
    return this.sessionsService.create(createSessionDto, user.id);
  }
}
```

## Comandos Específicos

### Desenvolvimento
```bash
npm run start:dev        # Modo desenvolvimento com hot-reload
npm run start:debug      # Modo debug
npm run build            # Build para produção
```

### Banco de Dados (Prisma)
```bash
npx prisma generate      # Gera cliente Prisma
npx prisma db push       # Aplica mudanças no schema
npx prisma studio        # Interface visual do banco
npx prisma migrate dev   # Cria nova migration
```

### Testes
```bash
npm run test             # Testes unitários
npm run test:e2e         # Testes de integração
npm run test:cov         # Coverage report
```

## Regras de Negócio Específicas

### Autenticação
- JWT com expiração de 7 dias
- Refresh tokens para renovação automática
- Hash de senhas com bcrypt (salt rounds: 12)

### Sessões de Poker
- Suporte para Cash Game e Torneios
- Cálculo automático de ROI e winrate
- Validação de bankroll management

### Validações Importantes
- buyIn deve ser > 0
- result pode ser negativo (prejuízo)
- gameType deve ser enum válido
- Usuário só pode acessar suas próprias sessões

## Testes

### Testes Unitários (Services)
```typescript
describe('SessionsService', () => {
  it('should create a session', async () => {
    const dto = { gameType: GameType.CASH, buyIn: 100, result: 150 };
    const result = await service.create(dto, 'user-id');
    expect(result).toBeDefined();
  });
});
```

### Testes E2E (Controllers)
```typescript
describe('/sessions (e2e)', () => {
  it('/sessions (POST)', () => {
    return request(app.getHttpServer())
      .post('/sessions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ gameType: 'CASH', buyIn: 100, result: 150 })
      .expect(201);
  });
});
```

## Diretrizes para Claude

1. **Sempre criar testes primeiro** (TDD)
2. **Validar todos os DTOs** com class-validator
3. **Usar Guards JWT** para rotas protegidas
4. **Tratar erros adequadamente** com exception filters
5. **Manter consistência** com padrões NestJS
6. **Documentar APIs** com Swagger quando necessário