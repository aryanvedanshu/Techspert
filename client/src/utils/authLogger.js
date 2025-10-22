// Frontend Authentication Logger
class FrontendAuthLogger {
  constructor() {
    this.startTime = Date.now()
    this.sessionId = `frontend_${this.startTime}_${Math.random().toString(36).substr(2, 9)}`
    this.logs = []
    this.maxLogs = 1000 // Keep last 1000 logs in memory
    
    // Log session start
    this.info('FrontendAuthLogger', 'constructor', `Frontend authentication logging session started`, {
      sessionId: this.sessionId,
      startTime: new Date(this.startTime).toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }

  // Helper function to format timestamp
  getTimestamp() {
    return new Date().toISOString()
  }

  // Helper function to format log entry
  formatLogEntry(level, component, functionName, message, data = null) {
    const timestamp = this.getTimestamp()
    return {
      timestamp,
      level,
      component,
      function: functionName,
      message,
      data,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    }
  }

  // Add log to memory and console
  addLog(logEntry) {
    this.logs.push(logEntry)
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
    
    // Console output with color coding
    const timestamp = new Date().toLocaleTimeString()
    const prefix = `[${timestamp}] [AUTH-${logEntry.level}] ${logEntry.component}.${logEntry.function}`
    
    switch (logEntry.level) {
      case 'ERROR':
        console.error(`${prefix}: ${logEntry.message}`, logEntry.data || '')
        break
      case 'WARN':
        console.warn(`${prefix}: ${logEntry.message}`, logEntry.data || '')
        break
      case 'DEBUG':
        console.log(`%c${prefix}: ${logEntry.message}`, 'color: #888', logEntry.data || '')
        break
      default:
        console.log(`${prefix}: ${logEntry.message}`, logEntry.data || '')
    }
  }

  // Log authentication attempts
  loginAttempt(email, isAdmin = false) {
    this.info('FrontendAuthLogger', 'loginAttempt', `Login attempt initiated`, {
      email,
      isAdmin,
      sessionId: this.sessionId,
      timestamp: this.getTimestamp()
    })
  }

  // Log successful login
  loginSuccess(email, userData, tokens) {
    this.info('FrontendAuthLogger', 'loginSuccess', `Login successful`, {
      email,
      userId: userData?.id,
      role: userData?.role,
      hasAccessToken: !!tokens?.accessToken,
      hasRefreshToken: !!tokens?.refreshToken,
      sessionId: this.sessionId,
      timestamp: this.getTimestamp()
    })
  }

  // Log login failure
  loginFailure(email, reason, error = null) {
    this.error('FrontendAuthLogger', 'loginFailure', `Login failed: ${reason}`, {
      email,
      reason,
      error: error?.message || error,
      sessionId: this.sessionId,
      timestamp: this.getTimestamp()
    })
  }

  // Log token verification
  tokenVerification(success, error = null) {
    if (success) {
      this.info('FrontendAuthLogger', 'tokenVerification', `Token verification successful`)
    } else {
      this.error('FrontendAuthLogger', 'tokenVerification', `Token verification failed`, {
        error: error?.message || error
      })
    }
  }

  // Log API requests
  apiRequest(method, url, headers, body = null) {
    this.info('FrontendAuthLogger', 'apiRequest', `API request made`, {
      method,
      url,
      hasAuthHeader: !!headers?.authorization,
      hasBody: !!body
    })
  }

  // Log API responses
  apiResponse(method, url, status, responseTime, error = null) {
    if (status >= 200 && status < 300) {
      this.info('FrontendAuthLogger', 'apiResponse', `API response successful`, {
        method,
        url,
        status,
        responseTime
      })
    } else {
      this.error('FrontendAuthLogger', 'apiResponse', `API response failed`, {
        method,
        url,
        status,
        responseTime,
        error: error?.message || error
      })
    }
  }

  // Log authentication state changes
  authStateChange(component, state, data = null) {
    this.info('FrontendAuthLogger', 'authStateChange', `Auth state changed in ${component}`, {
      component,
      state,
      data
    })
  }

  // Log redirects
  redirect(from, to, reason) {
    this.info('FrontendAuthLogger', 'redirect', `Redirect triggered`, {
      from,
      to,
      reason
    })
  }

  // Log localStorage operations
  localStorageOperation(operation, key, value = null) {
    this.info('FrontendAuthLogger', 'localStorageOperation', `localStorage ${operation}`, {
      operation,
      key,
      hasValue: !!value
    })
  }

  // Log component lifecycle
  componentLifecycle(component, lifecycle, props = null) {
    this.debug('FrontendAuthLogger', 'componentLifecycle', `Component ${lifecycle}`, {
      component,
      lifecycle,
      props
    })
  }

  // Log route changes
  routeChange(from, to) {
    this.info('FrontendAuthLogger', 'routeChange', `Route changed`, {
      from,
      to
    })
  }

  // Standard logging methods
  info(component, functionName, message, data = null) {
    const logEntry = this.formatLogEntry('INFO', component, functionName, message, data)
    this.addLog(logEntry)
  }

  error(component, functionName, message, data = null) {
    const logEntry = this.formatLogEntry('ERROR', component, functionName, message, data)
    this.addLog(logEntry)
  }

  debug(component, functionName, message, data = null) {
    const logEntry = this.formatLogEntry('DEBUG', component, functionName, message, data)
    this.addLog(logEntry)
  }

  warn(component, functionName, message, data = null) {
    const logEntry = this.formatLogEntry('WARN', component, functionName, message, data)
    this.addLog(logEntry)
  }

  // Get all logs
  getAllLogs() {
    return this.logs
  }

  // Get logs by level
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level)
  }

  // Get logs by component
  getLogsByComponent(component) {
    return this.logs.filter(log => log.component === component)
  }

  // Export logs as JSON
  exportLogs() {
    return JSON.stringify(this.logs, null, 2)
  }

  // Clear logs
  clearLogs() {
    this.logs = []
    this.info('FrontendAuthLogger', 'clearLogs', 'All logs cleared')
  }

  // Session summary
  sessionSummary() {
    const endTime = Date.now()
    const duration = endTime - this.startTime
    
    this.info('FrontendAuthLogger', 'sessionSummary', `Frontend authentication session completed`, {
      sessionId: this.sessionId,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: `${duration}ms`,
      totalLogs: this.logs.length,
      errorLogs: this.getLogsByLevel('ERROR').length,
      warnLogs: this.getLogsByLevel('WARN').length
    })
  }
}

// Create singleton instance
const frontendAuthLogger = new FrontendAuthLogger()

// Make it available globally for debugging
window.authLogger = frontendAuthLogger

// Export the logger instance
export default frontendAuthLogger

// Export individual logging functions for convenience
export const {
  loginAttempt,
  loginSuccess,
  loginFailure,
  tokenVerification,
  apiRequest,
  apiResponse,
  authStateChange,
  redirect,
  localStorageOperation,
  componentLifecycle,
  routeChange,
  info,
  error,
  debug,
  warn,
  getAllLogs,
  getLogsByLevel,
  getLogsByComponent,
  exportLogs,
  clearLogs,
  sessionSummary
} = frontendAuthLogger
