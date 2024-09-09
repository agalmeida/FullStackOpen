const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('assert')
const helper = require('./test_helper')




const api = supertest(app)

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier property of blog posts is named id', async () => {
  await api
    .get('/api/blogs')
    .expect((response) => {
      response.body.forEach(blog => {
        if (!blog.id) throw new Error("id property is missing")
        if (blog._id) throw new Error("_id property should not be present")
      })
    })
})

test('a valid blog post can be added ', async () => {
  const newBlog = {
    title: 'Valid post',
    author: 'Yours Trully Bob',
    url: 'validpost.com',
    likes: 23
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  const titles = blogsAtEnd.map(blog => blog.title)
  assert(titles.includes(newBlog.title))
})

test('likes default to 0 if undefined', async () => {
  const newBlog = {
    title: 'Post without likes',
    author: 'Author Without Likes',
    url: 'withoutlikes.com'
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
  const blogsAtEnd = await helper.blogsInDb()
  const addedBlog = blogsAtEnd.find(blog => blog.title === newBlog.title)
  assert.strictEqual(addedBlog.likes, 0)
})

test('adding blogs with no title or url', async () =>{
  const noTitleBlog = {
    author: 'Author Without Title',
    url: 'withouttitle.com',
    likes: 23
  }
  const noUrlBlog = {
    title: 'Blog Without URL',
    author: 'Author Without URL',
    likes: 14
  }
  await api
    .post('/api/blogs')
    .send(noTitleBlog)
    .expect(400)

  await api
    .post('/api/blogs')
    .send(noUrlBlog)
    .expect(400)
})


beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

after(async () => {
  await mongoose.connection.close()
})