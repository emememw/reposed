const url = require("url");

const ControllerUtils = module.exports = {};

ControllerUtils.handleError = function handleError(error, res, next) {
	console.log(error);
	res.send(500);
	next();
};

ControllerUtils.parseQuery = function parseQuery(req) {
	const urlParts = url.parse(req.url, true);
	return urlParts.query;
};
