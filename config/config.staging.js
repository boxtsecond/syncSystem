'use strict';
module.exports = {
	"mysql": {
		"master": {
			"host": "172.19.247.63",
			"port": 9696,
			"user": "root",
			"password": "123456",
			"database": "xgqoms"
		},
		"salve": {
			"host": "172.19.247.63",
			"port": 9696,
			"user": "root",
			"password": "123456",
			"database": "xgqoms"
		}
	},
	"redis": {
		"enableProxy": true,
		"proxy": {
			"master": {
				"port": 6379,
				"host": "172.19.247.64",
				"password": 'qn9G7of4lievPr'
			},
			"salve": {
				"port": 6379,
				"options": {},
				"host": "172.19.247.64",
				"password": 'qn9G7of4lievPr'
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
		"maximum": 50,
		"updateUseTrx": true
	},
	"schedule": {
		"goodsRule": "30 * * * * *",
		"deleteRedisKeyRule": "0 0 4 * * *",
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
