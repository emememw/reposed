const ResourceDiscoverer = require("server/resourcediscoverer");

const ControllerDiscoverer = module.exports = {};

ControllerDiscoverer.findControllersAsync = function findControllersAsync(lookupPath) {
	return new Promise((resolve, reject) => {
		ResourceDiscoverer.findResourcesAsync(lookupPath, file => this.checkIfControllerFile(file), controllerFile => this.controllerHandler(controllerFile))
		.then(controllers => resolve(controllers))
		.catch(error => reject(error));
	});
};

ControllerDiscoverer.controllerHandler = function controllerHandler(controllerFile) {
	// TODO validate
	const controller = require(controllerFile); //eslint-disable-line
	controller.method = controller.method ? controller.method.toLowerCase() : "get";
	console.log(`Registered controller: ${controllerFile} => [${controller.method.toUpperCase()}] ${controller.path}`);
	return controller;
};

ControllerDiscoverer.checkIfControllerFile = function checkIfControllerFile(file) {
	return file.match(/^.+\.controller\.js$/g);
};
