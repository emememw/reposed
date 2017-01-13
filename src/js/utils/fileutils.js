const fs = require("fs-extra");

const FileUtils = module.exports = {};

FileUtils.findFilesAsync = function findFilesAsync(rootDir, filter) {
	return new Promise((resolve, reject) => {
		const files = [];
		if (rootDir) {
			fs.walk(rootDir, {
				filter,
			})
			.on("data", file => files.push(file))
			.on("end", () => resolve(files))
			.on("error", error => reject(error));
		} else {
			reject("Error: No rootDir given!");
		}
	});
};
