const Mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const ModelFactory = module.exports = {};

ModelFactory.createModel = function createModel(modelFile) {
	return this.createMongooseModel(modelFile.name, this.createMongooseSchema(modelFile));
};

ModelFactory.createMongooseSchema = function createMongooseSchema(modelFile) {
	const schema = new Mongoose.Schema(modelFile.schema);
	schema.plugin(uniqueValidator);
	if (modelFile.hooks) {
		modelFile.hooks(schema);
	}
	return schema;
};

ModelFactory.createMongooseModel = function createMongooseModel(modelName, mongooseSchema) {
	return Mongoose.model(modelName, mongooseSchema);
};
