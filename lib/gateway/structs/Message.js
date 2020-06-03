const Base = require('./Base');
const User = require('./User');

class Message extends Base {
  constructor(client, msgdata) {
    super(client);
    this.setup(msgdata)
      .replaceProp('author', new User(client, msgdata.author))
      .addExtraProp('guild', msgdata.guild_id ? msgdata.shard.guilds.get(msgdata.guild_id) : null)
      .removeProp('guild_id');
  }

  async send(content) {
    return await this.client.send_message(this.channel_id, content);
  }

  async edit(content) {
    return await this.client.edit_message(this.channel_id, this.id, content);
  }
};

module.exports = Message;