import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Log file paths
const authLogFile = path.join(logsDir, 'auth.log')
const errorLogFile = path.join(logsDir, 'errors.log')
const debugLogFile = path.join(logsDir, 'debug.log')

// Helper function to format timestamp
const getTimestamp = () => {
  return new Date().toISOString()
}

// Helper function to format log entry
const formatLogEntry = (level, component, functionName, message, data = null) => {
  const timestamp = getTimestamp()
  const logEntry = {
    timestamp,
    level,
    component,
    function: functionName,
    message,
    data: data ? JSON.stringify(data, null, 2) : null,
    pid: process.pid
  }
  return JSON.stringify(logEntry) + '\n'
}

// Helper function to write to file
const writeToFile = (filePath, logEntry) => {
  try {
    fs.appendFileSync(filePath, logEntry)
  } catch (error) {
    console.error('Failed to write to log file:', error)
  }
}

// Authentication Logger Class
class AuthLogger {
  constructor() {
    this.startTime = Date.now()
    this.sessionId = `session_${this.startTime}_${Math.random().toString(36).substr(2, 9)}`
    
    // Log session start
    this.info('AuthLogger', 'constructor', `Authentication logging session started`, {
      sessionId: this.sessionId,
      startTime: new Date(this.startTime).toISOString(),
      pid: process.pid
    })
  }

  // Log authentication attempts
  loginAttempt(email, isAdmin = false) {
    this.info('AuthLogger', 'loginAttempt', `Login attempt initiated`, {
      email,
      isAdmin,
      sessionId: this.sessionId,
      timestamp: getTimestamp()
    })
  }

  // Log successful login
  loginSuccess(email, userId, role, tokens) {
    this.info('AuthLogger', 'loginSuccess', `Login successful`, {
      email,
      userId,
      role,
      hasAccessToken: !!tokens?.accessToken,
      hasRefreshToken: !!tokens?.refreshToken,
      sessionId: this.sessionId,
      timestamp: getTimestamp()
    })
  }

  // Log login failure
  loginFailure(email, reason, error = null) {
    this.error('AuthLogger', 'loginFailure', `Login failed: ${reason}`, {
      email,
      reason,
      error: error?.message || error,
      sessionId: this.sessionId,
      timestamp: getTimestamp()
    })
  }

  // Log token verification
  tokenVerification(token, success, userId = null, error = null) {
    if (success) {
      this.info('AuthLogger', 'tokenVerification', `Token verification successful`, {
        userId,
        hasToken: !!token,
        sessionId: this.sessionId,
        timestamp: getTimestamp()
      })
    } else {
      this.error('AuthLogger', 'tokenVerification', `Token verification failed`, {
        userId,
        hasToken: !!token,
        error: error?.message || error,
        sessionId: this.sessionId,
        timestamp: getTimestamp()
      })
    }
  }

  // Log middleware execution
  middlewareExecution(middlewareName, route, success, userId = null, error = null) {
    if (success) {
      this.info('AuthLogger', 'middlewareExecution', `Middleware ${middlewareName} executed successfully`, {
        middlewareName,
        route,
        userId,
        sessionId: this.sessionId,
        timestamp: getTimestamp()
      })
    } else {
      this.error('AuthLogger', 'middlewareExecution', `Middleware ${middlewareName} failed`, {
        middlewareName,
        route,
        userId,
        error: error?.message || error,
        sessionId: this.sessionId,
        timestamp: getTimestamp()
      })
    }
  }

  // Log API requests
  apiRequest(method, url, headers, body = null) {
    this.info('AuthLogger', 'apiRequest', `API request made`, {
      method,
      url,
      hasAuthHeader: !!headers?.authorization,
      hasBody: !!body,
      sessionId: this.sessionId,
      timestamp: getTimestamp()
    })
  }

