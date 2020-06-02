const Base = require('./Base');

class User extends Base {
  constructor(client, userdata) {
    super(client);
    this.addExtraProp('tag', `${userdata.username}#${userdata.discriminator}`)
      .setup(userdata);
  }
};

module.exports = User;