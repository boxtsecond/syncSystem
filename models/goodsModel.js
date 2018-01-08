'use strict';

const eutil = require("eutil");
// const snowflake = require('node-snowflake').Snowflake;
// var base64 = require('base-64');
// function discoverGoods (params) {
//   this.id = params.id;
//   this.sid = params.sid;
//   this.discover_displayid = params.discover_displayid;
//   this.goodsid = params.goodsid;
//   // 商品在此发现的排序分数
//   if (params.score) throw new Error('新增 discoverGoods 的 score 由 redis 自动生成，不可指定');
//
//   this.ctime = params.ctime || eutil.getTimeSeconds();
//   this.mtime = params.mtime || eutil.getTimeSeconds();
//   // 关联商品唯一索引
//   this.goods_sn = params.goods_sn || params.goodsSn || -1;
//   if (!eutil.isString(this.goods_sn)) throw new Error('goods_sn must be a string');
//   if (this.goods_sn == -1) throw new Error('新增discover_goods记录需要goods_sn');
// }
// function updateDiscoverGoodsAttributes (params) {
//   if (params.hasOwnProperty('goodsid')) this.goodsid = params.goodsid;
//   if (params.hasOwnProperty('goods_sn')) {
//     if (!eutil.isString(params.goods_sn)) throw new Error('goods_sn must be a string');
//     this.goods_sn = params.goods_sn;
//   }
//   this.mtime = eutil.getTimeSeconds();
// }
// function discoverGoodsIndex (params) {
//   if (!params.sid || !params.discover_displayid || !params.goods_sn) throw new Error('invalid param discoverGoodsIndex');
//   if (!eutil.isString(params.goods_sn)) throw new Error('goods_sn must be a string');
//   this.sid = params.sid;
//   this.discover_displayid = params.discover_displayid;
//   this.goods_sn = params.goods_sn;
// }
// function discoverGoodsResFilter (params) {
//   this.id = params.id;
//   this.sid = params.sid;
//   this.discover_displayid = params.discover_displayid;
//   this.goodsid = params.goodsid;
//   this.score = params.score;
//   this.ctime = params.ctime || eutil.getTimeSeconds();
//   this.mtime = params.mtime || eutil.getTimeSeconds();
//   // 关联商品唯一索引
//   this.goods_sn = (params.goods_sn && params.goods_sn != -1) ? base64.encode(params.goods_sn) : -1;
// }
// function goods (params) {
//   this.id = params.id;
//   this.sid = params.sid || 1;
//   this.is_digital = params.is_digital;
//   this.type = params.type;
//   if (this.is_digital == 0 && this.type == 2) throw new Error(`invalid value ${this.is_digital}-${this.type} of is_digital-type`);
//   this.category_id = params.category_id || 1;  // 商品所属分类
//   // 商品唯一索引
//   if (params.goods_sn || params.goodsSn) throw new Error('新增goods的goods_sn由snowflake自动生成，不可指定');
//   else this.goods_sn = snowflake.nextId();
//
//   this.is_hot = params.is_hot || 0; //是否热销，0，否；1，是
//   this.is_best = params.is_best || 0;
//   this.is_new = params.is_new || 0;
//   this.is_promote = params.is_promote || 0;
//   this.goods_name = params.goods_name;
//   this.goods_ico = params.goods_ico || -1;  //商品图标
//   this.small_url = params.small_url;
//   this.carousel_url = params.carousel_url || -1;//轮播url
//   this.video_url = params.video_url || -1;
//   this.page_url = params.page_url;  //商品展示url
//   this.is_sale = params.is_sale;  //是否上架，0，否；1，是
//   this.onsale_time = params.onsale_time;
//   this.offsale_time = params.offsale_time;
//   this.onflashsale_time = params.onflashsale_time;
//   this.offflashsale_time = params.offflashsale_time;
//   this.dispalyflashsale_time = params.dispalyflashsale_time || 0;  //是否显示抢购时间，0，否；1，是
//   this.dispalyflashsale_countdown_time = params.dispalyflashsale_countdown_time || 0; //是否开启抢购倒计时，0，否；1，是
//   this.sell_num = params.sell_num || 0; //已出售量
//   this.total_sale_price = params.total_sale_price || '0.00';//总销售价
//   this.goods_num = params.goods_num || 0; //商品余量
//   this.warn_num = params.warn_num || 0;  //商品报警数量
//   this.goods_market_price = params.goods_market_price || '0.00';  //市场售价
//   this.goods_price = params.goods_price;  //商品价格
//   this.is_show_goods_price = params.is_show_goods_price;  //是否显示商品价格，0，否；1，是
//   this.freight_price = params.freight_price || '0.00';//运费价格
//   this.freight_template_id = params.freight_template_id || -1;//运费模板id
//   this.buylimit = params.buylimit || -1; //商品人均最大购买量
//   this.goods_introduct = params.goods_introduct || -1;  //商品简介
//   this.goods_introduct_url = params.goods_introduct_url || -1;//商品介绍url
//   this.goods_detail = params.goods_detail || -1; //商品详情
//   this.activities_address = params.activities_address || -1;//活动地点,
//   this.onactivities_time = params.onactivities_time || 0;//活动开始时间
//   this.offactivities_time = params.offactivities_time || 0;//0,
//   this.status = params.status || 1;  //状态，-1：删除；0：禁用；1：启用
//   this.provide_invoice = params.provide_invoice || 0;//0,
//   this.provide_warranty = params.provide_warranty || 0;//0,
//   this.goods_weight = params.goods_weight || '0.00'; //商品的重量，以千克为单位
//   this.click_count = params.click_count || 0; //商品点击数
//   this.browse_count = params.browse_count || 0;//0,
//   this.share_count = params.share_count || 0;//0,
//   this.favorite_count = params.favorite_count || 0;//0,
//   this.like_count = params.like_count || 0;//0,
//   this.tenant_id = params.tenant_id || -1;//租户id
//   this.score = params.score || 0;//0,
//   this.is_check = params.is_check || 0;//是否通过审核，0，否；1，是
//   this.logistics_template_id = params.logistics_template_id || -1;//-1,
//   this.comments_id = params.comments_id || -1;//-1,
//   this.share_id = params.share_id || -1;//-1,
//   this.qa_id = params.qa_id || -1;//-1,
//   this.sellmonthly_num = params.sellmonthly_num || 0;//0,
//   this.promote_price = params.promote_price || 0;//0,
//   this.onpromote_time = params.onpromote_time || 0;//0,
//   this.offpromote_time = params.offpromote_time || 0;//0,
//   this.rmb_price = params.rmb_price || '0.00';//人民币售价
//   this.dollar_price = params.dollar_price || '0.00';//美金售价
//   this.keywords = params.keywords || '';//'-1',
//   this.note = params.note || '';//'""',
//   this.is_synced = params.is_synced || 0;//0,
//   this.synced_time = params.synced_time || 0;//0,
//   this.channel_id = params.channel_id || -1; //关联频道id
//   this.channel_h_id = params.channel_h_id || -1;
//   this.channel_h_data = params.channel_h_data || '';
//   // this.channel_h_data_obj={};
//   // if(this.channel_h_data!="-1" && eutil.isString(this.channel_h_data)) this.channel_h_data_obj=JSON.parse(this.channel_h_data);
//
//   // this.channel_reply_count = params.channel_reply_count; //关联频道回复数
//   // this.channel_like_count = params.channel_like_count; //关联频道点赞数
//   this.ctime = params.ctime || eutil.getTimeSeconds();
//   this.mtime = params.mtime || eutil.getTimeSeconds();
//   // 新加字段
//   this.goods_instructions = params.goods_instructions || '';//商品使用说明
//   this.star_profit_percent = params.star_profit_percent || '0.00'; //版主分成积分
//   this.platform_profit_percent = params.platform_profit_percent || '0.00'; //平台分成积分
//   this.profit_price = params.profit_price || '0.00'; //'商品盈利
//   // this.goods_instructions = params.goods_instructions; //'商品盈利
//   this.goods_sn_en = params.goods_sn_en || -1;
//   this.exp_price = params.exp_price || '0.00';
//   this.goods_total_num = params.goods_total_num || 0;
// }
// function goodsResFilter (params, score) {
//   if (params.discoverGoodsList) {
//     this.discoverGoodsList = params.discoverGoodsList.map(discoverGoods => new discoverGoods(params.discoverGoods));
//   }
//   this.score = score;
//
//   // this.id = params.id; 接口返回值中 隐藏商品id
//   // this.sid = params.sid || 1;
//   this.is_digital = params.is_digital;
//   this.type = params.type;
//   // this.category_id = params.category_id;  // 商品所属分类
//   // 商品唯一索引
//   this.goods_sn = (params.goods_sn && params.goods_sn != -1) ? base64.encode(params.goods_sn) : -1;
//
//   this.is_hot = params.is_hot || 0; //是否热销，0，否；1，是
//   this.is_best = params.is_best;
//   this.is_new = params.is_new;
//   this.is_promote = params.is_promote;
//   this.goods_name = params.goods_name;
//   this.goods_ico = params.goods_ico;  //商品图标
//   this.small_url = params.small_url;
//   this.carousel_url = params.carousel_url;//轮播url
//   this.video_url = params.video_url;
//   this.page_url = params.page_url;  //商品展示url
//   this.is_sale = params.is_sale;  //是否上架，0，否；1，是
//   this.onsale_time = params.onsale_time;
//   this.offsale_time = params.offsale_time;
//   this.onflashsale_time = params.onflashsale_time;
//   this.offflashsale_time = params.offflashsale_time;
//   this.dispalyflashsale_time = params.dispalyflashsale_time || 0;  //是否显示抢购时间，0，否；1，是
//   this.dispalyflashsale_countdown_time = params.dispalyflashsale_countdown_time || 0; //是否开启抢购倒计时，0，否；1，是
//   this.sell_num = params.sell_num || 0; //已出售量
//   // this.total_sale_price = params.total_sale_price || '0.00';//总销售价
//   this.goods_num = params.goods_num || 0; //商品余量
//   this.warn_num = params.warn_num || 0;  //商品报警数量
//   this.goods_market_price = params.goods_market_price;  //市场售价
//   this.goods_price = params.goods_price;  //商品价格
//   this.is_show_goods_price = params.is_show_goods_price;  //是否显示商品价格，0，否；1，是
//   this.freight_price = params.freight_price;//运费价格
//   this.freight_template_id = params.freight_template_id;//运费模板id
//   this.buylimit = params.buylimit || -1; //商品人均最大购买量
//   this.goods_introduct = params.goods_introduct == '-1' ? '' : (params.goods_introduct || '');  //商品简介
//   this.goods_introduct_url = params.goods_introduct_url;//商品介绍url
//   this.goods_detail = params.goods_detail;  //商品详情
//   this.activities_address = params.activities_address;//活动地点,
//   this.onactivities_time = params.onactivities_time;//活动开始时间
//   this.offactivities_time = params.offactivities_time;//0,
//   // this.status = params.status || 1;  //状态，-1：删除；0：禁用；1：启用
//   this.provide_invoice = params.provide_invoice;//0,
//   this.provide_warranty = params.provide_warranty;//0,
//   this.goods_weight = params.goods_weight; //商品的重量，以千克为单位
//   // this.click_count = params.click_count; //商品点击数
//   // this.browse_count = params.browse_count;//0,
//   // this.share_count = params.share_count;//0,
//   // this.favorite_count = params.favorite_count;//0,
//   // this.like_count = params.like_count;//0,
//   // this.tenant_id = params.tenant_id;//租户id
//   // this.score = params.score || 0;//0,
//   // this.is_check = params.is_check;//是否通过审核，0，否；1，是
//   this.logistics_template_id = params.logistics_template_id;//-1,
//   // this.comments_id = params.comments_id;//-1,
//   this.share_id = params.share_id;//-1,
//   // this.qa_id = params.qa_id;//-1,
//   // this.sellmonthly_num = params.sellmonthly_num;//0,
//   this.promote_price = params.promote_price;//0,
//   this.onpromote_time = params.onpromote_time;//0,
//   this.offpromote_time = params.offpromote_time;//0,
//   this.rmb_price = params.rmb_price;//人民币售价
//   // this.dollar_price = params.dollar_price;//美金售价
//   // this.keywords = params.keywords;//'-1',
//   // this.note = params.note;//'""',
//   // this.is_synced = params.is_synced;//0,
//   // this.synced_time = params.synced_time;//0,
//   this.channel_id = params.channel_id; //关联频道id
//   this.channel_h_id= params.channel_h_id;
//   this.channel_h_data= params.channel_h_data;
//   this.channel_h_data_obj=params.channel_h_data_obj || {
//     channelId : -1,
//     headlineId : -1,
//     mtime : Date.now(),
//     ctime : Date.now(),
//     like_count : 0,
//     reply_count : 0,
//     likelist : [],
//     driver : 1,
//     // musiclength : params.musiclength || "00:00",
//     datatype : -1,
//     text : "-1",
//     link : [],
//     ataillist : [],
//     creater : -1,
//     isdel : 0,
//     hasLive : 0,
//   };
//   // if(this.channel_h_data!="-1") this.channel_h_data_obj=JSON.parse(this.channel_h_data);
//   if(this.channel_id!=-1&&this.channel_h_data!="-1" && eutil.isString(this.channel_h_data)) {
//     console.log("channel_h_data -----",this.channel_h_data)
//     this.channel_h_data_obj = JSON.parse(this.channel_h_data);
//     if (this.channel_h_data_obj.text === '-1') this.goods_detail = '-1';
//     else {
//       this.goods_detail = '-1';
//       this.goods_name = new Buffer(this.channel_h_data_obj.text, 'base64').toString();
//     }
//     if (this.channel_h_data_obj.link && this.channel_h_data_obj.link[0] && this.channel_h_data_obj.link[0].url) {
//       this.small_url = this.channel_h_data_obj.link[0].url;
//     } else this.small_url = '-1';
//   }
//
//   // this.ctime = params.ctime || eutil.getTimeSeconds();
//   // this.mtime = params.mtime || eutil.getTimeSeconds();
//   this.goods_sn = (params.goods_sn && params.goods_sn != -1) ? base64.encode(params.goods_sn) : -1;
//   // 新加字段
//   this.goods_instructions = params.goods_instructions;
//   // this.star_profit_percent = params.star_profit_percent; //版主分成积分
//   // this.platform_profit_percent = params.platform_profit_percent; //平台分成积分
//   // this.goods_instructions = params.goods_instructions; //'商品盈利
//   this.goods_sn_en = params.goods_sn_en;
//   // this.exp_price = params.exp_price;
//   this.goods_total_num = params.goods_total_num;
// }
// function updateGoodsAttributes(params) {
//   if (eutil.haveOwnproperty(params, 'goods_sn')) throw new Error('goods_sn 不可更改');
//   if (eutil.haveOwnproperty(params, 'id')) throw new Error('id 不可更改');
//   Object.keys(params).forEach(property => {
//     this[property] = params[property];
//   });
//
//   // if (eutil.haveOwnproperty(params, 'goods_name')) this.goods_name = params.goods_name; //商品名称
//   // if (eutil.haveOwnproperty(params, 'goods_ico')) this.goods_ico = params.goods_ico; //商品图片
//   // if (eutil.haveOwnproperty(params, 'page_url')) this.page_url = params.page_url; //商品展示url
//   // if (eutil.haveOwnproperty(params, 'small_url')) this.small_url = params.small_url; //商品展示小图片url
//   // if (eutil.haveOwnproperty(params, 'goods_num')) this.goods_num = params.goods_num; //商品余量
//   // if (eutil.haveOwnproperty(params, 'sell_num')) this.sell_num = params.sell_num; //商品销量
//   // if (eutil.haveOwnproperty(params, 'onsale_time')) this.onsale_time = params.onsale_time; //商品上架时间
//   // if (eutil.haveOwnproperty(params, 'offsale_time')) this.offsale_time = params.offsale_time; //商品下架时间
//   // if (eutil.haveOwnproperty(params, 'onsale_time')) this.onsale_time = params.onsale_time; //商品上架时间
//   // if (eutil.haveOwnproperty(params, 'onsale_time')) this.onsale_time = params.onsale_time; //商品上架时间
//   // if (eutil.haveOwnproperty(params, 'onflashsale_time')) this.onflashsale_time = params.onflashsale_time; //商品抢购开始时间
//   // if (eutil.haveOwnproperty(params, 'offflashsale_time')) this.offflashsale_time = params.offflashsale_time; //商品抢购截止时间
//   // if (eutil.haveOwnproperty(params, 'dispalyflashsale_time')) this.dispalyflashsale_time = params.dispalyflashsale_time; //是否显示抢购时间，0，否；1，是
//   // if (eutil.haveOwnproperty(params, 'dispalyflashsale_countdown_time')) this.dispalyflashsale_countdown_time = params.dispalyflashsale_countdown_time; //是否开启抢购倒计时，0，否；1，是
//   // if (eutil.haveOwnproperty(params, 'goods_price')) this.goods_price = params.goods_price; //商品单价
//   // if (eutil.haveOwnproperty(params, 'is_show_goods_price')) this.is_show_goods_price = params.is_show_goods_price; //是否显示商品价格，0，否；1，是
//   // if (eutil.haveOwnproperty(params, 'buylimit')) this.buylimit = params.buylimit; //商品人均最大购买量
//   // if (eutil.haveOwnproperty(params, 'is_digital')) this.is_digital = params.is_digital; //商品类型
//   // if (eutil.haveOwnproperty(params, 'goods_introduct')) this.goods_introduct = params.goods_introduct; //商品介绍
//   // if (eutil.haveOwnproperty(params, 'goods_instructions')) this.goods_instructions = params.goods_instructions; //商品使用说明
//
//   // if (eutil.haveOwnproperty(params, 'goods_introduct_url')) this.goods_introduct_url = params.goods_introduct_url; //商品介绍url
//   // if (eutil.haveOwnproperty(params, 'carousel_url')) this.carousel_url = params.carousel_url; //轮播url
//   // if (eutil.haveOwnproperty(params, 'is_sale')) this.is_sale = params.is_sale; //是否上架，0，否；1，是
//
//   // if (eutil.haveOwnproperty(params, 'channel_id')) this.channel_id = params.channel_id; //接入舞台的活动的频道id
//   // if (eutil.haveOwnproperty(params, 'channel_h_id')) this.channel_h_id = params.channel_h_id; //接入舞台的活动展示的头条id
//   // if (eutil.haveOwnproperty(params, 'channel_h_data')) this.channel_h_data = params.channel_h_data; //接入舞台的活动展示的头条JSON字符串
//
//   // if (eutil.haveOwnproperty(params, 'activities_address')) this.activities_address = params.activities_address; //活动地址
//   // if (eutil.haveOwnproperty(params, 'onactivities_time')) this.onactivities_time = params.onactivities_time; //活动开始时间
//   // if (eutil.haveOwnproperty(params, 'offactivities_time')) this.offactivities_time = params.offactivities_time; //活动结束时间
//   // if (eutil.haveOwnproperty(params, 'type')) this.type = params.type; //1 普通商品 2 活动商品
//   // if (eutil.haveOwnproperty(params, 'goods_detail')) this.goods_detail = params.goods_detail; //商品详情
//   this.mtime = params.mtime || eutil.getTimeSeconds(); //修改时间
// }
//
// function GoodsForOrder(goods, goods_count) {
//   this.is_pay = 1;
//   this.goods_id = goods.goods_sn;
//   this.goods_name = goods.goods_name;
//   this.goods_small_url = goods.small_url;
//   this.goods_video_url = goods.video_url;
//   this.goods_page_url = goods.page_url;
//   this.goods_ico = goods.goods_ico;
//   this.goods_instructions = goods.goods_instructions;
//   this.goods_price = Number(goods.goods_price).toFixed(2);
//   this.report_type = 2;
//   this.order_status = 1;
//   this.change_type = 4;
//   this.payment_type = 4;
//   this.user_behavior = `商城购买: ${this.goods_name}`;
//   this.goods_type = goods.type;
//   this.goods_count = goods_count;
//   this.onactivities_time = goods.onactivities_time;
//   this.offactivities_time = goods.offactivities_time;
//   this.activities_address = goods.activities_address;
//   this.addressee = goods.addressee;
//   this.phone = goods.phone;
//   this.province = goods.province;
//   this.city = goods.city;
//   this.district = goods.district;
//   this.pay_price = this.goods_price*goods_count;
//   this.change_price = this.pay_price * -1;
//   this.exp_price = this.pay_price > 0 ? this.pay_price : 0;
// }
//
// function UpdateRedisGoodsForOrder(order) {
//   this.is_pay = 1;
//
// }

function GoodsBill(goods, count) {
	this.sid = goods.sid;
	this.goods_sn = goods.goods_sn || goods.code;
	this.report_type = goods.report_type;
	this.is_digital = goods.is_digital || 1;
	this.goods_id = goods.id;
	this.goods_name = goods.goods_name || goods.dispaly_name;
	this.goods_price = goods.goods_price || goods.price;
	this.sell_num = count;
	this.total_sell_price = goods.total_sell_price || this.goods_price * this.sell_num;
	this.y_month = goods.y_month || eutil.dateFormat(eutil.dateGetBeforeDay(null, 1), 'yyyyMM');
	this.mtime = eutil.getTimeSeconds();
	this.ctime = goods.ctime || this.mtime || eutil.getTimeSeconds();
}

// module.exports = {
//   goods,
//   discoverGoods,
//   updateGoodsAttributes,
//   goodsResFilter,
//   discoverGoodsResFilter,
//   GoodsForOrder,
//   UpdateRedisGoodsForOrder,
//   GoodsBill,
//   updateDiscoverGoodsAttributes,
//   discoverGoodsIndex
// };

module.exports = {
	GoodsBill
};
