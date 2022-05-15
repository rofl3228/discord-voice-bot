const Redis = require('./clients/redis');

const MusicQueues = require('./music_queues_storage');
const PlayersStorage = require('./players_storage');
const log = require('../common/logger').create({ zone: 'Stores' });

class Stores {
  constructor() {
    this._musicQueues = new MusicQueues(new Redis());
    this._players = new PlayersStorage();
  }

  async init() {
    log.info('Initializing storages ----->');
    await Promise.all([
      this._musicQueues.init(),
      this._players.init(),
    ]);
    log.info('Stores initialization finished <-----');
  }

  /**
   * Guilds music queues
   * @returns {MusicQueuesStorage}
   */
  get musicQueues() {
    return this._musicQueues;
  }

  /**
   * Active channels storage
   * @returns {PlayersStorage}
   */
  get players() {
    return this._players;
  }
}

module.exports = new Stores();
