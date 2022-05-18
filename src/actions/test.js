const { createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');
const Action = require('../core/action');
const singleton = require('../singleton');
const log = require('../common/logger').create({ zone: 'TestAction' });

const YTDL_PRESET = { filter: 'audioonly', quality: 'highestaudio' };

// eslint-disable-next-line no-promise-executor-return
const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class TestAction extends Action {
  static action = 't';

  static description = 'test';

  /**
   * Reply to message with pong
   * @returns {Promise<void>}
   */
  async execute() {
    const url2 = 'https://www.youtube.com/watch?v=cd3tUyau72c';
    const file = path.join(__dirname, '..', 'sounds', 'dima.ogg');
    // step with pause
    const { mainPlayer: fPlayer, connection: tConn } = singleton.storage.players.getPlayer(this.guildId);
    fPlayer.pause();
    const player2 = createAudioPlayer({});
    player2.on(
      'stateChange',
      (oldState, newState) => log.debug('player2 change state: ', oldState.status, ' -> ', newState.status),
    );
    const res2 = createAudioResource(fs.createReadStream(file), { inputType: StreamType.OggOpus, metadata: {} });// createAudioResource(ytdl(url2, YTDL_PRESET), { metadata: {} });
    tConn.subscribe(player2);
    player2.play(res2);
    player2.on('idle', () => {
      tConn.subscribe(fPlayer);
      fPlayer.unpause();
    });
  }
}

module.exports = TestAction;
