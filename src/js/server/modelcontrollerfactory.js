const Database = require("db/database");
const ControllerUtils = require("utils/controllerutils");
const QueryParamActionHandler = require("server/queryparamactionhandler");
const Authentication = require("authentication/authentication");

const ModelControllerFactory = module.exports = {};

ModelControllerFactory.createControllers = function createControllers(model, server, routePrefix = "") {
	if (model.expose !== false) {
		const capitalizedModelName = model.name[0].toUpperCase() + model.name.substring(1, model.name.length);
		const exposeOptions = this.createExposeOptions(model);
		const loginRequiredOptions = this.createLoginRequiredOptions(model);
		if (exposeOptions.findAll) {
			this.createFindAllController(model, server, capitalizedModelName, loginRequiredOptions.findAll, routePrefix);
		}
		if (exposeOptions.findOne) {
			this.createFindOneController(model, server, capitalizedModelName, loginRequiredOptions.findOne, routePrefix);
		}
		if (exposeOptions.create) {
			this.createCreateController(model, server, capitalizedModelName, loginRequiredOptions.create, routePrefix);
		}
		if (exposeOptions.store) {
			this.createCreateOrUpdateController(model, server, capitalizedModelName, loginRequiredOptions.store, routePrefix);
		}
		if (exposeOptions.update) {
			this.createUpdateController(model, server, capitalizedModelName, loginRequiredOptions.update, routePrefix);
		}
		if (exposeOptions.remove) {
			this.createDeleteController(model, server, capitalizedModelName, loginRequiredOptions.remove, routePrefix);
		}
	}
};

ModelControllerFactory.createLoginRequiredOptions = function createLoginRequiredOptions(model) {
	const result = {
		findOne: true,
		findAll: true,
		create: true,
		store: true,
		update: true,
		remove: true,
	};
	if (model.loginRequired && typeof model.loginRequired === "object") {
		result.findOne = model.loginRequired.findOne !== false;
		result.findAll = model.loginRequired.findAll !== false;
		result.create = model.loginRequired.create !== false;
		result.store = model.loginRequired.store !== false;
		result.update = model.loginRequired.update !== false;
		result.remove = model.loginRequired.remove !== false;
	} else if (model.loginRequired === false) {
		result.findOne = false;
		result.findAll = false;
		result.create = false;
		result.store = false;
		result.update = false;
		result.remove = false;
	}
	return result;
};

ModelControllerFactory.createExposeOptions = function createExposeOptions(model) {
	const result = {
		findOne: true,
		findAll: true,
		create: true,
		store: true,
		update: true,
		remove: true,
	};
	if (model.expose && typeof model.expose === "object") {
		result.findOne = model.expose.findOne !== false;
		result.findAll = model.expose.findAll !== false;
		result.create = model.expose.create !== false;
		result.store = model.expose.store !== false;
		result.update = model.expose.update !== false;
		result.remove = model.expose.remove !== false;
	}
	return result;
};

ModelControllerFactory.createFindAllController = function createFindAllController(model, server, capitalizedModelName, loginRequired, routePrefix = "") {
	server.get({
		name: `FindAll${capitalizedModelName}Controller`,
		path: `${routePrefix}/${model.resource}`,
	}, Authentication.createAuthenticationHandler(loginRequired), (req, res, next) => {
		let query = null;
		if (req.params._limit$ || req.params._page$) {
			query = Database.models[model.name].paginate(QueryParamActionHandler.checkAndApplyFilters({}, req), {
				page: req.params._page$ ? parseInt(req.params._page$, 10) : 1,
				limit: req.params._limit$ ? parseInt(req.params._limit$, 10) : 10,
				populate: QueryParamActionHandler.getFieldsToPopulate(req),
			}).then((result) => {
				res.send(200, result);
				next();
			}).catch(error => ControllerUtils.handleError(error, res, next));
		} else {
			query = Database.models[model.name].find(QueryParamActionHandler.checkAndApplyFilters({}, req));
			query = QueryParamActionHandler.checkAndPopulateFields(query, req);
			query.then((result) => {
				res.send(200, result);
				next();
			})
			.catch(error => ControllerUtils.handleError(error, res, next));
		}
	});
};

ModelControllerFactory.createFindOneController = function createFindOneController(model, server, capitalizedModelName, loginRequired, routePrefix = "") {
	server.get({
		name: `FindOne${capitalizedModelName}Controller`,
		path: `${routePrefix}/${model.resource}/:id`,
	}, Authentication.createAuthenticationHandler(loginRequired), (req, res, next) => {
		if (!Database.validateObjectId(req.params.id)) {
			res.send(409);
			next();
		} else {
			let query = Database.models[model.name].find({ _id: req.params.id });
			query = QueryParamActionHandler.checkAndPopulateFields(query, req);
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

ModelControllerFactory.createCreateController = function createCreateController(model, server, capitalizedModelName, loginRequired, routePrefix) {
	server.post({
		name: `Create${capitalizedModelName}Controller`,
		path: `${routePrefix}/${model.resource}`,
	}, Authentication.createAuthenticationHandler(loginRequired), (req, res, next) => {
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

ModelControllerFactory.createCreateOrUpdateController = function createCreateOrUpdateController(model, server, capitalizedModelName, loginRequired, routePrefix = "") {
	// TODO refactor :(
	server.put({
		name: `CreateOrUpdate${capitalizedModelName}Controller`,
		path: `${routePrefix}/${model.resource}/:id`,
	}, Authentication.createAuthenticationHandler(loginRequired), (req, res, next) => {
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

ModelControllerFactory.createUpdateController = function createUpdateController(model, server, capitalizedModelName, loginRequired, routePrefix) {
	server.patch({
		name: `Update${capitalizedModelName}Controller`,
		path: `${routePrefix}/${model.resource}/:id`,
	}, Authentication.createAuthenticationHandler(loginRequired), (req, res, next) => {
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

ModelControllerFactory.createDeleteController = function createDeleteController(model, server, capitalizedModelName, loginRequired, routePrefix = "") {
	server.del({
		name: `Delete${capitalizedModelName}Controller`,
		path: `${routePrefix}/${model.resource}/:id`,
	}, Authentication.createAuthenticationHandler(loginRequired), (req, res, next) => {
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

