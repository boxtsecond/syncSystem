/**
 * Created by Bo on 2017/11/13.
 */

'use strict';

const eutil = require('eutil');
const util = require('../../util');

class masterModel {
  constructor(wclient, rclient) {
    this.wclient = wclient;
    this.rclient = rclient;
    this.walletTable = 'wallet';
  }
  
  get(uid, type, fileds) {
    return this.rclient(this.walletTable).select(fileds).where({uid: uid, status: 1, type: type}).limit(1).then(w => {
      if (w && w.length) return w[0];
      else return null;
    });
  }
  
  set(wallet) {
    return this.wclient(this.walletTable).insert(wallet);
  }
  
  update(uid, type, data) {
    return this.wclient(this.walletTable).where({uid: uid, type: type}).update(data).limit(1);
  }
  
  getAll(uid, fileds) {
    return this.rclient(this.walletTable).select(fileds).where({uid: uid, status: 1});
  }
  
  updateBalance(uid, type, score, trx) {
    if(trx) {
      let update = {
        raw: 'update ?? set balance = balance + ?, mtime = ? where `uid` = ? and `type` = ?',
        params: [this.walletTable, score, eutil.getTimeSeconds(),uid, type]
      };
      if (score < 0) update.raw += ' and `balance` >= ?', update.params.push(-1 * score);
      return trx.raw(update.raw+' limit 1', update.params);
    }else {
      return this.wclient(this.walletTable).increment('balance', score).where({uid: uid, type: type}).limit(1);
    }
  }
  
  getAllUserBalance(uid) {
    return this.rclient(this.walletTable).select('uid', 'balance').where('uid', '<=', uid).orderBy('uid', 'desc').limit(1000);
  }
}

module.exports = masterModel;
