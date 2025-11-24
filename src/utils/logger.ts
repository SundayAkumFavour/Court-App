import axios from 'axios';

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  timestamp: string;
  source: string;
}

class Logger {
  private static logToConsole(entry: LogEntry) {
    const { level, message, data, timestamp, source } = entry;
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${source}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'debug':
        console.debug(logMessage, data || '');
        break;
      default:
        console.log(logMessage, data || '');
    }
  }

  private static createEntry(
    level: LogEntry['level'],
    source: string,
    message: string,
    data?: any
  ): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source,
    };
  }

  static info(source: string, message: string, data?: any) {
    const entry = this.createEntry('info', source, message, data);
    this.logToConsole(entry);
  }

  static warn(source: string, message: string, data?: any) {
    const entry = this.createEntry('warn', source, message, data);
    this.logToConsole(entry);
  }

  static error(source: string, message: string, error?: any) {
    const entry = this.createEntry('error', source, message, {
      error: error?.message || error,
      stack: error?.stack,
      ...(typeof error === 'object' ? error : {}),
    });
    this.logToConsole(entry);
  }

  static debug(source: string, message: string, data?: any) {
    const entry = this.createEntry('debug', source, message, data);
    this.logToConsole(entry);
  }

  // Log network request
  static async logRequest(
    source: string,
    method: string,
    url: string,
    config?: any
  ) {
    this.debug(source, `HTTP ${method.toUpperCase()} ${url}`, {
      headers: config?.headers,
      params: config?.params,
      data: config?.data,
    });
  }

  // Log network response
  static logResponse(
    source: string,
    method: string,
    url: string,
    status: number,
    data?: any
  ) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this[level](source, `HTTP ${method.toUpperCase()} ${url} - ${status}`, data);
  }

  // Log network error
  static logNetworkError(
    source: string,
    method: string,
    url: string,
    error: any
  ) {
    this.error(source, `HTTP ${method.toUpperCase()} ${url} - Network Error`, {
      message: error?.message,
      code: error?.code,
      response: error?.response?.data,
      status: error?.response?.status,
    });
  }
}

export default Logger;

