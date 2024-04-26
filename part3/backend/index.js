const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

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

app.use(express.json())
app.use(requestLogger)
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens['req-body'](req, res) // Include the request body in the log
    ].join(' ')
}))



let numbers = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/api/numbers', (request, response) => {
    response.json(numbers)
})



app.get('/info', (request,response) => {
    const timestamp = new Date()
    const count = numbers.length
    response.send(
        `<div>
            <p>Phonebook has info for ${count} people</p>
            <p>${timestamp}</p>
        </div>`
    )
})

app.get('/api/numbers/:id', (request, response) => {
    const id = Number(request.params.id)
    const number = numbers.find(number => number.id === id)
    if (number) {
        response.json(number)
    } else {
        response.status(404).end()
    }
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
    const existingPerson = numbers.find(person => person.name === body.name)
    if (existingPerson) {
        return response.status(400).json({
            error: `there is already an entry for ${existingPerson.name}`
        })
    }
    const person = {
        id: Math.floor(Math.random() * 100000000), // Random id between 0 and 9999
        name: body.name,
        number: body.number 
    }
    numbers = numbers.concat(person)
    response.json(person)
})

app.delete('/api/numbers/:id', (request, response) => {
    const id = Number(request.params.id)
    numbers = numbers.filter(number => number.id !== id)
    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)


const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)