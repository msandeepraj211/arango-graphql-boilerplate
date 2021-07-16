const arango = require('arangojs');

module.exports = function (url, dbName, username, password) {
	const db = arango({
		url,
	});
	db.useDatabase(dbName);
	db.useBasicAuth(username, password);
	return db;
};
