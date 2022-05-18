const { getVoiceConnection } = require('@discordjs/voice');
const Action = require('../core/action');
const singleton = require('../singleton');

class PingAction extends Action {
  static action = 'stop';

  static description = 'Abort music player';

  /**
   * Reply to message with pong
   * @returns {Promise<void>}
   */
  async execute() {
    const connection = getVoiceConnection(this.guildId);
    if (!connection) {
      this.reply('Player not active now');
      return;
    }
    await singleton.storage.musicQueues.clear(this.guildId);
    const { player, subscription } = singleton.storage.players.getPlayer(this.guildId) || {};
    player.stop(true);
    subscription.unsubscribe();
    connection.destroy();
    this.reply('Okay :(');
  }
}

module.exports = PingAction;
