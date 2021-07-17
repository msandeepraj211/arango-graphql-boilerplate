const { PubSub } = require('@google-cloud/pubsub');

const pubsub = new PubSub({ projectId: process.env.GOOGLE_PROJECT_ID });

const RETRY_ATTEMPTS = 3;

/**
 * Create a map with module/event-namespace emitted by publisher.
 * App can have any number of eent namespaces. They will be mapped to appropreate topic here.
 * This will be used to bridge any events service used later.
 * Project events can be groupd using event-namespace.
 * They will be mapped with external topics here.
 */
const toppingMapping = {
	users: 'USERS-TEST',
};

/**
 * Validate and sanitse the event that is being emitted.
 * This can be used to strip/modify/validate the data before sending.
 */
const eventDataSanitiser = {
	users: (eventData) => {
		if (!eventData?.username) {
			_G_logger.warn('username invalidate in event', eventData);
		}
		if (!eventData?.action) {
			_G_logger.error('event action is mandatory', eventData);
			return;
		}
		return eventData;
	},
};

/**
 * Internal function that tries to publish the data to gcp.
 * This is used to retry the publish in case it fails.
 */
const _publish = (topic, data, attemptNumber) => {
	data = typeof data === 'object' ? JSON.stringify(data) : data;
	// Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
	const dataBuffer = Buffer.from(data);
	// emit data
	pubsub
		.topic(topic)
		.publish(dataBuffer)
		.then((messageId) => {
			_G_logger.info(`Message ${messageId} published.`);
		})
		.catch((error) => {
			if (attemptNumber === RETRY_ATTEMPTS) {
				_G_logger.error(`Received error while publishing: ${error.message}`, {
					data,
					topic,
				});
			} else {
				setTimeout(() => {
					_publish(topic, data, attemptNumber + 1);
				}, attemptNumber * 1000);
			}
		});
};

//https://github.com/googleapis/nodejs-pubsub/blob/master/samples/publishMessage.js
const publish = (namespace, eventData) => {
	// Event publish to google should not throw error to GraphQL. Hence try catch.
	try {
		if (eventDataSanitiser[namespace]) {
			eventData = eventDataSanitiser[namespace](eventData);
		}
		_publish(toppingMapping[namespace] || namespace, eventData, 1);
	} catch (error) {
		_G_logger.error('Error in event publish to Google', {
			namespace,
			eventData,
		});
	}
};

module.exports = {
	publish,
};
