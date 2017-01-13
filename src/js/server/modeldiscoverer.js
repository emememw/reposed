const ResourceDiscoverer = require("server/resourcediscoverer");

const ModelDiscoverer = module.exports = {};

ModelDiscoverer.findModelsAsync = function findModelsAsync(lookupPath) {
	return new Promise((resolve, reject) => {
		ResourceDiscoverer.findResourcesAsync(lookupPath, file => this.checkIfModelFile(file), modelFile => this.modelHandler(modelFile))
		.then(modelFiles => resolve(modelFiles))
		.catch(error => reject(error));
	});
};

ModelDiscoverer.modelHandler = function modelHandler(modelFile) {
	// TODO validate
	const model = require(modelFile); //eslint-disable-line
	console.log(`Registered model: ${modelFile}`);
	return model;
};

ModelDiscoverer.checkIfModelFile = function checkIfModelFile(file) {
	return file.match(/^.+\.model\.js$/g);
};
