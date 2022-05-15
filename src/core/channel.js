const {
  joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, createAudioResource,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');

const { storage } = require('../singleton');
const { FileNotExistError } = require('../common/errors');
const log = require('../common/logger').create({ zone: 'Channel' });

const SOUNDS_PATH = '../sounds';
const YTDL_PRESET = { filter: 'audioonly', quality: 'highestaudio' };

class Channel {
  constructor(connection) {
    this._guildId = connection.joinConfig.guildId;
    this._connection = connection;
    this._connection.on('error', (err) => log.error(err));
    this._primaryPlayer = this._createPrimaryPlayer();
    this._secondaryPlayer = this._createSecondaryPlayer();
    this._subscription = this._connection.subscribe(this._primaryPlayer);
    this._currentPlayer = this._primaryPlayer;
  }

  static connection(guildId, channelId, adapterCreator) {
    return joinVoiceChannel({
      guildId,
      channelId,
      adapterCreator,
    });
  }

  _createPrimaryPlayer() {
    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });

    player.on('error', (error) => {
      log.error('Error in primaryPlayer', error);
    });

    player.on(AudioPlayerStatus.Idle, async () => {
      const url = await storage.musicQueues.pull(this._guildId);
      if (!url) {
        log.debug('No url to play, waiting disconnect');
        setTimeout(() => {
          if (this._currentPlayer.state.status === AudioPlayerStatus.Idle) {
            this.destroy();
            storage.channels.removeChannel(this._guildId);
          }
        }, 5000);
        return;
      }
      player.play(Channel.createResource(url));
    });

    return player;
  }

  _createSecondaryPlayer() {
    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });

    player.on('error', (error) => {
      log.error('Error in secondaryPlayer', error);
    });

    player.on(AudioPlayerStatus.Idle, () => {
      this.switchToPrimary();
      this.unpause();
    });

    return player;
  }

  static createResource(uri) {
    if (ytdl.validateURL(uri)) {
      log.debug('Create resource from URL');
      return createAudioResource(ytdl(uri, YTDL_PRESET), { metadata: {} });
    }
    const file = path.join(__dirname, SOUNDS_PATH, uri);
    if (!fs.existsSync(file)) {
      throw new FileNotExistError(file);
    }
    return createAudioResource(file, { metadata: {} });
  }

  async play(uri) {
    this._currentPlayer.play(Channel.createResource(uri));
  }

  get isPlaying() {
    return this._currentPlayer.state.status !== AudioPlayerStatus.Idle;
  }

  unpause() {
    this._currentPlayer.unpause();
  }

  switchToSecondary() {
    if (this._currentPlayer === this._secondaryPlayer) {
      return;
    }

    if (
      this._primaryPlayer.state.status === AudioPlayerStatus.Playing
      || this._primaryPlayer.state.status === AudioPlayerStatus.Buffering
    ) {
      this._primaryPlayer.pause();
    }

    this._subscription = this._connection.subscribe(this._secondaryPlayer);
    this._currentPlayer = this._secondaryPlayer;
  }

  switchToPrimary() {
    if (this._currentPlayer === this._primaryPlayer) {
      return;
    }

    this._secondaryPlayer.pause();

    this._subscription = this._connection.subscribe(this._primaryPlayer);
    this._currentPlayer = this._primaryPlayer;
    this._currentPlayer.unpause();
  }

  destroy() {
    this._subscription.unsubscribe();
    delete this._currentPlayer;
    this._primaryPlayer.stop(true);
    this._secondaryPlayer.stop(true);
    this._connection.destroy();
  }
}

module.exports = Channel;
