const cluster = require('cluster');
const WebSocket = require('ws');
const zlib = require('zlib');
const { EventEmitter } = require('events');
const CONSTANTS = require('../consants');
const BetterMap = require('../BetterMap');

class GatewayConnection extends EventEmitter {
  #handle_packet = function(chunk) {
    switch(chunk.op) {
      case CONSTANTS.opcodes.HELLO: {
        this.#hello(chunk);
        break;
      }

      case CONSTANTS.opcodes.HEARTBEAT: {
        this.emit('debug', `received heartbeat on shard: ${this.current_shard}`);
        break;
      }

      case CONSTANTS.opcodes.DISPATCH: {
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
    //this.send({ op: CONSTANTS.opcodes.HEARTBEAT, d: this.seq });
    setTimeout(() => {
      this.identify();
      this.emit('debug', `identify sent for shard ${this.current_shard}`);
    }, this.real_index * 6500);

    setInterval(() => {
      this.send({ op: CONSTANTS.opcodes.HEARTBEAT, d: this.seq });
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
      }
    });

    this.connect();
  }

  connect() {
    if (cluster.isMaster) {
      cluster.setupMaster({
        silent: true,
        windowsHide: true
      });
      this.ws = new WebSocket('wss://gateway.discord.gg/?v=6&encoding=json&compress=zlib-stream');
      this.client.shards.set(this.current_shard, this);
      cluster.fork();

      this.listen();
    }
  }

  listen() {
    const inflate = zlib.createInflate({
      chunkSize: 128 * 1024,
      flush: zlib.constants.Z_SYNC_FLUSH
    });

    this.ws.on('message', (data) => {
      if (this.client.options.compress) {
        if (Buffer.isBuffer(data) && data.readIntBE(data.length - 4, 4) === 0xFFFF) { // zlib compressed data
          inflate.write(data);

          inflate.once('data', (chunk) => {
            chunk = chunk.toString();
            chunk = JSON.parse(chunk);

            this.#handle_packet(chunk);
          });
        } else {
          let chunk = JSON.parse(data);
          this.#handle_packet(chunk);
        };
      }
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