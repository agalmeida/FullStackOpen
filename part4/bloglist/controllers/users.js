const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  if (!password || password.length < 3) {
    return response.status(400).json({
      error: 'Password must be at least 3 characters long'
    })
  }

  try {
    //hash the password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    //create a new user instance
    const user = new User({
      username,
      name,
      passwordHash,
    })

    //save the user to the database
    const savedUser = await user.save()

    //reespond with the saved user
    response.status(201).json(savedUser)
  } catch (error) {
    //if there's an error pass it to the errorHandler middleware
    next(error)
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User
  .find({}).populate('blogs', { title: 1, author: 1, url: 1 , likes: 1})
  response.json(users)
})

module.exports = usersRouter