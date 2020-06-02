const BetterMap = require('./BetterMap');
const GatewayConnection = require('./gateway/connection');
const { readdirSync, statSync } = require('fs');
const Rest = require('./rest');
const Message = require('./gateway/structs/Message');

class Client {
  #load_events_to_cache = function() {
    let events = readdirSync(`${__dirname}/gateway/events`)
    .filter(event => statSync(`${__dirname}/gateway/events/${event}`).isFile() && event.endsWith('.js'));

    for (let event of events) {
      this.events.set(event.split('.')[0], require(`./gateway/events/${event}`));
    }
  }
  constructor(options = {}) {
    if (!options.token || !options.token.match(/\w+\.\w+\.\w+/g))
      throw new Error('invalid token.');

    options.auto_connect = options.auto_connect || false ;
    options.shard = typeof options.shard === 'object' && !Array.isArray(options.shard) ? options.shard : { start_at: 0, count: 1 };
    options.compress = options.compress || false;
    options.encoding = options.encoding || 'json';

    Object.defineProperties(this, {
      shards: {
        value: new BetterMap()
      },

      events: {
        value: new BetterMap()
      },

      options: {
        value: options
      },

      user: {
        value: null,
        writable: true,
        enumerable: true
      },

      http: {
        value: new Rest(this),
        writable: false,
        enumerable: false
      }
    });

    this.#load_events_to_cache();

    if (options.auto_connect)
      this.connect_shard(options.shard.start_at, options.shard.count);
  }

  connect_shard(start_at, count) {
    console.log(`Connecting to discord with ${count} shard${count === 0 || count > 1 ? 's' : ''}, starting at Shard #${start_at}`)

    let i = start_at;
    let real_index = 0;

    while(i < count) {
      new GatewayConnection(this, i, real_index);
      i++;
      real_index++;
    }
  }

  async send_message(channel_id, content) {
    let msg = await this.http.post({
      url: `https://discord.com/api/v6/channels/${channel_id}/messages`,
      data: { content }
    });

    return new Message(this, msg.data);
  }

  async edit_message(channel_id, message_id, content) {
    let msg = await this.http.patch({
      url: `https://discord.com/api/v6/channels/${channel_id}/messages/${message_id}`,
      data: { content }
    });

    return new Message(this, msg.data);
  }
};

module.exports = Client;