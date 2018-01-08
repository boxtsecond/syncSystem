/**
 * Created by Bo on 2017/11/17.
 */

'use strict';

const eutil = require("eutil");

// 虚拟卡片模型
function Digital (dc) {
  this.goods_id = dc.goods_id;
  this.type = dc.type || -1;
  this.code = dc.code;
  this.sn = dc.sn;
  this.use_uid = dc.use_uid || -1;
  this.use_time = dc.use_time || 0;
  this.owner_uid = dc.owner_uid || -1;
  this.owner_time = dc.owner_time || 0;
  this.name = dc.name || '';
  this.ico = dc.ico || '';
  this.wrapper_url = dc.wrapper_url || '';
  this.market_price = dc.market_price || 0.00;
  this.price = dc.price || 0.00;
  this.introduct = dc.introduct || '';
  this.detail = dc.detail || '';
  this.status = dc.status || -1;
  this.note = dc.note || '';
  this.cd_type = dc.cd_type || 1;
  this.ctime = dc.ctime || eutil.getTimeSeconds();
  this.mtime = dc.mtime || eutil.getTimeSeconds();
}

function DigitalForOrder (code_sn, goods_count, digital, goods) {
  this.is_pay = 1;
  this.goods_id = digital.goods_id || goods.goods_sn;
  this.goods_name = digital.name || goods.goods_name;
  this.goods_small_url = goods.small_url;
  this.goods_video_url = goods.video_url;
  this.goods_page_url = goods.page_url;
  this.goods_ico = goods.goods_ico;
  this.goods_instructions = goods.goods_instructions;
  this.goods_count = goods_count;
  this.goods_price = Number(goods.goods_price).toFixed(2);
  this.pay_price = this.goods_price*this.goods_count;
  this.report_type = 2;
  this.order_status = 4;
  this.change_type = 4;
  this.payment_type = 4;
  this.change_price = this.pay_price * -1;
  this.cd_key = code_sn[0] || '';
  this.cd_sn = code_sn[1] || '';
  this.cd_type = digital.cd_type || -1;
  this.user_behavior = `商城购买: ${this.goods_name}`;
  this.exp_price = this.pay_price > 0 ? this.pay_price : 0;
}

module.exports = {
  Digital,
  DigitalForOrder
};
