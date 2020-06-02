const User = require('../structs/User');

class GuildCreate {
  constructor(client, shard, chunk) {
    this.client = client;
    this.shard = shard;
    this.chunk = chunk;
  }

  exec() {
    this.shard.guild_count++;

    for (let member of this.chunk.d.members) {
      this.shard.users.set(member.user.id, new User(this.client, member.user));
    }

    if (this.shard.client_data.guilds.filter(g => g.id === this.chunk.d.id && g.unavailable).length > 0)
      this.shard.emit('guild_available', this.shard.guilds.set(this.chunk.d.id, this.chunk.d));

    if (this.shard.guild_count === this.shard.client_data.guilds.length) {
      this.shard.emit('shard_ready');
      this.shard.is_ready = true;
    }
  }
};

module.exports = GuildCreate;