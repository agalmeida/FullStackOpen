const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('assert')
const helper = require('./test_helper')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

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
  //create a new user and get the token
  const user = await User.findOne({ username: 'raton' }) //ensure there's a valid user in your DB
  const userForToken = {
    username: user.username,
    id: user._id,
  }
  const token = jwt.sign(userForToken, process.env.SECRET)

  const newBlog = {
    title: 'Valid post',
    author: 'Yours Trully Bob',
    url: 'validpost.com',
    likes: 23
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
  
  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  const titles = blogsAtEnd.map(blog => blog.title)
  assert(titles.includes(newBlog.title))
})

test('likes default to 0 if undefined', async () => {
  //create a new user and get the token
  const user = await User.findOne({ username: 'raton' }) //ensure there's a valid user in your DB
  const userForToken = {
    username: user.username,
    id: user._id,
  }
  const token = jwt.sign(userForToken, process.env.SECRET)

  const newBlog = {
    title: 'Post without likes',
    author: 'Author Without Likes',
    url: 'withoutlikes.com'
  }
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
  const blogsAtEnd = await helper.blogsInDb()
  const addedBlog = blogsAtEnd.find(blog => blog.title === newBlog.title)
  assert.strictEqual(addedBlog.likes, 0)
})

test('adding blogs with no title or url', async () =>{
  //create a new user and get the token
  const user = await User.findOne({ username: 'raton' }) //ensure there's a valid user in your DB
  const userForToken = {
    username: user.username,
    id: user._id,
  }
  const token = jwt.sign(userForToken, process.env.SECRET)
  
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
    .set('Authorization', `Bearer ${token}`)
    .send(noTitleBlog)
    .expect(400)

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(noUrlBlog)
    .expect(400)
})


test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]
  console.log('Title:', blogToDelete.title)

  console.log('User ID:', blogToDelete.user)
  //create a new user and get the token
  const user = await User.findById(blogToDelete.user) //ensure there's a valid user in your DB
  const userForToken = {
    username: user.username,
    id: user._id,
  }
  const token = jwt.sign(userForToken, process.env.SECRET)

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  const titles = blogsAtEnd.map(r => r.title)
  assert(!titles.includes(blogToDelete.title))

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('can update blog likes', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  const updatedLikes = {
    title: blogToUpdate.title,
    author: blogToUpdate.author,
    url: blogToUpdate.url,
    likes: 99
  }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedLikes)
    .expect(200) 

  //fetch the updated blog from the database
  const blogsAtEnd = await helper.blogsInDb()
  const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
  //assert that the likes were updated
  assert.strictEqual(updatedBlog.likes, 99)
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