/**
 * Created by Bo on 2017/11/10.
 */

'use strict';
const models = require('../models');
const eutil = require('eutil');
const _ = require('lodash');
const GrpcService = require('../lib/grpc/client');

class Orders {
  constructor(app, util, services) {
    this.mysqlOrdersModel = app.get("mysqlOrdersModel");
    this.redisOrdersModel = app.get("redisOrdersModel");
    this.log = util.log;
    this.ChargeService = services.ChargeService;
    this.GoodsService = services.GoodsService;
    this.DigitalService = services.DigitalService;
    this.WalletService = services.WalletService;
    this.UserExpService = services.UserExpService;
    this.knex = app.get("mysqlMaster");
    // this.kueJob = new kueJob({redisclient: [app.get('redisKueJob'), app.get('redisKueProcess')]});
    this.kueJob = services.kue;
    if (util.config.kue.process) {
      this.kueProcess(util.config.kue.maximum);
      this.kueUpdateUserExpProcess(util.config.kue.maximum);
      this.kueUpdateOrderProcess(util.config.kue.maximum, util.config.kue.updateUseTrx);
    }
    this.digitalWarnNum = parseInt(util.config.digitalRedisNum / 10) || 20;
    this.digitalRedisNum = util.config.digitalRedisNum || 100;
  }
  
  // 创建统一下单模型
  // 验证订单签名信息 uid +goods_sn+ 金额+密钥串
  //1  先获取订单id
  //2  创建订单模型
  // order 表 失败 -> kue  事务
  // orderDetail 失败 -> kue 事务
  //
  //
  // createUnified
  // cancelOrder
  // notifyPaid 通知
  
  // type  充值Recharge  system 系统[+/-积分] mall实物类[商城] digital虚拟类[商城 电子卡] cash现金消费
  
  /**
   * 统一下单
   * @param orderType 订单类型
   * @param goods_sn 商品标志
   * @param is_digital 商品类型 0 实物 1 虚拟
   * @param data 参数 {_uid, goods_count}
   */
  createUnified(orderType, goods_sn, is_digital, data) {
    return Promise.resolve()
      .then(() => {
        if (!data._uid || !goods_sn) return Promise.reject([4510, 'params error', {}]);
      })
      .then(() => {
        return this.getOrderLimit(data.sid || 1, data._uid)
          .then(allow => {
            if (!allow) return Promise.reject([4511, 'frequent operation', {}]);
            else return this.getGoodsOrderByType(orderType, goods_sn, data.goods_count || 1, data.address, data);
          });
      })
      .then(orderData => {
        if (!orderData.order) return Promise.reject(orderData.err);
        else if (!orderData.limit) return {
          limit: false,
          order: new models.orderModel.Order('pre_order_no', _.merge(orderData.order, data))
        };
        else {
          return this.GoodsService.checkGoodsCount(data.sid || 1, data._uid, goods_sn, data.goods_count, orderData.limit).then(check => {
            if (check.err) return Promise.reject(check.err);
            else return {
              limit: true,
              order: new models.orderModel.Order('pre_order_no', _.merge(orderData.order, data))
            };//预先生成没有订单号的订单
          });
        }
      })
      .then(result => {
        // 除了充值外
        if (result.order.is_pay && result.order.change_price != 0) {
          return this.WalletService.updateIncrRedisBalance(result.order.uid, result.order.change_price, data.walletType || 1)
            .then(balance => {
              if (!balance && balance != 0) {
                return this.WalletService.set(new models.walletModel.Wallet({
                  uid: data._uid,
                  type: data.walletType || 1
                })).then(w => {
                  return result.order.change_price - 0;
                });
              }
              else return Number(balance).toFixed(2) - 0;
            })
            .then(w => {
              if (result.order.report_type == 3 || w >= 0) {
                return this.getOrderNo(result.order.sid, is_digital + 1).then(order_no => {
                  result.order.order_no = order_no;
                  return result.order;
                });
              }
              else {
                return Promise.all([
                  result.limit ? this.GoodsService.updateRedisGoodsNum(goods_sn, result.order.goods_count * -1) : null,
                  result.limit ? this.GoodsService.updateRedisGoodsLimit(result.order.sid, result.order.uid, goods_sn, result.order.goods_count * -1) : null,
                  this.WalletService.updateIncrRedisBalance(result.order.uid, Number(-1 * result.order.change_price).toFixed(2) - 0, data.walletType || 1)
                ]).then(() => {
                  return Promise.reject([4516, "User's balance is not enough", {
                    uid: result.order.uid,
                    balance: w
                  }]);
                });
              }
            })
            .then(order => {
              return Promise.all([
                order.exp_price > 0 ? this.UserExpService.updateRedisUserExp(order.sid, order.uid, order.exp_price) : null,
                order.is_pay ? this.GoodsService.updateRedisGoodsStatistics(order.sid, order.report_type, order.change_price > 0 ? order.change_price : -1 * order.change_price) : null,
                order.is_pay ? this.GoodsService.updateRedisGoodsBill(order.sid, order.goods_id, eutil.dateFormat(eutil.dateGetBeforeDay(null, 1), 'yyyyMM'), order.change_price > 0 ? order.change_price : -1 * order.change_price, order.goods_count) : null
              ]).then(() => {
                return order;
              });
            });
        } else return this.getOrderNo(result.order.sid, is_digital + 1).then(order_no => {
          result.order.order_no = order_no;
          return result.order;
        });
      })
      .then(ord => {
        if (ord.is_pay) {
          let orderDetail = new models.orderModel.OrderDetail(ord);
          return Promise.all([
            this.redisOrdersModel.createOrder(ord),
            this.redisOrdersModel.createOrderSort(ord),
            this.redisOrdersModel.createOrderDetail(orderDetail),
            this.redisOrdersModel.createOrderDetailSort(orderDetail),
            this.redisOrdersModel.createOrderTypeSort(ord)
          ]).then(() => {
            return ord;
          });
        }
        else return ord;
      })
      .then((od) => {
        if (data.usekue) {
          this.kueCreate(orderType, od, data.walletType || 1);
          return od;
        } else {
          return this.create(od, data.walletType).then(o => {
            if (od.exp_price > 0) {
              return this.UserExpService.getUserExp(od.sid, od.uid).then(exp => {
                return GrpcService.grpcCRM([{exp}, od.uid], 'consumerService-updateUserInfo')
                  .then(res => {
                    if (res[0] != 2000) {
                      this.kueUpdateUserExp({sid: od.sid, uid: od.uid, exp_price: exp, order_no: od.order_no});
                    }
                    return od;
                  });
              });
            } else return od;
          });
        }
      })
      .catch(res => {
        if (eutil.isArray(res)) return Promise.reject(res);
        else {
          this.log.error(res);
          return Promise.reject(res);
        }
      });
  }
  
