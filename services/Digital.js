/**
 * Created by Bo on 2017/11/17.
 */

'use strict';

const models = require('../models');
const eutil = require('eutil');

class Digital {
  constructor(app, util) {
    this.mysqlDigitalModel = app.get("mysqlDigitalModel");
    this.redisDigitalModel = app.get("redisDigitalModel");
    this.knex = app.get("mysqlMaster");
    this.log = util.log;
    //预加载，将没用过的digital预加载到redis ---> 具体个数配置在config文件中
    this.digitalRedisNum = util.config.digitalRedisNum || 100;
    this.initDigitalRedis();
  }
  
  getByGoodsId (goods_id) {
    return this.redisDigitalModel.getByGoodsId(goods_id)
      .then(goods => {
        if(goods) return goods;
        else return this.mysqlDigitalModel.getByGoodsId(goods_id).then(goods => {
          if(goods) {
            this.redisDigitalModel.setByGoodsId(goods);
            return goods;
          }else return null;
        });
      });
  }
  
  getByGoodsSn (goods_sn) {
    return this.redisDigitalModel.getByGoodsSn(goods_sn)
      .then(goods => {
        if(goods) return goods;
        else return this.mysqlDigitalModel.getByGoodsSn(goods_sn).then(goods => {
          if(goods) {
            this.redisDigitalModel.setByGoodsSn(goods);
            return goods;
          }else return null;
        });
      });
  }
  
  updateDigitalOwner (goods_id, uid, trx) {
    return this.mysqlDigitalModel.updateDigitalOwner(goods_id, uid, trx);
  }
  
  addDigitalCard (card) {
    return this.mysqlDigitalModel.addDigitalCard(card);
  }
  
  // 启动预加载
  initDigitalRedis () {
    return this.mysqlDigitalModel.getInitUnusedDigital (this.digitalRedisNum)
      .then(digitals => {
        if (JSON.stringify(digitals) == '{}') return false;
        else return this.redisDigitalModel.setListUnusedDigital(digitals, 1);
      });
  }
  
  //only redis
  getUnusedDigital (goods_id, num) {
    return this.redisDigitalModel.getUnusedDigital(goods_id, num)
      .then(digital => {
        if(!digital || digital.num) return digital;
        else if(digital.length == num) return {digital: digital};
        else return {num: String(digital.length)};
      });
      // .then(digital => {
      //   if(!digital || !digital.length) return this.mysqlDigitalModel.getUnusedDigital(goods_id, num);
      //   else if(digital.length == num) return {digital: digital};
      //   else {
      //     return this.mysqlDigitalModel.getUnusedDigital(goods_id, num-digital.length)
      //       .then(ds => {
      //         if(!ds) return null;
      //         else if(ds.digital && !ds.num) return {digital: ds.digital.concat(digital)};
      //         else return {num: ds.num+digital.length};
      //       });
      //   }
      // }).then(dig => {
      //   if(dig && !dig.num) {
      //     return this.deleteUnusedDigital(goods_id, num)
      //       .then(() => {
      //         return dig;
      //       });
      //   }else return dig;
      // });
  }
  
  setUnusedDigital (goods_id, num) {
    return this.knex.transaction(trx => {
      return this.mysqlDigitalModel.getUnusedDigital (goods_id, num, trx)
        .then(result => {
          if (result && result.length) {
            if(result.length < num) this.log.warn('All digital card into redis');
            let digital = result.map(d => {return JSON.stringify(d);});
            return this.redisDigitalModel.setUnusedDigital(goods_id, digital);
          }else return this.log.warn("Can't find digital card");
        });
    });
  }
  
}
module.exports = Digital;
