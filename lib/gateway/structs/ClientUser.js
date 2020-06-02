const User = require('./User');

class ClientUser extends User {
  constructor(client, userdata) {
    super(client, userdata);
  }
};

module.exports = ClientUser;