  // Log API responses
  apiResponse(method, url, status, responseTime, error = null) {
    if (status >= 200 && status < 300) {
      this.info('AuthLogger', 'apiResponse', `API response successful`, {
        method,
        url,
        status,
        responseTime,
        sessionId: this.sessionId,
        timestamp: getTimestamp()
      })
    } else {
      this.error('AuthLogger', 'apiResponse', `API response failed`, {
        method,
        url,
        status,
        responseTime,
        error: error?.message || error,
        sessionId: this.sessionId,
        timestamp: getTimestamp()
      })
    }
  }

  // Log frontend authentication state changes
  frontendAuthState(component, state, data = null) {
    this.info('AuthLogger', 'frontendAuthState', `Frontend auth state changed in ${component}`, {
      component,
      state,
      data,
      sessionId: this.sessionId,
      timestamp: getTimestamp()
    })
  }

  // Log redirects
  redirect(from, to, reason) {
    this.info('AuthLogger', 'redirect', `Redirect triggered`, {
      from,
      to,
      reason,
      sessionId: this.sessionId,
      timestamp: getTimestamp()
    })
  }

  // Log localStorage operations
  localStorageOperation(operation, key, value = null) {
    this.info('AuthLogger', 'localStorageOperation', `localStorage ${operation}`, {
      operation,
      key,
      hasValue: !!value,
      sessionId: this.sessionId,
      timestamp: getTimestamp()
    })
  }

  // Standard logging methods
  info(component, functionName, message, data = null) {
    const logEntry = formatLogEntry('INFO', component, functionName, message, data)
    writeToFile(authLogFile, logEntry)
    console.log(`[AUTH-INFO] ${component}.${functionName}: ${message}`, data || '')
  }

  error(component, functionName, message, data = null) {
    const logEntry = formatLogEntry('ERROR', component, functionName, message, data)
    writeToFile(errorLogFile, logEntry)
    writeToFile(authLogFile, logEntry)
    console.error(`[AUTH-ERROR] ${component}.${functionName}: ${message}`, data || '')
  }

  debug(component, functionName, message, data = null) {
    const logEntry = formatLogEntry('DEBUG', component, functionName, message, data)
    writeToFile(debugLogFile, logEntry)
    writeToFile(authLogFile, logEntry)
    console.log(`[AUTH-DEBUG] ${component}.${functionName}: ${message}`, data || '')
  }

  warn(component, functionName, message, data = null) {
    const logEntry = formatLogEntry('WARN', component, functionName, message, data)
    writeToFile(authLogFile, logEntry)
    console.warn(`[AUTH-WARN] ${component}.${functionName}: ${message}`, data || '')
  }

  // Session summary
  sessionSummary() {
    const endTime = Date.now()
    const duration = endTime - this.startTime
    
    this.info('AuthLogger', 'sessionSummary', `Authentication session completed`, {
      sessionId: this.sessionId,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: `${duration}ms`,
      pid: process.pid
    })
  }

  // Clear old logs (keep last 7 days)
  clearOldLogs() {
    try {
      const files = [authLogFile, errorLogFile, debugLogFile]
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file)
          if (stats.mtime.getTime() < sevenDaysAgo) {
            fs.unlinkSync(file)
            this.info('AuthLogger', 'clearOldLogs', `Cleared old log file: ${path.basename(file)}`)
          }
        }
      })
    } catch (error) {
      this.error('AuthLogger', 'clearOldLogs', 'Failed to clear old logs', { error: error.message })
    }
  }
}

// Create singleton instance
const authLogger = new AuthLogger()

// Export the logger instance
export default authLogger

// Export individual logging functions for convenience
export const {
  loginAttempt,
  loginSuccess,
  loginFailure,
  tokenVerification,
  middlewareExecution,
  apiRequest,
  apiResponse,
  frontendAuthState,
  redirect,
  localStorageOperation,
  info,
  error,
  debug,
  warn,
  sessionSummary
} = authLogger