  /**
   * 创建订单
   * @param order 订单模型
   */
  create(order, walletType) {
    return this.knex.transaction(trx => {
      return Promise.resolve()
        .then(() => {
          if (!order.is_digital) {
            return this.redisOrdersModel.getUpdateAddressKey(order.order_no, order.sid, order.uid).then(o => {
              if (o) return o;
              else return false;
            });
          } else return false;
        })
        .then((ord) => {
          let nwOrder = ord || order;
          let transactionObj = {
            mysqlOrder: this.mysqlOrdersModel.createOrder(nwOrder, trx)
          };
          if (nwOrder.is_pay) {
            transactionObj.mysqlOrderDetail = this.mysqlOrdersModel.createOrderDetail(new models.orderModel.OrderDetail(nwOrder), trx);
            if (nwOrder.change_price != 0) {
              transactionObj.mysqlWallet = this.WalletService.updateBalance(nwOrder.uid, walletType || 1, nwOrder.change_price, trx);
            }
            if (nwOrder.exp_price > 0) {
              transactionObj.mysqlUserExp = this.UserExpService.updateUserExp(nwOrder.sid, nwOrder.uid, nwOrder.exp_price, trx);
            }
            if (nwOrder.report_type == 2) {
              if (nwOrder.cd_key) {
                transactionObj.mysqlDigitalCard = this.DigitalService.updateDigitalOwner(nwOrder.goods_id, nwOrder.cd_key, nwOrder.uid, trx);
              } else {
                // 下单时不操作 goods 销量的更改，用定时任务去自动更新
                // transactionObj.updateMysqlGoods = this.GoodsService.updateGoodsCount(order.goods_id, order.goods_count, trx);
                transactionObj.mysqlGoodsLimit = this.GoodsService.updateGoodsLimit(nwOrder.sid, nwOrder.uid, nwOrder.goods_id, nwOrder.goods_count, trx);
              }
            }
          }
          return {transactionObj, ord};
        })
        .then(({transactionObj, ord}) => {
          return Promise.props(transactionObj).then(tranData => {
            // if (tranData.updateMysqlGoods && tranData.updateMysqlGoods[0] && tranData.updateMysqlGoods[0].affectedRows == 0) return Promise.reject([4514, 'Goods is not enough', {}]);
            if (tranData.mysqlDigitalCard === 0) return Promise.reject([4515, 'Digital card is already used', {}]);
            if (tranData.mysqlWallet && tranData.mysqlWallet[0] && tranData.mysqlWallet[0].affectedRows == 0) {
              // return this.WalletService.updateRedisBalanceByMysql(order.uid, walletType || 1)
              //   .then(() => {
              //     return Promise.reject([4516, "User's balance is not enough", {order_no: order.order_no, uid: order.uid}]);
              //   });
              return Promise.reject([4516, "User's balance is not enough", {order_no: order.order_no, uid: order.uid}]);
            }
            if (tranData.mysqlUserExp === 0) return Promise.reject([4522, "Update user's exp fail", {}]);
            return ord;
          }).catch(res => {
            // return Promise.all([
            //   order.is_pay && limit ? this.GoodsService.updateRedisGoodsLimit(order.sid, order.uid, order.goods_id, -1 * order.goods_count) : null,//购买限制
            //   order.is_pay && limit ? this.GoodsService.updateRedisGoodsNum(order.goods_id, -1 * order.goods_count) : null,//销量
            //   order.is_pay ? this.GoodsService.updateRedisGoodsStatistics(order.sid, order.report_type, order.change_price < 0 ? order.change_price : -1 * order.change_price, true) : null,//销量
            //   order.is_pay ? this.GoodsService.updateRedisGoodsBill(order.sid, order.goods_id, eutil.dateFormat(eutil.dateGetBeforeDay(null, 1), 'yyyyMM'), order.change_price < 0 ? order.change_price : -1 * order.change_price, -1 * order.goods_count) : null
            // ]).then(() => {
            //   if (eutil.isArray(res)) return Promise.reject(res);
            //   else return Promise.reject([4513, '创建失败，已回滚', {error: res}]);
            // });
            if (eutil.isArray(res)) return Promise.reject(res);
            else if (res.code == 'ER_DUP_ENTRY' && res.errno == 1062) return Promise.reject('done');
            else return Promise.reject([4513, '创建失败，已回滚', JSON.stringify({error: res})]);
          });
        })
        .then(od => {
          if (!od) {
            let redisArr = [
              this.redisOrdersModel.createOrder(order),
              this.redisOrdersModel.createOrderSort(order)
            ];
            if (order.is_pay) {
              let orderDetail = new models.orderModel.OrderDetail(order);
              redisArr.push(this.redisOrdersModel.createOrderDetail(orderDetail));
              redisArr.push(this.redisOrdersModel.createOrderDetailSort(orderDetail));
              // redisArr.push(this.WalletService.updateRedisBalance(order.uid, order.change_price));
              if (order.report_type == 2) {
                redisArr.push(this.redisOrdersModel.createOrderTypeSort(order));
                // if(order.cd_key) {
                //   redisArr.push(this.DigitalService.deleteUnusedDigital(order.goods_id, order.goods_count));
                // }
                // else {
                //   redisArr.push(this.GoodsService.updateRedisGoodsNum(order.goods_id, order.goods_count));
                // }
              }
            }
            return Promise.all(redisArr).then(() => {
              return order;
            });
          } else return this.redisOrdersModel.delUpdateAddressKey(od.order_no, od.sid, od.uid).then(() => {
            return od;
          });
        });
    });
  }
  
