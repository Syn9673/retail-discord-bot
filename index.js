const bot = require('./lib/client');
const abot = new bot({
  token: 'YOUR_TOKEN',
  auto_connect: true,
  compress: true,
  shard: {
    start_at: 0,
    count: 2
  }
});

abot.shards.broadcast(function(shard_id, shard) {
  shard.on('debug', (msg) => console.log(`[DEBUG]: ${msg}`));
  shard.on('guild_available', (guild) => console.log(`Guild: ${guild.name} now available in shard: ${shard_id}`));
});