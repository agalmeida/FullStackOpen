const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { tokenExtractor } = require('../utils/middleware')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  })

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body
  let decodedToken
  try {
    decodedToken = jwt.verify(request.token, process.env.SECRET)
    // Use req.token directly from the middleware
  } catch (error) {
    return response.status(401).json({ error: 'Token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    url: body.url,
    author: body.author,
    likes: body.likes || 0,
    user: user.id
  })
  try {
    //try saving the new blog post
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    //handle validation errors (missing title or url)
    if (error.name === 'ValidationError') {
      return response.status(400).json({ error: 'title or url is missing' })
    }
    next(error)
  }
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})
  
blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter