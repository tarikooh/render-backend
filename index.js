const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

const requestLogger = (request, response, next) => {
    console.log("Method: ", request.method)
    console.log("Path: ", request.path)
    console.log("Body: ", request.body)
    console.log("---")
    next()
}

// app.use(requestLogger)
// const morganLogger = morgan('tiny')
// app.use(morgan(':method :url :status :res[content-length] :response-time ms '))

const customMorgan = morgan(function (tokens, req, res) {
    if(tokens.method(req, res) === "POST"){
	morgan.token('body', (req, res) => {
	    return JSON.stringify(req.body)
	})
	return[
	    tokens.method(req, res),
	    tokens.url(req, res),
	    tokens.status(req, res),
	    tokens.res(req, res, 'content-length'), '-',
	    tokens['response-time'](req, res), 'ms',
	    tokens.body(req, res)
	].join(' ')
    }
    if(tokens.method(req, res) === "PUT"){
	morgan.token('body', (req, res) => {
	    return JSON.stringify(req.body)
	})
	return "PUT CALLED"
    }
    return[
	tokens.method(req, res),
	tokens.url(req, res),
	tokens.status(req, res),
	tokens.res(req, res, 'content-length'), '-',
	tokens['response-time'](req, res), 'ms',
    ].join(' ')

})

app.use(requestLogger)

let notes = [
    {
	id: "1",
	content: "HTML is easy",
	important: true
    },
    {
	id: "2",
	content: "Browser can execute only JavaScript",
	important: false
    },
    {
	id: "3",
	content: "GET and POST are the most important methods of HTTP protocol",
	important: true
    }
]

app.get('/', (request, response) => {
    response.send("<p>Hello world</p>")
})

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
    console.log("got the request for id...")
    const id = request.params.id;
    const note = notes.find(n => n.id === id)
    if(!note){
	console.log(`Couldn\'t find the note with id of ${id}`)
	response.status(404).end()
    }else{
	response.json(note)
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    console.log(`Got request for deleting note with ${id}`)
    notes = notes.filter(n => n.id !== id)

    response.status(204).end()
})

app.post('/api/notes', (request, response) => {
    const body = request.body

    if(!body.content){
	return response.status(400).json({
	    error: "missing content"
	})
    }

    const note = {
	id: `${notes.length + 1}`,
	content: body.content,
	important: body.important || false
    }
    notes = notes.concat(note)
    response.json(note)
})

app.put('/api/notes/:id', (req, res) => {
    const id = req.params.id
    if(!notes.find(n => n.id === id)){
	return res.status(400).end("No Note with given id exists")
    }
    notes = notes.map(note => note.id === id ? req.body : note)
    res.json(req.body)
})

const unknownEndpoint =  (req, res, next) => {
    res.status(404).send({
	error: "Unknown endpoint"
    })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

