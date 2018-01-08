/**
 * Created by Bo on 2017/12/8.
 */


'use strict';

const schedule = require('node-schedule');
const eutil = require('eutil');

class Schedule{
  constructor(obj){
    this.scheduleObj = {};
    this.kueJob = (obj && obj.kue) || '';
    // this.util = obj.util;
  }
  
  //second,minute,hour,date,month,year,dayOfWeek
  createKue (data) {
    let _self = this;
    if(eutil.isObject(data.rule)) {
      let scheduleRule = new schedule.RecurrenceRule();
      data.rule = _self.ruleModel(data.rule, scheduleRule);
    }
    var j = schedule.scheduleJob(data.rule, function(){
      console.log(`It's time to do ${data.title} job`);
      return _self.kueJob.create(data.title, {id: data.id}, data.priority);
    });
    // _self.scheduleObj[data.id] = j;
  }
  
  cancel (id) {
    return this.scheduleObj[id] && this.scheduleObj[id].cancel();
  }
  
  create (data) {
    let _self = this;
    if(eutil.isObject(data.rule)) {
      let scheduleRule = new schedule.RecurrenceRule();
      data.rule = _self.ruleModel(data.rule, scheduleRule);
    }
    var j = schedule.scheduleJob(data.rule, function(){
      console.log(`It's time to do ${data.title} job`);
      data.func();
    });
    // _self.scheduleObj[data.id] = j;
  }
  
  ruleModel (rule, scheduleRule) {
    if(rule.second) scheduleRule.second = rule.second;
    if(rule.minute) scheduleRule.minute = rule.minute;
    if(rule.hour) scheduleRule.hour = rule.hour;
    if(rule.date) scheduleRule.date = rule.date;
    if(rule.month) scheduleRule.month = rule.month;
    if(rule.year) scheduleRule.year = rule.year;
    if(rule.dayOfWeek) scheduleRule.dayOfWeek = rule.dayOfWeek;
    return scheduleRule;
  }
  
}

module.exports=Schedule;
