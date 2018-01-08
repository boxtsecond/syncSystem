'use strict';
module.exports = {
	"mysql": {
		"master": {
			"host": "172.19.247.84",
			"port": 9696,
			"user": "root",
			"password": "YONCTKlxYYnOEY",
			"database": "xgqoms"
		},
		"salve": {
			"host": "172.19.247.84",
			"port": 9696,
			"user": "root",
			"password": "YONCTKlxYYnOEY",
			"database": "xgqoms"
		}
	},
	"redis": {
		"enableProxy": true,
		"proxy": {
			"master": {
				"port": 19000,
				"host": "172.19.247.82",
				"password": '9HS3xgUBuv7sAa'
			},
			"salve": {
				"port": 19001,
				"options": {},
				"host": "172.19.247.82",
				"password": '9HS3xgUBuv7sAa'
			}
		},
		"master": {
			sentinels: [
				{
					host: '172.19.247.82',
					port: '26379'
				}, {
					host: '172.19.247.80',
					port: '26379'
				}, {
					host: '172.19.247.81',
					port: '26379'
				}
			],
			name: "mymaster",
			password: '9HS3xgUBuv7sAa'
		},
		"salve": {
			"port": 7379,
			"host": "127.0.0.1",
			"options": {},
			sentinels: [
				{
					host: '172.19.247.82',
					port: '26379'
				}, {
					host: '172.19.247.80',
					port: '26379'
				}, {
					host: '172.19.247.81',
					port: '26379'
				}
			],
			name: "mymaster",
			password: '9HS3xgUBuv7sAa'
		}
	},
	"digitalRedisNum": 500,
	"kue": {
		"use": true,
		"process": true,
		"maximum": 5,
		"updateUseTrx": true
	},
	"schedule": {
		"goodsRule": "10 * * * * *",
		"jobList": [
			{
				service: 'ScheduleService',
				func: 'start',
				argu: []
			}
		]
	},
	"sid": [1]
};
