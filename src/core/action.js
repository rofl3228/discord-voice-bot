/* eslint-disable class-methods-use-this,no-unused-vars */
const config = require('config').get('bot');

const { NotImplementedError } = require('../common/errors');

class Action {
  static action;

  static description;

  static disabled = false;

  /**
   * Base class for actions
   * @param {Message}message
   */
  constructor(message) {
    this._message = message;
    this._args = message.content.split(' ').slice(1);
  }

  static get handler() {
    return `${config.get('actionPrefix')}${this.action}`;
  }

  static get info() {
    return this.description;
  }

  get args() {
    return this._args;
  }

  reply(options) {
    return this._message.reply(options);
  }

  send(options) {
    return this._message.channel.send(options);
  }

  remove() {
    return this._message.delete();
  }

  get voiceChannelId() {
    return this._message.member.voice.channelId;
  }

  get guildId() {
    return this._message.guild.id;
  }

  get voiceAdapterCreator() {
    return this._message.guild.voiceAdapterCreator;
  }

  /**
   * Function with initial logic
   * @returns {Promise<void>}
   * @virtual
   */
  async execute() {
    throw new NotImplementedError();
  }
}

module.exports = Action;
