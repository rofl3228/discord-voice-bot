const { joinVoiceChannel } = require('@discordjs/voice');
const singleton = require('../singleton');
const Channel = require('./channel');
const log = require('../common/logger').create({ zone: 'SoundManager' });

class SoundManager {
  static async play(uri, { channelId, guildId, adapter }, secondary = false) {
    log.debug(`Got ${uri} from guild ${guildId}, secondary ${secondary}`);
    let channel = singleton.storage.channels.getChannel(guildId);
    log.debug('Found channel', channel);
    if (!channel) {
      const connection = joinVoiceChannel({
        guildId,
        channelId,
        adapterCreator: adapter,
      });
      channel = new Channel(connection);
      singleton.storage.channels.addChannel(guildId, channel);
    }
    if (secondary) {
      channel.switchToSecondary();
    } else {
      channel.switchToPrimary();
    }
    if (channel.isPlaying) {
      log.debug('Channel now is playing, add to queue');
      await singleton.storage.musicQueues.push(guildId, uri);
      return;
    }
    log.info(`Start playing ${uri} for guild ${guildId}`);
    await channel.play(uri);
  }

  static async next(guildId) {
    const channel = singleton.storage.channels.getChannel(guildId);
    if (!channel) {
      return false;
    }
    channel.switchToPrimary();
    const url = await singleton.storage.musicQueues.pull(guildId);
    if (!url) {
      return false;
    }
    channel.play(url);
    return true;
  }
}

module.exports = SoundManager;
