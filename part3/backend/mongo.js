const mongoose = require('mongoose')
require('dotenv').config()


if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

//const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]
const MONGODB_URI = process.env.MONGODB_URI
const url = MONGODB_URI

mongoose.set('strictQuery',false)
mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String,
})

phoneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Phone = mongoose.model('Phone', phoneSchema)

if (name !== undefined && number !== undefined){
  const phone = new Phone({
    name: name,
    number: number
  })

  phone.save().then(() => {
    console.log('added', name, 'number', number, 'to phonebook')
    mongoose.connection.close()
  })
} else {
  console.log('phonebook:')
  Phone.find({}).then(result => {
    result.forEach(phone => {
      console.log(phone.name, phone.number)
    })
    mongoose.connection.close()
  })
}





