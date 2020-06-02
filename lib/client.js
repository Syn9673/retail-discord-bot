const BetterMap = require('./BetterMap');
const GatewayConnection = require('./gateway/connection');
const { readdirSync, statSync } = require('fs');

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

    options.auto_connect = options.auto_connect ?? true;
    options.shard = typeof options.shard === 'object' && !Array.isArray(options.shard) ? options.shard : { start_at: 0, count: 1 };
    options.compress = options.compress ?? false;
    options.encoding = options.encoding ?? 'json';

    Object.defineProperties(this, {
      shards: {
        value: new BetterMap()
      },

      events: {
        value: new BetterMap()
      },

      options: {
        value: options
      }
    });

    this.#load_events_to_cache();

    if (options.auto_connect)
      this.connect_shard(options.shard.start_at, options.shard.count);
  }

  connect_shard(start_at, count) {
    let i = start_at;
    let real_index = 0;

    while(i < count) {
      new GatewayConnection(this, i, real_index);
      i++;
      real_index++;
    }
  }
};

module.exports = Client;