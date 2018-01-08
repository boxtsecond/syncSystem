
'use strict';
const models = require('../models');
class Discover {
  constructor(app, util) {
    this.mysqlDiscoverModel = app.get("mysqlDiscoverModel");
    this.redisDiscoverModel = app.get("redisDiscoverModel");
    this.log = util.log;
  }
  saveDiscoverDisplay (discoverDisplay) {
    discoverDisplay = new models.discoverModel.discoverDisplay(discoverDisplay);
    return this.mysqlDiscoverModel.save(discoverDisplay)
      .then(resDiscoverDisplay => {
        return this.redisDiscoverModel.save(resDiscoverDisplay).then(() => resDiscoverDisplay);
      });
  }
  delDisplayById (sid, id) {
    return this.findDisplayById(sid, id).then(discoverDisplay => {
      return Promise.all([
        this.mysqlDiscoverModel.delById(id),
        this.redisDiscoverModel.del(discoverDisplay)
      ]).then(res => {
        return res&&res[0]&&res[1];
      });
    });
  }
  findDisplayById (sid, id) {
    return this.redisDiscoverModel.get(sid, id)
      .then(redisResult => {
        if (redisResult) return redisResult;
        return this.mysqlDiscoverModel.findById(id).then(mysqlResult => {
          if (!mysqlResult) return null;
          // 异步写回redis
          this.redisDiscoverModel.save(mysqlResult)
            .catch(err => this.log.error('discoverService-findDisplayById:redis写回失败', err));
          return mysqlResult;
        });
      });
  }
  updateById (updateDisplayAttributes, sid, id) {
    updateDisplayAttributes = new models.discoverModel.updateDisplayAttributes(updateDisplayAttributes);
    return this.findDisplayById(sid, id).then(oldDisplay => {
      if (!oldDisplay) return null;
      let newDisplay = Object.assign({}, oldDisplay, updateDisplayAttributes);
      return this.redisDiscoverModel.save(newDisplay)
        .then(redisResult => {
          return this.mysqlDiscoverModel.updateById(updateDisplayAttributes, id)
            .then(() => oldDisplay);
        });
    });
  }
  listBySid (sid) {
    return this.redisDiscoverModel.listDiscoverIdBySid(sid)
      .then(discoverIds => Promise.map(discoverIds, id => this.findDisplayById(sid, id)))
      .then(redisResult => {
        if (redisResult && redisResult.length) return redisResult;
        return this.mysqlDiscoverModel.listBySid(sid)
          .then(mysqlResult => {
            if (!mysqlResult) return [];
            // 异步写回 redis
            Promise.map(mysqlResult, discover => {
              return this.redisDiscoverModel.save(discover);
            }).catch(err => this.log.error('discoverService-listBySid:redis写回失败', err));
            return mysqlResult;
          });
      });
  }
}
module.exports = Discover;
