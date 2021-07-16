const { usersTypeDef } = require('./users');

const Query = `
	type Query {
		users: [User]
		user(userId: ID!): User
	}
	type Mutation {
		user(username: String!): User
	}
`;

module.exports = [Query, usersTypeDef];
