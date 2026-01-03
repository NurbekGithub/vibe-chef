export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export function log(level: LogLevel, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log(LogLevel.DEBUG, message, data),
  info: (message: string, data?: unknown) => log(LogLevel.INFO, message, data),
  warn: (message: string, data?: unknown) => log(LogLevel.WARN, message, data),
  error: (message: string, data?: unknown) => log(LogLevel.ERROR, message, data),
};
