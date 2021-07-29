const bunyan = require('bunyan');
const bunyanDebugStream = require('bunyan-debug-stream');

const loggerOptions = {
	name: 'logger',
	serializers: bunyan.stdSerializers,
	level:  40,
}

if(process.env.NODE_ENV !== 'production') {
	loggerOptions.level = 10;
	loggerOptions.streams = [{
		type:   'raw',
		stream: bunyanDebugStream({
				basepath: __dirname, // this should be the root folder of your project.
				forceColor: true
		})
	}];
	loggerOptions.serializers = {...loggerOptions.serializers, ...bunyanDebugStream.serializers}
}

const logger = bunyan.createLogger(loggerOptions);

module.exports = logger;
