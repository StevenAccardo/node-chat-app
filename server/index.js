const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage, generateLoctionMessage } = require('./utils/message');
const publicPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', socket => {
  console.log('New user connected');

  socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app!'));

  socket.broadcast.emit('newMessage', generateMessage('Admin', 'A new user has joined!'));

  socket.on('createMessage', (message, callback) => {
    console.log('createMessage', message);
    io.emit('newMessage', generateMessage(message.from, message.text));
    callback();
  });

  socket.on('createLocationMessage', ({ lat, lon }) => {
    io.emit('newLocationMessage', generateLoctionMessage('Admin', lat, lon));
  });

  socket.on('disconnect', () => console.log('The user disconnected'));
});

server.listen(port, () => console.log(`Server is listening on port ${port}`));
