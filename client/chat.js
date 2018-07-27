//This file sets up and runs the interactions once a user has entered a chat room

const socket = io()

//A function that forces the chat window to be scrolled to the bottom as chat messages are rendered
function scrollToBottom() {
  //Selectors
  const messages = jQuery('#messages')
  const newMessage = messages.children('li:last-child')
  //Heights
  const clientHeight = messages.prop('clientHeight')
  const scrollTop = messages.prop('scrollTop')
  const scrollHeight = messages.prop('scrollHeight')
  const newMessageHeight = newMessage.innerHeight()
  const lastMessageHeight = newMessage.prev().innerHeight()

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight)
  }
}

socket.on('connect', () => {
  //grabs the params from the location object
  const params = jQuery.deparam(window.location.search)

  //sends out the join request
  socket.emit('join', params, err => {
    //if there is an error returned, render an alert, and kick the user back to the root route
    if (err) {
      alert(err)
      window.location.href = '/'
    } else {
      console.log('No error')
    }
  })
})
socket.on('disconnect', () => {
  console.log('Disconnected from server')
})

//creates a list of users in the room
socket.on('updateUserList', users => {
  const ol = jQuery('<ol></ol>')

  //iterates through the array of users, and appends a new list item with the users name in it to the ordered list
  users.forEach(user => ol.append(jQuery('<li></li>').text(user)))
  jQuery('#users').html(ol)
})

//When a new message is received
socket.on('newMessage', message => {
  //formats the time
  const formattedTime = moment(message.createdAt).format('h:mm a')
  //grabs the mustache template
  const template = jQuery('#message-template').html()
  //renders the template with the proper variables
  const html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  })

  jQuery('#messages').append(html)
  //invokes a function to determine if the window should be scrolled down, or not
  scrollToBottom()
})

//listens for a new locatin message
socket.on('newLocationMessage', message => {
  const formattedTime = moment(message.createdAt).format('h:mm a')
  const template = jQuery('#location-message-template').html()
  const html = Mustache.render(template, {
    url: message.url,
    from: message.from,
    createdAt: formattedTime
  })

  jQuery('#messages').append(html)
  scrollToBottom()
})

//stops the from from submitting, and insteaad sends out the message the the user types, and then resets the input
jQuery('#message-form').on('submit', e => {
  e.preventDefault()

  const messageTextbox = jQuery('[name=message]')

  socket.emit(
    'createMessage',
    {
      text: messageTextbox.val()
    },
    () => {
      messageTextbox.val('')
    }
  )
})

const locationButton = jQuery('#send-location')
locationButton.on('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser')
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...')

  navigator.geolocation.getCurrentPosition(
    position => {
      locationButton.removeAttr('disabled').text('Send Location')
      socket.emit('createLocationMessage', {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      })
    },
    () => {
      locationButton.removeAttr('disabled').text('Send Location')
      alert('Unable to fetch location')
    }
  )
})
