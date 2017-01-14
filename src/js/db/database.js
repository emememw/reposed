const Mongoose = require("mongoose");
Mongoose.Promise = global.Promise;

const Database = module.exports = {};

Database.connection = null;
Database.models = {};

Database.connectAsync = function connectAsync({ connectionString, debug, dbOptions }) {
	return new Promise((resolve) => {
		if (connectionString) {
			if (debug) {
				Mongoose.set("debug", true);
			}
			Mongoose.connect(connectionString, dbOptions);
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

Database.validateObjectId = function validateObjectId(id) {
	return id && Mongoose.Types.ObjectId.isValid(id);
};
