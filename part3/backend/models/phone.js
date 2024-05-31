const mongoose = require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery',false)
const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const phoneSchema = new mongoose.Schema({
  name:{
    type: String,
    minLength: 3,
    required:true
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{2}-\d{6,}$|^\d{3}-\d{5,}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }
})

phoneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString() // Convert _id to string and rename to id
    delete returnedObject._id  // Remove _id from the result
    delete returnedObject.__v  // Remove version key (__v) from the result
  }
})

module.exports = mongoose.model('Phone', phoneSchema)