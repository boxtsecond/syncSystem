/**
 * Created by Bo on 2017/11/8.
 */

'use strict';

const eutil = require("eutil");

function Order(order_no, order) {
  this.uid = order._uid || order.uid;
  this.creater = order.creater || -1;
  this.order_no = order_no || order.order_no;
  this.is_digital = order.is_digital || 0;
  this.order_type = order.order_type || 1;
  this.report_type = order.report_type || -1;
  this.goods_cat_count = order.goods_cat_count || 1;
  this.goods_id = order.goods_id || order.id;
  this.goods_type = order.goods_type || 1;
  this.goods_name = order.goods_name || '-1';
  this.goods_small_url = order.goods_small_url || '-1';
  this.goods_video_url = order.goods_video_url || '-1';
  this.goods_page_url = order.goods_page_url || '-1';
  this.goods_ico = order.goods_ico || '-1';
  this.goods_instructions = order.goods_instructions || '';
  this.goods_count = order.goods_count || 1;
  this.goods_price = Number(order.goods_price).toFixed(2); //实际支付(单价)
  // this.goods_market_price = Number(this.goods_market_price).toFixed(2) || this.goods_price; //应支付(单价)
  this.is_ship = order.is_ship || 0;
  this.ship_time = order.ship_time || 0;
  this.ship_completed_time = order.ship_completed_time || 0;
  this.ship_best_time = order.ship_best_time || '';
  this.is_receipt = order.is_receipt || 0;
  this.confirm_receipt_time = order.confirm_receipt_time || 0;
  this.order_status = order.order_status || -1;
  this.refund_status = Number(order.refund_status) || -1;
  this.status = order.status || 1;
  this.account = order.account || '-1';
  this.is_pay = order.is_pay;
  this.pay_time = order.pay_time || eutil.getTimeSeconds();
  this.payment_type = order.payment_type || -1;
  this.insure_price = order.insure_price || 0.00;
  this.pack_fee = order.pack_fee || 0.00;
  this.amount = order.amount || 1;
  this.address = order.address || '';
  this.addressid = order.addressid || -1;
  this.addressee = order.addressee || '';
  this.express_company = order.express_company || '-1';
  this.express_no = order.express_no || '-1';
  this.logistics = order.logistics || '-1';
  this.country = order.country || '';
  this.province = order.province || '';
  this.city = order.city || '';
  this.district = order.district || '';
  this.zipcode = order.zipcode || '';
  this.itucode = order.itucode || '-1';
  this.phone = order.phone || '';
  this.email = order.email || '-1';
  this.inv_type = order.inv_type || '';
  this.inv_payee = order.inv_payee || '';
  this.inv_content = order.inv_content || '';
  this.inv_tax_price = order.inv_tax_price || 0.00;
  this.coupon_no = order.coupon_no || '';
  this.discount_price = order.discount_price || 0.00;
  this.discount_other_price = order.discount_other_price || 0.00;
  this.user_note = order.user_note || '';
  this.order_note = order.order_note || '';
  this.note = order.note || '';
  this.user_behavior = order.user_behavior || '';
  this.sid = order.sid || 1;
  this.manufacture_time = order.manufacture_time || 0;
  this.is_synced = order.is_synced || 0;
  this.synced_time = order.synced_time || 0;
  this.promotion_price = order.promotion_price || 0.00;
  this.gainsharing_price = order.gainsharing_price || 0.00;
  this.is_mass = order.is_mass || 0;
  this.cd_key = order.cd_key || '';
  this.cd_sn = order.cd_sn || '';
  this.cd_type = order.cd_type || 0;
  this.change_price = order.change_price || this.goods_count * this.goods_price; //积分变动
  this.change_price = Number(this.change_price).toFixed(2);
  this.change_type = order.change_type;
  this.pay_price = order.pay_price || this.change_price || this.goods_count * this.goods_price; //实际支付价格
  this.pay_price = Number(this.pay_price).toFixed(2);
  this.exp_price = order.exp_price || 0.00;
  this.exp_price = Number(this.exp_price).toFixed(2);
  this.parent_order_no = order.parent_order_no || '';
  this.refundable_count = order.refundable_count || 0;
  this.change_time = order.change_time || eutil.getTimeSeconds();
  this.onactivities_time = order.onactivities_time || 0;
  this.offactivities_time = order.offactivities_time || 0;
  this.activities_address = order.activities_address || '';
  this.ctime = order.ctime || eutil.getTimeSeconds();
  this.mtime = order.mtime || eutil.getTimeSeconds();
}

