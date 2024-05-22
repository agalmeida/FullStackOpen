require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Phone = require('./models/phone')

app.use(express.static('dist'))
app.use(cors())

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

morgan.token('req-body', (req, res) => JSON.stringify(req.body))

app.use(requestLogger)
app.use(express.json())

app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens['req-body'](req, res) 
    ].join(' ')
}))

app.get('/api/numbers', (request, response) => {
    Phone.find({}).then(numbers => {
        response.json(numbers)
    })
})



app.get('/info', async (request, response) => {
    try {
        const timestamp = new Date()
        const count = await Phone.countDocuments({})
        response.send(
            `<div>
                <p>Phonebook has info for ${count} people</p>
                <p>${timestamp}</p>
            </div>`
        )
    } catch (err) {
        console.error(err)
        response.status(500).send('Error retrieving data from the database.')
    }
})

app.get('/api/numbers/:id', (request, response, next) => {
    Phone.findById(request.params.id).then(phone => {
        if (phone) {
            response.json(phone)
          } else {
            response.status(404).end()
          }
    })
    .catch(error => next(error))
})

app.post('/api/numbers', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: `name is missing`
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: `number is missing`
        })
    }
    Phone.findOne({ name: body.name})
        .then(foundPhone => {
            if(foundPhone) {
                Phone.findOneAndUpdate({ name: body.name }, { number: body.number }, { new: true })
                    .then(updatedPhone => response.json(updatedPhone))
                    .catch(error => next(error))
            } else{
                const phone = new Phone ({ 
                    name: body.name,
                    number: body.number 
                })
                phone.save().then(savedPhone => {
                    response.json(savedPhone)
                })
                .catch(error => next(error))
            }
        })
})

app.put('/api/numbers/:id', (req, res, next) => {
    const { id } = req.params
    const { name, number } = req.body

    Phone.findByIdAndUpdate(id, { name, number }, { new: true })
        .then(updatedPhone => {
            if (!updatedPhone) {
                return res.status(404).send({ error: 'Number not found' })
            }
            res.json(updatedPhone)
        })
        .catch(error => next(error))
})

app.delete('/api/numbers/:id', (request, response) => {
    Phone.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
}
  
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)