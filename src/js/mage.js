require("app-module-path").addPath(__dirname);
const ServerFactory = require("server/serverfactory");
const Database = require("db/database");

const Mage = module.exports = {};

Mage.server = null;

Mage.createServer = function createServer({ projectPath, database, port }) {
	return new Promise((resolve, reject) => {
		ServerFactory.createServerAsync({ projectPath, database, port })
		.then((server) => {
			this.server = server;
			resolve(this.server);
		})
		.catch((error) => {
			console.log(error);
			reject(error);
		});
	});
};

Mage.model = function model(modelName) {
	return Database.models[modelName];
};

