import Trainer from '../models/Trainer.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Public
export const getTrainers = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getTrainers', { 
    query: req.query,
    hasIsActive: !!req.query.isActive,
    hasSearch: !!req.query.search
  })
  
  try {
    const { isActive, search } = req.query
    let query = {}
    
    logger.debug('Building query for trainers', { isActive, search })
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true'
      logger.debug('Filtering by isActive', { isActive: query.isActive })
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $in: [new RegExp(search, 'i')] } },
      ]
      logger.debug('Search query built', { searchTerm: search, queryPattern: query.$or })
    }
    
    logger.dbOperation('find', 'Trainer', query)
    const trainers = await Trainer.find(query).sort({ createdAt: -1 })
    
    const duration = Date.now() - startTime
    logger.success('Trainers fetched successfully', { 
      count: trainers.length,
      duration: `${duration}ms`,
      hasFilters: !!search || isActive !== undefined
    })
    logger.functionExit('getTrainers', { 
      success: true,
      count: trainers.length,
      duration: `${duration}ms`
    })
    
    res.json({
      success: true,
      count: trainers.length,
      data: trainers,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch trainers', error, {
      query: req.query,
      operation: 'getTrainers',
      model: 'Trainer',
      duration: `${duration}ms`
    })
    logger.functionExit('getTrainers', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get single trainer
// @route   GET /api/trainers/:id
// @access  Public
export const getTrainer = asyncHandler(async (req, res) => {
  logger.functionEntry('getTrainer', { trainerId: req.params.id })
  
  logger.dbOperation('findById', 'Trainer', req.params.id)
  const trainer = await Trainer.findById(req.params.id)
  
  if (!trainer) {
    logger.warn('Trainer not found', { trainerId: req.params.id })
    return res.status(404).json({
      success: false,
      message: 'Trainer not found',
    })
  }
  
  logger.info('Trainer fetched successfully', { trainerId: trainer._id })
  logger.functionExit('getTrainer', { trainerId: trainer._id })
  
  res.json({
    success: true,
    data: trainer,
  })
})

// @desc    Create new trainer
// @route   POST /api/trainers
// @access  Private/Admin
export const createTrainer = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createTrainer', { 
    bodyKeys: Object.keys(req.body),
    hasName: !!req.body.name,
    hasEmail: !!req.body.email
  })
  
  logger.debug('Creating trainer with data', {
    name: req.body.name,
    email: req.body.email,
    hasBio: !!req.body.bio,
    hasImageUrl: !!req.body.imageUrl,
    hasSpecialization: Array.isArray(req.body.specialization) && req.body.specialization.length > 0,
    hasSocialLinks: !!req.body.socialLinks
  })
  
  try {
    // Validate required fields
    if (!req.body.name || !req.body.email) {
      const error = new Error('Name and email are required')
      error.name = 'ValidationError'
      logger.error('Validation failed: missing required fields', error, {
        body: req.body,
        operation: 'createTrainer',
        model: 'Trainer',
        missingFields: {
          name: !req.body.name,
          email: !req.body.email
        }
      })
      throw error
    }
    
    logger.dbOperation('create', 'Trainer', { name: req.body.name, email: req.body.email })
    const trainer = await Trainer.create(req.body)
    
    const duration = Date.now() - startTime
    logger.success('Trainer created successfully', { 
      trainerId: trainer._id, 
      name: trainer.name,
      email: trainer.email,
      duration: `${duration}ms`
    })
    logger.functionExit('createTrainer', { 
      success: true, 
      trainerId: trainer._id,
      duration: `${duration}ms`
    })
    
    res.status(201).json({
      success: true,
      data: trainer,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to create trainer', error, {
      body: req.body,
      operation: 'createTrainer',
      model: 'Trainer',
      errorName: error.name,
      errorMessage: error.message,
      duration: `${duration}ms`
    })
    logger.functionExit('createTrainer', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Private/Admin
export const updateTrainer = asyncHandler(async (req, res) => {
  logger.functionEntry('updateTrainer', { trainerId: req.params.id })
  
  logger.dbOperation('findByIdAndUpdate', 'Trainer', req.params.id)
  const trainer = await Trainer.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )
  
  if (!trainer) {
    logger.warn('Trainer not found for update', { trainerId: req.params.id })
    return res.status(404).json({
      success: false,
      message: 'Trainer not found',
    })
  }
  
  logger.info('Trainer updated successfully', { trainerId: trainer._id })
  logger.functionExit('updateTrainer', { success: true, trainerId: trainer._id })
  
  res.json({
    success: true,
    data: trainer,
  })
})

// @desc    Delete trainer
// @route   DELETE /api/trainers/:id
// @access  Private/Admin
export const deleteTrainer = asyncHandler(async (req, res) => {
  logger.functionEntry('deleteTrainer', { trainerId: req.params.id })
  
  logger.dbOperation('findByIdAndDelete', 'Trainer', req.params.id)
  const trainer = await Trainer.findByIdAndDelete(req.params.id)
  
  if (!trainer) {
    logger.warn('Trainer not found for deletion', { trainerId: req.params.id })
    return res.status(404).json({
      success: false,
      message: 'Trainer not found',
    })
  }
  
  logger.info('Trainer deleted successfully', { trainerId: req.params.id })
  logger.functionExit('deleteTrainer', { success: true, trainerId: req.params.id })
  
  res.json({
    success: true,
    message: 'Trainer deleted successfully',
  })
})

