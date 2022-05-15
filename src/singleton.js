class Singleton {
  constructor() {
    this.storage = {
      players: {},
      musicQueues: {},
    };
  }
}

module.exports = new Singleton();
