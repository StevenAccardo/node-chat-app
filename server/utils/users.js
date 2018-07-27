//Creates the Users class

class Users {
  constructor() {
    this.users = []
  }
  //Creates a user object, and pushes that user object onto the users array
  addUser(id, name, room) {
    const user = { id, name, room }
    this.users.push(user)
    return user
  }
  //removes the user object from the users array, this happens when a user is disconnected or if they enter a new room
  removeUser(id) {
    const user = this.getUser(id)

    //iterates through the ussers array, and returns a new array with any users that did not match the object, essentially creating a new array, but without the user object in which the id belongs to
    if (user) {
      this.users = this.users.filter(user => user.id !== id)
    }

    return user
  }
  //iterates through the users array, and returns the user with a matching id
  getUser(id) {
    return this.users.filter(user => user.id === id)[0]
  }
  //returns an array of users in a certain room
  getUserList(room) {
    //returns an array of user objects that are currently signed into the passed in room name
    const users = this.users.filter(user => user.room === room)
    //returns an array of those user's names
    const namesArray = users.map(user => user.name)

    return namesArray
  }
}

module.exports = { Users }
