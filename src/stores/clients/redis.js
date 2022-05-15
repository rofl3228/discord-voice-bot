const Redis = require('ioredis');
const config = require('config').get('redis');

const { RedisStorageError } = require('../../common/errors');

class RedisConnection {
  constructor() {
    this._HOST = config.get('host');
    this._PORT = config.get('port');
    this._PASS = config.has('password') && config.get('password');
  }

  async init() {
    try {
      return new Redis({
        host: this._HOST,
        port: this._PORT,
        password: this._PASS,
      });
    } catch (err) {
      throw new RedisStorageError('REDIS_INIT_ERROR');
    }
  }
}

module.exports = RedisConnection;
