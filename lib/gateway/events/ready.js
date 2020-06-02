const ClientUser = require('../structs/ClientUser');

class Ready {
  constructor(client, shard, chunk) {
    this.client = client;
    this.shard = shard;
    this.chunk = chunk;
  }

  exec() {
    this.shard.client_data = this.chunk.d;
    this.shard.session_id = this.chunk.d.session_id;

    if (!this.client.user)
      this.client.user = new ClientUser(this.client, this.chunk.d.user);

    if (this.chunk.d.guilds.length < 1)
      this.shard.emit('shard_ready');
  }
};

module.exports = Ready;