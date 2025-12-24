/**
 * Centralized Logger Service
 * Provides consistent logging across the application with log levels,
 * environment-based configuration, and optional remote logging support.
 */

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

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '#9CA3AF',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
};

const LOG_LEVEL_ICONS: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
};

class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  private constructor() {
    const isDev = import.meta.env.DEV;
    
    this.config = {
      minLevel: isDev ? 'debug' : 'warn',
      enableConsole: true,
      enableRemote: !isDev,
      remoteEndpoint: import.meta.env.VITE_LOG_ENDPOINT,
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    };
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

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

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const color = LOG_LEVEL_COLORS[entry.level];
    const icon = LOG_LEVEL_ICONS[entry.level];
    const prefix = entry.context ? `[${entry.context}]` : '';
    
    const style = `color: ${color}; font-weight: bold;`;
    const resetStyle = 'color: inherit; font-weight: normal;';

    console.groupCollapsed(
      `%c${icon} ${entry.level.toUpperCase()}%c ${prefix} ${entry.message}`,
      style,
      resetStyle
    );
    
    console.log('Timestamp:', entry.timestamp);
    
    if (entry.data !== undefined) {
      console.log('Data:', entry.data);
    }
    
    if (entry.stack) {
      console.log('Stack:', entry.stack);
    }
    
    console.groupEnd();
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entry,
          appVersion: this.config.appVersion,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch {
      // Silently fail remote logging to avoid infinite loops
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift();
    }
  }

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
    
    if (level === 'error' || level === 'warn') {
      this.logToRemote(entry);
    }
  }

  public debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data);
  }

  public info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
  }

  public warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data);
  }

  public error(message: string, context?: string, error?: Error, data?: unknown): void {
    this.log('error', message, context, data, error);
  }

  public getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

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

class ScopedLogger {
  constructor(
    private logger: Logger,
    private context: string
  ) {}

  public debug(message: string, data?: unknown): void {
    this.logger.debug(message, this.context, data);
  }

  public info(message: string, data?: unknown): void {
    this.logger.info(message, this.context, data);
  }

  public warn(message: string, data?: unknown): void {
    this.logger.warn(message, this.context, data);
  }

  public error(message: string, error?: Error, data?: unknown): void {
    this.logger.error(message, this.context, error, data);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export for creating scoped loggers
export const createLogger = (context: string): ScopedLogger => {
  return logger.createScoped(context);
};

// Export types
export type { LogLevel, LogEntry, LoggerConfig, ScopedLogger };