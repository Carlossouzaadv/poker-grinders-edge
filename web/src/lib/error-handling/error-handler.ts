/**
 * Centralized Error Handler
 *
 * Handles, logs, and converts errors to AppError format.
 * Integrates with AnomalyLogger for critical errors.
 */

import {
  AppError,
  ErrorCode,
  ErrorSeverity,
  ParseError,
  SnapshotBuildError,
  ValidationError,
  isAppError,
} from '@/types/errors';
import { AnomalyLogger } from '../anomaly-logger';

interface ErrorHandlerOptions {
  logToConsole?: boolean;
  logToFile?: boolean;
  notifyUser?: boolean;
}

export class ErrorHandler {
  private static defaultOptions: ErrorHandlerOptions = {
    logToConsole: true,
    logToFile: true,
    notifyUser: false,
  };

  /**
   * Main error handling method
   * Converts any error to AppError and handles it appropriately
   */
  static handle(
    error: Error | AppError | unknown,
    context: string,
    data?: Record<string, any>,
    options?: ErrorHandlerOptions
  ): AppError {
    const opts = { ...this.defaultOptions, ...options };

    // Convert to AppError if not already
    let appError: AppError;

    if (isAppError(error)) {
      appError = error;
    } else if (error instanceof ParseError || error instanceof SnapshotBuildError || error instanceof ValidationError) {
      appError = error.toAppError();
    } else if (error instanceof Error) {
      // Standard JavaScript error
      appError = {
        code: ErrorCode.SYSTEM_UNKNOWN,
        message: error.message,
        details: {
          ...data,
          stack: error.stack,
        },
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context,
      };
    } else {
      // Unknown error type
      appError = {
        code: ErrorCode.SYSTEM_UNKNOWN,
        message: String(error),
        details: data,
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context,
      };
    }

    // Update context if provided
    if (context && !appError.context) {
      appError.context = context;
    }

    // Add additional data
    if (data && appError.details) {
      appError.details = { ...appError.details, ...data };
    }

    // Log the error
    if (opts.logToConsole) {
      this.log(appError);
    }

    // Log critical errors to anomaly log
    if (opts.logToFile && appError.severity === ErrorSeverity.CRITICAL) {
      this.logCritical(appError);
    }

    return appError;
  }

  /**
   * Log error to console with appropriate formatting
   */
  static log(appError: AppError): void {
    const emoji = this.getEmojiForSeverity(appError.severity);
    const timestamp = appError.timestamp.toISOString();

    console.error(`${emoji} [${appError.severity.toUpperCase()}] ${appError.code} - ${timestamp}`);
    console.error(`   Context: ${appError.context || 'N/A'}`);
    console.error(`   Message: ${appError.message}`);
    console.error(`   Recoverable: ${appError.isRecoverable ? 'Yes' : 'No'}`);

    if (appError.details) {
      console.error(`   Details:`, appError.details);
    }
  }

  /**
   * Log critical errors to anomaly logger
   */
  private static async logCritical(appError: AppError): Promise<void> {
    try {
      await AnomalyLogger.logAnomaly({
        potIndex: -1,
        potAmountInCents: 0,
        eligibleAtCreation: [],
        totalCommittedMap: {},
        playerStatusTimeline: {},
        anomalyType: 'MATHEMATICAL_INCONSISTENCY',
        description: `CRITICAL ERROR: ${appError.code} - ${appError.message}`,
        fallbackAction: appError.isRecoverable ? 'Recovery attempted' : 'Operation failed',
        guardContext: {
          code: appError.code,
          context: appError.context,
          details: appError.details,
        },
        guardSeverity: appError.severity,
      });
    } catch (error) {
      console.error('Failed to log critical error to anomaly logger:', error);
    }
  }

  /**
   * Get emoji for severity level
   */
  private static getEmojiForSeverity(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.WARNING:
        return '⚠️';
      case ErrorSeverity.ERROR:
        return '❌';
      case ErrorSeverity.CRITICAL:
        return '🔥';
      default:
        return '❓';
    }
  }

  /**
   * Create a user-friendly error message
   */
  static getUserMessage(appError: AppError): string {
    // Map error codes to user-friendly messages
    const userMessages: Partial<Record<ErrorCode, string>> = {
      [ErrorCode.PARSE_INVALID_HEADER]: 'O formato do histórico de mão não foi reconhecido. Verifique se copiou corretamente do site de poker.',
      [ErrorCode.PARSE_MULTIPLE_HANDS]: 'Você colou múltiplas mãos. Por favor, cole apenas uma mão por vez.',
      [ErrorCode.PARSE_UNKNOWN_SITE]: 'Site de poker não suportado. Sites suportados: PokerStars, GGPoker, PartyPoker.',
      [ErrorCode.VALIDATION_EMPTY_INPUT]: 'Por favor, cole o histórico da mão.',
      [ErrorCode.SNAPSHOT_INCONSISTENT_STACKS]: 'Erro ao calcular os stacks dos jogadores. O histórico pode estar incompleto.',
      [ErrorCode.SNAPSHOT_POT_MISMATCH]: 'Erro ao calcular o pote. O histórico pode estar incompleto.',
      [ErrorCode.MATH_POT_INCONSISTENCY]: 'Erro matemático ao calcular o pote. Por favor, reporte este problema.',
    };

    return userMessages[appError.code] || appError.message;
  }

  /**
   * Format error for API response
   */
  static toApiResponse(appError: AppError): {
    success: false;
    error: {
      code: string;
      message: string;
      severity: string;
      recoverable: boolean;
    };
  } {
    return {
      success: false,
      error: {
        code: appError.code,
        message: this.getUserMessage(appError),
        severity: appError.severity,
        recoverable: appError.isRecoverable,
      },
    };
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverable(error: AppError | Error | unknown): boolean {
    if (isAppError(error)) {
      return error.isRecoverable;
    }
    return false;
  }

  /**
   * Create a ParseError
   */
  static createParseError(
    code: ErrorCode,
    message: string,
    options?: {
      details?: Record<string, any>;
      severity?: ErrorSeverity;
      isRecoverable?: boolean;
      context?: string;
    }
  ): ParseError {
    return new ParseError(code, message, options);
  }

  /**
   * Create a SnapshotBuildError
   */
  static createSnapshotError(
    code: ErrorCode,
    message: string,
    options?: {
      details?: Record<string, any>;
      severity?: ErrorSeverity;
      isRecoverable?: boolean;
      context?: string;
    }
  ): SnapshotBuildError {
    return new SnapshotBuildError(code, message, options);
  }

  /**
   * Create a ValidationError
   */
  static createValidationError(
    code: ErrorCode,
    message: string,
    options?: {
      details?: Record<string, any>;
      severity?: ErrorSeverity;
      isRecoverable?: boolean;
      context?: string;
    }
  ): ValidationError {
    return new ValidationError(code, message, options);
  }
}
