const Mongoose = require("mongoose");

const ModelFactory = module.exports = {};

ModelFactory.createModel = function createModel(modelFile) {
	return this.createMongooseModel(modelFile.name, this.createMongooseSchema(modelFile.schema));
};

ModelFactory.createMongooseSchema = function createMongooseSchema(modelSchema) {
	return new Mongoose.Schema(modelSchema);
};

ModelFactory.createMongooseModel = function createMongooseModel(modelName, mongooseSchema) {
	return Mongoose.model(modelName, mongooseSchema);
};
