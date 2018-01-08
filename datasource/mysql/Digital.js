/**
 * Created by Bo on 2017/11/17.
 */

'use strict';

const eutil = require('eutil');
const util = require('../../util');
const models = require('../../models');

class DigitalModel {
  constructor(wclient,rclient) {
    this.wclient=wclient;
    this.rclient=rclient;
    this.table = 'digital_card';
  }
  
  getByGoodsId (goods_id) {
    return this.rclient(this.table).select().where({goods_id: goods_id, status: 1}).limit(1)
      .then(result => {
        if (result && result.length === 1) return result[0];
        else return null;
      });
  }
  
  getByGoodsSn (goods_sn) {
    return this.rclient(this.table).select().where({goods_sn: goods_sn, status: 1}).limit(1)
      .then(result => {
        if (result && result.length === 1) return result[0];
        else return null;
      });
  }
  
  setByGoodsId (goods) {
    return this.wclient(this.table).insert(goods);
  }
  
  updateDigitalOwner (goods_id, code, uid, trx) {
    let mtime = eutil.getTimeSeconds();
    return this.wclient(this.table).transacting(trx).update({owner_uid: uid, mtime: mtime, owner_time: mtime}).whereIn('code', code.split(',')).andWhere({goods_id: goods_id, owner_uid: -1});
  }
  
  addDigitalCard (card) {
    return this.wclient(this.table).insert(card);
  }
  
  // getUnusedDigital (goods_id, num) {
  //   return this.rclient(this.table).select().where({goods_id: goods_id, status: 1, owner_uid: -1}).orderBy('ctime').limit(num).then(digital => {
  //     if(digital && digital.length == num) return {digital: digital};
  //     else if(digital && digital.length)  return {num: digital.length, digital: digital};
  //     else return null;
  //   });
  // }
  
  getUnusedDigital (goods_id, num, trx) {
    return this.rclient(this.table).transacting(trx).select().where({goods_id: goods_id, status: 1, owner_uid: -1}).orderBy('ctime').limit(num)
      .then(digital => {
        let ids = digital.map(d => {return d.id;});
        return this.wclient(this.table).update({status: 2}).whereIn('id', ids).then(() => {return digital;});
      });
  }
  
  getInitUnusedDigital (num) {
    return this.rclient('goods').select().where({is_digital: 1, status: 1}).orderByRaw('ctime desc').groupBy('goods_sn')
      .then(goods => {
        return Promise.reduce(goods, (result, g) => {
          return this.rclient(this.table).select().where({owner_uid: -1, status: 1, goods_id: g.goods_sn}).limit(num)
            .then(digitals => {
              if(digitals && digitals.length) result[g.goods_sn] = digitals;
              return result;
            });
        }, {});
      });
  }
}

module.exports = DigitalModel;
