let log4js = require('log4js');
let logger = exports = module.exports = {};

logger.request = log4js.getLogger('request');
logger.request.level = 'info'