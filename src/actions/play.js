const ytdl = require('ytdl-core');
const {
  joinVoiceChannel, getVoiceConnection, createAudioPlayer, AudioPlayerStatus, createAudioResource,
} = require('@discordjs/voice');
const singleton = require('../singleton');
const Action = require('../core/action');
const log = require('../common/logger').create({ zone: 'PlayAction' });

const YTDL_PRESET = { filter: 'audioonly', quality: 'highestaudio' };

class PlayAction extends Action {
  static action = 'play';

  static description = 'Play youtube video in your current channel';

  async execute() {
    if (!this.voiceChannelId) {
      this.reply('You are not in channel');
      return;
    }

    // Get connection
    let connection = getVoiceConnection(this.guildId);
    if (!connection) {
      log.debug(`No connection for guild ${this.guildId}`);
      connection = joinVoiceChannel({
        guildId: this.guildId,
        channelId: this.voiceChannelId,
        adapterCreator: this.voiceAdapterCreator,
      });
      connection.on(
        'stateChange',
        (oldState, newState) => log.debug('Connection change state: ', oldState.status, ' -> ', newState.status),
      );
    }
    log.debug(`Connection found: ${!!connection}`);

    // Get player for connection
    let { player } = singleton.storage.players.getPlayer(this.guildId);
    if (!player) {
      player = createAudioPlayer({});
      player.on('stateChange', (oldState, newState) => log.debug('Player change state: ', oldState.status, ' -> ', newState.status));
      player.on('idle', async () => {
        log.debug('Player idled');
        const url = await singleton.storage.musicQueues.poll(this.guildId);
        if (!url) {
          this.send('Music queue is empty');
          singleton.storage.players.removePlayer(this.guildId);
          connection.destroy();
          return;
        }
        const resource = createAudioResource(ytdl(this.args[0], YTDL_PRESET), { metadata: {} });
        player.play(resource);
      });
      player.on('error', (err) => {
        log.error('PLAYER_ERROR', err);
      });

      const subscription = connection.subscribe(player);
      singleton.storage.players.addPlayer(this.guildId, { player, subscription });
    }
    log.debug(`Player found: ${!!player}`);

    // Check player status and play
    if (player.state.status === AudioPlayerStatus.Idle) {
      const resource = createAudioResource(ytdl(this.args[0], YTDL_PRESET), { metadata: {} });
      player.play(resource);
      const info = await ytdl.getInfo(this.args[0]);
      this.send(`Playing now: **${info.videoDetails.title}**`);
      return;
    }
    singleton.storage.musicQueues.push(this.guildId, this.args[0]);
    this.reply('Was added to queue');
  }
}

module.exports = PlayAction;
