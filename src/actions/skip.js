const { getVoiceConnection, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const Action = require('../core/action');
const singleton = require('../singleton');

const YTDL_PRESET = { filter: 'audioonly', quality: 'highestaudio' };

class SkipAction extends Action {
  static action = 'skip';

  static description = 'Play next url from queue';

  /**
   * Reply to message with pong
   * @returns {Promise<void>}
   */
  async execute() {
    const connection = getVoiceConnection(this.guildId);
    if (!connection) {
      this.reply('No music to play');
      return;
    }
    const url = await singleton.storage.musicQueues.poll(this.guildId);
    if (!url) {
      this.reply('Queue is empty');
      return;
    }
    const { player } = singleton.storage.players.getPlayer(this.guildId);
    player.play(createAudioResource(ytdl(url, YTDL_PRESET), { metadata: {} }));
    const { videoDetails: { title } } = await ytdl.getInfo(url);
    this.send(`Playing now: **${title}**`);
  }
}

module.exports = SkipAction;
