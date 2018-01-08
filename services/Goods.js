/*
 * @Author: dongyuxuan
 * @Date: 2017-11-07 18:03:41
 * @Last Modified by: dongyuxuan
 * @Last Modified time: 2018-01-03 13:40:29
 */
'use strict';

class Goods {
	constructor(app, util) {
		this.mysqlGoodsModel = app.get("mysqlGoodsModel");
		this.redisGoodsModel = app.get("redisGoodsModel");
		this.eutil = util.eutil;
	}
	
	findById(goodsid) {
		return this.redisGoodsModel.getById(goodsid)
			.then(redisResult => {
				if (redisResult) return redisResult;
				return this.mysqlGoodsModel.findById(goodsid)
					.then(mysqlResult => {
						if (!mysqlResult) return {};
						// 异步写回 redis
						this.redisGoodsModel.save(mysqlResult)
							.catch(err => this.log.error('goodsService-findById:redis写回失败', err));
						return mysqlResult;
					});
			})
			.then(goods => {
				if (!goods) return goods;
				return this.getRedisGoodsNum(goods.goods_sn).then(res => {
					if (!res) return goods;
					let {sell_num, goods_num} = res;
					if (sell_num) goods.sell_num = sell_num;
					if (goods_num) goods.goods_num = goods_num;
					return goods;
				});
			});
	}
	
	findByGoodsSn(goodsSn) {
		return this.redisGoodsModel.getByGoodsSn(goodsSn)
			.then(redisResult => {
				if (redisResult) return redisResult;
				return this.mysqlGoodsModel.findByGoodsSn(goodsSn)
					.then(mysqlResult => {
						if (!mysqlResult) return null;
						// 异步写回 redis
						this.redisGoodsModel.save(mysqlResult)
							.catch(err => this.log.error('goodsService-findByGoodsSn:redis写回失败', err));
						return mysqlResult;
					});
			})
			.then(goods => {
				if (!goods) return goods;
				return this.getRedisGoodsNum(goods.goods_sn).then(res => {
					if (!res.sell_num || !res.goods_num) return goods;
					let {sell_num, goods_num} = res;
					if (sell_num) goods.sell_num = sell_num;
					if (goods_num) goods.goods_num = goods_num;
					return goods;
				});
			});
	}
	
	//only redis ---> sell_num and goods_num
	updateRedisGoodsNum(goods_sn, count) {
		return this.redisGoodsModel.updateRedisGoodsNum(goods_sn, -1 * count)
			.then(goods_num => {
				if (goods_num == -1 * count) return this.mysqlGoodsModel.findByGoodsSn(goods_sn).then(goods => {
					return {goods: goods && goods.status == 1 ? goods : false};
				});
				else return {goods: false, goods_num: goods_num};
			})
			.then(data => {
				if (!data.goods && !data.goods_num) return false;
				else if (!data.goods && data.goods_num) return this.redisGoodsModel.updateRedisSellNum(goods_sn, count).then(() => {
					return data.goods_num;
				});
				else return Promise.all([
						this.redisGoodsModel.updateRedisGoodsNum(goods_sn, Number(data.goods.goods_num)),
						this.redisGoodsModel.updateRedisSellNum(goods_sn, Number(data.goods.sell_num) + Number(count))
					]).then((num) => {
						return num[0];
					});
			});
	}
	
	getRedisGoodsNum(goods_sn) {
		return this.redisGoodsModel.getRedisGoodsNum(goods_sn).then(goods_num => {
			return this.redisGoodsModel.getRedisSellNum(goods_sn).then(sell_num => {
				return {sell_num, goods_num};
			});
		});
	}
	
	// only redis
	updateRedisGoodsStatistics(sid, report_type, pay_price, minus) {
		return this.redisGoodsModel.updateGoodsStatistics(sid, report_type, pay_price, minus);
	}
	
	updateRedisGoodsBill(sid, goods_sn, date, pay_price, sell_num) {
		return Promise.all([
			this.redisGoodsModel.updateGoodsBillNum(sid, goods_sn, date, sell_num),
			this.redisGoodsModel.updateGoodsBillPrice(sid, goods_sn, date, pay_price)
		]).then(data => {
			if (data[0] == sell_num || Number(data[1]).toFixed(2) == Number(pay_price).toFixed(2)) {
				return this.mysqlGoodsModel.getGoodsBill(sid, goods_sn, this.eutil.dateFormat(this.eutil.dateGetBeforeDay(null, 1), 'yyyyMM'))
					.then(sqlBill => {
						if (!sqlBill) return data;
						else return Promise.all([
							this.redisGoodsModel.updateGoodsBillNum(sid, goods_sn, date, sqlBill.sell_num),
							this.redisGoodsModel.updateGoodsBillPrice(sid, goods_sn, date, sqlBill.total_sell_price)
						]);
					});
			}
		});
	}
	
	getAllGoodsNum() {
		return this.redisGoodsModel.getAllGoodsNum();
	}
	
	getGoodsStatistics(sidArr) {
		return this.redisGoodsModel.getGoodsStatistics(sidArr);
	}
	
	updateGoodsStatistics(sid, report_type, obj) {
		return this.mysqlGoodsModel.updateGoodsStatistics(sid, report_type, obj);
	}
	
	getRedisGoodsBill(date, sidArr) {
		return this.redisGoodsModel.getGoodsBill(date, sidArr);
	}
	
	upsertGoodsBill(goodsbill) {
		return this.mysqlGoodsModel.upsertGoodsBill(goodsbill);
	}
	
	// schedule job sync it up to mysql, only mysql
	updateMysqlGoodsNums(goods_sn, goods_num, sell_num) {
		return this.mysqlGoodsModel.updateGoodsByGoodsSn(goods_sn, goods_num, sell_num);
	}
	
	
}

module.exports = Goods;
