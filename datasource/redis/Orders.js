/**
 * Created by Bo on 2017/11/10.
 */

'use strict';

const models = require('../../models');

class redisOrderModel {
  constructor(wclient, rclient) {
    this.wclient = wclient;
    this.rclient = rclient;
    this.orderKey = 'order'; //+ userId:status
    this.orderDetailKey = 'order_detail';
    this.orderTypeKey = 'order_detail_type';
    this.orderLimitKey = 'orderLimit:';
    this.orderCountKey = 'orderCount:';
    this.orderAddressKey = 'orderAddress';
    this.limitTime = 3;
    // this.initDel();
  }
  
  createOrderSort(order) {
    let key = `${this.orderKey}:${order.sid}:${order.uid}`;
    return this.wclient.zadd(key, order.ctime, order.order_no);
  }
  
  createOrder(order) {
    return this.wclient.hset(`${this.orderKey}:${order.sid}`, order.order_no, JSON.stringify(order));
  }
  
  //type = 2
  createOrderTypeSort (order) {
    let key = `${this.orderTypeKey}:${order.sid}:${order.uid}:${order.report_type}`;
    return this.wclient.zadd(key, order.ctime, order.order_no);
  }
  createOrderDetailSort(order) {
    let key = `${this.orderDetailKey}:${order.sid}:${order.uid}`;
    return this.wclient.zadd(key, order.ctime, order.order_no);
  }
  
  createOrderDetail(order) {
    return this.wclient.hset(`${this.orderDetailKey}:${order.sid}`, order.order_no, JSON.stringify(order));
  }
  
  getOrder(order_no, sid, uid) {
    return this.rclient.zscore(`${this.orderKey}:${sid}:${uid}`, order_no)
      .then(score => {
        if(!score) return null;
        else return this.rclient.hget(`${this.orderKey}:${sid}`, order_no)
          .then(order => {
            if (order && order != '{}') return JSON.parse(order);
            else return null;
          });
      });
  }
  
  getOrderList(sid, uid, lastTime, count, sort) {
    return Promise.resolve()
      .then(() => {
        if (sort != -1) { //正序
          let left = lastTime ? '(' + lastTime : '-inf';
          return this.rclient.zrangebyscore(`${this.orderKey}:${sid}:${uid}`, left, '+inf', 'LIMIT', 0, count);
        } else { //倒序
          let right = lastTime ? '(' + lastTime : '+inf';
          return this.rclient.zrevrangebyscore(`${this.orderKey}:${sid}:${uid}`, right, '-inf', 'LIMIT', 0, count);
        }
      })
      .then(res => {
        if(res && res.length) {
          return Promise.reduce(res, (result, order) => {
            return this.getOrder(order, sid, uid).then(o => {
              if(o) result.push(new models.orderModel.OrderResFilter(o));
            }).then(() => {return result;});
          }, []);
        }else return [];
      });
  }
  
  getOrderByType(order_no, sid, uid, type) {
    return this.rclient.zscore(`${this.orderTypeKey}:${sid}:${uid}:${type}`, order_no)
      .then(score => {
        if(!score) return null;
        else return this.rclient.hget(`${this.orderKey}:${sid}`, order_no)
          .then(order => {
            if (order && order != '{}') return JSON.parse(order);
            else return null;
          });
      });
  }
  
  //type = 2
  getOrderTypeList(type, sid, uid, lastTime, count, sort) {
    return Promise.resolve()
      .then(() => {
        if (sort != -1) { //正序
          let left = lastTime ? '(' + lastTime : '-inf';
          return this.rclient.zrangebyscore(`${this.orderTypeKey}:${sid}:${uid}:${type}`, left, '+inf', 'LIMIT', 0, count);
        } else { //倒序
          let right = lastTime ? '(' + lastTime : '+inf';
          return this.rclient.zrevrangebyscore(`${this.orderTypeKey}:${sid}:${uid}:${type}`, right, '-inf', 'LIMIT', 0, count);
        }
      })
      .then(res => {
        if(res && res.length) {
          return Promise.reduce(res, (result, order) => {
            return this.rclient.hget(`${this.orderKey}:${sid}`, order)
              .then(o => {
                if (o && o != '{}') result.push(new models.orderModel.OrderResFilter(JSON.parse(o)));
              }).then(() => {return result;});
          }, []);
        }else return [];
      });
  }
  
