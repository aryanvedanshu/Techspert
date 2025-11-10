/**
 * Mongoose Plugin for Database Operation Logging
 * Logs all database operations (find, save, create, update, delete) with full context
 * Ensures we can trace all database operations from root to page
 */
import logger from '../utils/logger.js'

const dbLoggerPlugin = function(schema) {
  // Log find operations
  schema.pre(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete'], function() {
    const operation = this.op || 'find'
    const modelName = this.model.modelName
    const query = this.getQuery()
    
    logger.dbOperation(operation, modelName, query, null, null)
    logger.debug(`DB ${operation} operation started`, {
      model: modelName,
      query: logger.sanitizeParams(query),
      operation
    })
  })

  schema.post(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete'], function(docs) {
    const operation = this.op || 'find'
    const modelName = this.model.modelName
    const resultCount = Array.isArray(docs) ? docs.length : docs ? 1 : 0
    
    logger.dbOperation(operation, modelName, this.getQuery(), resultCount, null)
    logger.debug(`DB ${operation} operation completed`, {
      model: modelName,
      resultCount,
      operation
    })
  })

  // Log save operations (create/update)
  schema.pre('save', function() {
    const modelName = this.constructor.modelName
    const isNew = this.isNew
    const operation = isNew ? 'create' : 'update'
    
    logger.dbOperation(operation, modelName, { _id: this._id }, null, null)
    logger.debug(`DB ${operation} operation started`, {
      model: modelName,
      documentId: this._id,
      isNew,
      operation
    })
  })

  schema.post('save', function(doc) {
    const modelName = this.constructor.modelName
    const isNew = this.isNew
    const operation = isNew ? 'create' : 'update'
    
    logger.dbOperation(operation, modelName, { _id: doc._id }, doc, null)
    logger.info(`DB ${operation} operation completed successfully`, {
      model: modelName,
      documentId: doc._id,
      isNew,
      operation
    })
  })

  // Log delete operations
  schema.pre(['remove', 'deleteOne', 'deleteMany'], function() {
    const operation = this.op || 'delete'
    const modelName = this.model.modelName
    const query = this.getQuery()
    
    logger.dbOperation(operation, modelName, query, null, null)
    logger.debug(`DB ${operation} operation started`, {
      model: modelName,
      query: logger.sanitizeParams(query),
      operation
    })
  })

  schema.post(['remove', 'deleteOne', 'deleteMany'], function(result) {
    const operation = this.op || 'delete'
    const modelName = this.model.modelName
    const deletedCount = result.deletedCount || (result ? 1 : 0)
    
    logger.dbOperation(operation, modelName, this.getQuery(), deletedCount, null)
    logger.info(`DB ${operation} operation completed`, {
      model: modelName,
      deletedCount,
      operation
    })
  })

  // Log aggregate operations
  schema.pre('aggregate', function() {
    const modelName = this.model.modelName
    const pipeline = this.pipeline()
    
    logger.dbOperation('aggregate', modelName, { pipeline }, null, null)
    logger.debug('DB aggregate operation started', {
      model: modelName,
      pipelineStages: pipeline.length,
      operation: 'aggregate'
    })
  })

  schema.post('aggregate', function(results) {
    const modelName = this.model.modelName
    const resultCount = Array.isArray(results) ? results.length : results ? 1 : 0
    
    logger.dbOperation('aggregate', modelName, {}, resultCount, null)
    logger.debug('DB aggregate operation completed', {
      model: modelName,
      resultCount,
      operation: 'aggregate'
    })
  })

  // Log count operations
  schema.pre('count', function() {
    const modelName = this.model.modelName
    const query = this.getQuery()
    
    logger.dbOperation('count', modelName, query, null, null)
    logger.debug('DB count operation started', {
      model: modelName,
      query: logger.sanitizeParams(query),
      operation: 'count'
    })
  })

  schema.post('count', function(count) {
    const modelName = this.model.modelName
    
    logger.dbOperation('count', modelName, this.getQuery(), count, null)
    logger.debug('DB count operation completed', {
      model: modelName,
      count,
      operation: 'count'
    })
  })
}

export default dbLoggerPlugin