  /**
   * 利用kue消息队列创建 create 任务
   * @param order 订单模型
   */
  kueCreate(orderType, order, walletType) {
    console.log('CreateOrderJob: ========>', order.order_no);
    return this.kueJob.create('CreateOrder', {orderType, order, walletType, title: order.order_no}, 'high');
  }
  
  /**
   * 利用kue消息队列消费 create 任务
   * @param order 订单模型
   */
  kueProcess(maximum) {
    return this.kueJob.process('CreateOrder', maximum, (job, done) => {
      if (job.data.status == 'complete') return done();
      console.log('CreateOrderProcess: ========>', job.data.order.order_no);
      return this.create(job.data.order, job.data.walletType).then(o => {
        let order = job.data.order;
        if (order.exp_price > 0) {
          return this.UserExpService.getUserExp(order.sid, order.uid)
            .then(exp => {
              this.kueUpdateUserExp({sid: order.sid, uid: order.uid, exp_price: exp, order_no: order.order_no});
              return done();
            }).catch(err => {
              this.log.error('GetUserExp Error: ', err);
              return done(err);
            });
        } else return done();
      }).catch(err => {
        this.log.error('CreateOrder Error: ', err);
        if (err == 'done') return done();
        else if (eutil.isArray(err)) return done(new Error(JSON.stringify(err))); //return job.complete();
        else return done(err);
        // return done(err);
      });
    });
  }
  
  kueUpdateUserExp(data) {
    console.log('UpdateUserExpJob: ========>', data.order_no);
    data.title = data.order_no;
    return this.kueJob.create('UpdateUserExp', data, 'normal');
  }
  
  kueUpdateUserExpProcess(maximum) {
    return this.kueJob.process('UpdateUserExp', maximum, (job, done) => {
      if (job.data.status == 'complete') return done();
      console.log('UpdateUserExpProcess: ========>', job.data.order_no);
      return this.UserExpService.getUserExp(job.data.sid, job.data.uid)
        .then(exp => {
          if (exp == job.data.exp_price) {
            return GrpcService.grpcCRM([{exp: job.data.exp_price}, job.data.uid], 'consumerService-updateUserInfo').then(res => {
              return done();
            }).catch(err => {
              this.log.error('GrpcCRM UpdateEXP Error: ', err);
              // this.kueUpdateUserExp(job.data);
              return done(err);
            });
          } else return done();
        });
    });
  }
  
