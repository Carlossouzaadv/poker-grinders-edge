/**
 * Side Pot Configuration
 *
 * Controls behavior when anomalies are detected in side pot calculation
 */

export interface SidePotConfig {
  /**
   * Whether to allow fallback allocation when anomalies are detected
   *
   * false (default): Throw exception when anomaly detected (fail-fast)
   * true: Apply deterministic fallback and log as anomaly
   */
  ALLOW_FALLBACK_ON_ANOMALY: boolean;

  /**
   * Directory for anomaly logging
   */
  ANOMALY_LOG_DIR: string;
}

// Default configuration
export const DEFAULT_SIDEPOT_CONFIG: SidePotConfig = {
  ALLOW_FALLBACK_ON_ANOMALY: false,
  ANOMALY_LOG_DIR: './logs'
};

// Runtime configuration (can be overridden by environment variables)
export const SIDEPOT_CONFIG: SidePotConfig = {
  ALLOW_FALLBACK_ON_ANOMALY: process.env.ALLOW_FALLBACK_ON_ANOMALY === 'true' || DEFAULT_SIDEPOT_CONFIG.ALLOW_FALLBACK_ON_ANOMALY,
  ANOMALY_LOG_DIR: process.env.ANOMALY_LOG_DIR || DEFAULT_SIDEPOT_CONFIG.ANOMALY_LOG_DIR
};

/**
 * Check if fallback allocation is allowed when anomalies are detected
 */
export function isAnomalyFallbackAllowed(): boolean {
  return SIDEPOT_CONFIG.ALLOW_FALLBACK_ON_ANOMALY;
}

/**
 * Get the anomaly log directory
 */
export function getAnomalyLogDir(): string {
  return SIDEPOT_CONFIG.ANOMALY_LOG_DIR;
}