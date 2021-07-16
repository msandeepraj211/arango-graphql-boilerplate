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

const mutationResolver = {
	user: async (_, { username }, { dataSources }) => {
		const user = await dataSources.Users.addUser({ username });
		return user;
	},
};

module.exports = {
	rootQueryResolver,
	otherResolvers,
	mutationResolver,
};
