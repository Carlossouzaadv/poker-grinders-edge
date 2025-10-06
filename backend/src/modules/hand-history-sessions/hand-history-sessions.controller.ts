import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { HandHistorySessionsService } from './hand-history-sessions.service';
import { UploadHandHistoryDto } from './dto/upload-hand-history.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { User } from '@prisma/client';

/**
 * Controller for Hand History Analysis Sessions
 * All endpoints require authentication via JWT
 */
@Controller('hand-history-sessions')
@UseGuards(JwtAuthGuard)
export class HandHistorySessionsController {
  constructor(
    private readonly handHistorySessionsService: HandHistorySessionsService,
  ) {}

  /**
   * POST /hand-history-sessions/upload
   * Upload and parse a complete hand history (multiple hands)
   * Returns session ID and first parsed hand for immediate display
   */
  @Post('upload')
  async uploadHandHistory(
    @Body() uploadDto: UploadHandHistoryDto,
    @CurrentUser() user: User,
  ) {
    return this.handHistorySessionsService.uploadHandHistory(
      uploadDto,
      user.id,
    );
  }

  /**
   * POST /hand-history-sessions/add-hands
   * Add hands to existing session or create new session grouped by tournament+date
   * Automatically groups hands from same tournament on same date
   */
  @Post('add-hands')
  async addHandsToSession(
    @Body() body: { tournamentName: string; date: string; parsedHands: any[] },
    @CurrentUser() user: User,
  ) {
    return this.handHistorySessionsService.addHandsToSession(
      body.tournamentName,
      body.date,
      body.parsedHands,
      user.id,
    );
  }

  /**
   * GET /hand-history-sessions
   * List all hand history sessions for the authenticated user
   */
  @Get()
  async listSessions(@CurrentUser() user: User) {
    return this.handHistorySessionsService.listUserSessions(user.id);
  }

  /**
   * GET /hand-history-sessions/:sessionId/hands/:handIndex
   * Get a specific hand from a session by its index
   * Example: GET /hand-history-sessions/abc123/hands/5
   */
  @Get(':sessionId/hands/:handIndex')
  async getHandByIndex(
    @Param('sessionId') sessionId: string,
    @Param('handIndex', ParseIntPipe) handIndex: number,
    @CurrentUser() user: User,
  ) {
    return this.handHistorySessionsService.getHandByIndex(
      sessionId,
      handIndex,
      user.id,
    );
  }

  /**
   * DELETE /hand-history-sessions/:sessionId
   * Delete a hand history session and all its hands
   */
  @Delete(':sessionId')
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: User,
  ) {
    await this.handHistorySessionsService.deleteSession(sessionId, user.id);
    return { message: 'Session deleted successfully' };
  }
}