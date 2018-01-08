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
  
  // get (category_id, id) {
  //   return this.rclient.hget(this.table+category_id, id);
  // }
  get (id) {
    return this.rclient.hget(this.table, id).then(p => {
      if(p && p != '{}') return JSON.parse(p);
      else return null;
    });
  }
  
  getByCode (code) {
    return this.rclient.hget(this.table, code).then(p => {
      if(p && p != '{}') return JSON.parse(p);
      else return null;
    });
  }
  
  // set(score_rule) {
  //   return this.wclient.hset(this.table+score_rule.category_id, score_rule.id, JSON.stringify(score_rule));
  // }
  
  set(score_rule) {
    return this.wclient.hset(this.table, score_rule.id, JSON.stringify(score_rule));
  }
  
  setList (list) {
    return this.wclient.hmset(this.table, list);
  }
  
  setListByCategoryId (category_id, list) {
    return this.wclient.hmset(`${this.table}:${category_id}`, list);
  }
  
  setByCode (charge) {
    return this.wclient.hset(this.table, charge.code, JSON.stringify(charge));
  }
  
  getAll () {
    return this.rclient.hgetall(this.table);
  }
  
  getByCategoryId (category_id) {
    return this.rclient.hgetall(this.table+':'+category_id);
  }
  
  setByCategoryId (category_id, charge) {
    return this.wclient.hset(this.table+':'+category_id, charge.code, JSON.stringify(charge));
  }
  
  getCodeByCNYPrice (price) {
    return this.rclient.hget(this.table+'_price', price).then(p => {
      if(p && p != '{}') return p;
      else return null;
    });
  }
  
  setCodeByCNYPrice (price, code) {
    return this.wclient.hset(this.table+'_price', price, code);
  }
  
}

module.exports = masterModel;
