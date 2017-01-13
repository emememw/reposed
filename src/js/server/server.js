const ControllerDiscoverer = require("server/controllerdiscoverer");
const ModelDiscoverer = require("server/modeldiscoverer");
const ModelFactory = require("server/modelfactory");
const Database = require("db/database");

const Server = module.exports = {};

Server.projectPath = null;
Server.controllers = [];
Server.modelFiles = [];

Server.createAsync = function createAsync(options = {}) {
	return new Promise((resolve, reject) => {
		this.projectPath = options.projectPath;
		Database.connectAsync({ connectionString: options.database })
		.then(() => this.registerControllersAsync())
		.then(() => this.registerModelsAsync())
		.then(() => resolve(this))
		.catch(error => reject(error));
	});
};

Server.registerControllersAsync = function registerControllersAsync() {
	return new Promise((resolve, reject) => {
		ControllerDiscoverer.findControllersAsync(this.projectPath)
			.then((controllers) => {
				this.controllers = controllers;
				resolve(controllers);
			})
			.catch(error => reject(error));
	});
};

Server.registerModelsAsync = function registerModelsAsync() {
	return new Promise((resolve, reject) => {
		ModelDiscoverer.findModelsAsync(this.projectPath)
			.then((modelFiles) => {
				this.modelFiles = modelFiles;
				modelFiles.forEach((modelFile) => {
					const mongooseModel = ModelFactory.createModel(modelFile);
					Database.addModel(modelFile.name, mongooseModel);
				});
				resolve();
			})
			.catch(error => reject(error));
	});
};

