const { ArangoDataSource } = require('@msandeepraj211/arango-datasource');

const { aql } = require('arangojs');

class UserDataSource extends ArangoDataSource {
	// Pass the user collection to the DataSource
	constructor(db, collection) {
		super(db);
		this.collection = collection;
	}

	// Build the query and call super.query
	async getUsers() {
		const query = `
      FOR user in @@collection
      return user
    `;
		return await this.query({ query, bindVars: { '@collection': this.collection } });
	}

	async userById(userId) {
		const query = `
			FOR user in @@collection
				FILTER user._key == @userId
			return user
    `;
		const users = await this.query({ query, bindVars: { '@collection': this.collection, userId } });
		return users[0];
	}
}

module.exports = UserDataSource;
