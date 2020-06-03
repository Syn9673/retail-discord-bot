const Base = require('./Base');

class Guild extends Base {
  constructor(client, guilddata) {
    super(client);
    this.setup(guilddata);
  }
};

module.exports = Guild;