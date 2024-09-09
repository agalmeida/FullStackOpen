const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
  })

blogsRouter.post('/', async (request, response) => {
    const blog = new Blog(request.body)
    try {
      // Try saving the new blog post
      const savedBlog = await blog.save()
      response.status(201).json(savedBlog)
    } catch (error) {
      // Handle validation errors (missing title or url)
      if (error.name === 'ValidationError') {
        return response.status(400).json({ error: 'title or url is missing' })
      }
    }
})
  

module.exports = blogsRouter