/**
 * Created by Bo on 2017/11/13.
 */

'use strict';
const models = require('../models');
const _ = require('lodash');
const eutil = require('eutil');

class Wallet {
  constructor(app, util) {
    this.mysqlWalletModel = app.get("mysqlWalletModel");
    this.redisWalletModel = app.get("redisWalletModel");
    this.log = util.log;
  }
  
  get (uid, type) {
    return this.redisWalletModel.get(uid, type)
      .then(w => {
        if(w) return w;
        else {
          return this.mysqlWalletModel.get(uid, type)
            .then(wallet => {
              if(wallet) {
                wallet.balance = wallet.balance.toString();
                this.redisWalletModel.set(wallet);
                return wallet;
              }
              else return null;
            });
        }
      });
  }
  
  set (wallet) {
    return this.mysqlWalletModel.set(wallet)
      .then(w => {
        this.redisWalletModel.set(wallet);
        return wallet;
      });
  }
  
  getAll (uid) {
    return this.redisWalletModel.getAll(uid)
      .then(ws => {
        if (ws && JSON.stringify(ws) != '{}') {
          return _.values(ws).map(c => {return JSON.parse(c);});
        }
        else {
          return this.mysqlWalletModel.getAll(uid)
            .then(chs => {
              chs.forEach(c => {return this.redisWalletModel.set(c);});
              return chs;
            });
        }
      });
  }
  
  upsert (uid, type, data) {
    return this.mysqlWalletModel.update(uid, type, data)
      .then((rs) => {
        data.uid = uid, data.type = type;
        if(rs === 1) return rs;
        else return this.mysqlWalletModel.set(data);
      })
      .then(() => {
        return this.redisWalletModel.set(data);
      });
  }
  
  // 使用事务更新用户积分
  updateBalance (uid, type, score, trx) {
    return this.mysqlWalletModel.updateBalance(uid, type, score, trx);
  }
  
  // 更新redis中的用户积分
  updateRedisBalance (uid, score, type) {
    return this.redisWalletModel.get(uid, type || 1)
      .then(wallet => {
        if(wallet) {
          wallet.balance = score;
          wallet.mtime = eutil.getTimeSeconds();
          return this.redisWalletModel.set(wallet);
        }else return null;
      })
      .catch(error => {
        this.log.error(error);
        return this.redisWalletModel.del(uid, type || 1);
      });
  }
  
  // 存在则返回，不存在则创建
  checkAndSet (uid, type) {
    return this.get(uid, type).then(wallet => {
      if(wallet) return wallet;
      else return this.set(new models.walletModel.Wallet({uid, type}));
    });
  }
  
  deleteRedisWallet (uid, type) {
    return this.redisWalletModel.del(uid, type);
  }
  
  //only update balance
  updateIncrRedisBalance (uid, score, type, set) {
    return this.redisWalletModel.upsertBalance(uid, score, type, set)
      .then(balance => {
        if(!set && Number(balance).toFixed(2) == Number(score).toFixed(2)) {
          return this.mysqlWalletModel.get(uid, type).then(w => {
            if(!w) return null;
            else if(w.balance == 0) return balance;
            else return this.redisWalletModel.upsertBalance(uid, w.balance, type);
          });
        }
        else if(set) return score;
        else return balance;
      });
  }
  
  getIncrRedisBalance (uid, type) {
    return this.redisWalletModel.getIncrRedisBalance(uid, type);
  }
  
  updateRedisBalanceByMysql (uid, type) {
    return this.mysqlWalletModel.get(uid, type).then(wallet => {
      if(wallet) {
        return this.getIncrRedisBalance(uid, type).then(wrongBa => {
          if(wrongBa != wallet.balance) {
            wrongBa = wrongBa >= 0 ? wrongBa : 0;
            return this.redisWalletModel.upsertBalance(uid, wallet.balance-wrongBa, type);
          }else return true;
        });
      }else return false;
    });
  }
  
  getUserBalanceForOSS (uid, type) {
    return this.getIncrRedisBalance(uid, type).then(balance => {
      if(!balance) {
        return this.mysqlWalletModel.get(uid, type)
          .then(wallet => {
            if(wallet) {
              wallet.balance = wallet.balance.toString();
              return this.redisWalletModel.set(wallet).then(() => {return Number(wallet.balance);});
            }
            else return this.set(new models.walletModel.Wallet({uid, type})).then(() => {
              return 0;
            });
          });
      }else return balance;
    });
  }
  
  getAllUserBalance (uid) {
      return this.mysqlWalletModel.getAllUserBalance(uid).then(balanceArr => {
          if(balanceArr && balanceArr.length) {
	          return this.checkBalance(balanceArr).then(() => {
	              if(balanceArr.length == 1000) return this.getAllUserBalance(balanceArr[999].uid);
	              else {console.log('done');return true;}
              })
          }else {console.log('done');return true;};
      });
  }
  
  checkBalance(balanceArr) {
	  return Promise.each(balanceArr, bc => {
		  return this.redisWalletModel.getIncrRedisBalance(bc.uid, 1).then(rbc => {
			  if(rbc && rbc.toString().fixed(2) != bc.balance.toString().fixed(2)) {
				  console.error('--------', bc.uid);
				  console.error('mysql/redis', bc.balance, rbc);
				  return Promise.all([
					  this.redisWalletModel.del(bc.uid, 1),
					  this.redisWalletModel.delBalance(bc.uid, 1)
				  ])
			  }else if(!rbc) {
			      console.log('----!!----', bc.uid);
				  return this.redisWalletModel.del(bc.uid, 1);
              }
			  else console.log(bc.uid, rbc);
		  })
	  })
  }
  
  start() {
	  console.log('start check user balance');
	  return this.getAllUserBalance(10000000);
  }
}

module.exports = Wallet;

