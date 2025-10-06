import { getAnomalyLogDir } from '../config/sidepot-config';

// Dynamic imports for Node.js modules (server-side only)
const getNodeModules = async () => {
  if (typeof window !== 'undefined') {
    // Browser environment - return mock implementations
    return {
      fs: {
        existsSync: () => false,
        mkdirSync: () => {},
        appendFileSync: () => {},
        readFileSync: () => '',
        unlinkSync: () => {}
      },
      path: {
        join: (...args: string[]) => args.join('/')
      }
    };
  }

  // Additional client-side check for webpack environment
  if (typeof process === 'undefined' || process.env.__NEXT_PROCESSED_ENV) {
    // Client-side webpack environment
    return {
      fs: {
        existsSync: () => false,
        mkdirSync: () => {},
        appendFileSync: () => {},
        readFileSync: () => '',
        unlinkSync: () => {}
      },
      path: {
        join: (...args: string[]) => args.join('/')
      }
    };
  }

  // Test environment detection and fallback
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    // Jest test environment - use require instead of dynamic import
    const fs = require('fs');
    const path = require('path');

    return { fs, path };
  }

  try {
    // Server environment - use actual Node.js modules
    const [fs, path] = await Promise.all([
      import('fs'),
      import('path')
    ]);

    return {
      fs: fs.default || fs,
      path: path.default || path
    };
  } catch (error) {
    // Fallback to mock if imports fail
    console.warn('Failed to import Node.js modules, using mocks:', error);
    return {
      fs: {
        existsSync: () => false,
        mkdirSync: () => {},
        appendFileSync: () => {},
        readFileSync: () => '',
        unlinkSync: () => {}
      },
      path: {
        join: (...args: string[]) => args.join('/')
      }
    };
  }
};

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
  anomalyType: 'NO_ELIGIBLE_WINNERS' | 'EMPTY_ELIGIBLE_ARRAY' | 'MATHEMATICAL_INCONSISTENCY' | 'GUARD_FAILURE';
  description: string;
  fallbackAction?: string;
  fallbackWinner?: string;
  guardContext?: Record<string, any>;
  guardSeverity?: string;
}

export class AnomalyLogger {
  private static logDir: string | null = null;

  /**
   * Check if we're in a server environment
   */
  private static isServerSide(): boolean {
    return typeof window === 'undefined' && typeof process !== 'undefined';
  }

  /**
   * Initialize the logger and ensure log directory exists
   */
  private static async ensureLogDir(): Promise<string> {
    // Only initialize on server side
    if (!this.isServerSide()) {
      return './'; // Return dummy path for client side
    }

    if (!this.logDir) {
      this.logDir = getAnomalyLogDir();

      try {
        const { fs } = await getNodeModules();
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
  public static async logAnomaly(entry: Omit<AnomalyLogEntry, 'incidentId' | 'timestamp'>): Promise<string> {
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

    // Only attempt file logging on server side
    if (this.isServerSide()) {
      try {
        const { fs, path } = await getNodeModules();
        const logDir = await this.ensureLogDir();
        const logFile = path.join(logDir, 'anomalies.log');

        // Append to log file (one JSON object per line)
        const logLine = JSON.stringify(fullEntry) + '\n';
        fs.appendFileSync(logFile, logLine, 'utf8');

        console.log(`📝 Anomaly logged to: ${logFile}`);
      } catch (error) {
        console.error(`❌ Failed to write anomaly log:`, error);
        // Still return the incident ID even if file write failed
      }
    } else {
      console.log(`📝 Anomaly logged (client-side, no file write)`);
    }

    return incidentId;
  }

  /**
   * Log a "no eligible winners" anomaly
   */
  public static async logNoEligibleWinners(
    potIndex: number,
    potAmount: number,
    eligible: string[],
    totalCommitted: Record<string, number>,
    playerStatus: Record<string, 'folded' | 'all-in' | 'active'>,
    handId?: string,
    fallbackWinner?: string
  ): Promise<string> {
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
  public static async logMathematicalInconsistency(
    expected: number,
    actual: number,
    context: string,
    totalCommitted: Record<string, number>,
    handId?: string
  ): Promise<string> {
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
  public static async readAnomalyLog(): Promise<AnomalyLogEntry[]> {
    // Only read on server side
    if (!this.isServerSide()) {
      console.warn('⚠️ Cannot read anomaly log on client side');
      return [];
    }

    try {
      const { fs, path } = await getNodeModules();
      const logDir = await this.ensureLogDir();
      const logFile = path.join(logDir, 'anomalies.log');

      if (!fs.existsSync(logFile)) {
        return [];
      }

      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n').filter((line: string) => line.trim());

      return lines.map((line: string) => JSON.parse(line) as AnomalyLogEntry);
    } catch (error) {
      console.error(`❌ Failed to read anomaly log:`, error);
      return [];
    }
  }

  /**
   * Clear the anomaly log (for testing)
   */
  public static async clearAnomalyLog(): Promise<void> {
    // Only clear on server side
    if (!this.isServerSide()) {
      console.warn('⚠️ Cannot clear anomaly log on client side');
      return;
    }

    try {
      const { fs, path } = await getNodeModules();
      const logDir = await this.ensureLogDir();
      const logFile = path.join(logDir, 'anomalies.log');

      if (fs.existsSync(logFile)) {
        fs.unlinkSync(logFile);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to clear anomaly log:`, error);
    }
  }

  /**
   * Log a guard failure
   */
  public static async logGuardFailure(guard: {
    passed: boolean;
    severity: string;
    message: string;
    context: Record<string, any>;
    recoverable: boolean;
  }): Promise<string> {
    return this.logAnomaly({
      potIndex: -1,
      potAmountInCents: 0,
      eligibleAtCreation: [],
      totalCommittedMap: {},
      playerStatusTimeline: {},
      anomalyType: 'GUARD_FAILURE',
      description: guard.message,
      guardContext: guard.context,
      guardSeverity: guard.severity,
      fallbackAction: guard.recoverable ? 'Recovery attempted' : 'Exception thrown'
    });
  }
}