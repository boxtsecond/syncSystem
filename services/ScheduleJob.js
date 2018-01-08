/**
 * Created by Bo on 2017/12/8.
 */

'use strict';
const models = require('../models');
const eutil = require('eutil');

class ScheduleJob {
	constructor(app, util, services) {
		this.redisScheduleModel = app.get("redisScheduleModel");
		this.config = util.config;
		this.GoodsService = services.GoodsService;
		this.ChargeService = services.ChargeService;
		this.Schedule = services.schedule;
		// this.start();
	}
	
	start() {
		let _self = this;
		return _self.Schedule.create({
			title: 'Sync Goods For OSS',
			// rule: this.config.schedule.goodsRule,
			rule: '5 * * * * *',
			func: function () {
				return Promise.all([
					_self.goodsMysqlPer(),
					_self.goodsBillMysqlPer(),
					_self.goodsStatisticsMysqlPer()
				]);
			}
		});
	}
	
	goodsMysqlPer() {
		console.log('Start sync goods');
		return this.GoodsService.getAllGoodsNum()
			.then(({goodsNum, sellNum}) => {
				if (goodsNum && sellNum) {
					return Promise.map(Object.keys(goodsNum), k => {
						return this.GoodsService.updateMysqlGoodsNums(k, goodsNum[k], sellNum[k]);
					});
				}
			});
	}
	
	goodsStatisticsMysqlPer() {
		console.log('Start sync goods_statistices');
		return this.GoodsService.getGoodsStatistics(this.config.sid)
			.then(data => {
				if (data[0] && JSON.stringify(data[0]) != '{}' && data[1] && JSON.stringify(data[1]) != '{}') {
					return Promise.map(Object.keys(data[0]), k => {
						let arr = k.split('_');
						return this.GoodsService.updateGoodsStatistics(arr[0], arr[1], {
							sell_num: data[0][k],
							total_sell_price: data[1][k]
						});
					});
				}else return false;
			});
	}
	
	goodsBillMysqlPer() {
		console.log('Start sync goods_bill');
		return this.GoodsService.getRedisGoodsBill(eutil.dateFormat(eutil.dateGetBeforeDay(null, 1), 'yyyyMM'), this.config.sid).then(data => {
			if(data && JSON.stringify(data) != '{}') {
				return Promise.map(Object.keys(data), sn => {
					return this.getGoodsByGoodsBill (sn)
						.then(goods => {
							if (goods) {
								return this.GoodsService.upsertGoodsBill(new models.goodsModel.GoodsBill(goods, data[sn]));
							}
						});
				});
			} else return false;
		});
	}
	
	getGoodsByGoodsBill (sn) {
		return this.GoodsService.findByGoodsSn(sn)
			.then(goods => {
				if (goods) {
					goods.report_type = 2;
					goods.goods_price = goods.goods_price.toString();
					return goods;
				}
				else return this.ChargeService.getByCode(sn)
					.then(charge => {
						if (charge) {
							charge.report_type = charge.category_id == 6 ? 1 : (charge.price > 0 ? 3 : 4);
							charge.price = charge.price > 0 ? charge.price : -1 * charge.price;
							charge.price = charge.price.toString();
						}
						return charge;
					});
			});
	}
}

module.exports = ScheduleJob;