  kueUpdateOrder(order_no, updateOrder, order, insert, orderDetail) {
    console.log('UpdateOrderJob: ========>', order_no);
    return this.kueJob.create('UpdateOrder', {order_no, updateOrder, order, insert, orderDetail, title: order.order_no}, 'critical');
  }
  
  kueUpdateOrderProcess(maximum, useTrx) {
    return this.kueJob.process('UpdateOrder', maximum, (job, done) => {
      if (job.data.status == 'complete') return done();
      console.log('UpdateOrderProcess: ========>', job.data.order_no);
      return Promise.resolve()
        .then(() => {
          if (useTrx) {
            return this.updateOrderUseTransaction(job.data.order_no, job.data.updateOrder, job.data.order, job.data.insert, job.data.orderDetail);
          } else {
            return Promise.all([
              this.mysqlOrdersModel.updateOrder(job.data.order.uid, job.data.order_no, job.data.updateOrder),
              !job.data.insert ? this.mysqlOrdersModel.updateOrderDetail(job.data.order.uid, job.data.order_no, new models.orderModel.GetOrderDetailParams(job.data.updateOrder)) : this.mysqlOrdersModel.createOrderDetail(job.data.orderDetail),
              job.data.order.change_price != 0 ? this.WalletService.updateBalance(job.data.order.uid, job.data.order.type || 1, job.data.order.change_price) : null
            ]);
          }
        })
        .then(o => {
          return done();
        }).catch(err => {
          this.log.error('UpdateOrder Error: ', err);
          if (err == 'done') return done();
          else if (eutil.isArray(err)) return done(new Error(JSON.stringify(err))); //return job.complete();
          else return done(err);
        });
      
    });
  }
  
  // kueUpdateOrderProcess(maximum) {
  //   return this.kueJob.process('UpdateOrder', maximum, (job, done) => {
  //     if(job.data.status == 'complete') return done();
  //     console.log('UpdateOrderProcess: ========>', job.data.order_no);
  //     return Promise.all([
  //       this.mysqlOrdersModel.updateOrder(job.data.order_no, job.data.updateOrder),
  //       !job.data.insert ? this.mysqlOrdersModel.updateOrderDetail(job.data.order_no, new models.orderModel.GetOrderDetailParams(job.data.updateOrder)) : this.mysqlOrdersModel.createOrderDetail(job.data.orderDetail),
  //       this.WalletService.updateBalance(job.data.order.uid, job.data.order.type || 1, job.data.order.change_price)
  //     ]).then(o => {
  //       return done();
  //     }).catch(err => {
  //       this.log.error('UpdateOrder Error: ', err);
  //       if (eutil.isArray(err)) return done(new Error(JSON.stringify(err))); //return job.complete();
  //       else return done(err);
  //     });
  //   });
  // }
  
  
  /**
   * 获取订单明细
   * @param order_no 订单号
   */
  getOrderDetail(order_no, sid, uid) {
    return this.redisOrdersModel.getOrderDetail(order_no, sid, uid)
      .then(order => {
        if (order) return new models.orderModel.OrderDetailResFilter(order);
        else return this.mysqlOrdersModel.getOrderDetail(order_no, sid, uid)
          .then(o => {
            if (!o) return null;
            else {
              Promise.all([
                this.redisOrdersModel.createOrderDetail(o),
                this.redisOrdersModel.createOrderDetailSort(o)
              ]);
              return new models.orderModel.OrderDetailResFilter(o);
            }
          });
      });
  }
  
  /**
   * 获取订单
   * @param order_no 订单号
   */
  getOrder(order_no, sid, uid) {
    return this.redisOrdersModel.getOrder(order_no, sid, uid)
      .then(order => {
        if (order) return order;
        else {
          return this.mysqlOrdersModel.getOrder(order_no, sid, uid)
            .then(o => {
              if (!o) return null;
              else {
                Promise.all([
                  this.redisOrdersModel.createOrder(o),
                  this.redisOrdersModel.createOrderSort(o),
                  o.report_type == 2 ? this.redisOrdersModel.createOrderTypeSort(o) : null
                ]);
                return o;
              }
            });
        }
      });
  }
  
  /**
   * 获取订单明细列表
   * @param uid 用户Id
   * @param start 起始
   * @param end 结束
   */
  getOrderListDetail(sid, uid, lastTime, count, sort) {
    return this.redisOrdersModel.getOrderListDetail(sid, uid, lastTime, count, sort)
      .then(order => {
        if (order && order.length) return order;
        else {
          return this.mysqlOrdersModel.getOrderListDetail(sid, uid, lastTime, count, sort)
            .then(orders => {
              if (orders && orders.length) {
                return Promise.map(orders, (o) => {
                  Promise.all([
                    this.redisOrdersModel.createOrderDetail(o),
                    this.redisOrdersModel.createOrderDetailSort(o)
                  ]);
                  return new models.orderModel.OrderDetailResFilter(o);
                });
              } else return [];
            });
        }
      });
  }
  
