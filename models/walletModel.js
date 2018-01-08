/**
 * Created by Bo on 2017/11/13.
 */

'use strict';

const eutil = require("eutil");

function Wallet (data) {
  this.sid = data.sid || '-1';
  this.uid = data._uid || data.uid;
  this.type = data.type || 1;
  this.balance = data.balance || 0;
  this.amount = data.amount || 0.00;
  this.note = data.note || '';
  this.sign = data.sign || '';
  this.credential = data.credential || '';
  this.bankcard_id = data.bankcard_id || -1;
  this.status = data.status || 1;
  this.ctime = data.ctime || eutil.getTimeSeconds();
  this.mtime = data.mtime || eutil.getTimeSeconds();
}

function GetWalletParams (data) {
  // if(data._uid) this.uid = data._uid;
  // if(data.type) this.type = data.type;
  if(data.balance) this.balance = data.balance;
  if(data.amount) this.amount = data.amount;
  if(data.note) this.note = data.note;
  if(data.bankcard_id) this.bankcard_id = data.bankcard_id;
  if(data.status) this.status = data.status;
  // if(data.ctime) this.ctime = data.ctime || eutil.getTimeSeconds();
  // if(data.mtime) this.mtime = data.mtime || eutil.getTimeSeconds();
}

function WalletResFilter(data) {
  // this.uid = data.uid;
  this.type = data.type;
  this.balance = data.balance;
  this.amount = data.amount;
  this.note = data.note;
  this.sign = data.sign;
  // this.ctime = data.ctime;
  // this.mtime = data.mtime;
}


module.exports = {
  Wallet,
  GetWalletParams,
  WalletResFilter
};
