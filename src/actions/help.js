// not include this action in index for prevent circular dependencies
const actions = require('./index');
const Action = require('../core/action');

const helpInfo = `${Object.values(actions)
  .filter((action) => !action.disabled)
  .reduce(
    (acc, { handler, description }) => `${acc}${handler} - ${description}\n`,
    'My important commands list:\n```',
  )}\n\`\`\``;

class HelpAction extends Action {
  static action = 'help';

  static description = 'Display this message';

  async execute() {
    await this.send(helpInfo);
  }
}

module.exports = HelpAction;
