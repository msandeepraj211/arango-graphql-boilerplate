const UsersResolver = require('./users');

module.exports = {
	Query: Object.assign({}, UsersResolver.rootQueryResolver),
	Mutation: Object.assign({}, UsersResolver.mutationResolver),
	...UsersResolver.otherResolvers,
};
