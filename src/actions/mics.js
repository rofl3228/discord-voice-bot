const ytdl = require('ytdl-core');
const {
  getVoiceConnection, joinVoiceChannel, createAudioPlayer, createAudioResource,
} = require('@discordjs/voice');
const Action = require('../core/action');
const singleton = require('../singleton');
const log = require('../common/logger').create({ zone: 'MicsAction' });

const YTDL_PRESET = { filter: 'audioonly', quality: 'highestaudio' };

class MicsAction extends Action {
  static action = 'mics';

  static description = 'mics two source';

  /**
   * Reply to message with pong
   * @returns {Promise<void>}
   */
  async execute() {
    const url1 = this.args[0];
    // Get connection
    let conn = getVoiceConnection(this.guildId);
    if (!conn) {
      log.debug(`No connection for guild ${this.guildId}`);
      conn = joinVoiceChannel({
        guildId: this.guildId,
        channelId: this.voiceChannelId,
        adapterCreator: this.voiceAdapterCreator,
      });
      conn.on(
        'stateChange',
        (oldState, newState) => log.debug('Connection change state: ', oldState.status, ' -> ', newState.status),
      );
    }
    log.debug(`Connection found: ${!!conn}`);
    const player1 = createAudioPlayer({});
    player1.on(
      'stateChange',
      (oldState, newState) => log.debug('player1 change state: ', oldState.status, ' -> ', newState.status),
    );
    player1.on('idle', () => {
      player1.stop(true);
      conn.destroy();
      singleton.storage.players.removePlayer(this.guildId);
    });
    singleton.storage.players.addPlayer(this.guildId, { connection: conn, mainPlayer: player1 });
    const res1 = createAudioResource(ytdl(url1, YTDL_PRESET), { metadata: {} });

    const { connection, mainPlayer } = singleton.storage.players.getPlayer(this.guildId);

    // Check getting from storage
    connection.subscribe(mainPlayer);
    mainPlayer.play(res1);
  }
}

module.exports = MicsAction;
