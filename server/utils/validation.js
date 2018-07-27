//receives a string, checks the typeof and then ensures it is not empty

const isRealString = str => {
  return typeof str === 'string' && str.trim().length > 0
}

module.exports = { isRealString }
