'use strict';

const eutil = require("eutil");

function discoverDisplay (params) {
  // this.id = params.id;
  this.sid = params.sid || 1;// || 1,// 默认郑爽的等级
  this.name = params.name;
  this.remark = params.remark;
  this.isdel = params.isdel || 0;// 0,
  this.discoverid = params.discoverid;// 1,
  this.score = params.score;// 0,
  this.ctime = params.ctime || eutil.getTimeSeconds();
  this.mtime = params.mtime || eutil.getTimeSeconds();
}
function discoverDisplayResFilter (params) {
  this.id = params.id;
  this.sid = params.sid;// || 1,// 默认郑爽的等级
  this.name = params.name;
  // this.remark = params.remark;
  this.isdel = params.isdel || 0;// 0,
  this.discoverid = params.discoverid;// 1,
  this.score = params.score;// 0,
  this.ctime = params.ctime;
  this.mtime = params.mtime;
}
function updateDisplayAttributes(params) {
  if (eutil.haveOwnproperty(params, 'name')) this.name = params.name;
  if (eutil.haveOwnproperty(params, 'remark')) this.remark = params.remark;
  //if (eutil.haveOwnproperty(params, 'isdel')) this.isdel = params.isdel;
  //if (eutil.haveOwnproperty(params, 'discoverid')) this.discoverid = params.discoverid;
  //if (eutil.haveOwnproperty(params, 'score')) this.score = params.score;
  this.mtime = params.mtime || eutil.getTimeSeconds();
}

module.exports = {
  discoverDisplay,
  discoverDisplayResFilter,
  updateDisplayAttributes
};