/**
 * Created by Bo on 2018/1/8.
 */

'use strict';
var appConfig = require("./config/config.development");
const eutil = require("eutil");
const env = process.env.NODE_ENV;
if(env=="development")  appConfig = require("./config/config.development");
if(env=="production")  appConfig = require("./config/config.production");
if(env=="staging")  appConfig = require("./config/config.staging");

module.exports = {
	config: appConfig,
	eutil: eutil
}
