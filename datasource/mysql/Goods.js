'use strict';

const eutil = require('eutil');
const util = require('../../util');

class goodsModel {
  constructor(wclient,rclient) {
    this.wclient=wclient;
    this.rclient=rclient;
    this.goodsTable = 'goods';
    this.discoverGoodsTable = 'discover_goods';
    this.goodsLimitTable = 'goods_limit';
    this.goodsStatisticsTable = 'goods_statistics';
    this.goodsBillTable = 'goods_bill';
	}
  save (goods, discoverGoodsList) {
    if (!discoverGoodsList) discoverGoodsList = [];
    if (!(discoverGoodsList instanceof Array)) discoverGoodsList = [discoverGoodsList];
    return new Promise((resolve, reject) => {
      this.wclient.transaction(trx => {
        trx(this.goodsTable).insert(goods).then(ids => {
          goods.id = ids[0];
          return Promise.map(discoverGoodsList, discoverGoods => {
            discoverGoods.goodsid = ids[0];
            return this.addDiscoverGoods(discoverGoods, trx);
            // return trx(this.discoverGoodsTable).insert(discoverGoods)
            //   .then(ids => {
            //     discoverGoods.id = ids[0];
            //     return discoverGoods;
            //   });
          });
        })
        .then(resDiscoverGoodsList => {
          trx.commit();
          resolve({goods, discoverGoodsList: resDiscoverGoodsList});
        })
        .catch(err => {
          trx.rollback();
          resolve({err});
        });
      });
    });
  }
  addDiscoverGoods (discoverGoods, trx) {
    let queryBuild = trx || this.wclient;
    return queryBuild(this.discoverGoodsTable).insert(discoverGoods).then(ids => {
      discoverGoods.id = ids[0];
      return discoverGoods;
    });
  }
  remDiscoverGoods ({discover_displayid, sid, goods_sn}, trx) {
    let queryBuild = trx || this.wclient;
    return queryBuild(this.discoverGoodsTable).where({discover_displayid, sid, goods_sn}).del();
  }
  /**
   * @param {Number} [updateAttributes.goodsid]
   * @param {String} [updateAttributes.goods_sn]
   */
  updateDiscoverGoods (updateAttributes, discoverGoodsIndex) {
    return this.wclient(this.discoverGoodsTable).where(discoverGoodsIndex).update(updateAttributes);
  }
  /**
   * 修改商品的排序分值
   * @param {Array} [{goodsid, score}, {}]
   */
  updateGoodsScores (discover_displayid, sid, goodsSnAndScoreList) {
    return this.wclient.transaction(trx => {
      return Promise.map(goodsSnAndScoreList, goodsSnAndScore => trx(this.discoverGoodsTable)
        .where({discover_displayid, sid, goods_sn: goodsSnAndScore.goods_sn})
        .update({score: goodsSnAndScore.score})
      );
    });
  }
  listDiscoversByGoodsId (goodsid) {
    return this.rclient(this.discoverGoodsTable).select().where({goodsid});
  }
  delById (goodsid) {
    return new Promise((resolve, reject) => {
      this.wclient.transaction(trx => {
        trx(this.goodsTable).where({id: goodsid}).update({status: -1})
          .then(res => {
            return trx(this.discoverGoodsTable).where({goodsid}).del();
          }).then(res => {
            trx.commit();
            resolve(res);
          }).catch(err => {
            trx.rollback();
            reject(err);
          });
      });
    });
  }
  updateById (updateGoodsAttributes, id) {
    return this.wclient(this.goodsTable).where({id}).update(updateGoodsAttributes);
  }
  findById (id) {
    return this.rclient('goods').select().where({id}).limit(1)
      .then(result => {
        if (result && result.length === 1) return result[0];
        else return null;
      });
  }
  findByGoodsSn (goodsSn) {
    return this.rclient(this.goodsTable).select().where({goods_sn: goodsSn}).limit(1)
      .then(result => {
        if (result && result.length === 1) return result[0];
        else return null;
      });
  }
  listByDiscoverId (discoverId, sid, limit, skip) {
    let discoverGoodsQuery = this.rclient(this.discoverGoodsTable).select()
      .where({discover_displayid: discoverId, sid}).orderBy('score', 'desc');
    if (limit) discoverGoodsQuery = discoverGoodsQuery.limit(limit);
    if (skip) discoverGoodsQuery = discoverGoodsQuery.skip(skip);
    return discoverGoodsQuery
      .then(discoverGoodsList => {
        if (!discoverGoodsList || !discoverGoodsList[0]) return [];
        return Promise.map(discoverGoodsList, discoverGoods => {
          return this.rclient(this.goodsTable).select().where({id: discoverGoods.goodsid}).limit(1)
            // .then(goods => Object.assign({}, discoverGoods, {goods: goods[0]}));
            .then(goodsList => ({goods: goodsList[0], discoverGoods}));
        }).then(resList => resList.filter(item => item && item.goods));
      });
  }
  find ({fields, where, order, limit, skip}) {
    let query = this.rclient('goods').select();
    if (fields) query = query.column(fields);
    if (where) query = query.where(where);
    if (order) query = query.orderByRaw(order);
    if (limit) query = query.limit(limit);
    if (skip) query = query.offset(skip);
    return query;
  }
  
