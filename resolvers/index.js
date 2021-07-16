const UsersResolver = require('./users');

module.exports = {
	Query: Object.assign({}, UsersResolver.rootQueryResolver),
	...UsersResolver.otherResolvers,
};
