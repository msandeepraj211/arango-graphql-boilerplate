require('dotenv').config();
const http = require('http');
const Redis = require('ioredis');
const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');

const { ApolloServer, AuthenticationError } = require('apollo-server-express');
const { BaseRedisCache } = require('apollo-server-cache-redis');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const UsersDataSource = require('./datasources/users');
const createDB = require('./arangodb/db');
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');
const logger = require('./logger');
const { publish } = require('./events');

// `_G_` is custom pattern is used to signify that it is a global variable and should not be modified.
// Comment the below lines if you want to avoid global logger.
// Attach logger to global variable so it can be used accross the code.
global._G_logger = logger;
// Attach event publisher to global variable so it can be used accross the code.
if (process.env.USE_EVENTS === 'true') {
	global._G_publish = publish;
} else {
	// Attach a mock publisher when events emitting is disabled. This can be used for local development.
	global._G_publish = (namespace, data) => {
		logger.debug(
			{
				namespace,
				data,
			},
			'Tried to publish an event when events are disabled. '
		);
	};
}

function authenticate(token = '') {
	let user;
	try {
		user = jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		throw new AuthenticationError('User needs to be authenticated');
	}
	return user;
}

function errorFormatterAndLogger(err) {
	// Log every error to console in json format. Used to analyse the errors later.
	logger.error(err);

	// TODO: analyse the error and send proper messages. use various error messages availabe in apollo-server-express

	return err;
}

async function start() {
	const app = express();

	app.use(cors());

	// Create a new arangoDB instance. This will be used to create datasources.
	const db = createDB(
		process.env.DB_URL,
		process.env.DB_NAME,
		process.env.DB_USERNAME,
		process.env.DB_PASSWORD
	);

	// Combine TypeDefs and resolvers into schema.
	const schema = makeExecutableSchema({
		typeDefs,
		resolvers,
	});

	/**
	 * Set Cache property. Use Redis Cache depending on env value.
	 */
	let cache = {};
	if (process.env.USE_REDIS_CACHE === 'true') {
		cache = {
			cache: new BaseRedisCache({
				client: new Redis(process.env.REDIS_URL),
			}),
		};
	}

	const apolloServer = new ApolloServer({
		schema,
		...cache,
		dataSources: () => {
			return {
				Users: new UsersDataSource(db, 'users'),
			};
		},
		formatError: errorFormatterAndLogger,
		context: ({ req }) => {
			let context = {};
			if (process.env.USE_AUTH === 'true') {
				const token = req.headers.authorization || '';
				context.user = authenticate(token.replace('Bearer ', ''));
			}

			return context;
		},
	});

	apolloServer.applyMiddleware({ app });

	const httpServer = http.createServer(app);
	apolloServer.installSubscriptionHandlers(httpServer);

	return httpServer.listen({ port: 4000 }, () => {
		console.log('🚀  Server ready at http://localhost:4000/graphql');
	});
}

start().catch((err) => console.log(err));
