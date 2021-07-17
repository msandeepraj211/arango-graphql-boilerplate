const bunyan = require('bunyan');
const logger = bunyan.createLogger({
	name: 'logger',
	serializers: bunyan.stdSerializers,
	level: process.env.NODE_ENV == 'production' ? 40 : 10,
});

module.exports = logger;