function OrderDetail(order) {
  this.uid = order.uid;
  this.creater = order.creater || -1;
  this.order_no = order.order_no;
  this.goods_id = order.goods_id;
  this.note = order.note || '';
  this.user_behavior = order.user_behavior || '';
  this.sid = order.sid || 1;
  this.change_price = order.change_price || order.goods_price * order.goods_count; //积分变动
  this.change_type = order.change_type;
  this.change_time = order.change_time || eutil.getTimeSeconds();
  this.ctime = order.ctime || eutil.getTimeSeconds();
  this.mtime = order.mtime || eutil.getTimeSeconds();
  this.is_synced = order.is_synced || 0;
  this.synced_time = order.synced_time || 0;
}

function GetOrderParams(data, delUid) {
  if(data._uid && !delUid) this.uid = data._uid;
  if(data.uid && !delUid) this.uid = data.uid;
  if(data.sid) this.sid = data.sid;
  if(data.order_no) this.order_no = data.order_no;
  if(data.is_digital) this.is_digital = data.is_digital;
  if(data.order_type) this.order_type = data.order_type;
  if(data.report_type) this.report_type = data.report_type;
  if(data.goods_cat_count) this.goods_cat_count = data.goods_cat_count;
  if(data.goods_id) this.goods_id = data.goods_id;
  if(data.goods_name) this.goods_name = data.goods_name;
  if(data.goods_small_url) this.goods_small_url = data.goods_small_url;
  if(data.goods_video_url) this.goods_video_url = data.goods_video_url;
  if(data.goods_page_url) this.goods_page_url = data.goods_page_url;
  if(data.goods_ico) this.goods_ico = data.goods_ico;
  if(data.is_ship) this.is_ship = data.is_ship;
  if(data.goods_count) this.goods_count = data.goods_count;
  if(data.ship_time) this.ship_time = data.ship_time;
  if(data.ship_completed_time) this.ship_completed_time = data.ship_completed_time;
  if(data.ship_best_time) this.ship_best_time = data.ship_best_time;
  if(data.is_receipt) this.is_receipt = data.is_receipt;
  if(data.confirm_receipt_time) this.confirm_receipt_time = data.confirm_receipt_time;
  if(data.order_status) this.order_status = data.order_status;
  if(data.refund_status) this.refund_status = data.refund_status;
  if(data.status) this.status = data.status;
  if(data.account) this.account = data.account;
  if(data.is_pay) this.is_pay = data.is_pay;
  if(data.pay_price) this.pay_price = data.pay_price;
  if(data.pay_time) this.pay_time = data.pay_time;
  if(data.payment_type) this.payment_type = data.payment_type;
  if(data.goods_price) this.goods_price = data.goods_count * data.goods_price; //应支付价格
  if(data.change_price) this.change_price = data.change_price || data.goods_price * data.goods_count; //积分变动
  if(data.change_type) this.change_type = data.change_type;
  if(data.change_time) this.change_time = data.change_time;
  if(data.insure_price) this.insure_price = data.insure_price;
  if(data.pack_fee) this.pack_fee = data.pack_fee;
  if(data.amount) this.amount = data.amount;
  if(data.address) this.address = data.address;
  if(data.addressid) this.addressid = data.addressid;
  if(data.addressee) this.addressee = data.addressee;
  if(data.express_company) this.express_company = data.express_company;
  if(data.express_no) this.express_no = data.express_no;
  if(data.logistics) this.logistics = data.logistics;
  if(data.country) this.country = data.country;
  if(data.province) this.province = data.province;
  if(data.city) this.city = data.city;
  if(data.district) this.district = data.district;
  if(data.zipcode) this.zipcode = data.zipcode;
  if(data.itucode) this.itucode = data.itucode;
  if(data.phone) this.phone = data.phone;
  if(data.email) this.email = data.email;
  if(data.inv_type) this.inv_type = data.inv_type;
  if(data.inv_payee) this.inv_payee = data.inv_payee;
  if(data.inv_content) this.inv_content = data.inv_content;
  if(data.inv_tax_price) this.inv_tax_price = data.inv_tax_price;
  if(data.coupon_no) this.coupon_no = data.coupon_no;
  if(data.discount_price) this.discount_price = data.discount_price;
  if(data.discount_other_price) this.discount_other_price = data.discount_other_price;
  if(data.user_note) this.user_note = data.user_note;
  if(data.order_note) this.order_note = data.order_note;
  if(data.note) this.note = data.note;
  if(data.user_behavior) this.user_behavior = data.user_behavior;
  if(data.manufacture_time) this.manufacture_time = data.manufacture_time;
  if(data.is_synced) this.is_synced = data.is_synced;
  if(data.synced_time) this.synced_time = data.synced_time;
  if(data.promotion_price) this.promotion_price = data.promotion_price;
  if(data.gainsharing_price) this.gainsharing_price = data.gainsharing_price;
  if(data.is_mass) this.is_mass = data.is_mass;
  if(data.cd_key) this.cd_key = data.cd_key;
  if(data.cd_sn) this.cd_sn = data.cd_sn;
  if(data.ctime) this.ctime = data.ctime;
  if(data.parent_order_no) this.parent_order_no = data.parent_order_no;
  if(data.refundable_count) this.refundable_count = data.refundable_count;
  if(data.exp_price) this.exp_price = data.exp_price;
  if(data.creater) this.creater = data.creater;
  this.mtime = data.mtime || eutil.getTimeSeconds();
}

