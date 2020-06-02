class GuildCreate {
  constructor(client, shard, chunk) {
    this.client = client;
    this.shard = shard;
    this.chunk = chunk;
  }

  exec() {
    this.shard.emit('guild_available', this.shard.guilds.set(this.chunk.d.id, this.chunk.d));
  }
};

module.exports = GuildCreate;