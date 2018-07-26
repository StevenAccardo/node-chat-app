const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage, generateLoctionMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');
const publicPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();

app.use(express.static(publicPath));

io.on('connection', socket => {
  console.log('New user connected');

  socket.on('join', ({ name, room }, callback) => {
    console.log(isRealString(name));
    console.log(isRealString(room));
    console.log(name, room);
    if (!isRealString(name) || !isRealString(room)) {
      return callback('Name and room name are required.');
    }
    socket.join(room);
    //Removes the user from any other rooms they may be in, ensuring they are only ever in one room
    users.removeUser(socket.id);
    users.addUser(socket.id, name, room);

    io.to(room).emit('updateUserList', users.getUserList(room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app!'));
    socket.broadcast.to(room).emit('newMessage', generateMessage('Admin', `${name} has joined.`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    console.log('createMessage', message);
    io.emit('newMessage', generateMessage(message.from, message.text));
    callback();
  });

  socket.on('createLocationMessage', ({ lat, lon }) => {
    io.emit('newLocationMessage', generateLoctionMessage('Admin', lat, lon));
  });

  socket.on('disconnect', () => {
    const user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});

server.listen(port, () => console.log(`Server is listening on port ${port}`));
