import fs from 'fs';
import path from 'path';
import { getAnomalyLogDir } from '../config/sidepot-config';

/**
 * Structured Anomaly Logger
 *
 * Logs side pot anomalies to structured JSON files for audit and analysis
 */

export interface AnomalyLogEntry {
  incidentId: string;
  timestamp: string;
  handId?: string;
  potIndex: number;
  potAmountInCents: number;
  eligibleAtCreation: string[];
  totalCommittedMap: Record<string, number>;
  playerStatusTimeline: Record<string, 'folded' | 'all-in' | 'active'>;
  anomalyType: 'NO_ELIGIBLE_WINNERS' | 'EMPTY_ELIGIBLE_ARRAY' | 'MATHEMATICAL_INCONSISTENCY';
  description: string;
  fallbackAction?: string;
  fallbackWinner?: string;
}

export class AnomalyLogger {
  private static logDir: string | null = null;

  /**
   * Initialize the logger and ensure log directory exists
   */
  private static ensureLogDir(): string {
    if (!this.logDir) {
      this.logDir = getAnomalyLogDir();

      try {
        if (!fs.existsSync(this.logDir)) {
          fs.mkdirSync(this.logDir, { recursive: true });
        }
      } catch (error) {
        console.warn(`⚠️ Failed to create anomaly log directory: ${this.logDir}`, error);
        // Fall back to current directory
        this.logDir = './';
      }
    }

    return this.logDir;
  }

  /**
   * Generate a unique incident ID
   */
  private static generateIncidentId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ANOMALY_${timestamp}_${random}`;
  }

  /**
   * Log an anomaly to structured JSON file
   */
  public static logAnomaly(entry: Omit<AnomalyLogEntry, 'incidentId' | 'timestamp'>): string {
    const incidentId = this.generateIncidentId();
    const timestamp = new Date().toISOString();

    const fullEntry: AnomalyLogEntry = {
      incidentId,
      timestamp,
      ...entry
    };

    // Log to console for immediate visibility
    console.error(`❌ ANOMALY LOGGED: ${incidentId}`);
    console.error(`   Type: ${entry.anomalyType}`);
    console.error(`   Description: ${entry.description}`);
    console.error(`   Pot ${entry.potIndex}: ${entry.potAmountInCents} cents`);
    console.error(`   Eligible: [${entry.eligibleAtCreation.join(', ')}]`);

    try {
      const logDir = this.ensureLogDir();
      const logFile = path.join(logDir, 'anomalies.log');

      // Append to log file (one JSON object per line)
      const logLine = JSON.stringify(fullEntry) + '\n';
      fs.appendFileSync(logFile, logLine, 'utf8');

      console.log(`📝 Anomaly logged to: ${logFile}`);
    } catch (error) {
      console.error(`❌ Failed to write anomaly log:`, error);
      // Still return the incident ID even if file write failed
    }

    return incidentId;
  }

  /**
   * Log a "no eligible winners" anomaly
   */
  public static logNoEligibleWinners(
    potIndex: number,
    potAmount: number,
    eligible: string[],
    totalCommitted: Record<string, number>,
    playerStatus: Record<string, 'folded' | 'all-in' | 'active'>,
    handId?: string,
    fallbackWinner?: string
  ): string {
    return this.logAnomaly({
      handId,
      potIndex,
      potAmountInCents: potAmount,
      eligibleAtCreation: eligible,
      totalCommittedMap: totalCommitted,
      playerStatusTimeline: playerStatus,
      anomalyType: 'NO_ELIGIBLE_WINNERS',
      description: `Pot ${potIndex} has eligible players [${eligible.join(', ')}] but none won at showdown`,
      fallbackAction: fallbackWinner ? `Awarded to ${fallbackWinner} via earliest-eligible rule` : 'Exception thrown',
      fallbackWinner
    });
  }

  /**
   * Log a mathematical inconsistency anomaly
   */
  public static logMathematicalInconsistency(
    expected: number,
    actual: number,
    context: string,
    totalCommitted: Record<string, number>,
    handId?: string
  ): string {
    return this.logAnomaly({
      handId,
      potIndex: -1, // Not applicable for mathematical errors
      potAmountInCents: 0,
      eligibleAtCreation: [],
      totalCommittedMap: totalCommitted,
      playerStatusTimeline: {},
      anomalyType: 'MATHEMATICAL_INCONSISTENCY',
      description: `Mathematical inconsistency in ${context}: expected ${expected}, got ${actual}`,
      fallbackAction: 'Exception thrown'
    });
  }

  /**
   * Read all anomaly log entries (for testing/analysis)
   */
  public static readAnomalyLog(): AnomalyLogEntry[] {
    try {
      const logDir = this.ensureLogDir();
      const logFile = path.join(logDir, 'anomalies.log');

      if (!fs.existsSync(logFile)) {
        return [];
      }

      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());

      return lines.map(line => JSON.parse(line) as AnomalyLogEntry);
    } catch (error) {
      console.error(`❌ Failed to read anomaly log:`, error);
      return [];
    }
  }

  /**
   * Clear the anomaly log (for testing)
   */
  public static clearAnomalyLog(): void {
    try {
      const logDir = this.ensureLogDir();
      const logFile = path.join(logDir, 'anomalies.log');

      if (fs.existsSync(logFile)) {
        fs.unlinkSync(logFile);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to clear anomaly log:`, error);
    }
  }
}