function GetOrderDetailParams(data, delUid) {
  if(data._uid && !delUid) this.uid = data._uid;
  if(data.uid && !delUid) this.uid = data.uid;
  if(data.creater) this.creater = data.creater;
  if(data.sid) this.sid = data.sid;
  if(data.order_no) this.order_no = data.order_no;
  if(data.goods_id) this.goods_id = data.goods_id;
  if(data.goods_price) this.goods_price = data.goods_count * data.goods_price; //应支付价格
  if(data.note) this.note = data.note;
  if(data.user_behavior) this.user_behavior = data.user_behavior;
  if(data.is_synced) this.is_synced = data.is_synced;
  if(data.synced_time) this.synced_time = data.synced_time;
  if(data.ctime) this.ctime = data.ctime;
  if(data.change_price) this.change_price = data.change_price || data.goods_price * data.goods_count; //积分变动
  if(data.change_type) this.change_type = data.change_type;
  if(data.change_time) this.change_time = data.change_time || eutil.getTimeSeconds();
  this.mtime = data.mtime || eutil.getTimeSeconds();
}

function ChargeOrder(order_no, charge) {
  this.order_no = order_no;
  this.is_pay = charge.category_id == 6 ? 0 : 1;
  this.goods_id = charge.code;
  this.goods_name = charge.dispaly_name;
  this.goods_price = Number(charge.price).toFixed(2);
  this.pay_price = charge.recharge_price > 0 ? Number(charge.recharge_price).toFixed(2) : charge.price;
  this.report_type = charge.category_id == 6 ? 1 : (this.goods_price > 0 ? 3 : 4);
  this.order_status = charge.category_id == 6 ? 0 : 4;
  this.change_type = charge.category_id == 6 ? 1 : 4;
}

function GoodsOrder(order_no, goods) {
  this.order_no = order_no;
  this.is_pay = 1;
  this.goods_id = goods.goods_sn;
  this.goods_name = goods.goods_name;
  this.goods_small_url = goods.small_url;
  this.goods_video_url = goods.video_url;
  this.goods_page_url = goods.page_url;
  this.goods_ico = goods.goods_ico;
  this.goods_price = Number(goods.goods_price * -1).toFixed(2);
  this.report_type = 2;
  this.order_status = 1;
  this.change_type = 4;
  this.payment_type = 4;
  this.user_behavior = `商城购买: ${this.goods_name}`;
  this.goods_type = goods.type;
  this.onactivities_time = goods.onactivities_time;
  this.offactivities_time = goods.offactivities_time;
  this.activities_address = goods.activities_address;
}

function DigitalOrder(order_no, code_sn, digital) {
  this.order_no = order_no;
  this.is_pay = 1;
  this.goods_id = digital.goods_id;
  this.goods_name = digital.name;
  this.goods_price = Number(digital.price * -1).toFixed(2);
  // this.pay_price = this.goods_price;
  this.report_type = 2;
  this.order_status = 4;
  this.change_type = 4;
  this.payment_type = 4;
  // this.change_price = this.goods_price * this.goods_count;
  this.cd_key = code_sn[0];
  this.cd_sn = code_sn[1];
  this.cd_type = digital.cd_type;
  this.user_behavior = `商城购买: ${this.goods_name}`;
}

