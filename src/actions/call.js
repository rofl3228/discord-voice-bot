const Action = require('../core/action');

class CallAction extends Action {
  static action = 'call';

  static description = 'Mention for someone';

  /**
   * Reply to message with pong
   * @returns {Promise<void>}
   */
  async execute() {
    const userid = this.args;
    this.send(`Hey! ${userid}`);
    await this.remove();
  }
}

module.exports = CallAction;
