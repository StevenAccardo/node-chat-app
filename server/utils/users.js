class Users {
  constructor() {
    this.users = [];
  }
  addUser(id, name, room) {
    const user = { id, name, room };
    this.users.push(user);
    return user;
  }
  removeUser(id) {
    const user = this.getUser(id);

    if (user) {
      this.users = this.users.filter(user => user.id !== id);
    }

    return user;
  }
  getUser(id) {
    return this.users.filter(user => user.id === id)[0];
  }
  getUserList(room) {
    //returns an array of user objects that are currently signed into the passed in room name
    const users = this.users.filter(user => user.room === room);
    //returns an array of those user's names
    const namesArray = users.map(user => user.name);

    return namesArray;
  }
}

module.exports = { Users };
