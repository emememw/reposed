const Database = require("db/database");

const ModelControllerFactory = module.exports = {};

ModelControllerFactory.createControllers = function createControllers(model, server) {
	const capitalizedModelName = model.name[0].toUpperCase() + model.name.substring(1, model.name.length);
	this.createFindAllController(model, server, capitalizedModelName);
	this.createFindOneController(model, server, capitalizedModelName);
	this.createCreateController(model, server, capitalizedModelName);
	this.createCreateOrUpdateController(model, server, capitalizedModelName);
	this.createUpdateController(model, server, capitalizedModelName);
	this.createDeleteController(model, server, capitalizedModelName);
};

ModelControllerFactory.createFindAllController = function createFindAllController(model, server, capitalizedModelName) {
	server.get({
		name: `FindAll${capitalizedModelName}Controller`,
		path: `/${model.resource}`,
	}, (req, res, next) => {
		const DbModel = Database.models[model.name];
		DbModel.find({}, (error, result) => {
			if (error) {
				console.log(error);
				res.send(500);
			} else {
				res.send(200, result);
			}
			return next();
		});
	});
};

ModelControllerFactory.createFindOneController = function createFindOneController(model, server, capitalizedModelName) {
	server.get({
		name: `FindOne${capitalizedModelName}Controller`,
		path: `/${model.resource}/:id`,
	}, (req, res, next) => {
		const DbModel = Database.models[model.name];
		DbModel.find({ _id: req.params.id }, (error, result) => {
			if (error) {
				console.log(error);
				res.send(500);
			} else if (!result || result.length === 0) {
				res.send(404);
			} else {
				res.send(200, result[0]);
			}
			return next();
		});
	});
};

ModelControllerFactory.createCreateController = function createCreateController(model, server, capitalizedModelName) {
	server.post({
		name: `Create${capitalizedModelName}Controller`,
		path: `/${model.resource}`,
	}, (req, res, next) => {
		if (!req.body) {
			res.send(409);
			next();
		} else {
			const dataToSave = req.body;
			delete dataToSave._id;
			const DbModel = Database.models[model.name];
			const entry = new DbModel(dataToSave);
			entry.validate((validationError) => {
				if (validationError) {
					res.send(409, validationError.errors);
					next();
				}
				entry.save((error, result) => {
					if (error) {
						console.log(error);
						res.send(500);
					} else {
						res.send(201, result);
					}
					next();
				});
			});
		}
	});
};

ModelControllerFactory.createCreateOrUpdateController = function createCreateOrUpdateController(model, server, capitalizedModelName) {
	// TODO refactor :(
	server.put({
		name: `CreateOrUpdate${capitalizedModelName}Controller`,
		path: `/${model.resource}/:id`,
	}, (req, res, next) => {
		const DbModel = Database.models[model.name];
		if (!req.body || !req.params.id) {
			res.send(409);
			next();
		} else {
			const dataToSave = req.body;
			const idToSave = req.params.id;
			DbModel.find({ _id: req.params.id }, (error, result) => {
				if (error) {
					console.log(error);
					res.send(500);
					next();
				} else {
					const entryToSave = new DbModel(dataToSave);
					entryToSave.validate((validationError) => {
						if (validationError) {
							res.send(409, validationError.errors);
						} else {
							DbModel.findByIdAndUpdate(idToSave, dataToSave, {
								new: true,
								upsert: true,
								setDefaultsOnInsert: true,
							}, (saveError, saveResult) => {
								if (saveError) {
									console.log(saveError);
									res.send(500);
									next();
								} else {
									if (result && result.length > 0) {
										res.send(200, saveResult);
									} else {
										res.send(201, saveResult);
									}
									next();
								}
							});
						}
					});
				}
			});
		}
	});
};

ModelControllerFactory.createUpdateController = function createUpdateController(model, server, capitalizedModelName) {
	server.patch({
		name: `Update${capitalizedModelName}Controller`,
		path: `/${model.resource}/:id`,
	}, (req, res, next) => {
		const DbModel = Database.models[model.name];
		if (!req.body || !req.params.id) {
			res.send(409);
			next();
		} else {
			const dataToSave = req.body;
			delete dataToSave._id;
			const idToSave = req.params.id;
			DbModel.find({ _id: req.params.id }, (error, result) => {
				if (error) {
					console.log(error);
					res.send(500);
					next();
				} else if (!result || result.length === 0) {
					res.send(404);
					next();
				} else {
					DbModel.update({ _id: idToSave }, { $set: dataToSave }, {
						runValidators: true,
						new: true,
					}, (updateError) => {
						if (updateError) {
							res.send(409, updateError);
							next();
						} else {
							DbModel.find({ _id: idToSave }, (updateResultError, updateResult) => {
								if (updateResultError) {
									console.log(updateResultError);
									res.send(500);
								} else {
									res.send(200, updateResult[0]);
								}
								next();
							});
						}
					});
				}
			});
		}
	});
};

ModelControllerFactory.createDeleteController = function createDeleteController(model, server, capitalizedModelName) {
	server.del({
		name: `Delete${capitalizedModelName}Controller`,
		path: `/${model.resource}/:id`,
	}, (req, res, next) => {
		if (!req.params.id) {
			res.send(409);
			next();
		} else {
			const idToDelete = req.params.id;
			const DbModel = Database.models[model.name];
			DbModel.find({ _id: idToDelete }, (error, result) => {
				if (error) {
					console.log(error);
					res.send(500);
					next();
				} else if (!result || result.length === 0) {
					res.send(404);
					next();
				} else {
					DbModel.remove({ _id: idToDelete }, (deleteError) => {
						if (deleteError) {
							console.log(deleteError);
							res.send(500);
						} else {
							res.send(200, result);
						}
						next();
					});
				}
			});
		}
	});
};