  /**
   * 获取订单列表
   * @param uid 用户Id
   * @param lastTime
   * @param count
   */
  getOrderList(sid, uid, lastTime, count, sort) {
    return this.redisOrdersModel.getOrderList(sid, uid, lastTime, count, sort)
      .then(order => {
        if (order && order.length) return order;
        else {
          return this.mysqlOrdersModel.getOrderList(sid, uid, lastTime, count, sort)
            .then(orders => {
              if (orders && orders.length) {
                return Promise.map(orders, (o) => {
                  Promise.all([
                    this.redisOrdersModel.createOrder(o),
                    this.redisOrdersModel.createOrderSort(o),
                    o.report_type == 2 ? this.redisOrdersModel.createOrderTypeSort(o) : null
                  ]);
                  return new models.orderModel.OrderResFilter(o);
                });
              } else return [];
            });
        }
      });
  }
  
  /**
   * 根据report_type获取订单详情
   * @param order_no 订单号
   * @param uid 用户Id
   * @param type
   */
  getOrderByType(order_no, sid, uid, type) {
    return this.redisOrdersModel.getOrderByType(order_no, sid, uid, type)
      .then(order => {
        if (order) return new models.orderModel.OrderResFilter(order);
        else {
          return this.mysqlOrdersModel.getOrderByType(order_no, sid, uid, type)
            .then(o => {
              if (!o) return null;
              else {
                Promise.all([
                  this.redisOrdersModel.createOrder(o),
                  this.redisOrdersModel.createOrderSort(o),
                  o.report_type == 2 ? this.redisOrdersModel.createOrderTypeSort(o) : null
                ]);
                return new models.orderModel.OrderResFilter(o);
              }
            });
        }
      });
  }
  
  /**
   * 根据report_type获取订单详情列表
   * @param uid 用户Id
   * @param lastTime
   * @param count
   */
  getOrderTypeList(type, sid, uid, lastTime, count, sort) {
    return this.redisOrdersModel.getOrderTypeList(type, sid, uid, lastTime, count, sort)
      .then(order => {
        if (order && order.length) return order;
        else return null;
      })
      .then(od => {
        if (od && od.length) return od;
        else {
          return this.mysqlOrdersModel.getOrderTypeList(type, sid, uid, lastTime, count, sort)
            .then(orders => {
              if (orders && orders.length) {
                return Promise.map(orders, (o) => {
                  Promise.all([
                    this.redisOrdersModel.createOrder(o),
                    this.redisOrdersModel.createOrderSort(o),
                    this.redisOrdersModel.createOrderTypeSort(o)
                  ]);
                  return new models.orderModel.OrderResFilter(o);
                });
              } else return [];
            });
        }
      });
  }
  
  /**
   * 创建订单号
   * @param
   */
  getOrderNo(sid, type) {
    let date = eutil.dateGetDataStringNUmber();
    return this.getOrderCount(date)
      .then(count => {
        if (String(count).length === 9) this.log.warn("order number warn Order number spillover length is ", String(count).length);
        if (String(count).length > 9) this.log.error("order number error Order number spillover length is ", String(count).length);
        if (String(sid).length === 3) this.log.warn("order number warn sid spillover length is ", String(sid).length);
        if (String(sid).length > 3) this.log.error("order number error sid spillover length is ", String(sid).length);
        if (String(type).length === 2) this.log.warn("order number warn type spillover length is ", String(type).length);
        if (String(type).length > 2) this.log.error("order number error type spillover length is ", String(type).length);
        count = count ? Number(count).toString() : '1';
        return eutil.strPadstr(String(sid), "0", 3) + type + date + eutil.strPadstr(String(count), "0", 9);
        //return '0'.repeat(3 - String(sid).length) + sid + type + date + '0'.repeat(9 - String(count).length) + count;
      });
    // 数组超出报警
  }
  
  /**
   * 更新订单
   * @param order 订单模型
   */
  updateOrder(order_no, order, updateOrder, updateOrderDetail) {
    let list = [
      this.mysqlOrdersModel.updateOrder(order.uid, order_no, updateOrder),
      this.redisOrdersModel.createOrder(order),
      this.redisOrdersModel.createOrderSort(order),
      order.report_type == 2 ? this.redisOrdersModel.createOrderTypeSort(order) : null
    ];
    if (updateOrderDetail) {
      let orderDetail = new models.orderModel.OrderDetail(order);
      list.push(this.mysqlOrdersModel.updateOrderDetail(order.uid, order_no, updateOrderDetail));
      list.push(this.redisOrdersModel.createOrderDetail(orderDetail));
      list.push(this.redisOrdersModel.createOrderDetailSort(orderDetail));
    }
    return Promise.all(list);
  }
  
