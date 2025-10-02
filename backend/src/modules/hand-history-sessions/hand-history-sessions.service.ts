import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UploadHandHistoryDto } from './dto/upload-hand-history.dto';
import {
  SessionResponseDto,
  SessionListItemDto,
  HandResponseDto,
} from './dto/session-response.dto';

/**
 * @class HandHistorySessionsService
 * @description Serviço responsável por gerenciar sessões de análise de Hand History.
 * Processa arquivos de histórico de mãos de poker (podem conter múltiplas mãos), armazena no banco de dados
 * e fornece interface para recuperação e navegação entre mãos.
 *
 * Funcionalidades principais:
 * - Upload e parsing de Hand History completo (múltiplas mãos)
 * - Armazenamento transacional (garante atomicidade)
 * - Recuperação de mão específica por índice
 * - Listagem de sessões do usuário
 * - Controle de acesso (apenas dono da sessão pode acessar)
 *
 * @example
 * ```typescript
 * // Upload de Hand History
 * const session = await service.uploadHandHistory({
 *   rawHandHistory: '...texto completo...',
 *   name: 'Sessão MTT 09/10',
 *   siteFormat: 'PokerStars'
 * }, userId);
 *
 * // Recuperar mão #5 da sessão
 * const hand = await service.getHandByIndex(sessionId, 5, userId);
 * ```
 */
