import {
  Controller,
  Post,
  Headers,
  UnauthorizedException,
  Logger,
  Body,
} from '@nestjs/common';
import { AnonymizationService } from './anonymization.service';

@Controller('anonymization')
export class AnonymizationController {
  private readonly logger = new Logger(AnonymizationController.name);

  constructor(private readonly anonymizationService: AnonymizationService) {}

  /**
   * Endpoint called by Vercel cron job
   * Requires CRON_SECRET header for authentication
   */
  @Post('process')
  async processJobs(
    @Headers('authorization') authHeader: string,
    @Body('batchSize') batchSize?: number,
  ) {
    // Verify cron secret
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    if (authHeader !== expectedAuth) {
      this.logger.warn('Unauthorized anonymization request');
      throw new UnauthorizedException('Invalid authorization');
    }

    this.logger.log('Processing anonymization jobs via cron');

    const result = await this.anonymizationService.processPendingJobs(
      batchSize || 200,
    );

    return {
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    };
  }

  /**
   * Manual trigger endpoint (protected by admin auth)
   * Useful for testing or manual processing
   */
  @Post('process-manual')
  async processManual(
    @Headers('authorization') authHeader: string,
    @Body('batchSize') batchSize?: number,
  ) {
    // Verify admin secret
    const expectedAuth = `Bearer ${process.env.ADMIN_SECRET || process.env.CRON_SECRET}`;
    if (authHeader !== expectedAuth) {
      this.logger.warn('Unauthorized manual anonymization request');
      throw new UnauthorizedException('Invalid authorization');
    }

    this.logger.log('Processing anonymization jobs manually');

    const result = await this.anonymizationService.processPendingJobs(
      batchSize || 500, // Higher batch size for manual processing
    );

    return {
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    };
  }
}
