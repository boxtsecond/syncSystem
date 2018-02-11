/**
 * Created by Bo on 2017/11/13.
 */

'use strict';

class masterModel {
  constructor(wclient,rclient) {
    this.wclient=wclient;
    this.rclient=rclient;
    this.walletTable = 'wallet:';
    this.walletBalanceTable = 'balance:';
  }
  
  get (uid, type) {
    return this.rclient.hget(this.walletTable+uid, type).then(w => {
      if(w && w != '{}') return JSON.parse(w);
      else return null;
    });
  }
  
  set(wallet) {
    return this.wclient.hset(this.walletTable+wallet.uid, wallet.type, JSON.stringify(wallet));
  }
  
  getAll (uid) {
    return this.rclient.hgetall(this.walletTable+uid);
  }
  
  del(uid, type) {
    return this.wclient.hdel(this.walletTable+uid, type);
  }
  
  upsertBalance (uid, score, type, set) {
    if(!set) return this.wclient.hincrbyfloat(this.walletBalanceTable+uid, type, score);
    else return this.wclient.hset(this.walletBalanceTable+uid, type, score);
  }
  
  getIncrRedisBalance (uid, type) {
    return this.rclient.hget(this.walletBalanceTable+uid, type);
  }
  
  delBalance(uid, type) {
	  return this.wclient.hdel(this.walletBalanceTable+uid, type);
  }
}

module.exports = masterModel;
