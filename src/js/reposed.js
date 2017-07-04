require("app-module-path").addPath(__dirname);
const ServerFactory = require("server/serverfactory");
const Database = require("db/database");

const Reposed = module.exports = {};

Reposed.server = null;

Reposed.createServer = function createServer({
	projectPath,
	port,
	dbUri,
	dbOptions,
	debugDatabase,
	beforeInit,
	passportStrategy,
	routePrefix,
}) {
	return new Promise((resolve, reject) => {
		ServerFactory.createServerAsync({
			projectPath,
			port,
			dbUri,
			dbOptions,
			debugDatabase,
			beforeInit,
			passportStrategy,
			routePrefix,
		})
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

Reposed.model = function model(modelName) {
	return Database.models[modelName];
};

