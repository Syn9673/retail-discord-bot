const Message = require('../structs/Message');
const User = require('../structs/User');

class MessageCreate {
  constructor(client, shard, chunk) {
    this.client = client;
    this.shard = shard;
    this.chunk = chunk;
  }

  exec() {
    if (!this.shard.is_ready) return;
    
    this.chunk.d.author = new User(this.client, this.chunk.d.author);

    this.shard.emit('message_create', new Message(this.client, this.chunk.d));
  }
};

module.exports = MessageCreate;