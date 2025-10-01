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
 * Service for managing Hand History analysis sessions
 * Handles uploading, parsing, storing, and retrieving multiple hands
 */
@Injectable()
export class HandHistorySessionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Upload and parse a complete hand history (multiple hands)
   * This method:
   * 1. Receives the raw hand history text
   * 2. Calls parseMultipleHands() to split and parse each hand
   * 3. Stores the session and all hands in a TRANSACTION
   * 4. Returns the session ID and first parsed hand
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
   * Get a specific hand from a session by index
   * Validates that the user owns the session
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
   * List all sessions for a user
   * Returns basic session info (no hand data)
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
   * Delete a session and all its hands
   * Cascade delete is handled by DB schema
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
   * PLACEHOLDER: Parse multiple hands from raw text
   * TODO: Replace with actual parseMultipleHands() from refactored parser
   */
  private async parseMultipleHandsPlaceholder(
    rawHandHistory: string,
    siteFormatHint?: string,
  ): Promise<any[]> {
    // This is a placeholder that returns mock data
    // Will be replaced with actual parser integration
    return [
      {
        site: siteFormatHint || 'PokerStars',
        originalText: rawHandHistory.substring(0, 500),
        // ... other parsed hand fields
      },
    ];
  }

  /**
   * Generate a default session name based on site and hand count
   */
  private generateSessionName(siteFormat: string, handCount: number): string {
    const date = new Date().toISOString().split('T')[0];
    return `${siteFormat} Session - ${handCount} hands (${date})`;
  }
}