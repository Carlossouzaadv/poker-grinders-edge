import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GameType, JobStatus, RakeTier, StakesTier } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface AnonymizedPlayer {
  position: string | null;
  stack: number;
  cards?: string;
}

interface AnonymizedAction {
  player: string;
  action: string;
  amount?: number;
  street: string;
}

interface AnonymizedHandData {
  players: AnonymizedPlayer[];
  actions: AnonymizedAction[];
  board: string[];
  pots: Array<{ amount: number; winners: string[] }>;
  showdown?: {
    winners: string[];
    cards: Record<string, string>;
  };
}

@Injectable()
export class AnonymizationService {
  private readonly logger = new Logger(AnonymizationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Process pending anonymization jobs
   * Called by cron job once daily at 3 AM UTC
   * @param batchSize Maximum number of hands to process per execution
   */
  async processPendingJobs(batchSize: number = 1000): Promise<{
    jobsProcessed: number;
    handsProcessed: number;
    errors: number;
  }> {
    const startTime = Date.now();
    let totalJobsProcessed = 0;
    let totalHandsProcessed = 0;
    let totalErrors = 0;

    this.logger.log(
      `Starting anonymization process (batch size: ${batchSize})`,
    );

    try {
      // Find pending jobs (ordered by creation date)
      const pendingJobs = await this.prisma.anonymizationJob.findMany({
        where: {
          status: JobStatus.PENDING,
          attempts: { lt: 3 }, // Max 3 attempts
        },
        orderBy: { createdAt: 'asc' },
        take: 20, // Process up to 20 jobs per daily cron run
      });

      if (pendingJobs.length === 0) {
        this.logger.log('No pending jobs found');
        return { jobsProcessed: 0, handsProcessed: 0, errors: 0 };
      }

      this.logger.log(`Found ${pendingJobs.length} pending jobs`);

      // Process each job
      for (const job of pendingJobs) {
        try {
          const result = await this.processJob(job.id, batchSize);
          totalJobsProcessed++;
          totalHandsProcessed += result.handsProcessed;

          if (result.status === JobStatus.FAILED) {
            totalErrors++;
          }
        } catch (error) {
          this.logger.error(
            `Failed to process job ${job.id}: ${error.message}`,
            error.stack,
          );
          totalErrors++;
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Anonymization completed: ${totalJobsProcessed} jobs, ${totalHandsProcessed} hands in ${duration}ms`,
      );

      return {
        jobsProcessed: totalJobsProcessed,
        handsProcessed: totalHandsProcessed,
        errors: totalErrors,
      };
    } catch (error) {
      this.logger.error(`Anonymization process failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a single anonymization job
   */
  private async processJob(
    jobId: string,
    maxHands: number,
  ): Promise<{
    status: JobStatus;
    handsProcessed: number;
    handsSkipped: number;
    handsFailed: number;
  }> {
    // Mark job as processing
    await this.prisma.anonymizationJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
        attempts: { increment: 1 },
      },
    });

    try {
      // Get job details
      const job = await this.prisma.anonymizationJob.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      // Get hand history session with hands
      const session = await this.prisma.handHistorySession.findUnique({
        where: { id: job.handHistorySessionId },
        include: {
          hands: {
            orderBy: { handIndex: 'asc' },
            take: maxHands,
          },
        },
      });

      if (!session) {
        throw new Error(`Session ${job.handHistorySessionId} not found`);
      }

      let handsProcessed = 0;
      let handsSkipped = 0;
      let handsFailed = 0;

      // Process each hand
      for (const hand of session.hands) {
        try {
          // Check if hand already exists (deduplication)
          const parsedData = hand.parsedData as any;
          const handId = parsedData.handId || parsedData.id;

          if (!handId) {
            this.logger.warn(
              `Hand ${hand.id} missing handId, generating from session`,
            );
          }

          const uniqueHandId = handId || `${session.id}-${hand.handIndex}`;

          const existingHand = await this.prisma.anonymizedHand.findUnique({
            where: { handId: uniqueHandId },
          });

          if (existingHand) {
            handsSkipped++;
            continue;
          }

          // Anonymize and save hand
          await this.anonymizeAndSaveHand(
            session.siteFormat,
            hand.handText,
            parsedData,
            uniqueHandId,
          );
          handsProcessed++;
        } catch (error) {
          this.logger.error(
            `Failed to anonymize hand ${hand.id}: ${error.message}`,
          );
          handsFailed++;
        }
      }

      // Update job status
      const finalStatus =
        handsFailed > 0 && handsProcessed === 0
          ? JobStatus.FAILED
          : JobStatus.COMPLETED;

      await this.prisma.anonymizationJob.update({
        where: { id: jobId },
        data: {
          status: finalStatus,
          completedAt: new Date(),
          handsProcessed,
          handsSkipped,
          handsFailed,
          lastError:
            finalStatus === JobStatus.FAILED
              ? `Failed to process ${handsFailed} hands`
              : null,
        },
      });

      return {
        status: finalStatus,
        handsProcessed,
        handsSkipped,
        handsFailed,
      };
    } catch (error) {
      // Update job with error
      await this.prisma.anonymizationJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          lastError: error.message,
          lastErrorAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Anonymize a single hand and save to database
   */
  private async anonymizeAndSaveHand(
    site: string,
    handText: string,
    parsedData: any,
    handId: string,
  ): Promise<void> {
    // Extract game type
    const gameType = this.determineGameType(parsedData);

    // Categorize by rake (cash games) or stakes (tournaments)
    const rakeTier =
      gameType === GameType.CASH
        ? this.categorizeRake(parsedData.rake || 0)
        : null;
    const stakesTier =
      gameType !== GameType.CASH
        ? this.categorizeStakes(parsedData.buyIn || 0)
        : null;

    // Create player name mapping
    const playerMapping = this.createPlayerMapping(parsedData.players || []);

    // Anonymize hand text
    const anonymizedText = this.anonymizeText(handText, playerMapping);

    // Anonymize parsed data
    const anonymizedData = this.anonymizeParsedData(
      parsedData,
      playerMapping,
    );

    // Generate tags
    const tags = this.generateTags(parsedData);

    // Save to database
    await this.prisma.anonymizedHand.create({
      data: {
        handId,
        site,
        playedAt: parsedData.timestamp
          ? new Date(parsedData.timestamp)
          : new Date(),
        gameType,
        rakeTier,
        rakeAmount: parsedData.rake ? new Decimal(parsedData.rake) : null,
        stakesTier,
        buyIn: parsedData.buyIn ? new Decimal(parsedData.buyIn) : null,
        smallBlind: new Decimal(parsedData.smallBlind || 0),
        bigBlind: new Decimal(parsedData.bigBlind || 0),
        ante: parsedData.ante ? new Decimal(parsedData.ante) : null,
        maxPlayers: parsedData.maxPlayers || 9,
        anonymizedData: anonymizedData as any,
        anonymizedText,
        tags,
      },
    });
  }

  /**
   * Create mapping of real player names to anonymized names
   */
  private createPlayerMapping(players: any[]): Map<string, string> {
    const mapping = new Map<string, string>();

    players.forEach((player, index) => {
      const anonymizedName = `Player${index + 1}`;
      mapping.set(player.name, anonymizedName);
    });

    return mapping;
  }

  /**
   * Anonymize hand text by replacing player names
   */
  private anonymizeText(
    handText: string,
    playerMapping: Map<string, string>,
  ): string {
    let anonymized = handText;

    // Replace each player name
    playerMapping.forEach((anonymizedName, realName) => {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${this.escapeRegex(realName)}\\b`, 'g');
      anonymized = anonymized.replace(regex, anonymizedName);
    });

    return anonymized;
  }

  /**
   * Anonymize parsed data structure
   */
  private anonymizeParsedData(
    parsedData: any,
    playerMapping: Map<string, string>,
  ): AnonymizedHandData {
    const anonymized: AnonymizedHandData = {
      players: [],
      actions: [],
      board: parsedData.board || [],
      pots: [],
      showdown: undefined,
    };

    // Anonymize players
    if (parsedData.players) {
      anonymized.players = parsedData.players.map((player: any) => ({
        position: player.position || null,
        stack: player.stack || 0,
        cards: player.cards ? this.anonymizeCards(player.cards) : undefined,
      }));
    }

    // Anonymize actions
    if (parsedData.actions) {
      anonymized.actions = parsedData.actions.map((action: any) => ({
        player: playerMapping.get(action.player) || action.player,
        action: action.action,
        amount: action.amount,
        street: action.street || 'preflop',
      }));
    }

    // Anonymize showdown
    if (parsedData.showdown) {
      const winners = parsedData.showdown.winners || [];
      const cards = parsedData.showdown.cards || {};

      anonymized.showdown = {
        winners: winners.map(
          (w: string) => playerMapping.get(w) || w,
        ),
        cards: Object.fromEntries(
          Object.entries(cards).map(([player, playerCards]) => [
            playerMapping.get(player) || player,
            playerCards,
          ]),
        ),
      };
    }

    // Anonymize pots
    if (parsedData.pots) {
      anonymized.pots = parsedData.pots.map((pot: any) => ({
        amount: pot.amount || 0,
        winners: (pot.winners || []).map(
          (w: string) => playerMapping.get(w) || w,
        ),
      }));
    }

    return anonymized;
  }

  /**
   * Anonymize player cards (keep card values, hide identity)
   */
  private anonymizeCards(cards: string): string {
    // Cards are already anonymous (e.g., "AhKd")
    // Just return as-is
    return cards;
  }

  /**
   * Determine game type from parsed data
   */
  private determineGameType(parsedData: any): GameType {
    if (parsedData.gameContext?.isTournament) {
      return GameType.TOURNAMENT;
    }
    if (parsedData.gameContext?.isSitAndGo) {
      return GameType.SIT_AND_GO;
    }
    return GameType.CASH;
  }

  /**
   * Categorize cash game rake into tiers
   */
  private categorizeRake(rake: number): RakeTier {
    if (rake <= 0.1) return RakeTier.MICRO;
    if (rake <= 0.5) return RakeTier.LOW;
    if (rake <= 2.0) return RakeTier.MEDIUM;
    return RakeTier.HIGH;
  }

  /**
   * Categorize tournament buy-in into stakes tiers
   */
  private categorizeStakes(buyIn: number): StakesTier {
    if (buyIn <= 10) return StakesTier.MICRO;
    if (buyIn <= 50) return StakesTier.LOW;
    if (buyIn <= 200) return StakesTier.MEDIUM;
    if (buyIn <= 1000) return StakesTier.HIGH;
    return StakesTier.NOSEBLEED;
  }

  /**
   * Generate tags for ML training
   */
  private generateTags(parsedData: any): string[] {
    const tags: string[] = [];

    // All-in detection
    if (this.hasAllIn(parsedData)) {
      tags.push('all-in');
    }

    // 3-bet pot detection
    if (this.has3Bet(parsedData)) {
      tags.push('3-bet-pot');
    }

    // Multiway pot detection
    if (this.isMultiway(parsedData)) {
      tags.push('multiway');
    }

    // Short stack detection
    if (this.hasShortStack(parsedData)) {
      tags.push('short-stack');
    }

    // Showdown
    if (parsedData.showdown) {
      tags.push('showdown');
    }

    return tags;
  }

  private hasAllIn(parsedData: any): boolean {
    if (!parsedData.actions) return false;
    return parsedData.actions.some(
      (a: any) => a.action?.toLowerCase().includes('all-in'),
    );
  }

  private has3Bet(parsedData: any): boolean {
    if (!parsedData.actions) return false;
    const raises = parsedData.actions.filter(
      (a: any) => a.action?.toLowerCase() === 'raise',
    );
    return raises.length >= 2;
  }

  private isMultiway(parsedData: any): boolean {
    if (!parsedData.players) return false;
    // Count players who saw flop
    const flopActions = parsedData.actions?.filter(
      (a: any) => a.street === 'flop',
    );
    const uniquePlayers = new Set(flopActions?.map((a: any) => a.player) || []);
    return uniquePlayers.size >= 3;
  }

  private hasShortStack(parsedData: any): boolean {
    if (!parsedData.players || !parsedData.bigBlind) return false;
    return parsedData.players.some(
      (p: any) => p.stack / parsedData.bigBlind < 20,
    );
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
