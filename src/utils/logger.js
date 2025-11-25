/**
 * Comprehensive Frontend Logging Utility for Techspert
 * Provides structured logging with file, function, and component tracking
 */

class FrontendLogger {
  constructor(module = 'FRONTEND') {
    this.module = module
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
  }

  /**
   * Get caller information from stack trace
   */
  getCallerInfo() {
    if (!this.isDevelopment) return { file: 'unknown', function: 'unknown', line: 'unknown' }
    
    try {
      const stack = new Error().stack
      if (!stack) return { file: 'unknown', function: 'unknown', line: 'unknown' }
      
      const stackLines = stack.split('\n')
      // Skip Error, getCallerInfo, and the log method itself
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
    } catch (error) {
      // Silently fail if stack trace parsing fails
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
    if (!this.isDevelopment) return
    
    const formatted = this.formatMessage('DEBUG', message, data)
    console.log(
      `%c${formatted.prefix} ${formatted.location}`,
      'color: #00BCD4; font-weight: bold',
      formatted.message,
      formatted.data
    )
  }

  /**
   * Info log - for general information
   */
  info(message, data = {}) {
    if (!this.isDevelopment) return
    
    const formatted = this.formatMessage('INFO', message, data)
    console.log(
      `%c${formatted.prefix} ${formatted.location}`,
      'color: #4CAF50; font-weight: bold',
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
      `%c${formatted.prefix} ${formatted.location}`,
      'color: #FF9800; font-weight: bold',
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
      `%c${formatted.prefix} ${formatted.location}`,
      'color: #F44336; font-weight: bold',
      formatted.message,
      formatted.data
    )
    
    if (error && error.stack) {
      console.error('Stack Trace:', error.stack)
    }
    
    // Log failure analysis separately for visibility
    if (formatted.data.failureAnalysis) {
      console.error(
        '%cFailure Analysis:',
        'color: #F44336; font-weight: bold; font-size: 14px',
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
    if (error.name === 'TypeError') {
      analysis.potentialBreakage.push('Component may fail to render or display incorrect data')
      analysis.potentialBreakage.push('State updates may fail, causing UI inconsistencies')
      analysis.suggestedFix = 'Add null/undefined checks before accessing object properties'
    } else if (error.name === 'ReferenceError') {
      analysis.potentialBreakage.push('Component may crash completely')
      analysis.potentialBreakage.push('Related components may also fail')
      analysis.suggestedFix = 'Check imports and ensure all variables are properly declared'
    } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
      analysis.potentialBreakage.push('API calls may fail, causing data not to load')
      analysis.potentialBreakage.push('User actions may not be saved or processed')
      analysis.suggestedFix = 'Check network connectivity and API server status'
    } else if (error.response?.status === 401) {
      analysis.potentialBreakage.push('User may be logged out or redirected to login')
      analysis.potentialBreakage.push('Protected routes may become inaccessible')
      analysis.suggestedFix = 'Verify authentication token and refresh if expired'
    } else if (error.response?.status === 403) {
      analysis.potentialBreakage.push('User may be blocked from performing actions')
      analysis.potentialBreakage.push('Admin features may not be accessible')
      analysis.suggestedFix = 'Check user permissions and role assignments'
    } else if (error.response?.status === 404) {
      analysis.potentialBreakage.push('Data may not be displayed correctly')
      analysis.potentialBreakage.push('Navigation may fail to load pages')
      analysis.suggestedFix = 'Verify API endpoint exists and resource ID is correct'
    } else if (error.response?.status === 400) {
      analysis.potentialBreakage.push('Form submissions may fail validation')
      analysis.potentialBreakage.push('Data may not be saved to database')
      analysis.suggestedFix = 'Check form data format and required fields'
    } else if (error.response?.status >= 500) {
      analysis.potentialBreakage.push('Server operations may be completely unavailable')
      analysis.potentialBreakage.push('All API calls may fail')
      analysis.suggestedFix = 'Check server logs and database connectivity'
    }

    // Add context-specific breakage points
    if (context.component) {
      analysis.potentialBreakage.push(`Component '${context.component}' may not function correctly`)
    }
    if (context.apiCall) {
      analysis.potentialBreakage.push(`API call '${context.apiCall}' may need to be retried`)
    }

    return analysis
  }

  /**
   * Identify root cause of error
   */
  identifyRootCause(error) {
    if (!error) return 'Unknown error'
    
    if (error.name === 'TypeError') {
      return 'Type error - attempting to access property or method on undefined/null'
    } else if (error.name === 'ReferenceError') {
      return 'Reference error - variable or function not defined'
    } else if (error.name === 'SyntaxError') {
      return 'Syntax error - invalid JavaScript syntax'
    } else if (error.response) {
      const status = error.response.status
      if (status === 401) return 'Authentication failed - invalid or expired token'
      if (status === 403) return 'Authorization failed - insufficient permissions'
      if (status === 404) return 'Resource not found - endpoint or data does not exist'
      if (status === 400) return 'Bad request - invalid data format or missing required fields'
      if (status >= 500) return 'Server error - backend operation failed'
      return `HTTP error (${status}) - ${error.response.statusText || 'Unknown error'}`
    } else if (error.message?.includes('Network Error')) {
      return 'Network error - cannot reach server or connection lost'
    } else if (error.message?.includes('timeout')) {
      return 'Request timeout - operation took too long to complete'
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
      `%c${formatted.prefix} ${formatted.location}`,
      'color: #4CAF50; font-weight: bold',
      formatted.message,
      formatted.data
    )
  }

  /**
   * Function entry log
   */
  functionEntry(functionName, params = {}) {
    this.debug(`→ Function Entry: ${functionName}`, {
      function: functionName,
      params: this.sanitizeParams(params)
    })
  }

  /**
   * Function exit log
   */
  functionExit(functionName, result = null, duration = null) {
    this.debug(`← Function Exit: ${functionName}`, {
      function: functionName,
      result: this.sanitizeResult(result),
      duration: duration ? `${duration}ms` : null
    })
  }

  /**
   * Component mount log
   */
  componentMount(componentName, props = {}) {
    this.debug(`Component Mount: ${componentName}`, {
      component: componentName,
      props: this.sanitizeParams(props)
    })
  }

  /**
   * Component update log
   */
  componentUpdate(componentName, prevProps = {}, nextProps = {}) {
    this.debug(`Component Update: ${componentName}`, {
      component: componentName,
      prevProps: this.sanitizeParams(prevProps),
      nextProps: this.sanitizeParams(nextProps)
    })
  }

  /**
   * Component unmount log
   */
  componentUnmount(componentName) {
    this.debug(`Component Unmount: ${componentName}`, {
      component: componentName
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
    
    logMethod(`API Response: ${method} ${url} - ${status}`, null, {
      method,
      url,
      status,
      data: this.sanitizeResult(data),
      duration: duration ? `${duration}ms` : null
    })
  }

  /**
   * State change log
   */
  stateChange(componentName, stateKey, prevValue, nextValue) {
    this.debug(`State Change: ${componentName}.${stateKey}`, {
      component: componentName,
      stateKey,
      prevValue: this.sanitizeResult(prevValue),
      nextValue: this.sanitizeResult(nextValue)
    })
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
export const createLogger = (module) => new FrontendLogger(module)

// Default logger
export default new FrontendLogger('FRONTEND')

