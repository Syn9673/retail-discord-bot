const Base = require('./Base');
const PublicFlags = require('./PublicFlags');

class User extends Base {
  constructor(client, userdata) {
    super(client);
    this.hideProp('public_flags')
      .setup(userdata)
      .addExtraProp('tag', `${userdata.username}#${userdata.discriminator}`)
      .addExtraProp('flags', new PublicFlags(userdata.public_flags).return());
  }
};

module.exports = User;