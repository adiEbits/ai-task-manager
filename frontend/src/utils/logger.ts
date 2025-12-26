/**
 * Centralized Logger Service
 * Provides consistent logging across the application with log levels,
 * environment-based configuration, and structured output.
 * 
 * @module utils/logger
 */

// ============================================
// Types
// ============================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  stack?: string;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  appVersion: string;
}

// ============================================
// Constants
// ============================================

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL_STYLES: Record<LogLevel, { color: string; bgColor: string; icon: string }> = {
  debug: { color: '#9CA3AF', bgColor: '#F3F4F6', icon: '🔍' },
  info: { color: '#3B82F6', bgColor: '#EFF6FF', icon: 'ℹ️' },
  warn: { color: '#F59E0B', bgColor: '#FFFBEB', icon: '⚠️' },
  error: { color: '#EF4444', bgColor: '#FEF2F2', icon: '❌' },
};

// ============================================
// Logger Class
// ============================================

class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  private constructor() {
    const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
    
    this.config = {
      minLevel: isDev ? 'debug' : 'warn',
      enableConsole: true,
      enableRemote: !isDev,
      remoteEndpoint: typeof import.meta !== 'undefined' 
        ? import.meta.env?.VITE_LOG_ENDPOINT 
        : undefined,
      appVersion: typeof import.meta !== 'undefined' 
        ? (import.meta.env?.VITE_APP_VERSION ?? '1.0.0')
        : '1.0.0',
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Update logger configuration
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
  }

  /**
   * Format ISO timestamp
   */
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Create log entry object
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: this.formatTimestamp(),
      context,
      data,
      stack: error?.stack,
    };
  }

  /**
   * Log to browser console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const { color, icon } = LOG_LEVEL_STYLES[entry.level];
    const prefix = entry.context ? `[${entry.context}]` : '';
    const time = new Date(entry.timestamp).toLocaleTimeString();
    
    // Styled console output
    const labelStyle = `
      color: ${color};
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
    `;
    const contextStyle = 'color: #6B7280; font-weight: 500;';
    const messageStyle = 'color: inherit;';
    const timeStyle = 'color: #9CA3AF; font-size: 11px;';

    // Build console args
    const consoleArgs: unknown[] = [
      `%c${icon} ${entry.level.toUpperCase()}%c ${prefix}%c ${entry.message} %c${time}`,
      labelStyle,
      contextStyle,
      messageStyle,
      timeStyle,
    ];

    // Use appropriate console method
    const consoleMethod = entry.level === 'error' 
      ? console.error 
      : entry.level === 'warn' 
        ? console.warn 
        : entry.level === 'debug'
          ? console.debug
          : console.log;

    // Log with grouping for data/stack
    if (entry.data !== undefined || entry.stack) {
      console.groupCollapsed(...consoleArgs);
      
      if (entry.data !== undefined) {
        console.log('%cData:', 'color: #6B7280; font-weight: bold;', entry.data);
      }
      
      if (entry.stack) {
        console.log('%cStack:', 'color: #EF4444; font-weight: bold;', entry.stack);
      }
      
      console.groupEnd();
    } else {
      consoleMethod(...consoleArgs);
    }
  }

  /**
   * Log to remote endpoint (for production error tracking)
   */
  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entry,
          appVersion: this.config.appVersion,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        }),
      });
    } catch {
      // Silently fail remote logging to avoid infinite loops
    }
  }

  /**
   * Add entry to buffer for debugging
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift();
    }
  }

  /**
   * Main logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, data, error);
    
    this.addToBuffer(entry);
    this.logToConsole(entry);
    
    // Only send errors and warnings to remote
    if (level === 'error' || level === 'warn') {
      this.logToRemote(entry);
    }
  }

  /**
   * Debug level log
   */
  public debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data);
  }

  /**
   * Info level log
   */
  public info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
  }

  /**
   * Warning level log
   */
  public warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data);
  }

  /**
   * Error level log
   */
  public error(message: string, context?: string, error?: Error, data?: unknown): void {
    this.log('error', message, context, data, error);
  }

  /**
   * Get log buffer for debugging
   */
  public getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  public clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Create a scoped logger for a specific context (component/service)
   */
  public createScoped(context: string): ScopedLogger {
    return new ScopedLogger(this, context);
  }
}

// ============================================
// Scoped Logger Class
// ============================================

/**
 * Scoped logger for specific components/services
 * Automatically includes context in all log messages
 */
class ScopedLogger {
  constructor(
    private logger: Logger,
    private context: string
  ) {}

  /**
   * Debug level log
   */
  public debug(message: string, data?: unknown): void {
    this.logger.debug(message, this.context, data);
  }

  /**
   * Info level log
   */
  public info(message: string, data?: unknown): void {
    this.logger.info(message, this.context, data);
  }

  /**
   * Warning level log
   */
  public warn(message: string, data?: unknown): void {
    this.logger.warn(message, this.context, data);
  }

  /**
   * Error level log
   */
  public error(message: string, error?: Error, data?: unknown): void {
    this.logger.error(message, this.context, error, data);
  }
}

// ============================================
// Exports
// ============================================

/** Logger singleton instance */
export const logger = Logger.getInstance();

/**
 * Create a scoped logger for a specific context
 * 
 * @example
 * const logger = createLogger('TaskService');
 * logger.info('Task created', { taskId: '123' });
 * logger.error('Failed to create task', error, { data });
 */
export const createLogger = (context: string): ScopedLogger => {
  return logger.createScoped(context);
};

// Export types
export type { LogLevel, LogEntry, LoggerConfig, ScopedLogger };