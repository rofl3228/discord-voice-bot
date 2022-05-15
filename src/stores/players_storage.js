const log = require('../common/logger').create({ zone: 'PlayersStorage' });

class PlayersStorage {
  constructor() {
    this._store = new Map();
  }

  // eslint-disable-next-line class-methods-use-this
  async init() {
    log.info('Initialize PlayersStorage');
  }

  /**
   * Get player form cache
   * @param {Snowflake}guildId
   * @returns {{}|AudioPlayer}
   */
  getPlayer(guildId) {
    log.debug(`Get player for guild: ${guildId}`);
    if (this._store.has(guildId)) {
      log.debug('Player found');
      return this._store.get(guildId);
    }
    log.debug('No player');
    return {};
  }

  addPlayer(guildId, channel) {
    log.debug(`Store player for ${guildId}`);
    this._store.set(guildId, channel);
  }

  removePlayer(guildId) {
    log.debug(`Remove player for guild: ${guildId}`);
    this._store.delete(guildId);
  }
}

module.exports = PlayersStorage;