function OrderAddressFilter(address) {
  this.address = address || null;
  let info = this.address.replace(/\s+/g, '').split('|');
  let userInfo = info[0].split(',');
  if(info.length == 2) {
    this.addressee = userInfo[0] || null;
    this.phone = Number(userInfo[1]) || null;
    this.province = userInfo[2] || null;
    this.city = this.province;
    this.district = info[1] || null;
  }else if(info.length == 3) {
    this.addressee = userInfo[0] || null;
    this.phone = Number(userInfo[1]) || null;
    this.province = userInfo[2] || null;
    this.city = info[1] || null;
    this.district = info[2] || null;
  }
}

function OrderDetailResFilter(order) {
  this.order_no = order.order_no;
  // this.uid = order.uid;
  this.change_price = order.change_price;
  this.change_type = order.change_type;
  this.change_time = order.change_time;
  this.user_behavior = order.user_behavior;
  this.ctime = order.ctime;
}

function OrderResFilter(order) {
  this.uid = order.uid;
  this.order_no = order.order_no;
  this.is_digital = order.is_digital;
  this.order_type = order.order_type;
  this.report_type = order.report_type;
  this.goods_id = new Buffer(order.goods_id).toString('base64');
  this.goods_type = order.goods_type;
  this.goods_name = order.goods_name;
  this.goods_small_url = order.goods_small_url;
  this.goods_video_url = order.goods_video_url;
  this.goods_page_url = order.goods_page_url;
  this.goods_ico = order.goods_ico;
  this.goods_count = order.goods_count;
  this.goods_price = order.goods_price;
  this.is_ship = order.is_ship;
  this.ship_time = order.ship_time;
  this.ship_completed_time = order.ship_completed_time;
  this.ship_best_time = order.ship_best_time;
  this.is_receipt = order.is_receipt;
  this.confirm_receipt_time = order.confirm_receipt_time;
  this.order_status = order.order_status;
  this.refund_status = order.refund_status;
  this.status = order.status;
  this.account = order.account;
  this.is_pay = order.is_pay;
  this.pay_time = order.pay_time;
  this.payment_type = order.payment_type;
  this.insure_price = order.insure_price;
  this.pack_fee = order.pack_fee;
  this.amount = order.amount;
  this.address = order.address;
  this.addressid = order.addressid;
  this.addressee = order.addressee;
  this.express_company = order.express_company;
  this.express_no = order.express_no;
  this.logistics = order.logistics;
  this.country = order.country;
  this.province = order.province;
  this.city = order.city;
  this.district = order.district;
  this.zipcode = order.zipcode;
  this.itucode = order.itucode;
  this.phone = order.phone;
  this.inv_type = order.inv_type;
  this.inv_payee = order.inv_payee;
  this.inv_content = order.inv_content;
  this.inv_tax_price = order.inv_tax_price;
  this.coupon_no = order.coupon_no;
  this.discount_price = order.discount_price;
  this.discount_other_price = order.discount_other_price;
  this.user_note = order.user_note;
  this.order_note = order.order_note;
  this.note = order.note;
  this.user_behavior = order.user_behavior;
  this.sid = order.sid;
  this.manufacture_time = order.manufacture_time;
  this.promotion_price = order.promotion_price;
  this.gainsharing_price = order.gainsharing_price;
  this.is_mass = order.is_mass;
  this.cd_key = order.cd_key;
  this.cd_sn = order.cd_sn;
  this.change_price = order.change_price; //积分变动
  this.change_type = order.change_type;
  this.pay_price = order.pay_price;
  this.change_time = order.change_time;
  this.onactivities_time = order.onactivities_time;
  this.offactivities_time = order.offactivities_time;
  this.activities_address = order.activities_address;
  this.goods_instructions = order.goods_instructions;
  this.exp_price = order.exp_price;
  this.parent_order_no = order.parent_order_no;
  this.refundable_count = order.refundable_count;
  this.ctime = order.ctime;
}

module.exports = {
  Order,
  OrderDetail,
  GetOrderParams,
  GetOrderDetailParams,
  ChargeOrder,
  GoodsOrder,
  DigitalOrder,
  OrderAddressFilter,
  OrderResFilter,
  OrderDetailResFilter
};
