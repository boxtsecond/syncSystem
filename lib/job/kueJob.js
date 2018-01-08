'use strict';

const kue = require('kue');
const Redis = require('ioredis');

class kueJob {
	constructor(opt) {
		opt = opt || {};
		this.debug = opt.debug || false;
		this.retry = opt.retry || 3;
		this.ttl = opt.ttl || 1000 * 60 * 60;
		this.enableUI = opt.enableUI || false;
		this.UI_port = opt.UI_port || 3000;
		this.active_delay = opt.active_delay || 5000;
		this.jobs = kue.createQueue({
			prefix: opt.prefix || 'omsq',
			jobEvents: opt.jobEvents || false,
			redis: {
				createClientFactory: function () {
					if (!opt.redis_sentinels) {
						return opt.redisclient || new Redis({
							port: opt.redis_port || 7379,          // Redis port
							host: opt.redis_host || "10.40.253.187",   // Redis host
							family: opt.redis_family || 4,           // 4 (IPv4) or 6 (IPv6)
							password: opt.redis_password || "",
							db: opt.redis_db || 14
						});
						
					} else {
						return opt.redisclient || new Redis({
							sentinels: opt.redis_sentinels,
							name: opt.redis_name,
							// port: opt.redis_port ||7379,          // Redis port
							host: opt.redis_host || "10.40.253.187",   // Redis host
							family: opt.redis_family || 4,           // 4 (IPv4) or 6 (IPv6)
							password: opt.redis_password || "12345678",
							db: opt.redis_db || 14
						});
					}
				}
			}
		});
		if (this.debug) {
			this.jobs.on('job enqueue', function (id, type) {
				console.log('Job %s got queued of type %s', id, type);
				
			}).on('job complete', function (id, result) {
				kue.Job.get(id, function (err, job) {
					if (err) return;
					job.remove(function (err) {
						if (err) throw err;
						console.log('removed completed job #%d', job.id);
					});
				});
			});
		}
		this.jobs.on('promotion', function (id) {
			console.log('Job %s got promotion', id);
			kue.Job.get(id, function (err, job) {
				// Your application should check if job is a stuck one
				if (job) job.inactive();
			});
		});
		
		this.jobs.on('error', function (err) {
			console.error('oms job... ', err);
		});
		process.once('SIGTERM', function (sig) {
			this.jobs.shutdown(5000, function (err) {
				console.log('Kue shutdown: ', err || '');
				process.exit(0);
			});
		});
		this.RebootPauseTask();
		// this.RebootInactiveTask();
		// this.jobs.watchStuckJobs(5000);
		if (this.enableUI && this.UI_port) {
			kue.app.set('title', 'osmeteor');
			kue.app.listen(this.UI_port);
			console.log(`UI started on port ${this.UI_port}`);
		}
		
		this.RebootfailedTask();
	}
	
	// priority [ low, normal, medium, high, critical]
	create(jobTitle, data, priority) {
		var job = this.jobs.create(jobTitle, data)
			.removeOnComplete(!this.debug)
			.attempts(this.retry).ttl(this.ttl)
			.delay(this.active_delay)
			.priority(priority || 'normal').backoff({delay: 60 * 1000 * 3, type: 'fixed'});
		
		job.on('complete', function () {
			console.log(" Job complete");
		}).on('failed', function () {
			console.log(" Job failed");
		}).on('progress', function (progress) {
			// console.log( '\r  job #' + job.id + ' ' + progress + '% complete' );
			process.stdout.write('\r  job #' + job.id + ' ' + progress + '% complete');
		});
		job.save();
	}
	
	// 延迟执行
	createdelay(jobTitle, data, priority, delay) {
		var job = this.jobs.create(jobTitle, data)
			.removeOnComplete(!this.debug).delay(delay || 0).attempts(this.retry).ttl(this.ttl)
			.priority(priority || 'high');
		job.on('complete', function () {
			console.log(" Job complete");
		}).on('failed', function () {
			console.log(" Job failed");
		}).on('progress', function (progress) {
			// console.log( '\r  job #' + job.id + ' ' + progress + '% complete' );
			process.stdout.write('\r  job #' + job.id + ' ' + progress + '% complete');
		});
		job.save();
	}
	
	// 重启失败的应用
	RebootfailedTask() {
		this.jobs.failed(function (err, ids) {
			// console.log(err,ids);
			ids.forEach(function (id) {
				kue.Job.get(id, function (err, job) {
					// Your application should check if job is a stuck one
					if (job) job.inactive();
				});
			});
		});
		
	}
	
	// 重新启动暂停任务
	RebootPauseTask() {
		this.jobs.active(function (err, ids) {
			ids.forEach(function (id) {
				kue.Job.get(id, function (err, job) {
					// Your application should check if job is a stuck one
					if (job) job.inactive();
				});
			});
		});
	}
	
	RebootInactiveTask() {
		this.jobs.inactive(function (err, ids) {
			ids.forEach(function (id) {
				kue.Job.get(id, function (err, job) {
					// Your application should check if job is a stuck one
					if (job) job.active();
				});
			});
		});
	}
	
	shutdown() {
		this.jobs.shutdown(5000, function (err) {
			console.log('Kue shutdown: ', err || '');
			process.exit(0);
		});
	}
	
	process(jobTitle, maximum, cb) {
		this.jobs.process(jobTitle, maximum || 1, cb);
	}
}

module.exports = kueJob;
