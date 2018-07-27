const moment = require('moment')

//takes the incoming messages, adds a timestamp to them, and returns that all in a object
const generateMessage = (from, text) => {
  return {
    from,
    text,
    createdAt: moment().valueOf()
  }
}

//takes the incoming position data, adds a timestamp, and then returns an object with the url link to google maps
const generateLoctionMessage = (from, lat, lon) => {
  return {
    from,
    url: `https://www.google.com/maps?q=${lat},${lon}`,
    createdAt: moment().valueOf()
  }
}

module.exports = { generateMessage, generateLoctionMessage }
