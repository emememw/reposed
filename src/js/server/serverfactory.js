const Restify = require("restify");
const Server = require("server/server");
const Path = require("path");
const ModelControllerFactory = require("server/modelcontrollerfactory");
const Authentication = require("authentication/authentication");

const ServerFactory = module.exports = {};

ServerFactory.createServerAsync = function createServerAsync(givenOptions = {}) {
	return new Promise((resolve, reject) => {
		const options = this.ensureDefaultOptions(givenOptions);
		if (typeof givenOptions.passportStrategy === "string") {
			Authentication.passportStrategy = [givenOptions.passportStrategy];
		} else {
			Authentication.passportStrategy = givenOptions.passportStrategy;
		}
		const restifyServer = Restify.createServer(options);
		if (givenOptions.beforeInit) {
			givenOptions.beforeInit(restifyServer);
		}
		this.registerPlugins(restifyServer);
		Server.createAsync(options)
		.then((reposedServer) => {
			const server = Object.assign(restifyServer, reposedServer);
			server.listen(options.port);
			if (givenOptions.dbUri) {
				this.bindModelControllers(server, options.routePrefix);
			}
			this.bindControllers(server, options.routePrefix);
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

ServerFactory.bindControllers = function bindControllers(server, routePrefix = "") {
	server.controllers.forEach((controller) => {
		server[controller.method]({
			name: controller.name,
			path: `${routePrefix}/${controller.path}`,
			version: controller.version,
		}, Authentication.createAuthenticationHandler(controller.loginRequired), controller.handler);
	});
};

ServerFactory.bindModelControllers = function bindModelControllers(server, routePrefix) {
	server.modelFiles.forEach((model) => {
		ModelControllerFactory.createControllers(model, server, routePrefix);
	});
};
