const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware');


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  })

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
  const body = request.body
  const user = request.user

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

blogsRouter.get('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})
  
blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
  const user = request.user
  try {
    //verify if blog exists by id
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' })
    }
    //check if user deleting the blog is the user who created
    if (blog.user.toString() === user.id) {
      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).end()
    } else{
      return response.status(403).json({error: 'You are not authorized to delete this blog'})
    }
  } catch (error) {
    next(error)
  }
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