  /**
   * 收到异步回调更新订单
   */
  // updateOrderByNotify(order_no, updateOrder, order, insert, useTrx) {
  //   if (useTrx) {
  //     let orderDetail = new models.orderModel.OrderDetail(order);
  //     return this.updateOrderUseTransaction(order_no, updateOrder, order, insert, orderDetail)
  //       .then(() => {
  //         let redisArr = [
  //           this.redisOrdersModel.createOrder(order),
  //           this.redisOrdersModel.createOrderSort(order),
  //           this.redisOrdersModel.createOrderDetail(orderDetail),
  //           this.redisOrdersModel.createOrderDetailSort(orderDetail),
  //           this.WalletService.updateIncrRedisBalance(order.uid, order.change_price, order.type || 1)
  //         ];
  //         return Promise.all(redisArr);
  //       }).then(() => {return order;});
  //   } else {
  //     let orderDetail = new models.orderModel.OrderDetail(order);
  //     let list = [
  //       this.mysqlOrdersModel.updateOrder(order_no, updateOrder),
  //       !insert ? this.mysqlOrdersModel.updateOrderDetail(order_no, new models.orderModel.GetOrderDetailParams(updateOrder)) : this.mysqlOrdersModel.createOrderDetail(orderDetail),
  //       this.WalletService.updateBalance(order.uid, order.type || 1, order.change_price)
  //     ];
  //     return Promise.all(list)
  //       .then(() => {
  //         return Promise.all([
  //           this.redisOrdersModel.createOrder(order),
  //           this.redisOrdersModel.createOrderSort(order),
  //           this.redisOrdersModel.createOrderDetail(orderDetail),
  //           this.redisOrdersModel.createOrderDetailSort(orderDetail),
  //           this.WalletService.updateIncrRedisBalance(order.uid, order.change_price, order.type || 1)
  //         ]);
  //       })
  //       .catch(err => {
  //         return Promise.reject(err);
  //       });
  //   }
  // }
  
  updateOrderUseTransaction(order_no, updateOrder, order, insert, orderDetail) {
    return this.knex.transaction(trx => {
      return Promise.resolve()
        .then(() => {
          let transactionObj = {
            updateOrder: this.mysqlOrdersModel.updateOrder(order.uid, order_no, updateOrder, trx),
            updateOrderDetail: !insert ? this.mysqlOrdersModel.updateOrderDetail(order.uid, order_no, new models.orderModel.GetOrderDetailParams(updateOrder), trx) : this.mysqlOrdersModel.createOrderDetail(orderDetail, trx)
          };
          if (order.change_price != 0) {
            transactionObj.updateBalance = this.WalletService.updateBalance(order.uid, order.type || 1, order.change_price, trx);
          }
          return transactionObj;
        })
        .then(transactionObj => {
          return Promise.props(transactionObj).then(tranData => {
            if (tranData.updateOrder === 0) return Promise.reject([4512, "Can't find order", {order_no: order_no}]);
            if (tranData.updateBalance && tranData.updateBalance[0] && tranData.updateBalance[0].affectedRows == 0) {
              return Promise.reject([4523, "Update user's balance fail", {uid: order.uid, change_price: order.change_price}]);
            }
            if (tranData.updateOrderDetail === 0) return Promise.reject([4524, "Update user's order_detail fail", {}]);
            return order;
          }).catch(err => {
            if (eutil.isArray(err)) return Promise.reject(err);
            else if (err.code == 'ER_DUP_ENTRY' && err.errno == 1062) return Promise.reject('done');
            else return Promise.reject([4525, '更新失败，已回滚', JSON.stringify({error: err})]);
          });
        });
    });
  }
  
  /**
   * 收到异步回调使用kue更新订单
   */
  updateOrderByNotifyWithKUE(order_no, updateOrder, order, insert) {
    return Promise.resolve()
      .then(() => {
        let orderDetail = new models.orderModel.OrderDetail(order);
        let redisArr = [
          this.redisOrdersModel.createOrder(order),
          this.redisOrdersModel.createOrderSort(order),
          this.redisOrdersModel.createOrderDetail(orderDetail),
          this.redisOrdersModel.createOrderDetailSort(orderDetail),
          this.WalletService.updateIncrRedisBalance(order.uid, order.change_price, order.type || 1)
        ];
        return Promise.all(redisArr).then(() => {
          this.kueUpdateOrder(order_no, updateOrder, order, insert, orderDetail);
          return orderDetail;
        });
      });
    
  }
  
