const log = require('../common/logger').create({ zone: 'MusicQueuesStorage' });

class MusicQueuesStorage {
  constructor(redis) {
    this._redis = redis;
    this._client = null;
    this._QUEUE_KEY = 'MUSIC_QUEUE';
  }

  async init() {
    log.info('Initialize MusicQueuesStorage');
    this._client = await this._redis.init();
  }

  async push(guildId, element) {
    log.info(`Add ${element} to ${guildId} queue`);
    await this._client.rpush(`${this._QUEUE_KEY}:${guildId}`, element);
  }

  async poll(guildId) {
    log.info(`Poll element from ${guildId} queue`);
    const element = await this._client.lpop(`${this._QUEUE_KEY}:${guildId}`);
    log.info(`Polled element: ${element}`);
    return element;
  }

  async clear(guildId) {
    log.info(`Clear ${guildId} queue`);
    await this._client.del(`${this._QUEUE_KEY}:${guildId}`);
  }
}

module.exports = MusicQueuesStorage;
