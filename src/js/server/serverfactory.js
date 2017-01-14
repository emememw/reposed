const Restify = require("restify");
const Server = require("server/server");
const Path = require("path");
const ModelControllerFactory = require("server/modelcontrollerfactory");

const ServerFactory = module.exports = {};

ServerFactory.createServerAsync = function createServerAsync(givenOptions = {}) {
	return new Promise((resolve, reject) => {
		const options = this.ensureDefaultOptions(givenOptions);
		const restifyServer = Restify.createServer(options);
		this.registerPlugins(restifyServer);
		Server.createAsync(options)
		.then((mageServer) => {
			const server = Object.assign(restifyServer, mageServer);
			server.listen(options.port);
			if (givenOptions.dbUri) {
				this.bindModelControllers(server);
			}
			this.bindControllers(server);
			resolve(server);
		})
		.catch(error => reject(error));
	});
};

ServerFactory.registerPlugins = function registerPlugins(restifyServer) {
	restifyServer.use(Restify.bodyParser());
	restifyServer.use(Restify.queryParser());
};

ServerFactory.ensureDefaultOptions = function ensureDefaultOptions(givenOptions) {
	const options = givenOptions;
	options.projectPath = givenOptions.projectPath || this.resolveProjectPath();
	options.port = givenOptions.port || 8080;
	return options;
};

ServerFactory.resolveProjectPath = function resolveProjectPath() {
	// TODO there should be a better way to do this ...
	return Path.join(__dirname, "../../../../../");
};

ServerFactory.bindControllers = function bindControllers(server) {
	server.controllers.forEach((controller) => {
		server[controller.method]({
			name: controller.name,
			path: controller.path,
			version: controller.version,
		}, controller.handler);
	});
};

ServerFactory.bindModelControllers = function bindModelControllers(server) {
	server.modelFiles.forEach((model) => {
		if (model.expose !== false) {
			ModelControllerFactory.createControllers(model, server);
		}
	});
};
