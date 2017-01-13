const FileUtils = require("utils/fileutils");
const path = require("path");

const ResourceDiscoverer = module.exports = {};

ResourceDiscoverer.findResourcesAsync = function findResourcesAsync(lookupPath, filePathMatcher, resourceHandler) {
	return new Promise((resolve, reject) => {
		this.findResourceFilesAsync(lookupPath, filePathMatcher, resourceHandler)
		.then(resources => resolve(resources))
		.catch(error => reject(error));
	});
};

ResourceDiscoverer.findResourceFilesAsync = function findResourceFilesAsync(rootDir, filePathMatcher, resourceHandler) {
	return new Promise((resolve, reject) => {
		FileUtils.findFilesAsync(rootDir, file => path.basename(file) !== "node_modules")
		.then((files) => {
			const resources = [];
			files.forEach((file) => {
				const resource = this.handlePossibleResourceFile(file, filePathMatcher, resourceHandler);
				if (resource) {
					resources.push(resource);
				}
			});
			resolve(resources);
		})
		.catch(error => reject(error));
	});
};

ResourceDiscoverer.handlePossibleResourceFile = function handlePossibleResourceFile(file, filePathMatcher, resourceHandler) {
	let result = null;
	if (filePathMatcher(file.path)) {
		result = resourceHandler(file.path);
	}
	return result;
};

