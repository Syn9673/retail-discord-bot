const cluster = require('cluster');
const WebSocket = require('ws');
const { EventEmitter } = require('events');
const CONSTANTS = require('../consants');
const BetterMap = require('../BetterMap');
const zlib = require('zlib-sync');

class GatewayConnection extends EventEmitter {
  #handle_packet = function(chunk) {
    switch(chunk.op) {
      case CONSTANTS.opcodes.HELLO: {
        this.#hello(chunk);
        break;
      }

      case CONSTANTS.opcodes.HEARTBEAT_ACK: {
        this.last_receive_timestamp = Date.now();
        this.emit('debug', `received heartbeat on shard: ${this.current_shard}`);
        break;
      }

      case CONSTANTS.opcodes.DISPATCH: {
        this.seq = chunk.s;
        //if (!this.is_ready && (chunk.t.toLowerCase() !== 'ready' || chunk.t.toLowerCase() !== 'guild_create')) break;
        Object.defineProperty(chunk.d, 'shard', {
          value: this,
          writable: false,
          enumerable: false
        });

        if (!this.client.events.has(chunk.t.toLowerCase()))
          this.emit('debug', `unhandled event: ${chunk.t}`);
        else new (this.client.events.get(chunk.t.toLowerCase()))(this.client, this, chunk).exec();
        break;
      }

      default: {
        this.emit('debug', `unhandled opcode: ${chunk.op}`);
        break;
      }
    }
  }

  #hello = function(chunk) {
    this.send({ op: CONSTANTS.opcodes.HEARTBEAT, d: this.seq });
    this.last_sent_timestamp = Date.now();

    setTimeout(() => {
      this.identify();
      this.emit('debug', `identify sent for shard ${this.current_shard}`);
    }, this.real_index * 5500);

    setInterval(() => {
      this.send({ op: CONSTANTS.opcodes.HEARTBEAT, d: this.seq });
      this.last_sent_timestamp = Date.now();
    }, chunk.d.heartbeat_interval);
  }
  constructor(client, current_shard, real_index) {
    super();

    Object.defineProperties(this, {
      client: {
        value: client,
        writable: false,
        enumerable: true
      },

      current_shard: {
        value: current_shard,
        enumerable: false,
        writable: false
      },

      client_data: {
        value: null,
        enumerable: false,
        writable: true
      },

      real_index: {
        value: real_index
      },

      guilds: {
        value: new BetterMap(),
        enumerable: true,
        writable: false
      },

      guild_count: {
        value: 0,
        enumerable: false,
        writable: true
      },

      session_id: {
        value: null,
        writable: true,
        enumerable: true
      },

      users: {
        value: new BetterMap()
      },

      is_ready: {
        value: false,
        writable: true
      },

      seq: {
        value: null,
        writable: true,
        enumerable: true
      },

      last_sent_timestamp: {
        value: 0,
        writable: true,
        enumerable: false
      },

      last_receive_timestamp: {
        value: 0,
        writable: true,
        enumerable: false
      }
    });

    this.connect();
  }

  get ping() {
    return this.last_receive_timestamp - this.last_sent_timestamp;
  }

  connect() {
    if (cluster.isMaster) {
      cluster.setupMaster({
        silent: true,
        windowsHide: true
      });
      this.ws = new WebSocket(`wss://gateway.discord.gg/?v=6&encoding=json${this.client.options.compress ? '&compress=zlib-stream' : ''}`);
      this.client.shards.set(this.current_shard, this);

      cluster.fork();
      this.listen();
    }
  }

  listen() {
    const inflate = new zlib.Inflate({ chunkSize: 128 * 1024 });
    this.ws.on('message', (data) => {
      if (this.client.options.compress) {
        if (Buffer.isBuffer(data) && data.readIntBE(data.length - 4, 4) === 0xFFFF) { // zlib compressed data
          inflate.push(data, zlib.Z_SYNC_FLUSH);
          
          if (inflate.err)
            throw new Error(inflate.msg);

          let chunk = JSON.parse(inflate.result.toString());
          this.#handle_packet(chunk);
        }
      } else {
        let chunk = JSON.parse(data);
        this.#handle_packet(chunk);
      };
    });
  }

  identify(chunk) {
    let data_to_send = {
      token: this.client.options.token,
      compress: this.client.options.compress,
      shard: [this.current_shard, this.client.options.shard.count],
      properties: {
        $os: process.platform,
        $browser: 'idk',
        $os: 'idk'
      }
    };

    this.send({ op: CONSTANTS.opcodes.IDENTIFY, d: data_to_send });
  }

  send(data) {
    this.ws.send(typeof data === 'object' && !Array.isArray(data) ? JSON.stringify(data) : data);
  }
};

module.exports = GatewayConnection;