  getOrderDetail(order_no, sid, uid) {
    return this.rclient.zscore(`${this.orderDetailKey}:${sid}:${uid}`, order_no)
      .then(score => {
        if(!score) return null;
        else return this.rclient.hget(`${this.orderDetailKey}:${sid}`, order_no)
          .then(order => {
            if (order && order != '{}') return JSON.parse(order);
            else return null;
          });
      });
  }
  
  getOrderListDetail(sid, uid, lastTime, count, sort) {
    return Promise.resolve()
      .then(() => {
        if (sort != -1) { //正序
          let left = lastTime ? '(' + lastTime : '-inf';
          return this.rclient.zrangebyscore(`${this.orderDetailKey}:${sid}:${uid}`, left, '+inf', 'LIMIT', 0, count);
        } else { //倒序
          let right = lastTime ? '(' + lastTime : '+inf';
          return this.rclient.zrevrangebyscore(`${this.orderDetailKey}:${sid}:${uid}`, right, '-inf', 'LIMIT', 0, count);
        }
      })
      .then(res => {
        if(res && res.length) {
          return Promise.reduce(res, (result, order) => {
            return this.rclient.hget(`${this.orderDetailKey}:${sid}`, order)
              .then(o => {
                if (o && o != '{}') result.push(new models.orderModel.OrderDetailResFilter(JSON.parse(o)));
              }).then(() => {return result;});
          }, []);
        }else return [];
      });
  }
  
  getOrderLimit(sid, uid) {
    return this.rclient.incr(`${this.orderLimitKey}:${sid}` + uid);
  }
  
  setOrderLimit(sid, uid) {
    return this.wclient.expire(`${this.orderLimitKey}:${sid}` + uid, this.limitTime);
  }
  
  // getOrderCount(date) {
  //   return this.rclient.get(this.orderCountKey + date);
  // }
  
  // updateOrderCount(date, cnt) {
  //   if (!cnt) return this.wclient.incr(this.orderCountKey + date);
  //   else return this.wclient.set(this.orderCountKey + date, cnt + 1);
  // }
  
  upsertOrderCount(date, cnt) {
    if (!cnt) return this.wclient.incr(this.orderCountKey + date);
    else return this.wclient.set(this.orderCountKey + date, cnt);
  }
  
  delOrderCount(date) {
    return this.wclient.del(this.orderCountKey + date);
  }
  
  getOrderByNo(sid, order_no) {
    return this.rclient.hget(`${this.orderKey}:${sid}`, order_no)
      .then(order => {
        if (order && order != '{}') return JSON.parse(order);
        else return null;
      });
  }
  
  deleteOrder (order_no, sid, uid) {
    return this.wclient.zrem(`${this.orderKey}:${sid}:${uid}`, order_no)
      .then(() => {
        return this.wclient.hdel(`${this.orderKey}:${sid}`, order_no);
      });
  }
  
  deleteOrderDetail (order_no, sid, uid) {
    return this.wclient.zrem(`${this.orderDetailKey}:${sid}:${uid}`, order_no)
      .then(() => {
        return this.wclient.hdel(`${this.orderDetailKey}:${sid}`, order_no);
      });
  }
  
  addUpdateAddressKey (updateAddress) {
    return this.wclient.hset(`${this.orderAddressKey}:${updateAddress.sid}:${updateAddress.uid}`, updateAddress.order_no, JSON.stringify(updateAddress));
  }
  
  getUpdateAddressKey (order_no, sid, uid) {
    return this.rclient.hget(`${this.orderAddressKey}:${sid}:${uid}`, order_no).then(orAd => {
      if(orAd && orAd != '{}') return JSON.parse(orAd);
      else return null;
    });
  }
  
  delUpdateAddressKey (order_no, sid, uid) {
    return this.wclient.hdel(`${this.orderAddressKey}:${sid}:${uid}`, order_no);
  }
}

module.exports = redisOrderModel;

