'use strict'

/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor')


new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .fireHttpServer()
  .catch(console.error)

  const Server = use('Server')
  const io = require('socket.io')(Server.getInstance())
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)
  
    socket.on('sunmori_chat', (message) => {
      console.log('Received chat:', message)
      socket.broadcast.emit('sunmori_chat', message)
    })

    socket.on('sunmori_notif', (message) => {
      console.log('Received notif:', message)
      socket.broadcast.emit('sunmori_notif', message)
    })
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
  