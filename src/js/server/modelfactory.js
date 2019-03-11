const Mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate");

const ModelFactory = module.exports = {};

ModelFactory.createModel = function createModel(modelFile) {
	return this.createMongooseModel(modelFile.name, this.createMongooseSchema(modelFile));
};

ModelFactory.createMongooseSchema = function createMongooseSchema(modelFile) {
	const schema = new Mongoose.Schema(modelFile.schema, { usePushEach: true });
	schema.plugin(uniqueValidator);
	schema.plugin(mongoosePaginate);
	if (modelFile.hooks) {
		modelFile.hooks(schema);
	}
	if (modelFile.methods) {
		Object.keys(modelFile.methods).forEach((method) => {
			schema.methods[method] = modelFile.methods[method];
		});
	}
	return schema;
};

ModelFactory.createMongooseModel = function createMongooseModel(modelName, mongooseSchema) {
	return Mongoose.model(modelName, mongooseSchema);
};
