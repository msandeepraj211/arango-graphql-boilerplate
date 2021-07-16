require('dotenv').config();
const http = require('http');
const Redis = require('ioredis');
const cors = require('cors');
const express = require('express');

const { ApolloServer } = require('apollo-server-express');
const { BaseRedisCache } = require('apollo-server-cache-redis');

const UsersDataSource = require('./datasources/users');
const createDB = require('./arangodb/db');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const typeDefs = require('./schemas');
const resolvers = require('./resolvers');

async function start() {
	const app = express();

	app.use(cors());

	// Create a new arangoDB instance. This will be used to create datasources.
	const db = createDB(process.env.DB_URL, process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD);

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
	});

	apolloServer.applyMiddleware({ app });

	const httpServer = http.createServer(app);
	apolloServer.installSubscriptionHandlers(httpServer);

	return httpServer.listen({ port: 4000 }, () => {
		console.log('🚀  Server ready at http://localhost:4000/graphql');
	});
}

start().catch((err) => console.log(err));
