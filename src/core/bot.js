const config = require('config').get('bot');
const { Client, Constants: { Events }, Intents: { FLAGS } } = require('discord.js');
const {
  getVoiceConnection, joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType,
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');
const singleton = require('../singleton');
// Special case for load all commands
const actions = require('../actions');
const HelpAction = require('../actions/help');
const log = require('../common/logger').create({ zone: 'Bot' });

class Bot {
  constructor(token) {
    this._token = token;
    this._bot = new Client({ intents: [FLAGS.GUILDS, FLAGS.GUILD_VOICE_STATES, FLAGS.GUILD_MESSAGES] });
    this._actions = new Map();
    this._vipUsers = config.get('vipUsers');
    this._bot.on(Events.VOICE_STATE_UPDATE, this.onVoiceStateUpdate.bind(this));
    this._bot.on(Events.MESSAGE_CREATE, this.onMessageCreate.bind(this));
    this._bot.on(Events.ERROR, this.errorHandler.bind(this));
  }

  async launch() {
    await this.loadCommands();
    log.info('Start bot login');
    await this._bot.login(this._token);
    log.info(`Bot connected as ${this._bot.user.username}`);
  }

  async loadCommands() {
    log.info('Loading actions');
    Object.values(actions).forEach((action) => {
      if (!action.disabled) {
        this._actions.set(action.handler, action);
      } else {
        log.warn(`Action ${action.name} is disabled`);
      }
    });
    log.info('Actions loaded');
  }

  async stop() {
    this._bot.destroy();
    log.info('Bot is shutdown');
    process.exit(0);
  }

  /**
   * Voice state update handler
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   * @returns {Promise<void>}
   */
  async onVoiceStateUpdate(oldState, newState) {
    if (oldState.id === this._bot.user.id) {
      return;
    }
    const voiceEvent = Bot.calcEvent(oldState, newState);
    log.info(`Handle voice event: ${voiceEvent}`);
    switch (voiceEvent) {
      case 'muted':
        this.playFile('mute.mp3', { guildId: newState.guild.id, channelId: newState.channelId });
        break;
      case 'unmuted':
        this.playFile('unmute.mp3', { guildId: newState.guild.id, channelId: newState.channelId });
        break;
      case 'joined':
        joinedUser = this._vipUsers[newState.id];
        if (joinedUser) {
          this.playFile(joinedUser.file, { guildId: newState.guild.id, channelId: newState.channelId });
        }
        break;
      case 'leave':
        this.playFile('leave.mp3', { guildId: newState.guild.id, channelId: newState.channelId });
        break;
      default:
        log.debug(`Unprocessable event ${voiceEvent}`);
        break;
    }
  }

  async playFile(file, options = { guildId: undefined, channelId: undefined }) {
    let connection = getVoiceConnection(options.guildId);
    if (!connection) {
      log.debug(`Connection not exist for guild: ${options.guildId}`);
      connection = joinVoiceChannel({
        guildId: options.guildId,
        channelId: options.channelId,
        adapterCreator: this._bot.guilds.cache.get(options.guildId).voiceAdapterCreator,
      });
      connection.on(
        'stateChange',
        (oldState, newState) => log.debug('Connection change state: ', oldState.status, ' -> ', newState.status),
      );
    }
    log.debug('Connection found');
    const { player, subscription } = singleton.storage.players.getPlayer(options.guildId);
    if (player) {
      player.pause();
      subscription.unsubscribe();
    }
    const tempPlayer = createAudioPlayer({});
    tempPlayer.on('error', (err) => log.error('Temp player error', err));
    tempPlayer.on('stateChange', (oldState, newState) => log.debug('Temp change state: ', oldState.status, ' -> ', newState.status));

    connection.subscribe(tempPlayer);
    const resource = createAudioResource(
      fs.createReadStream(path.join(__dirname, '../sounds', file)),
      { inputType: StreamType.Arbitrary, metadata: {} },
    );
    tempPlayer.play(resource);
    tempPlayer.on('idle', () => {
      tempPlayer.stop(true);
      if (player) {
        log.debug('Turn back music player');
        const newSubscription = connection.subscribe(player);
        singleton.storage.players.addPlayer(options.guildId, { player, subscription: newSubscription });
        player.unpause();
        return;
      }
      log.debug('No waiting player, destroy connection');
      connection.destroy();
    });
  }

  static calcEvent(oldState, newState) {
    if (oldState.channelId && !newState.channelId) {
      return 'leave';
    }
    if (!oldState.channelId && newState.channelId) {
      return 'joined';
    }
    if (!oldState.selfDeaf && newState.selfDeaf) {
      return 'deaf';
    }
    if (oldState.selfDeaf && !newState.selfDeaf) {
      return 'undeaf';
    }
    if (!oldState.selfMute && newState.selfMute) {
      return 'muted';
    }
    if (oldState.selfMute && !newState.selfMute) {
      return 'unmuted';
    }
    return 'unknown';
  }

  /**
   * New message handler
   * @param {Message} message
   * @returns {Promise<void>}
   */
  async onMessageCreate(message) {
    if (message.author.bot) {
      return;
    }

    log.debug(`Message handled ${message}`);
    if (!message.content.startsWith(config.get('actionPrefix'))) {
      log.debug('Not command message');
      return;
    }

    const [action] = message.content.split(' ');
    if (this._actions.has(action)) {
      await new (this._actions.get(action))(message).execute();
    } else if (action === HelpAction.handler) {
      await new HelpAction(message).execute();
    } else {
      await message.channel.send('Use .help for list commands');
    }
  }

  /* eslint-disable-next-line class-methods-use-this */
  errorHandler(error) {
    log.error('Bot error occurred', error);
  }
}

module.exports = Bot;
