const otherResolvers = {
	User: {
		id: ({ _key }) => {
			return _key;
		},
	},
};

const rootQueryResolver = {
	users: (_, __, { dataSources }) => {
		return dataSources.Users.getUsers();
	},
	user: (_, { userId }, { dataSources }) => {
		return dataSources.Users.userById(userId);
	},
};

module.exports = {
	rootQueryResolver,
	otherResolvers,
};
