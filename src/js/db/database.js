const Mongoose = require("mongoose");

const Database = module.exports = {};

Database.connection = null;
Database.models = {};

Database.connectAsync = function connectAsync({ connectionString }) {
	return new Promise((resolve) => {
		if (connectionString) {
			Mongoose.connect(connectionString);
			this.connection = Mongoose.connection;
			this.connection.on("error", console.error.bind(console, "connection error:"));
			this.connection.once("open", () => resolve());
		} else {
			resolve();
		}
	});
};

Database.addModel = function addModel(modelName, model) {
	this.models[modelName] = model;
};
