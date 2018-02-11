/**
 * Created by Bo on 2018/1/8.
 */

'use strict';
const Register = require('file-register');
const path = require('path');
const Model = require('./lib/Model');
const services = new Register().register(path.join(__dirname,"services"));
const datasource = require('./datasource');
const util = require('./util');

// const kue =datasource.get('kue');

const _schedule = require('./lib/schedule/schedule');
// const schedule = new _schedule({kue, util});
const schedule = new _schedule();

var obj = new Model();
obj.set("util",util);
// obj.set("kue", kue);
obj.set("schedule", schedule);
// obj.set("TokenService",new services.Token(datasource));

// obj.set("DiscoverService",new services.Discover(datasource, util));
obj.set("GoodsService",new services.Goods(datasource, util));
// obj.set("DigitalService",new services.Digital(datasource, util));

obj.set("WalletService",new services.Wallet(datasource, util));
// obj.set("UserExpService",new services.UserExp(datasource, util));
obj.set("ChargeService",new services.Charge(datasource, util));
obj.set("ScheduleService",new services.ScheduleJob(datasource, util, {GoodsService: obj.get('GoodsService'),ChargeService: obj.get('ChargeService'), schedule: obj.get('schedule')}));
// obj.set("PaymentService",new services.Payment(datasource, util));
// obj.set("OrderService",new services.Orders(datasource, util, {ChargeService: obj.get('ChargeService'), GoodsService: obj.get('GoodsService'), WalletService: obj.get('WalletService'), DigitalService: obj.get('DigitalService'),UserExpService: obj.get('UserExpService'), kue: obj.get('kue')}));
// obj.set("ScheduleService",new services.ScheduleJob(datasource, util, {GoodsService: obj.get('GoodsService'),ChargeService: obj.get('ChargeService'), DigitalService: obj.get('DigitalService'),  kue: obj.get('kue'), schedule: obj.get('schedule')}));
//
// obj.set("CheckInfoService",new services.CheckInfo(datasource, util, {OrderService: obj.get('OrderService'), kue: obj.get('kue')}));
// obj.set("StatusService", new services.Status(util));
module.exports=obj;
