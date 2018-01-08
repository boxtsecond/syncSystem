/*
 * @Author: dongyuxuan 
 * @Date: 2017-10-30 18:28:11 
 * @Last Modified by: dongyuxuan
 * @Last Modified time: 2017-12-14 10:41:11
 */
'use strict';

class redisDiscoverModel {
  constructor(wclient,rclient){
    this.wclient=wclient;
    this.rclient=rclient;
    this.valueTable = 'discover:';// + sid type:hash key：id，value：JSON字符串(discover_display信息)
    this.sidIndexTable = 'discover_sid_sort:'; // + sid value:id,score:score 
  }
  getValueTable (sid) {
    return this.valueTable + sid;
  }
  getSidIndexTable (sid) {
    return this.sidIndexTable + sid;
  }
  updateSort (sortName, score, value, action) {
    return (action
        ? this.wclient.zadd(sortName, score, value)
        : this.wclient.zrem(sortName, value)
    );
  }
  updateSidIndexTable ({sid, score, id, action}) {
    return this.updateSort(this.getSidIndexTable(sid), score, id, action);
  }
  save (discover) {
    return this.set(discover)
      .then(() => this.updateSidIndexTable({
        sid: discover.sid,
        score: discover.score,
        id: discover.id,
        action: true
      }));
  }
  del (discover) {
    discover.isdel = 1;
    return this.set(discover).then(() => this.updateSidIndexTable({
      sid: discover.sid,
      score: discover.score,
      id: discover.id,
      action: false
    }));
  }
  listDiscoverIdBySid (sid) {
    return this.rclient.zrangebyscore(this.getSidIndexTable(sid), '-inf', '+inf');
  }
  set (discover) {
    return this.wclient.hset(this.getValueTable(discover.sid), discover.id, JSON.stringify(discover));
  }
  get (sid, id) {
    return this.rclient.hget(this.getValueTable(sid), id)
    .then(res => {
      if (res) return JSON.parse(res);
      else return null;
    });
  }
}
module.exports = redisDiscoverModel;