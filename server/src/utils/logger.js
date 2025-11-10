/**
 * Comprehensive Logging Utility for Techspert
 * Provides structured logging with file, function, and line tracking
 */

class Logger {
  constructor(module = 'APP') {
    this.module = module
    this.colors = {
      DEBUG: '\x1b[36m',    // Cyan
      INFO: '\x1b[32m',     // Green
      WARN: '\x1b[33m',     // Yellow
      ERROR: '\x1b[31m',    // Red
      RESET: '\x1b[0m'      // Reset
    }
  }

  /**
   * Get caller information from stack trace
   */
  getCallerInfo() {
    const stack = new Error().stack
    if (!stack) return { file: 'unknown', function: 'unknown', line: 'unknown' }
    
    const stackLines = stack.split('\n')
    // Skip Error, getCallerInfo, and the log method itself (usually index 3 or 4)
    const callerLine = stackLines[4] || stackLines[3] || stackLines[2] || ''
    
    // Extract file, function, and line from stack trace
    const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) || 
                  callerLine.match(/at\s+(.+?):(\d+):(\d+)/)
    
    if (match) {
      const filePath = match[2] || match[1] || 'unknown'
      const fileName = filePath.split(/[/\\]/).pop() || 'unknown'
      const functionName = match[1]?.split('.').pop() || 'anonymous'
      const line = match[3] || match[2] || 'unknown'
      
      return {
        file: fileName,
        fullPath: filePath,
        function: functionName,
        line: line
      }
    }
    
