/**
 * Created by Bo on 2017/11/13.
 */

'use strict';

class masterModel {
  constructor(wclient,rclient) {
    this.wclient=wclient;
    this.rclient=rclient;
    this.table = 'score_rule';
  }
  
  get (id) {
    return this.rclient(this.table).select().where({id}).limit(1).then(ch => {
      if(ch && ch.length) return ch[0];
      else return null;
    });
  }
  
  getByCode (code) {
    return this.rclient(this.table).select().where({code: code, status: 1}).limit(1).then(ch => {
      if(ch && ch.length) return ch[0];
      else return null;
    });
  }
  
  set (wallet) {
    return this.wclient(this.table).insert(wallet);
  }
  
  getAll(fileds) {
    return this.rclient(this.table).select(fileds).where({status: 1});
  }
  
  update (code, data) {
    return this.wclient(this.table).where({code}).update(data);
  }
  
  getByCategoryId (category_id, fileds) {
    return this.rclient(this.table).select(fileds).where({category_id: category_id, status: 1}).orderBy('code').then(ch => {
      if(ch && ch.length) return ch;
      else return null;
    });
  }
  
  getCodeByCNYPrice (price) {
    return this.rclient(this.table).select('code').where({category_id: 6, recharge_price: price, status: 1}).limit(1).then(p => {
      if(p && p.length) return p[0].code;
      else return null;
    });
  }
}

module.exports = masterModel;
