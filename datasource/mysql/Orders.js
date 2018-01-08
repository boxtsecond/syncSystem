/**
 * Created by Bo on 2017/11/10.
 */

'use strict';
const util = require('../../util');

class masterModel {
  constructor(wclient, rclient) {
    this.wclient = wclient;
    this.rclient = rclient;
    this.orderTable = 'order_info';
    this.orderDetailTable = 'order_detail';
  }
  
  createOrder(order, trx) {
    // return this.wclient.transaction(trx => {
    //   trx.insert(order).into(this.orderTable).then(result => {return {trx: trx};})
    //     .catch(err => {
    //       util.log.error('orderMysql-createOrder', err);
    //       return {trx: trx, err};
    //     });
    // });
    return this.wclient(this.orderTable).insert(order).transacting(trx);
  }
  
  createOrderDetail(orderDetail, trx) {
    if(trx) return this.wclient(this.orderDetailTable).insert(orderDetail).transacting(trx);
    else return this.wclient(this.orderDetailTable).insert(orderDetail);
  }
  
  getOrderDetail(order_no, sid, uid, order_status) {
    let findCondition = {order_no: order_no, uid: uid, sid: sid};
    if (order_status) findCondition.order_status = order_status;
    return this.rclient(this.orderDetailTable).select().where(findCondition).limit(1).then(od => {
      if (od && od.length) return od[0];
      else return null;
    });
  }
  
  getOrderListDetail(sid, uid, lastTime, count, sort, order_status) {
    let findCondition = {uid: uid, sid: sid};
    if (order_status) findCondition.order_status = order_status;
    let query = this.rclient(this.orderDetailTable).select().where(findCondition);
    if (count) query = query.limit(count);
    if (lastTime) query = sort == -1 ? query.whereRaw('`ctime` < ?', Number(lastTime)) : query.whereRaw('`ctime` > ?', Number(lastTime));
    if (sort) query = query.orderByRaw(sort == -1 ? 'ctime DESC' : null);
    return query;
  }
  
  getOrderList(sid, uid, lastTime, count, sort, order_status) {
    let findCondition = {uid: uid, sid: sid};
    let query = this.rclient(this.orderTable).select().where(findCondition);
    if (order_status || order_status == 0) query = query.andWhere({order_status});
    else query = query.andWhere('order_status', '!=', -1);
    if (count) query = query.limit(count);
    if (lastTime) query = sort == -1 ? query.whereRaw('`ctime` < ?', Number(lastTime)) : query.whereRaw('`ctime` > ?', Number(lastTime));
    if (sort) query = query.orderByRaw(sort == -1 ? 'ctime DESC' : null);
    return query;
  }
  
  updateOrder(uid, order_no, order, trx) {
    if(trx) return this.wclient(this.orderTable).where({uid, order_no}).update(order).limit(1).transacting(trx);
    else return this.wclient(this.orderTable).where({uid, order_no}).update(order).limit(1);
  }
  
  updateOrderDetail(uid, order_no, order, trx) {
    if(trx) return this.wclient(this.orderDetailTable).where({uid, order_no}).update(order).limit(1).transacting(trx);
    else return this.wclient(this.orderDetailTable).where({uid, order_no}).update(order).limit(1);
  }
  
  getOrder(order_no, sid, uid, order_status) {
    let findCondition = {order_no: order_no, uid: uid, sid: sid};
    if (order_status) findCondition.order_status = order_status;
    return this.rclient(this.orderTable).select().where(findCondition).limit(1).then(od => {
      if (od && od.length) return od[0];
      else return null;
    });
  }
  
  getOrderByNo (order_no) {
    return this.rclient(this.orderTable).select().where({order_no: order_no}).limit(1).then(od => {
      if (od && od.length) return od[0];
      else return null;
    });
  }
  
  getOrderByType(order_no, sid, uid, type, order_status) {
    let findCondition = {order_no: order_no, sid: sid, uid: uid, report_type: type};
    let andWhere = (order_status == 0 || order_status) ? {order_status} : ['order_status', '!=', -1];
    return this.rclient(this.orderTable).select().where(findCondition).andWhere(andWhere).limit(1).then(od => {
      if (od && od.length) return od[0];
      else return null;
    });
  }
  
  getOrderTypeList(type, sid, uid, lastTime, count, sort, order_status) {
    let findCondition = {sid: sid, uid: uid, report_type: type};
    let query = this.rclient(this.orderTable).select().where(findCondition);
    if (order_status || order_status == 0) query = query.andWhere({order_status});
    else query = query.andWhere('order_status', '!=', -1);
    if (count) query = query.limit(count);
    if (lastTime) query = sort == -1 ? query.whereRaw('`ctime` < ?', Number(lastTime)) : query.whereRaw('`ctime` > ?', Number(lastTime));
    if (sort) query = query.orderByRaw(sort == -1 ? 'ctime DESC' : null);
    return query;
  }
  
  getOrderCount(time) {
    return this.rclient(this.orderTable).select(['order_no']).where('ctime', '>', time).orderByRaw('ctime DESC').limit(1).then(order => {
      if (order && order.length) return Number(order[0].order_no.toString().substr(12));
      else return 0;
    });
  }
  
  deleteOrder (order_no, sid, uid) {
    return this.wclient(this.orderTable).where({order_no, sid, uid}).del();
  }
  
  deleteOrderDetail (order_no, sid, uid) {
    return this.wclient(this.orderDetailTable).where({order_no, sid, uid}).del();
  }
}

module.exports = masterModel;
