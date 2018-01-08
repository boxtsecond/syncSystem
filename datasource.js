/**
 * Created by Bo on 2018/1/8.
 */

'use strict';
const path = require('path');
const Model = require('./lib/Model');
const Register = require('file-register');
const datasource = new Register().register(path.join(__dirname,"datasource"));
const datasource_cfg = require('./datasource.cfg');
const obj = new Model();

obj.set("config",datasource_cfg.get("config"));
obj.set("redisMaster",datasource_cfg.get("redisMaster"));
obj.set("redisSalve",datasource_cfg.get("redisSalve"));
obj.set("mysqlMaster",datasource_cfg.get("mysqlMaster"));
obj.set("mysqlSalve",datasource_cfg.get("mysqlSalve"));

// obj.set("kue",datasource_cfg.get("kue"));

// 订单
obj.set("redisOrdersModel",new datasource.redis.Orders(datasource_cfg.get("redisOrdersModelMaster"),datasource_cfg.get("redisOrdersModelSalve")));

//经验值和签到
// obj.set("redisCheckInfoModel",new datasource.redis.CheckInfo(datasource_cfg.get("redisUserExpModelMaster"),datasource_cfg.get("redisUserExpModelSalve")));
// obj.set("redisUserExpModel",new datasource.redis.UserExp(datasource_cfg.get("redisUserExpModelMaster"),datasource_cfg.get("redisUserExpModelSalve")));

//钱包
obj.set("redisWalletModel",new datasource.redis.Wallet(datasource_cfg.get("redisWalletModelMaster"),datasource_cfg.get("redisWalletModelSalve")));

//商品
obj.set("redisDiscoverModel",new datasource.redis.Discover(datasource_cfg.get("redisShopProductMaster"),datasource_cfg.get("redisShopProductSalve")));
obj.set("redisGoodsModel",new datasource.redis.Goods(datasource_cfg.get("redisShopProductMaster"),datasource_cfg.get("redisShopProductSalve")));
obj.set("redisDigitalModel",new datasource.redis.Digital(datasource_cfg.get("redisShopProductMaster"),datasource_cfg.get("redisShopProductSalve")));
obj.set("redisChargeModel",new datasource.redis.Charge(datasource_cfg.get("redisShopProductMaster"),datasource_cfg.get("redisShopProductSalve")));

//定时任务
obj.set("redisScheduleModel",new datasource.redis.Schedule(datasource_cfg.get("redisScheduleModelMaster"),datasource_cfg.get("redisScheduleModelSalve")));

// obj.set("mysqlCheckInfoModel",new datasource.mysql.CheckInfo(datasource_cfg.get("mysqlMaster") ,datasource_cfg.get("mysqlSalve")));
// obj.set("mysqlDiscoverModel",new datasource.mysql.Discover(datasource_cfg.get("mysqlMaster") ,datasource_cfg.get("mysqlSalve")));
obj.set("mysqlGoodsModel",new datasource.mysql.Goods(datasource_cfg.get("mysqlMaster") ,datasource_cfg.get("mysqlSalve")));
obj.set("mysqlDigitalModel",new datasource.mysql.Digital(datasource_cfg.get("mysqlMaster") ,datasource_cfg.get("mysqlSalve")));
obj.set("mysqlOrdersModel",new datasource.mysql.Orders(datasource_cfg.get("mysqlMaster") ,datasource_cfg.get("mysqlSalve")));
obj.set("mysqlWalletModel",new datasource.mysql.Wallet(datasource_cfg.get("mysqlMaster") ,datasource_cfg.get("mysqlSalve")));
obj.set("mysqlChargeModel",new datasource.mysql.Charge(datasource_cfg.get("mysqlMaster") ,datasource_cfg.get("mysqlSalve")));
// obj.set("mysqlUserExpModel",new datasource.mysql.UserExp(datasource_cfg.get("mysqlMaster") ,datasource_cfg.get("mysqlSalve")));

module.exports = obj;
