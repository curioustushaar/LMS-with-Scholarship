/**
 * Secure Logger Utility
 * Only logs in development mode, completely silent in production
 * Prevents sensitive data exposure in browser console
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isServer = typeof window === 'undefined'

/**
 * Sanitize data to remove sensitive information
 */
function sanitize(data: any): any {
  if (!data || typeof data !== 'object') return data
  
  const sanitized = { ...data }
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key', 'Authorization', 'authorization']
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      sanitized[key] = '***REDACTED***'
    }
  }
  
  return sanitized
}

export const logger = {
  /**
   * Info level logging - only in development
   */
  info: (...args: any[]) => {
    if (isDevelopment && isServer) {
      console.log('[INFO]', ...args.map(sanitize))
    }
  },

  /**
   * Warning level logging - only in development
   */
  warn: (...args: any[]) => {
    if (isDevelopment && isServer) {
      console.warn('[WARN]', ...args.map(sanitize))
    }
  },

  /**
   * Error level logging - logs in production but sanitized
   */
  error: (...args: any[]) => {
    if (isServer) {
      // In production, only log error messages, not full objects
      if (isDevelopment) {
        console.error('[ERROR]', ...args.map(sanitize))
      } else {
        // In production, log minimal info
        console.error('[ERROR]', 'An error occurred')
      }
    }
  },

  /**
   * Debug level logging - only in development
   */
  debug: (...args: any[]) => {
    if (isDevelopment && isServer) {
      console.debug('[DEBUG]', ...args.map(sanitize))
    }
  }
}

/**
 * Client-side logger - never logs sensitive data
 */
export const clientLogger = {
  info: (...args: any[]) => {
    // Client logs are completely silent in production
    if (isDevelopment) {
      console.log('[CLIENT]', ...args)
    }
  },
  
  error: (message: string) => {
    // Only log generic error messages on client
    if (isDevelopment) {
      console.error('[CLIENT ERROR]', message)
    }
  }
}
