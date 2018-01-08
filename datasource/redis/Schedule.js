/**
 * Created by Bo on 2017/12/11.
 */
/**
 * Created by Bo on 2017/11/10.
 */

'use strict';

const models = require('../../models');

class redisScheduleModel {
  constructor(wclient, rclient) {
    this.wclient = wclient;
    this.rclient = rclient;
    this.goodsKey = 'goods'; // + Date
    this.goodsStatisticsKey = 'goods_statistics'; // + Date
    this.goodsBillKey = 'goods_bill'; // + Date
    this.digitalCardKey = 'digital_card'; // + Date
    this.expireTime = 600;
  }
  
  getGoodsKey (date) {
    return this.rclient.get(`${this.goodsKey}:${date}`);
  }
  
  incrGoodsKey (date) {
    return this.wclient.incr(`${this.goodsKey}:${date}`);
  }
  
  getGoodsStatisticsKey (date) {
    return this.rclient.get(`${this.goodsStatisticsKey}:${date}`);
  }
  
  incrGoodsStatisticsKey (date) {
    return this.wclient.incr(`${this.goodsStatisticsKey}:${date}`);
  }
  
  getGoodsBillKey (date) {
    return this.rclient.get(`${this.goodsBillKey}:${date}`);
  }
  
  incrGoodsBillKey (date) {
    return this.wclient.incr(`${this.goodsBillKey}:${date}`);
  }
  
  getDigitalCardKey (date) {
    return this.rclient.get(`${this.digitalCardKey}:${date}`);
  }
  
  incrDigitalCardKey (date) {
    return this.wclient.incr(`${this.digitalCardKey}:${date}`);
  }
  
  deleteGoodsKey (date) {
    return this.wclient.del(`${this.goodsKey}:${date}`);
  }
  
  deleteGoodsStatisticsKey (date) {
    return this.wclient.del(`${this.goodsStatisticsKey}:${date}`);
  }
  
  deleteGoodsBillKey (date) {
    return this.wclient.del(`${this.goodsBillKey}:${date}`);
  }
  
  deleteDigitalCardKey (date) {
    return this.wclient.del(`${this.digitalCardKey}:${date}`);
  }
  
}

module.exports = redisScheduleModel;