    return { file: 'unknown', function: 'unknown', line: 'unknown' }
  }

  /**
   * Format log message with context
   */
  formatMessage(level, message, data = {}) {
    const caller = this.getCallerInfo()
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${this.module}] [${level}]`
    const location = `${caller.file}:${caller.function}:${caller.line}`
    
    return {
      prefix,
      location,
      message,
      data: {
        ...data,
        _caller: {
          file: caller.file,
          fullPath: caller.fullPath,
          function: caller.function,
          line: caller.line
        }
      }
    }
  }

  /**
   * Debug log - for detailed debugging information
   */
  debug(message, data = {}) {
    const formatted = this.formatMessage('DEBUG', message, data)
    console.log(
      `${this.colors.DEBUG}${formatted.prefix} ${formatted.location}${this.colors.RESET}`,
      formatted.message,
      formatted.data
    )
  }

  /**
   * Info log - for general information
   */
  info(message, data = {}) {
    const formatted = this.formatMessage('INFO', message, data)
    console.log(
      `${this.colors.INFO}${formatted.prefix} ${formatted.location}${this.colors.RESET}`,
      formatted.message,
      formatted.data
    )
  }

  /**
   * Warn log - for warnings
   */
  warn(message, data = {}) {
    const formatted = this.formatMessage('WARN', message, data)
    console.warn(
      `${this.colors.WARN}${formatted.prefix} ${formatted.location}${this.colors.RESET}`,
      formatted.message,
      formatted.data
    )
  }

  /**
   * Error log - for errors with full stack trace and failure analysis
   */
  error(message, error = null, data = {}) {
    const caller = this.getCallerInfo()
    const formatted = this.formatMessage('ERROR', message, {
      ...data,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      } : null,
      failureAnalysis: this.analyzeFailure(error, caller, data)
    })
    
    console.error(
      `${this.colors.ERROR}${formatted.prefix} ${formatted.location}${this.colors.RESET}`,
      formatted.message,
      formatted.data
    )
    
    if (error && error.stack) {
      console.error(`${this.colors.ERROR}Stack Trace:${this.colors.RESET}`, error.stack)
    }
    
    // Log failure analysis separately for visibility
    if (formatted.data.failureAnalysis) {
      console.error(
        `${this.colors.ERROR}Failure Analysis:${this.colors.RESET}`,
        formatted.data.failureAnalysis
      )
    }
  }

  /**
   * Analyze failure and identify potential breakage points
   */
  analyzeFailure(error, caller, context = {}) {
    if (!error) return null
    
    const analysis = {
      rootCause: this.identifyRootCause(error),
      errorLocation: {
        file: caller.file,
        function: caller.function,
        line: caller.line
      },
      errorType: error.name || 'Unknown',
      errorMessage: error.message,
      potentialBreakage: [],
      suggestedFix: null
    }

    // Identify potential breakage points based on error type
    if (error.name === 'ValidationError') {
      analysis.potentialBreakage.push('Data validation may fail in dependent operations')
      analysis.potentialBreakage.push('Database save operations may be blocked')
      analysis.suggestedFix = 'Check validation rules and ensure all required fields are provided'
    } else if (error.name === 'CastError') {
      analysis.potentialBreakage.push('Database queries may fail with invalid IDs')
      analysis.potentialBreakage.push('Related data lookups may return null/undefined')
      analysis.suggestedFix = 'Verify ID format and ensure object exists in database'
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      analysis.potentialBreakage.push('Duplicate entries may cause data inconsistency')
      analysis.potentialBreakage.push('Unique constraint violations may block operations')
      analysis.suggestedFix = 'Check for existing records with same unique field value'
    } else if (error.message?.includes('not found')) {
      analysis.potentialBreakage.push('Null reference errors may occur in dependent code')
      analysis.potentialBreakage.push('UI may display empty or broken state')
      analysis.suggestedFix = 'Add null checks and fallback values before accessing properties'
    } else if (error.message?.includes('unauthorized') || error.message?.includes('forbidden')) {
      analysis.potentialBreakage.push('User may be redirected or blocked from accessing resources')
      analysis.potentialBreakage.push('API calls may fail with 401/403 errors')
      analysis.suggestedFix = 'Verify authentication token and user permissions'
    } else if (error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
      analysis.potentialBreakage.push('Database operations may fail completely')
      analysis.potentialBreakage.push('API endpoints may become unresponsive')
      analysis.suggestedFix = 'Check database connection and network connectivity'
    }

    // Add context-specific breakage points
    if (context.operation) {
      analysis.potentialBreakage.push(`Operation '${context.operation}' may not complete successfully`)
    }
    if (context.model) {
      analysis.potentialBreakage.push(`Model '${context.model}' operations may be affected`)
    }

    return analysis
  }

  /**
   * Identify root cause of error
   */
  identifyRootCause(error) {
    if (!error) return 'Unknown error'
    
    if (error.name === 'ValidationError') {
      return 'Data validation failed - required fields missing or invalid format'
    } else if (error.name === 'CastError') {
      return 'Invalid data type or format - cannot cast to expected type'
    } else if (error.name === 'MongoServerError') {
      if (error.code === 11000) return 'Duplicate key error - unique constraint violation'
      return `Database server error (code: ${error.code})`
    } else if (error.name === 'MongooseError') {
      return 'Mongoose operation failed - check database connection and query syntax'
    } else if (error.message?.includes('not found')) {
      return 'Resource not found - requested entity does not exist'
    } else if (error.message?.includes('unauthorized')) {
      return 'Authentication failed - invalid or missing credentials'
    } else if (error.message?.includes('forbidden')) {
      return 'Authorization failed - insufficient permissions'
    } else if (error.message?.includes('timeout')) {
      return 'Operation timeout - request took too long to complete'
    } else if (error.message?.includes('ECONNREFUSED')) {
      return 'Connection refused - service unavailable or network issue'
    }
    
    return error.message || 'Unknown error occurred'
  }

  /**
   * Success log - for successful operations with details
   */
  success(message, data = {}) {
    const formatted = this.formatMessage('SUCCESS', message, {
      ...data,
      status: 'success',
      timestamp: new Date().toISOString()
    })
    
    console.log(
      `${this.colors.INFO}${formatted.prefix} ${formatted.location}${this.colors.RESET}`,
      formatted.message,
      formatted.data
    )
  }

  /**
   * Function entry log
   */
  functionEntry(functionName, params = {}) {
    const caller = this.getCallerInfo()
    this.debug(`→ Function Entry: ${functionName}`, {
      function: functionName,
      params: this.sanitizeParams(params),
      entryPoint: caller
    })
  }

  /**
   * Function exit log
   */
  functionExit(functionName, result = null, duration = null) {
    const caller = this.getCallerInfo()
    this.debug(`← Function Exit: ${functionName}`, {
      function: functionName,
      result: this.sanitizeResult(result),
      duration: duration ? `${duration}ms` : null,
      exitPoint: caller
    })
  }

  /**
   * API request log
   */
  apiRequest(method, url, data = {}) {
    this.info(`API Request: ${method} ${url}`, {
      method,
      url,
      data: this.sanitizeParams(data),
      timestamp: new Date().toISOString()
    })
  }

  /**
   * API response log
   */
  apiResponse(method, url, status, data = {}, duration = null) {
    const level = status >= 400 ? 'error' : 'info'
    const logMethod = level === 'error' ? this.error.bind(this) : this.info.bind(this)
    
    logMethod(`API Response: ${method} ${url} - ${status}`, {
      method,
      url,
      status,
      data: this.sanitizeResult(data),
      duration: duration ? `${duration}ms` : null
    })
  }

  /**
   * Database operation log
   */
  dbOperation(operation, model, query = {}, result = null, error = null) {
    if (error) {
      this.error(`DB ${operation} failed: ${model}`, error, {
        operation,
        model,
        query: this.sanitizeParams(query)
      })
    } else {
      this.debug(`DB ${operation}: ${model}`, {
        operation,
        model,
        query: this.sanitizeParams(query),
        resultCount: Array.isArray(result) ? result.length : result ? 1 : 0
      })
    }
  }

  /**
   * Sanitize parameters (remove sensitive data)
   */
  sanitizeParams(params) {
    if (!params || typeof params !== 'object') return params
    
    const sensitive = ['password', 'token', 'secret', 'authorization', 'auth', 'creditCard', 'cvv']
    const sanitized = { ...params }
    
    for (const key in sanitized) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeParams(sanitized[key])
      }
    }
    
    return sanitized
  }

  /**
   * Sanitize result (remove sensitive data)
   */
  sanitizeResult(result) {
    if (!result) return result
    if (typeof result === 'string' && result.length > 500) {
      return result.substring(0, 500) + '... [truncated]'
    }
    return this.sanitizeParams(result)
  }
}

// Create module-specific loggers
export const createLogger = (module) => new Logger(module)

// Default logger
export default new Logger('APP')

