/**
 * Centralized Error Handling System
 *
 * Provides typed errors, error codes, and severity levels for the Hand Analyzer.
 */

// Error codes with prefixes for easy categorization
export enum ErrorCode {
  // Parsing errors (PARSE_xxx)
  PARSE_INVALID_HEADER = 'PARSE_001',
  PARSE_MISSING_PLAYER = 'PARSE_002',
  PARSE_INVALID_TABLE = 'PARSE_003',
  PARSE_INVALID_ACTION = 'PARSE_004',
  PARSE_INVALID_CARD = 'PARSE_005',
  PARSE_MULTIPLE_HANDS = 'PARSE_006',
  PARSE_UNKNOWN_SITE = 'PARSE_007',
  PARSE_MALFORMED_LINE = 'PARSE_008',
  PARSE_MISSING_BLINDS = 'PARSE_009',
  PARSE_INVALID_AMOUNT = 'PARSE_010',

  // Snapshot building errors (SNAP_xxx)
  SNAPSHOT_INCONSISTENT_STACKS = 'SNAP_001',
  SNAPSHOT_INVALID_POT = 'SNAP_002',
  SNAPSHOT_MISSING_PLAYER = 'SNAP_003',
  SNAPSHOT_NEGATIVE_STACK = 'SNAP_004',
  SNAPSHOT_POT_MISMATCH = 'SNAP_005',
  SNAPSHOT_INVALID_ACTION = 'SNAP_006',

  // Validation errors (VAL_xxx)
  VALIDATION_MULTIPLE_HANDS = 'VAL_001',
  VALIDATION_EMPTY_INPUT = 'VAL_002',
  VALIDATION_INVALID_FORMAT = 'VAL_003',
  VALIDATION_MISSING_REQUIRED = 'VAL_004',

  // Mathematical errors (MATH_xxx)
  MATH_POT_INCONSISTENCY = 'MATH_001',
  MATH_STACK_INCONSISTENCY = 'MATH_002',
  MATH_NEGATIVE_VALUE = 'MATH_003',
  MATH_OVERFLOW = 'MATH_004',

  // System errors (SYS_xxx)
  SYSTEM_UNKNOWN = 'SYS_001',
  SYSTEM_NOT_IMPLEMENTED = 'SYS_002',
  SYSTEM_INTERNAL = 'SYS_003',
}

// Severity levels for errors
export enum ErrorSeverity {
  WARNING = 'warning',   // Non-critical, can continue
  ERROR = 'error',       // Blocking, cannot complete operation
  CRITICAL = 'critical', // Critical system error, should halt
}

// Main error interface
export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  severity: ErrorSeverity;
  isRecoverable: boolean;
  timestamp: Date;
  context?: string; // Where the error occurred
}

// Custom error classes for better error handling
export class ParseError extends Error implements AppError {
  code: ErrorCode;
  severity: ErrorSeverity;
  isRecoverable: boolean;
  timestamp: Date;
  context?: string;
  details?: Record<string, any>;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      details?: Record<string, any>;
      severity?: ErrorSeverity;
      isRecoverable?: boolean;
      context?: string;
    }
  ) {
    super(message);
    this.name = 'ParseError';
    this.code = code;
    this.message = message;
    this.details = options?.details;
    this.severity = options?.severity || ErrorSeverity.ERROR;
    this.isRecoverable = options?.isRecoverable ?? false;
    this.timestamp = new Date();
    this.context = options?.context;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParseError);
    }
  }

  toAppError(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      severity: this.severity,
      isRecoverable: this.isRecoverable,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

export class SnapshotBuildError extends Error implements AppError {
  code: ErrorCode;
  severity: ErrorSeverity;
  isRecoverable: boolean;
  timestamp: Date;
  context?: string;
  details?: Record<string, any>;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      details?: Record<string, any>;
      severity?: ErrorSeverity;
      isRecoverable?: boolean;
      context?: string;
    }
  ) {
    super(message);
    this.name = 'SnapshotBuildError';
    this.code = code;
    this.message = message;
    this.details = options?.details;
    this.severity = options?.severity || ErrorSeverity.ERROR;
    this.isRecoverable = options?.isRecoverable ?? false;
    this.timestamp = new Date();
    this.context = options?.context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SnapshotBuildError);
    }
  }

  toAppError(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      severity: this.severity,
      isRecoverable: this.isRecoverable,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

export class ValidationError extends Error implements AppError {
  code: ErrorCode;
  severity: ErrorSeverity;
  isRecoverable: boolean;
  timestamp: Date;
  context?: string;
  details?: Record<string, any>;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      details?: Record<string, any>;
      severity?: ErrorSeverity;
      isRecoverable?: boolean;
      context?: string;
    }
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.message = message;
    this.details = options?.details;
    this.severity = options?.severity || ErrorSeverity.ERROR;
    this.isRecoverable = options?.isRecoverable ?? false;
    this.timestamp = new Date();
    this.context = options?.context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  toAppError(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      severity: this.severity,
      isRecoverable: this.isRecoverable,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

// Helper type guards
export function isAppError(error: any): error is AppError {
  return (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    'severity' in error &&
    'isRecoverable' in error
  );
}

export function isParseError(error: any): error is ParseError {
  return error instanceof ParseError;
}

export function isSnapshotBuildError(error: any): error is SnapshotBuildError {
  return error instanceof SnapshotBuildError;
}

export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}
