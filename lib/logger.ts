type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogMessage {
  level: LogLevel
  message: string
  error?: Error
  context?: Record<string, any>
}

class Logger {
  private static instance: Logger
  private isDevelopment: boolean

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private log({ level, message, error, context }: LogMessage): void {
    if (!this.isDevelopment) return

    const timestamp = new Date().toISOString()
    const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : ''
    const errorStr = error
      ? `\nError: ${error.message}\nStack: ${error.stack}`
      : ''

    console[level](
      `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}${errorStr}`
    )
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log({ level: 'debug', message, context })
  }

  info(message: string, context?: Record<string, any>): void {
    this.log({ level: 'info', message, context })
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log({ level: 'warn', message, context })
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log({ level: 'error', message, error, context })
  }
}

export const logger = Logger.getInstance()
