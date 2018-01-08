/**
 * Created by Bo on 2017/11/13.
 */

'use strict';

function ChargeResFilter(data) {
  // this.id = data.id;
  // this.category_id = data.category_id;
  this.dispaly_name = data.dispaly_name;
  this.recharge_price = data.recharge_price.toFixed(2);
  this.price = data.price.toFixed(2);
  // this.status = data.status;
  this.score = data.score;
  // this.channel_reply_limit = data.channel_reply_limit;
  // this.channel_reply_limit_count = data.channel_reply_limit_count;
  // this.ctime = data.ctime || eutil.getTimeSeconds();
  // this.mtime = data.mtime || eutil.getTimeSeconds();
}

function ChargeForOrder(charge, type, goods_count) {
  this.type = 1;
  this.is_pay = 0;
  this.goods_id = charge.code;
  this.goods_name = charge.dispaly_name;
  this.goods_price = Number(charge.price).toFixed(2);
  this.goods_count = goods_count;
  this.pay_price = Number(charge.recharge_price).toFixed(2)*goods_count;
  this.change_price = this.goods_price*this.goods_count;
  this.report_type = 1;
  this.order_status = '0';
  this.change_type = 1;
  this.user_behavior = `充值${charge.price}星星`;
  this.payment_type = type;
}

function SystemForOrder(charge, goods_count) {
  this.is_pay = 1;
  this.goods_id = charge.code;
  this.goods_name = charge.dispaly_name;
  this.goods_price = Number(charge.price).toFixed(2);
  this.goods_count = goods_count;
  this.report_type = this.goods_price > 0 ? 3 : 4;
  this.pay_price = (this.report_type == 3 ? -1*charge.price: charge.price)*goods_count;
  this.change_price = this.goods_price*this.goods_count;
  this.order_status = 4;
  this.change_type = 4;
  this.exp_price = this.pay_price > 0 ? this.pay_price : 0;
}

function OSSForOrder(OSS, goods_count) {
  this.is_pay = 1;
  this.creater = OSS.creater;
  this.goods_id = OSS.user_behavior;
  this.goods_name = OSS.dispaly_name || 'OSS';
  this.goods_price = Number(OSS.goods_price).toFixed(2);
  this.goods_count = goods_count ? goods_count : 1;
  this.report_type = this.goods_price > 0 ? 3 : 4;
  this.pay_price = this.goods_price*goods_count;
  this.order_status = 4;
  this.change_type = 4;
  this.user_behavior = OSS.user_behavior;
  this.change_price = this.pay_price;
}

module.exports = {
  ChargeResFilter,
  ChargeForOrder,
  SystemForOrder,
  OSSForOrder
};
