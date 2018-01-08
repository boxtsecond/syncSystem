'use strict';
module.exports = {
	"mysql": {
		"master": {
			"host": "10.40.253.187",
			"port": 9696,
			"user": "root",
			"password": "123456",
			"database": "xgqoms"
		},
		"salve": {
			"host": "10.40.253.187",
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
				"host": "10.40.253.187",
				"password": ''
			},
			"salve": {
				"port": 19000,
				"options": {},
				"host": "10.40.253.187",
				"password": ''
			}
		},
		"master": {
			"port": 8379,
			"host": "10.40.253.187",
			"options": {},
			"password": "12345678"
		},
		"salve": {
			"port": 8379,
			"host": "10.40.253.187",
			"options": {},
			"password": "12345678"
		}
	},
	"digitalRedisNum": 500,
	"kue": {
		"use": true,
		"process": true,
		"maximum": 10,
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
