const ControllerUtils = module.exports = {};

ControllerUtils.handleError = function handleError(error, res, next) {
	console.log(error);
	res.send(500);
	next();
};
