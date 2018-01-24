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
				"port": 19000,
				"host": "172.19.247.64",
				"password": 'hzOU0siFJOUSR6'
			},
			"salve": {
				"port": 19000,
				"options": {},
				"host": "172.19.247.64",
				"password": 'hzOU0siFJOUSR6'
			}
		},
		"master": {
			sentinels: [
				{
					host: '172.19.247.64',
					port: '16381'
				}, {
					host: '172.19.247.64',
					port: '16382'
				}, {
					host: '172.19.247.64',
					port: '16383'
				}
			],
			name: "mymaster",
			password: 'hzOU0siFJOUSR6'
		},
		"salve": {
			"port": 7379,
			"host": "127.0.0.1",
			"options": {},
			sentinels: [
				{
					host: '172.19.247.64',
					port: '16381'
				}, {
					host: '172.19.247.64',
					port: '16382'
				}, {
					host: '172.19.247.64',
					port: '16383'
				}
			],
			name: "mymaster",
			password: 'hzOU0siFJOUSR6'
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
		"goodsRule": "10 * * * * *",
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
