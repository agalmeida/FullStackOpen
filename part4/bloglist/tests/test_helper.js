const Blog = require('../models/blog')
const User = require('../models/user')


const initialBlogs = [
  {
    title: "How to sell your Kidney",
    author: "SpongeBob",
    url: "www.sellkidneywithbob.org",
    likes: 5,
    id: "6679ec55822683cb89b95b2b"
    },
    {
    title: "How to sell your Liver",
    author: "Luigi",
    url: "www.sellliverwithluigi.org",
    likes: 11,
    id: "6679f86e79689b87ca12d20b"
    },
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}


const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, blogsInDb, usersInDb
}