  updateGoodsCount (goods_sn, count, trx) {
    let mtime = eutil.getTimeSeconds();
    return trx.raw('update ?? set sell_num = sell_num + ?, goods_num = goods_num - ?, mtime = ? where goods_sn = ? and goods_num >= ? limit 1', [this.goodsTable, count, count, mtime, goods_sn, count]);
  }
  
  createGoodsLimit (goods) {
    return this.wclient(this.goodsLimitTable).insert(goods);
  }
  
  getGoodsLimitCount (sid, uid, goods_sn) {
    return this.rclient(this.goodsLimitTable).select().where({sid: sid, uid: uid, goods_sn: goods_sn}).limit(1).then(gds => {
      if(gds && gds.length) return gds[0].goods_count.toString();
      else return 0;
    });
  }
  
  updateGoodsByGoodsSn (goods_sn, goods_num, sell_num) {
    let mtime = eutil.getTimeSeconds();
    return this.wclient(this.goodsTable).update({goods_num, sell_num, mtime}).where({goods_sn: goods_sn});
  }
  
  updateGoodsLimit (sid, uid, goods_sn, updateCount, trx) {
    let mtime = eutil.getTimeSeconds();
    if(trx) return trx.raw('insert into ?? set sid = ?, uid = ? ,goods_sn = ?, goods_count = ? on duplicate key update goods_count = goods_count + ?, mtime = ?', [this.goodsLimitTable, sid, uid, goods_sn, updateCount, updateCount, mtime]);
    else return this.wclient.raw('insert into ?? set sid = ?, uid = ? ,goods_sn = ?, goods_count = ? on duplicate key update goods_count = goods_count + ?, mtime = ?', [this.goodsLimitTable, sid, uid, goods_sn, updateCount, updateCount, mtime]);
  }
  
  updateGoodsStatistics (sid, report_type, obj) {
    obj.mtime = eutil.getTimeSeconds();
    return this.wclient(this.goodsStatisticsTable).update(obj).where({sid: sid, report_type: report_type}).limit(1);
    // return this.wclient.raw('update ?? set sell_num = sell_num + ?, total_sell_price = total_sell_price + ?, mtime = ? where sid = ? and report_type = ? limit 1', [this.goodsStatisticsTable, obj.sell_num, obj.sell_price, eutil.getTimeSeconds(), sid, report_type]);
    // return this.wclient(this.goodsStatisticsTable).increment('sell_num', obj.sell_num).increment('sell_price', obj.sell_price).update({mtime: eutil.getTimeSeconds()}).where(where).limit(1);
  }
  
  upsertGoodsBill (goodsbill) {
    return this.wclient.raw('insert into ?? set sid = ?, report_type = ? ,goods_sn = ?, is_digital = ?, goods_id = ?, goods_name = ?, goods_price = ?, total_sell_price = ?, sell_num = ?, y_month = ?, ctime = ?, mtime = ? on duplicate key update total_sell_price = ?, sell_num = ?, mtime = ?', [this.goodsBillTable, goodsbill.sid, goodsbill.report_type, goodsbill.goods_sn, goodsbill.is_digital, goodsbill.goods_id, goodsbill.goods_name, goodsbill.goods_price, goodsbill.total_sell_price, goodsbill.sell_num, goodsbill.y_month, goodsbill.ctime, goodsbill.mtime, goodsbill.total_sell_price, goodsbill.sell_num, goodsbill.mtime]);
  }
  
  getGoodsBill (sid, goods_sn, y_month) {
    return this.wclient(this.goodsBillTable).select().where({sid, goods_sn, y_month}).orderBy('mtime', 'desc').limit(1).then(bill => {
      if(bill && bill.length) return bill[0];
      else return null;
    });
  }
  
}

module.exports = goodsModel;
