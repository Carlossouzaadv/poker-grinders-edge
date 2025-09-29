import fs from 'fs';
import path from 'path';
import { AnomalyLogger } from './anomaly-logger';
import { SIDEPOT_CONFIG } from '../config/sidepot-config';

/**
 * Tests for the anomaly logging system
 */

describe('Anomaly Logger', () => {

  beforeEach(() => {
    // Clear any existing anomaly log before each test
    AnomalyLogger.clearAnomalyLog();
  });

  afterEach(() => {
    // Clean up after each test
    AnomalyLogger.clearAnomalyLog();
  });

  describe('Basic Logging', () => {
    it('should log no-eligible-winners anomaly to file', () => {
      const incidentId = AnomalyLogger.logNoEligibleWinners(
        1,
        20000, // 200 dollars in cents
        ['player3'],
        { 'cashurchecks': 1596900, 'player3': 1616900 },
        { 'cashurchecks': 'all-in', 'player3': 'all-in' },
        'test_hand_123',
        'player3'
      );

      expect(incidentId).toMatch(/^ANOMALY_\d+_\d{4}$/);

      // Verify log entry was written
      const logEntries = AnomalyLogger.readAnomalyLog();
      expect(logEntries).toHaveLength(1);

      const entry = logEntries[0];
      expect(entry.incidentId).toBe(incidentId);
      expect(entry.anomalyType).toBe('NO_ELIGIBLE_WINNERS');
      expect(entry.potIndex).toBe(1);
      expect(entry.potAmountInCents).toBe(20000);
      expect(entry.eligibleAtCreation).toEqual(['player3']);
      expect(entry.handId).toBe('test_hand_123');
      expect(entry.fallbackWinner).toBe('player3');
    });

    it('should log mathematical inconsistency anomaly', () => {
      const incidentId = AnomalyLogger.logMathematicalInconsistency(
        100000, // expected
        99950,  // actual
        'payout distribution',
        { 'player1': 50000, 'player2': 50000 },
        'test_hand_456'
      );

      expect(incidentId).toMatch(/^ANOMALY_\d+_\d{4}$/);

      // Verify log entry
      const logEntries = AnomalyLogger.readAnomalyLog();
      expect(logEntries).toHaveLength(1);

      const entry = logEntries[0];
      expect(entry.anomalyType).toBe('MATHEMATICAL_INCONSISTENCY');
      expect(entry.description).toContain('expected 100000, got 99950');
      expect(entry.handId).toBe('test_hand_456');
    });

    it('should append multiple anomalies to same log file', () => {
      // Log first anomaly
      const id1 = AnomalyLogger.logNoEligibleWinners(
        0, 100, ['player1'], { 'player1': 100 }, { 'player1': 'active' }
      );

      // Log second anomaly
      const id2 = AnomalyLogger.logMathematicalInconsistency(
        200, 150, 'test context', { 'player2': 200 }
      );

      // Verify both entries exist
      const logEntries = AnomalyLogger.readAnomalyLog();
      expect(logEntries).toHaveLength(2);

      const incidentIds = logEntries.map(entry => entry.incidentId);
      expect(incidentIds).toContain(id1);
      expect(incidentIds).toContain(id2);
    });
  });

  describe('File System Integration', () => {
    it('should create logs directory if it does not exist', () => {
      const logDir = SIDEPOT_CONFIG.ANOMALY_LOG_DIR;

      // Log an anomaly (this should create the directory)
      AnomalyLogger.logNoEligibleWinners(
        0, 100, ['test'], { 'test': 100 }, { 'test': 'active' }
      );

      // Verify log file exists
      const logFile = path.join(logDir, 'anomalies.log');
      expect(fs.existsSync(logFile)).toBe(true);
    });

    it('should handle missing log file gracefully when reading', () => {
      // Try to read from non-existent log
      const entries = AnomalyLogger.readAnomalyLog();
      expect(entries).toEqual([]);
    });

    it('should write valid JSON format', () => {
      AnomalyLogger.logNoEligibleWinners(
        2, 50000, ['playerA', 'playerB'],
        { 'playerA': 25000, 'playerB': 25000 },
        { 'playerA': 'active', 'playerB': 'folded' }
      );

      // Read raw file content and verify it's valid JSON
      const logDir = SIDEPOT_CONFIG.ANOMALY_LOG_DIR;
      const logFile = path.join(logDir, 'anomalies.log');
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n');

      expect(lines).toHaveLength(1);

      // Should parse as valid JSON
      const parsed = JSON.parse(lines[0]);
      expect(parsed.potIndex).toBe(2);
      expect(parsed.potAmountInCents).toBe(50000);
      expect(parsed.eligibleAtCreation).toEqual(['playerA', 'playerB']);
    });
  });

  describe('Incident ID Generation', () => {
    it('should generate unique incident IDs', () => {
      const id1 = AnomalyLogger.logNoEligibleWinners(
        0, 100, ['test1'], { 'test1': 100 }, { 'test1': 'active' }
      );

      const id2 = AnomalyLogger.logNoEligibleWinners(
        0, 100, ['test2'], { 'test2': 100 }, { 'test2': 'active' }
      );

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^ANOMALY_\d+_\d{4}$/);
      expect(id2).toMatch(/^ANOMALY_\d+_\d{4}$/);
    });

    it('should include timestamp in incident ID', () => {
      const beforeTime = Date.now();

      const incidentId = AnomalyLogger.logNoEligibleWinners(
        0, 100, ['test'], { 'test': 100 }, { 'test': 'active' }
      );

      const afterTime = Date.now();

      // Extract timestamp from incident ID
      const timestampMatch = incidentId.match(/^ANOMALY_(\d+)_\d{4}$/);
      expect(timestampMatch).not.toBeNull();

      const extractedTimestamp = parseInt(timestampMatch![1], 10);
      expect(extractedTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(extractedTimestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all provided data in log entry', () => {
      const testData = {
        potIndex: 5,
        potAmount: 123450,
        eligible: ['alpha', 'beta', 'gamma'],
        totalCommitted: { 'alpha': 40000, 'beta': 41150, 'gamma': 42300 },
        playerStatus: { 'alpha': 'all-in' as const, 'beta': 'active' as const, 'gamma': 'folded' as const },
        handId: 'complex_hand_789',
        fallbackWinner: 'alpha'
      };

      const incidentId = AnomalyLogger.logNoEligibleWinners(
        testData.potIndex,
        testData.potAmount,
        testData.eligible,
        testData.totalCommitted,
        testData.playerStatus,
        testData.handId,
        testData.fallbackWinner
      );

      const logEntries = AnomalyLogger.readAnomalyLog();
      const entry = logEntries[0];

      expect(entry.potIndex).toBe(testData.potIndex);
      expect(entry.potAmountInCents).toBe(testData.potAmount);
      expect(entry.eligibleAtCreation).toEqual(testData.eligible);
      expect(entry.totalCommittedMap).toEqual(testData.totalCommitted);
      expect(entry.playerStatusTimeline).toEqual(testData.playerStatus);
      expect(entry.handId).toBe(testData.handId);
      expect(entry.fallbackWinner).toBe(testData.fallbackWinner);
      expect(entry.incidentId).toBe(incidentId);
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});