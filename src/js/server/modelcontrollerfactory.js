const Database = require("db/database");
const ControllerUtils = require("utils/controllerutils");

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
		let query = Database.models[model.name].find({});
		query = this.checkAndPopulateFields(query, req);
		query.then((result) => {
			res.send(200, result);
			next();
		})
		.catch(error => ControllerUtils.handleError(error, res, next));
	});
};

ModelControllerFactory.createFindOneController = function createFindOneController(model, server, capitalizedModelName) {
	server.get({
		name: `FindOne${capitalizedModelName}Controller`,
		path: `/${model.resource}/:id`,
	}, (req, res, next) => {
		if (!Database.validateObjectId(req.params.id)) {
			res.send(409);
			next();
		} else {
			let query = Database.models[model.name].find({ _id: req.params.id });
			query = this.checkAndPopulateFields(query, req);
			query.then((result) => {
				if (!result || result.length === 0) {
					res.send(404);
				} else {
					res.send(200, result[0]);
				}
				next();
			})
			.catch(error => ControllerUtils.handleError(error, res, next));
		}
	});
};

ModelControllerFactory.checkAndPopulateFields = function checkAndPopulateFields(givenQuery, req) {
	let query = givenQuery;
	if (req.params._populate) {
		if (req.params._populate.indexOf(",") !== -1) {
			req.params._populate.split(",").forEach((populateParam) => {
				query = query.populate(populateParam);
			});
		} else {
			query = query.populate(req.params._populate);
		}
		query = query.exec();
	}
	return query;
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
			const entry = new Database.models[model.name](dataToSave);
			entry.validate().then(() => {
				entry.save().then((result) => {
					res.send(201, result);
					next();
				})
				.catch((error) => {
					console.log(error);
					res.send(500);
					next();
				});
			})
			.catch((validationError) => {
				res.send(409, validationError.errors);
				next();
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
						} else if (result && result.length > 0) {
							delete dataToSave._id;
							DbModel.update({ _id: idToSave }, dataToSave, {
								overwrite: true,
							})
							.then(() => DbModel.find({ _id: idToSave }))
							.then((updateResult) => {
								res.send(200, updateResult[0]);
								next();
							})
							.catch(updateError => Database.handleError(updateError, res, next));
						} else {
							dataToSave._id = idToSave;
							const entry = new DbModel(dataToSave);
							entry.save()
							.then((creationResult) => {
								res.send(201, creationResult);
								next();
							})
							.catch(creationError => Database.handleError(creationError, res, next));
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
			DbModel.find({ _id: idToSave }).then((result) => {
				if (!result || result.length === 0) {
					res.send(404);
					next();
				} else {
					DbModel.update({ _id: idToSave }, { $set: dataToSave }, {
						runValidators: true,
						new: true,
					}).then(() => {
						DbModel.find({ _id: idToSave }).then((updateResult) => {
							res.send(200, updateResult[0]);
							next();
						}).catch(updateResultError => Database.handleError(updateResultError, res, next));
					}).catch((updateError) => {
						res.send(409, updateError);
						next();
					});
				}
			})
			.catch(error => Database.handleError(error, res, next));
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
			DbModel.find({ _id: idToDelete }).then((result) => {
				if (!result || result.length === 0) {
					res.send(404);
					next();
				} else {
					DbModel.remove({ _id: idToDelete }).then(() => {
						res.send(200, result);
						next();
					}).catch(deleteError => Database.handleError(deleteError, res, next));
				}
			}).catch(error => Database.handleError(error, res, next));
		}
	});
};