  /**
   * 订单限速，若通过则异步设置订单限速
   * @param order 订单模型
   */
  getOrderLimit(sid, uid) {
    return this.redisOrdersModel.getOrderLimit(sid, uid)
      .then(o => {
        return this.redisOrdersModel.setOrderLimit(sid, uid).then(() => {
          return o;
        });
      })
      .then(o => {
        if (o - 1 > 0) return false;
        else return true;
      });
  }
  
  /**
   * 创建订单限制
   * @param order 订单模型
   */
  setOrderLimit(sid, uid, order_no) {
    return this.redisOrdersModel.setOrderLimit(sid, uid, order_no);
  }
  
  /**
   * 获取订单数量
   * @param date 日期
   */
  getOrderCount(date) {
    return this.redisOrdersModel.upsertOrderCount(date)
      .then(count => {
        if (count && count !== 1) return count;
        else return this.mysqlOrdersModel.getOrderCount(eutil.getTimeSeconds(eutil.dateGetDayOfStart())).then(cnt => {
          if (!cnt) return count;
          else return this.redisOrdersModel.upsertOrderCount(date, cnt - 0 + 1).then(() => {
            return cnt - 0 + 1;
          });
        });
      });
  }
  
  /**
   * 更新订单地址
   * @param order 新订单数据
   */
  updateOrderAddress(order, addressInfo) {
    return this.mysqlOrdersModel.updateOrder(order.uid, order.order_no, new models.orderModel.GetOrderParams(addressInfo))
      .then(o => {
        if (o) {
          return Promise.all([
            this.redisOrdersModel.createOrder(order),
            this.redisOrdersModel.createOrderSort(order),
            order.report_type == 2 ? this.redisOrdersModel.createOrderTypeSort(order) : null
          ]);
        } else return this.redisOrdersModel.addUpdateAddressKey(order);
      });
  }
  
  getOrderByNo(sid, order_no) {
    return this.redisOrdersModel.getOrderByNo(sid, order_no)
      .then(order => {
        if (order) return order;
        else {
          return this.mysqlOrdersModel.getOrderByNo(order_no)
            .then(o => {
              if (!o) return null;
              else {
                Promise.all([
                  this.redisOrdersModel.createOrder(o),
                  this.redisOrdersModel.createOrderSort(o),
                ]);
                return o;
              }
            });
        }
      });
  }
  
  /**
   * 根据订单类型获取订单所需要的商品信息
   * 充值 goods_sn ---> score_rule code
   * 系统 goods_sn ---> score_rule code
   * 实物 goods_sn ---> goods goods_sn
   * 虚拟 goods_sn ---> goods goods_sn and digital_card goods_is
   */
  getGoodsOrderByType(type, goods_sn, buy_count, address, data) {
    switch (type) {
      //CNY-充值
      case 'recharge':
        return this.ChargeService.getByCode(goods_sn)
          .then(charge => {
            if (charge && charge.category_id == 6) return {
              order: new models.chargeModel.ChargeForOrder(charge, data.type, buy_count),
              limit: false
            };
            else return {order: false, err: [4512, 'Can not find charges', {}]};
          });
        break;
      // 积分变动
      case 'system':
        return this.ChargeService.getByCode(goods_sn)
          .then(charge => {
            if (charge && charge.price != 0) {
              return {order: new models.chargeModel.SystemForOrder(charge, buy_count), limit: false};
            } else if (charge) return {order: false, err: [4522, 'charges price is 0', {code: goods_sn}]};
            else return {order: false, err: [4512, 'Can not find charges', {}]};
          });
        break;
      //实物(商城) 和 虚拟(电子卡)
      case 'goods':
        return this.GoodsService.findByGoodsSn(goods_sn)
          .then(goods => {
            if (goods && goods.status == 1) {
              return this.getOrderByGoodsType(goods, buy_count, address);
            } else return {order: false, err: [4512, 'Can not find workable goods', {}]};
          });
        break;
      //运营后台加积分
      case 'OSS':
        if (!data.creater) return {order: false, err: [4000, 'OSS system need creater', {}]};
        return {order: new models.chargeModel.OSSForOrder(data, buy_count), limit: false};
        break;
      default:
        return {order: false, err: [4513, 'create order type error', {type}]};
    }
  }
  
  /**
   * 根据商品类型获取不同的订单参数
   */
  getOrderByGoodsType(goods, buy_count, address) {
    let now = eutil.getTimeSeconds();
    // if(goods.type == 2) {
    //   if(goods.onactivities_time - now > 0 || goods.offactivities_time - now < 0) return {order: false, err: [4521, 'out of the activity time', {onactivities_time: goods.onactivities_time, offactivities_time: goods.offactivities_time}]};
    // }
    //上下架时间
    if (goods.is_sale) {
      if (goods.onsale_time - now > 0 || goods.offsale_time - now < 0) return {
        order: false,
        err: [4521, 'out of the sale time', {onsale_time: goods.onsale_time, offsale_time: goods.offsale_time}]
      };
    }
    //抢购时间
    if (goods.dispalyflashsale_countdown_time) {
      if (goods.onflashsale_time - now > 0 || goods.offflashsale_time - now < 0) return {
        order: false,
        err: [4521, 'out of the dispaly flash time', {
          onflashsale_time: goods.onflashsale_time,
          offflashsale_time: goods.offflashsale_time
        }]
      };
    }
    if (!goods.is_digital || (goods.type == 2 && goods.is_digital)) {
      return this.getMallOrderByGoods(goods, buy_count, (goods.type == 2 && goods.is_digital) ? 0 : 1, address);
    } else return this.getDigitalOrderByGoods(buy_count, goods);
  }
  
