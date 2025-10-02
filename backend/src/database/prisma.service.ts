import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * @class PrismaService
 * @description Serviço centralizado para gerenciar conexões com o banco de dados PostgreSQL via Prisma ORM.
 * Estende PrismaClient para fornecer funcionalidades de conexão/desconexão automáticas durante o ciclo de vida da aplicação.
 *
 * @implements {OnModuleInit} Hook do NestJS que executa a conexão ao inicializar o módulo
 * @extends {PrismaClient} Cliente Prisma gerado automaticamente baseado no schema.prisma
 *
 * @example
 * ```typescript
 * // Injetar o serviço em outros módulos
 * constructor(private prisma: PrismaService) {}
 *
 * // Usar para queries
 * const users = await this.prisma.user.findMany();
 * ```
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * @method onModuleInit
   * @description Hook executado automaticamente quando o módulo é inicializado.
   * Estabelece conexão com o banco de dados PostgreSQL.
   *
   * @returns {Promise<void>}
   * @throws {PrismaClientKnownRequestError} Se falhar ao conectar ao banco
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * @method enableShutdownHooks
   * @description Configura hooks para desconexão segura do banco de dados antes do shutdown da aplicação.
   * Garante que todas as conexões sejam fechadas adequadamente para evitar vazamento de recursos.
   *
   * @param {any} app - Instância da aplicação NestJS
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * // Em main.ts
   * const app = await NestFactory.create(AppModule);
   * const prismaService = app.get(PrismaService);
   * await prismaService.enableShutdownHooks(app);
   * ```
   */
  async enableShutdownHooks(app: any) {
    process.on('beforeExit', async () => {
      await this.$disconnect();
      await app.close();
    });
  }
}