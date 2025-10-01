import { Module } from '@nestjs/common';
import { HandHistorySessionsController } from './hand-history-sessions.controller';
import { HandHistorySessionsService } from './hand-history-sessions.service';

/**
 * Module for Hand History Analysis Sessions
 * Provides endpoints for uploading, parsing, and navigating multiple hands
 */
@Module({
  controllers: [HandHistorySessionsController],
  providers: [HandHistorySessionsService],
  exports: [HandHistorySessionsService],
})
export class HandHistorySessionsModule {}