  /**
   * 获取虚拟订单参数
   */
  getDigitalOrderByGoods(buy_count, goods) {
    return this.DigitalService.getUnusedDigital(goods.goods_sn, buy_count)
      .then(data => {
        if (!data) return {order: false, err: [4512, 'Can not find workable digital', {}]};
        // else if (data.num) return {order: false, err: [4514, 'Digital is not enough', {num: data.num}]};
        else if (data.num) {
          if (data.num <= this.digitalWarnNum) this.DigitalService.setUnusedDigital(goods.goods_sn, this.digitalRedisNum);
          return {
            order: new models.digitalModel.DigitalForOrder([], buy_count, {}, goods),
            limit: {buylimit: goods.buylimit == -1 ? false : goods.buylimit, goods_num: goods.goods_num}
          };
        }
        else {
          return Promise.reduce(data.digital, (result, d, index) => {
            if (index == 0) result[0] = d.code, result[1] = d.sn;
            else result[0] += ',' + d.code, result[1] += ',' + d.sn;
            return result;
          }, []).then(code_sn => {
            return {
              order: new models.digitalModel.DigitalForOrder(code_sn, buy_count, data.digital[0], goods),
              limit: {buylimit: goods.buylimit == -1 ? false : goods.buylimit, goods_num: goods.goods_num}
            };
          });
        }
      });
  }
  
  /**
   * 获取实物订单参数
   */
  getMallOrderByGoods(goods, goods_count, needAddress, address) {
    if (needAddress && !address) return {
      order: false,
      err: [4000, 'address form error', {address: '用户名,手机号码,省|市|区,街道等具体信息 or 用户名,手机号码,直辖市|区,街道等具体信息'}]
    };
    let mallOrder = needAddress ? new models.orderModel.OrderAddressFilter(address) : {};
    if (!needAddress || mallOrder.address && mallOrder.addressee && mallOrder.district && mallOrder.phone > 0) {
      return {
        order: new models.goodsModel.GoodsForOrder(_.merge(goods, mallOrder), goods_count),
        limit: {buylimit: goods.buylimit == -1 ? false : goods.buylimit, goods_num: goods.goods_num}
      };
    }
    else return {
      order: false,
      err: [4000, 'address form error', {address: '用户名,手机号码,省|市|区,街道等具体信息 or 用户名,手机号码,直辖市|区,街道等具体信息'}]
    };
  }
  
  deleteOrder(order_no, sid, uid) {
    return this.mysqlOrdersModel.deleteOrder(order_no, sid, uid)
      .then(() => {
        return this.redisOrdersModel.deleteOrder(order_no, sid, uid);
      });
  }
  
  deleteOrderDetail(order_no, sid, uid) {
    return this.mysqlOrdersModel.deleteOrderDetail(order_no, sid, uid)
      .then(() => {
        return this.redisOrdersModel.deleteOrderDetail(order_no, sid, uid);
      });
  }
  
  updateOrderByOSS(sid, order_no, updateParams) {
    return Promise.resolve()
      .then(() => {
        let updateOrder = new models.orderModel.GetOrderParams(updateParams, true);
        if (Object.keys(updateOrder).length < 1) {
          return Promise.reject([4000, 'update params error', {}]);
        } else {
          let updateOrderDetail = new models.orderModel.GetOrderDetailParams(updateOrder, true);
          if (Object.keys(updateOrderDetail).length < 1) updateOrderDetail = null;
          return {updateOrder, updateOrderDetail};
        }
      })
      .then(({updateOrder, updateOrderDetail}) => {
        return this.getOrderByNo(sid || 1, order_no)
          .then(order => {
            if (!order) return Promise.reject([4512, 'can not find order', {order_no}]);
            else return {updateOrder, updateOrderDetail, order: _.assign(order, updateOrder)};
          });
      })
      .then(({updateOrder, updateOrderDetail, order}) => {
        return this.updateOrder(order_no, order, updateOrder, updateOrderDetail)
          .then(() => {
            return [2000, 'success', {}];
          });
      })
      .catch(function (res) {
        if (eutil.isArray(res)) return res;
        else {
          this.log.error(res);
          return [500, 'error', res];
        }
      });
  }
  
}

module.exports = Orders;
