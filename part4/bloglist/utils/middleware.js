const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }
  next(error)
}

//extracts the token from the Authorization header and makes it available in request.token
const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.substring(7) //attach the token to the request object and remove Bearer + the space that follows it
  } else {
    request.token = null //if no token, set req.token to null
  }
  next()
}

//verifies the token, finds the user from the token, and attaches the user to request.user
const userExtractor = async (request, response, next) => {  
  try {
    //ensure token exists (already extracted by tokenExtractor)
    const token = request.token
    if (!token) {
      return response.status(401).json({ error: 'Token missing' })
    }
    //checks if token is valid, extracts id and check if id is valid
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id){
      return response.status(401).json({ error: 'Token invalid' })
    }
    //check if there is user id that matches token id
    const user = await User.findById(decodedToken.id)
    if (!user) {
      return response.status(401).json({ error: 'User not found' })
    }
    request.user = user
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}