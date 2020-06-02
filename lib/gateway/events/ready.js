class Ready {
  constructor(client, shard, chunk) {
    this.client = client;
    this.shard = shard;
    this.chunk = chunk;
  }

  exec() {
    this.shard.emit('ready', this.chunk.d);
  }
};

module.exports = Ready;