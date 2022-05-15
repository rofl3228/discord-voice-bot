const Action = require('../core/action');

class PingAction extends Action {
  static action = 'ping';

  static description = 'Check bot is available';

  /**
   * Reply to message with pong
   * @returns {Promise<void>}
   */
  async execute() {
    await this.reply('Pong');
  }
}

module.exports = PingAction;