@Injectable()
export class HandHistorySessionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * @method uploadHandHistory
   * @description Faz upload e processa um arquivo de Hand History completo contendo múltiplas mãos.
   * Executa as seguintes etapas:
   * 1. Recebe texto bruto do Hand History
   * 2. Chama parseMultipleHands() para dividir e parsear cada mão individualmente
   * 3. Detecta automaticamente o site de poker (PokerStars, GGPoker, etc) se não fornecido
   * 4. Armazena sessão e todas as mãos em uma TRANSAÇÃO (garante atomicidade)
   * 5. Retorna informações da sessão + primeira mão parseada (para exibição imediata)
   *
   * @param {UploadHandHistoryDto} uploadDto - Dados do upload (rawHandHistory, name, siteFormat)
   * @param {string} userId - ID do usuário (owner da sessão)
   * @returns {Promise<SessionResponseDto>} Sessão criada + primeira mão parseada
   *
   * @throws {BadRequestException} Se nenhuma mão válida for encontrada ou parsing falhar
   * @throws {Error} Se erro ao salvar no banco de dados
   *
   * @example
   * ```typescript
   * const result = await service.uploadHandHistory({
   *   rawHandHistory: 'PokerStars Hand #123... PokerStars Hand #124...',
   *   name: 'MTT Sunday Million',
   *   siteFormat: 'PokerStars'
   * }, 'user-abc-123');
   * // { id: 'session-xyz', name: 'MTT Sunday Million', totalHands: 45, firstHand: {...} }
   * ```
   */
  async uploadHandHistory(
    uploadDto: UploadHandHistoryDto,
    userId: string,
  ): Promise<SessionResponseDto> {
    const { rawHandHistory, name, siteFormat } = uploadDto;

    try {
      // TODO: INTEGRATION POINT - Call parseMultipleHands() from refactored parser
      // const parsedHands = await this.parseMultipleHands(rawHandHistory, siteFormat);

      // PLACEHOLDER: For now, we'll use a mock implementation
      const parsedHands = await this.parseMultipleHandsPlaceholder(
        rawHandHistory,
        siteFormat,
      );

      if (!parsedHands || parsedHands.length === 0) {
        throw new BadRequestException(
          'No valid hands found in the provided hand history',
        );
      }

      // Detect site format from first hand if not provided
      const detectedSiteFormat =
        siteFormat || parsedHands[0].site || 'Unknown';

      // Generate session name if not provided
      const sessionName =
        name ||
        this.generateSessionName(detectedSiteFormat, parsedHands.length);

      // Use transaction to ensure all-or-nothing save
      const session = await this.prisma.$transaction(async (tx) => {
        // Create session
        const newSession = await tx.handHistorySession.create({
          data: {
            userId,
            name: sessionName,
            siteFormat: detectedSiteFormat,
            totalHands: parsedHands.length,
            rawHandHistory,
          },
        });

        // Create all hands
        await tx.handHistoryHand.createMany({
          data: parsedHands.map((parsedHand, index) => ({
            sessionId: newSession.id,
            handIndex: index,
            handText: parsedHand.originalText || '',
            parsedData: parsedHand,
          })),
        });

        return newSession;
      });

      // Return session with first hand for immediate display
      return {
        id: session.id,
        name: session.name,
        siteFormat: session.siteFormat,
        totalHands: session.totalHands,
        createdAt: session.createdAt,
        firstHand: parsedHands[0],
      };
    } catch (error) {
      // Handle parsing errors
      if (error.message.includes('parse') || error.message.includes('format')) {
        throw new BadRequestException(
          `Failed to parse hand history: ${error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * @method getHandByIndex
   * @description Recupera uma mão específica de uma sessão através do seu índice.
   * Valida ownership da sessão antes de retornar os dados (segurança).
   *
   * @param {string} sessionId - ID da sessão
   * @param {number} handIndex - Índice da mão (0-based, ex: 0 = primeira mão)
   * @param {string} userId - ID do usuário solicitante
   * @returns {Promise<HandResponseDto>} Dados completos da mão parseada
   *
   * @throws {NotFoundException} Se sessão ou mão não encontrada
   * @throws {ForbiddenException} Se usuário não tem acesso à sessão
   * @throws {BadRequestException} Se handIndex inválido (< 0 ou >= totalHands)
   *
   * @example
   * ```typescript
   * // Buscar 6ª mão (índice 5) da sessão
   * const hand = await service.getHandByIndex('session-123', 5, 'user-abc');
   * // { id: 'hand-xyz', handIndex: 5, parsedData: {...}, sessionId: 'session-123' }
   * ```
   */
  async getHandByIndex(
    sessionId: string,
    handIndex: number,
    userId: string,
  ): Promise<HandResponseDto> {
    // Verify session ownership
    const session = await this.prisma.handHistorySession.findUnique({
      where: { id: sessionId },
      select: { userId: true, totalHands: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this session');
    }

    // Validate hand index
    if (handIndex < 0 || handIndex >= session.totalHands) {
      throw new BadRequestException(
        `Invalid hand index. Must be between 0 and ${session.totalHands - 1}`,
      );
    }

    // Get the specific hand
    const hand = await this.prisma.handHistoryHand.findUnique({
      where: {
        sessionId_handIndex: {
          sessionId,
          handIndex,
        },
      },
    });

    if (!hand) {
      throw new NotFoundException('Hand not found');
    }

    return {
      id: hand.id,
      handIndex: hand.handIndex,
      parsedData: hand.parsedData,
      sessionId: hand.sessionId,
    };
  }

  /**
   * @method listUserSessions
   * @description Lista todas as sessões de um usuário, ordenadas por data de criação (mais recentes primeiro).
   * Retorna apenas informações básicas da sessão (sem dados das mãos para otimizar performance).
   *
   * @param {string} userId - ID do usuário
   * @returns {Promise<SessionListItemDto[]>} Array de sessões (sem hand data)
   *
   * @example
   * ```typescript
   * const sessions = await service.listUserSessions('user-abc');
   * // [
   * //   { id: 'session-1', name: 'MTT 09/10', siteFormat: 'PokerStars', totalHands: 45, createdAt: ... },
   * //   { id: 'session-2', name: 'Cash 08/10', siteFormat: 'GGPoker', totalHands: 120, createdAt: ... }
   * // ]
   * ```
   */
  async listUserSessions(userId: string): Promise<SessionListItemDto[]> {
    const sessions = await this.prisma.handHistorySession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        siteFormat: true,
        totalHands: true,
        createdAt: true,
      },
    });

    return sessions;
  }

  /**
   * @method deleteSession
   * @description Deleta uma sessão e todas as suas mãos. Valida ownership antes de deletar.
   * O cascade delete das mãos é gerenciado automaticamente pelo schema do Prisma.
   *
   * @param {string} sessionId - ID da sessão a deletar
   * @param {string} userId - ID do usuário solicitante
   * @returns {Promise<void>}
   *
   * @throws {NotFoundException} Se sessão não encontrada
   * @throws {ForbiddenException} Se usuário não tem acesso à sessão
   *
   * @example
   * ```typescript
   * await service.deleteSession('session-123', 'user-abc');
   * ```
   */
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    // Verify ownership
    const session = await this.prisma.handHistorySession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this session');
    }

    // Delete session (hands will be cascade deleted)
    await this.prisma.handHistorySession.delete({
      where: { id: sessionId },
    });
  }

  /**
   * @private
   * @method parseMultipleHandsPlaceholder
   * @description PLACEHOLDER temporário para parsing de múltiplas mãos.
   * Será substituído pela integração real com o parser refatorado (Strategy Pattern).
   *
   * TODO: Integrar com HandParser.parseMultipleHands() quando disponível
   *
   * @param {string} rawHandHistory - Texto bruto completo do Hand History
   * @param {string} [siteFormatHint] - Hint opcional do site de poker
   * @returns {Promise<any[]>} Array de mãos parseadas (formato placeholder)
   */
  private async parseMultipleHandsPlaceholder(
    rawHandHistory: string,
    siteFormatHint?: string,
  ): Promise<any[]> {
    // Placeholder: retorna mock data para desenvolvimento
    // Produção: chamar HandParser.parseMultipleHands()
    return [
      {
        site: siteFormatHint || 'PokerStars',
        originalText: rawHandHistory.substring(0, 500),
        // ... outros campos parseados serão adicionados na integração real
      },
    ];
  }

  /**
   * @private
   * @method generateSessionName
   * @description Gera um nome padrão para a sessão quando o usuário não fornece um.
   * Formato: "{Site} Session - {N} hands ({Date})"
   *
   * @param {string} siteFormat - Nome do site de poker (ex: 'PokerStars', 'GGPoker')
   * @param {number} handCount - Número total de mãos na sessão
   * @returns {string} Nome gerado automaticamente
   *
   * @example
   * ```typescript
   * generateSessionName('PokerStars', 45)
   * // "PokerStars Session - 45 hands (2023-10-02)"
   * ```
   */
  private generateSessionName(siteFormat: string, handCount: number): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${siteFormat} Session - ${handCount} hands (${date})`;
  }
}