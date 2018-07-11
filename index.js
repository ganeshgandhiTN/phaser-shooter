const express = require('express')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)

const path = require('path')

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')))
} else {
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')

  const config = require('./webpack.config')
  config.mode = 'development'
  const compiler = require('webpack')(config)

  app.use(webpackDevMiddleware(compiler))
  app.use(webpackHotMiddleware(compiler))
}

let players = {}

io.on('connection', socket => {
  console.log(`a user connected: ${socket.id}`)

  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700 + 50),
    y: Math.floor(Math.random() * 500 + 50),
    playerID: socket.id,
    team: (Math.floor(Math.random() * 2) === 0) ? 'red' : 'blue'
  }

  socket.emit('currentPlayers', players)
  socket.broadcast.emit('newPlayer', players[socket.id])

  socket.on('playerMovement', movementData => {
    players[socket.id].x = movementData.x
    players[socket.id].y = movementData.y
    players[socket.id].rotation = movementData.rotation
    socket.broadcast.emit('playerMoved', players[socket.id])
  })

  socket.on('disconnect', () => {
    console.log(`a user disconnected: ${socket.id}`)

    delete players[socket.id]
    io.emit('disconnect', socket.id)
  })
})

const SERVER_PORT = process.env.SERVER_PORT || 8080
server.listen(SERVER_PORT, function () {
  console.log(`Listening on: *:${this.address().port}`)
})
