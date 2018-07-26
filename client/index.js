const socket = io();

socket.on('connect', () => {
  console.log('Connected to server');
});
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('newMessage', message => {
  console.log(message);
  const li = jQuery('<li></li>');
  li.text(`${message.from}: ${message.text}`);

  jQuery('#messages').append(li);
});

socket.emit(
  'createMessage',
  {
    from: 'Frank',
    text: 'Hi'
  },
  data => console.log('Got it', data)
);

jQuery('#message-form').on('submit', e => {
  e.preventDefault();

  socket.emit(
    'createMessage',
    {
      from: 'User',
      text: jQuery('[name=message]').val()
    },
    () => {}
  );
});
