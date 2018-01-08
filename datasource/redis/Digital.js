/**
 * Created by Bo on 2017/11/17.
 */

'use strict';

const models = require('../../models');
const util = require('../../util');

class redisDigitalModel {
  constructor(wclient,rclient){
    this.wclient=wclient;
    this.rclient=rclient;
    this.table = 'digital_card';// hash field:goods_id, value: JSON字符串
  }
  
  getByGoodsId (goods_id) {
    return this.rclient.hget(this.table, goods_id)
      .then(res => {
        if (res) return JSON.parse(res);
        else return null;
      });
  }
  
  getByGoodsSn (goods_sn) {
    return this.rclient.hget(this.table, goods_sn)
      .then(res => {
        if (res) return JSON.parse(res);
        else return null;
      });
  }
  
  setByGoodsId (goods) {
    return this.wclient.hset(this.table, goods.goods_id, JSON.stringify(goods));
  }
  
  setByGoodsSn (goods) {
    return this.wclient.hset(this.table, goods.goods_sn, JSON.stringify(goods));
  }
  
  getUnusedDigital (goods_id, num) {
    return this.rclient.scard(`${this.table}:${goods_id}`)
      .then(goodsNum => {
        if(goodsNum >= num) return this.deleteUnusedDigital(goods_id, num);
        else return {num: goodsNum.toString()};
      });
  }
  
  deleteUnusedDigital (goods_id, num, result) {
    let res = result || [];
    if(num > 0) {
      return this.wclient.spop(`${this.table}:${goods_id}`)
        .then(digital => {
          if(digital && digital != '{}') {
            res.push(JSON.parse(digital));
            return this.deleteUnusedDigital(goods_id, --num, res);
          }else this.deleteUnusedDigital(goods_id, num, res);
        });
    }else return res;
  }
  
  setUnusedDigital (goods_id, digital) {
    return this.wclient.sadd(`${this.table}:${goods_id}`, digital);
  }
  
  setListUnusedDigital (digitalObj) {
    return Promise.map(Object.keys(digitalObj), goods_id => {
      let digital = digitalObj[goods_id].map(s => {return JSON.stringify(s);});
      return this.wclient.sadd(`${this.table}:${goods_id}`, digital);
    });
  }
  
}
module.exports = redisDigitalModel;
