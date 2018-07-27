const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const { generateMessage, generateLoctionMessage } = require('./utils/message')
const { isRealString } = require('./utils/validation')
const { Users } = require('./utils/users')
const publicPath = path.join(__dirname, '../client')
const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketIO(server)
const users = new Users()

//serves our static files from the client directory
app.use(express.static(publicPath))

//Listens for connnection from client
io.on('connection', socket => {
  console.log('New user connected')

  //listens for a 'join' request
  socket.on('join', ({ name, room }, callback) => {
    //checks to make sure the name and room parameters are not blank, and are strings
    if (!isRealString(name) || !isRealString(room)) {
      //If not the server will invoke the callback, and pass in an error message
      return callback('Name and room name are required.')
    }
    //this connection will use the join method to enter the passed in room
    socket.join(room)
    //Removes the user from any other rooms they may be in, ensuring they are only ever in one room
    users.removeUser(socket.id)
    users.addUser(socket.id, name, room)

    //sends the updated user list to any client, whose user is in that specific room
    io.to(room).emit('updateUserList', users.getUserList(room))
    //send a new message to the user welcoming them to the chat app
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app!'))
    //sends a message to everyone that is in the room, except for the current connection, notifying them that a new user has entered the chat
    socket.broadcast.to(room).emit('newMessage', generateMessage('Admin', `${name} has joined.`))
    callback()
  })

  //listens for any new messages created by users
  socket.on('createMessage', ({ text }, callback) => {
    //finds the user object in the users array
    const user = users.getUser(socket.id)

    //if there is a user, and the message they typed is a non-empty string, then send it to all users in the room
    if (user && isRealString(text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, text))
    }

    callback()
  })

  //Sends all members of a chatroom the location of the user
  socket.on('createLocationMessage', ({ lat, lon }) => {
    const user = users.getUser(socket.id)

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLoctionMessage(user.name, lat, lon))
    }
  })
  //When a user is disconnected, they are removed from the users array, a new user list is sent to all clients who users are in the same room, and a message is sent letting the other users know that the user has left the chat.
  socket.on('disconnect', () => {
    const user = users.removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room))
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`))
    }
  })
})

server.listen(port, () => console.log(`Server is listening on port ${port}`))
