const { usersTypeDef } = require('./users');

const Query = `
	type Query {
		users: [User]
		user(userId: ID!): User
	}
`;

module.exports = [Query, usersTypeDef];
