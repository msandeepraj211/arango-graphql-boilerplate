// const { gql } = require('apollo-server');

const usersTypeDef = `
	type User {
		id: ID
		username: String
	}
`;

module.exports = {
	usersTypeDef,
};
