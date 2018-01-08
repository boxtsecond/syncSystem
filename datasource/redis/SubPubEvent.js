'use strict';
const events = require('events');

class SubPubEventModel{
  constructor(redisSubscribe, redisPublish){
    this.redisSubscribe = redisSubscribe;
    this.redisPublish = redisPublish;
    this.redisPublishEvent=new events.EventEmitter();

    this.redisSubscribe.on('message', (channel, message) => {
      this.redisPublishEvent.emit(channel, message);
    });
  }
  subscribe (channel) {
    return new Promise((resolve, reject) => {
      this.redisSubscribe.subscribe(channel, (err, count) => {
        if (err) {
          return reject(err);
        }
        resolve({event: this.eventEmitter, count});
      });
    });
  }
  publish (channel, message) {
    return this.redisPublish.publish(channel, message);
  }
}
module.exports = SubPubEventModel;
