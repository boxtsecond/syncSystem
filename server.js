/**
 * Created by Bo on 2018/1/8.
 */
const botservices = require('./services');
const util = botservices.get("util");
const jobList = util.config.schedule.jobList;
global.Promise = require("bluebird");

function start() {
	console.log('Sync System Started ......');
	return Promise.resolve()
		.then(() => {
			if(util.eutil.isArray(jobList) && jobList.length) {
				console.log('Check JobList Success');
				return Promise.each(jobList, job => {
					let Service = botservices.get(job.service);
					let jobFunc = Service[job.func].bind(Service);
					if (!(jobFunc instanceof Function)) return Promise.reject('Execute job Function is not find');
					return jobFunc(job.argu);
				});
			}else return Promise.reject('JobList is not correct');
		})
		.catch(err => {
			console.error(err);
			console.error('Sync System Stoped ......')
		})
}

start();