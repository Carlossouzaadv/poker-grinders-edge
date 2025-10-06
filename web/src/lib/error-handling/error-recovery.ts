/**
 * Error Recovery Strategies
 *
 * Implements recovery strategies for different types of errors.
 * Attempts "best effort" parsing and graceful degradation.
 */

import { AppError, ErrorSeverity } from '@/types/errors';
import { ErrorHandler } from './error-handler';

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  errors: AppError[];
  warnings: AppError[];
  recovered: boolean; // True if recovery was applied
}

export class ErrorRecovery {
  /**
   * Attempt to recover from a parsing error
   * Returns partial results with warnings if possible
   */
  static attemptParseRecovery<T>(
    error: AppError,
    partialData?: T
  ): RecoveryResult<T> {
    const warnings: AppError[] = [];
    const errors: AppError[] = [];

    // Determine if we can recover
    if (!error.isRecoverable) {
      errors.push(error);
      return {
        success: false,
        errors,
        warnings,
        recovered: false,
      };
    }

    // Downgrade error to warning if we have partial data
    if (partialData) {
      warnings.push({
        ...error,
        severity: ErrorSeverity.WARNING,
      });

      return {
        success: true,
        data: partialData,
        errors: [],
        warnings,
        recovered: true,
      };
    }

    // No recovery possible
    errors.push(error);
    return {
      success: false,
      errors,
      warnings,
      recovered: false,
    };
  }

  /**
   * Collect multiple errors and warnings
   * Determines overall success based on critical errors
   */
  static collectResults<T>(
    data: T | undefined,
    errors: AppError[],
    warnings: AppError[]
  ): RecoveryResult<T> {
    // Check if any critical or blocking errors exist
    const criticalErrors = errors.filter(
      (e) => e.severity === ErrorSeverity.CRITICAL || e.severity === ErrorSeverity.ERROR
    );

    if (criticalErrors.length > 0) {
      return {
        success: false,
        data,
        errors,
        warnings,
        recovered: false,
      };
    }

    // Only warnings or no errors
    return {
      success: true,
      data,
      errors: [],
      warnings,
      recovered: warnings.length > 0,
    };
  }

  /**
   * Try multiple recovery strategies in order
   */
  static async tryStrategies<T>(
    strategies: Array<() => Promise<RecoveryResult<T>>>
  ): Promise<RecoveryResult<T>> {
    const allWarnings: AppError[] = [];
    const allErrors: AppError[] = [];

    for (const strategy of strategies) {
      try {
        const result = await strategy();

        // If successful, return with accumulated warnings
        if (result.success) {
          return {
            ...result,
            warnings: [...allWarnings, ...result.warnings],
          };
        }

        // Accumulate errors and warnings
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      } catch (error) {
        const appError = ErrorHandler.handle(
          error,
          'ErrorRecovery.tryStrategies',
          undefined,
          { logToConsole: false }
        );
        allErrors.push(appError);
      }
    }

    // All strategies failed
    return {
      success: false,
      errors: allErrors,
      warnings: allWarnings,
      recovered: false,
    };
  }

  /**
   * Skip malformed line and continue parsing
   */
  static skipLine(
    line: string,
    lineNumber: number,
    context: string
  ): AppError {
    return {
      code: 'PARSE_008' as any, // PARSE_MALFORMED_LINE
      message: `Linha malformada ignorada: "${line.substring(0, 50)}..."`,
      details: {
        lineNumber,
        line,
      },
      severity: ErrorSeverity.WARNING,
      isRecoverable: true,
      timestamp: new Date(),
      context,
    };
  }

  /**
   * Use default value when parsing fails
   */
  static useDefault<T>(
    defaultValue: T,
    field: string,
    context: string
  ): { value: T; warning: AppError } {
    const warning: AppError = {
      code: 'PARSE_004' as any, // PARSE_INVALID_ACTION
      message: `Usando valor padrão para ${field}`,
      details: {
        field,
        defaultValue,
      },
      severity: ErrorSeverity.WARNING,
      isRecoverable: true,
      timestamp: new Date(),
      context,
    };

    return { value: defaultValue, warning };
  }

  /**
   * Best effort parsing: try to extract what we can
   */
  static bestEffort<T>(
    partialData: Partial<T>,
    requiredFields: (keyof T)[],
    context: string
  ): RecoveryResult<T | Partial<T>> {
    const warnings: AppError[] = [];
    const errors: AppError[] = [];

    // Check which required fields are missing
    const missingFields = requiredFields.filter(
      (field) => partialData[field] === undefined || partialData[field] === null
    );

    if (missingFields.length > 0) {
      const warning: AppError = {
        code: 'VALIDATION_MISSING_REQUIRED' as any,
        message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
        details: {
          missingFields,
          partialData,
        },
        severity: ErrorSeverity.WARNING,
        isRecoverable: true,
        timestamp: new Date(),
        context,
      };
      warnings.push(warning);
    }

    // Return partial data with warnings
    return {
      success: missingFields.length === 0,
      data: partialData as any,
      errors,
      warnings,
      recovered: warnings.length > 0,
    };
  }
}
