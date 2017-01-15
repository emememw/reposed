const ControllerUtils = require("utils/controllerutils");

const QueryParamActionHandler = module.exports = {};

QueryParamActionHandler.checkAndPopulateFields = function checkAndPopulateFields(givenQuery, req) {
	let query = givenQuery;
	const fieldsToPopulate = this.getFieldsToPopulate(req);
	fieldsToPopulate.forEach((fieldToPopulate) => {
		query = query.populate(fieldToPopulate);
	});
	if (fieldsToPopulate.length > 0) {
		query = query.exec();
	}
	return query;
};

QueryParamActionHandler.getFieldsToPopulate = function getFieldsToPopulate(req) {
	let result = [];
	if (req.params._populate$) {
		if (req.params._populate$.indexOf(",") !== -1) {
			result = req.params._populate$.split(",");
		} else {
			result.push(req.params._populate$);
		}
	}
	return result;
};

QueryParamActionHandler.checkAndApplyFilters = function checkAndApplyFilters(givenQueryObject = {}, req) {
	let queryObject = givenQueryObject;
	queryObject = this.checkAndApplyFilter(queryObject, req);
	queryObject = this.checkAndApplyLikeFilter(queryObject, req);
	queryObject = this.checkAndApplyGreaterThanFilter(queryObject, req);
	queryObject = this.checkAndApplyGreaterThanEqualsFilter(queryObject, req);
	queryObject = this.checkAndApplyLessThanFilter(queryObject, req);
	queryObject = this.checkAndApplyLessThanEqualsFilter(queryObject, req);
	queryObject = this.checkAndApplyBetweenFilter(queryObject, req);
	return queryObject;
};

QueryParamActionHandler.checkAndApplyFilter = function checkAndApplyFilter(givenQueryObject = {}, req) {
	const queryObject = givenQueryObject;
	const queryParams = ControllerUtils.parseQuery(req);
	Object.keys(queryParams).filter(queryParam => queryParam.startsWith("_eq$")).forEach((queryParam) => {
		queryObject[queryParam.replace("_eq$", "")] = queryParams[queryParam];
	});
	return queryObject;
};

QueryParamActionHandler.checkAndApplyLikeFilter = function checkAndApplyLikeFilter(givenQueryObject = {}, req) {
	const queryObject = givenQueryObject;
	const queryParams = ControllerUtils.parseQuery(req);
	Object.keys(queryParams).filter(queryParam => queryParam.startsWith("_like$")).forEach((queryParam) => {
		let valueToSearch = queryParams[queryParam];
		if (valueToSearch.startsWith("/") && valueToSearch.endsWith("/")) {
			valueToSearch = new RegExp(valueToSearch.substring(1, valueToSearch.length - 1));
		}
		queryObject[queryParam.replace("_like$", "")] = { $regex: valueToSearch, $options: "i" };
	});
	return queryObject;
};

QueryParamActionHandler.checkAndApplyGreaterThanFilter = function checkAndApplyGreaterThanFilter(givenQueryObject = {}, req) {
	const queryObject = givenQueryObject;
	const queryParams = ControllerUtils.parseQuery(req);
	Object.keys(queryParams).filter(queryParam => queryParam.startsWith("_gt$")).forEach((queryParam) => {
		queryObject[queryParam.replace("_gt$", "")] = { $gt: queryParams[queryParam] };
	});
	return queryObject;
};

QueryParamActionHandler.checkAndApplyGreaterThanEqualsFilter = function checkAndApplyGreaterThanEqualsFilter(givenQueryObject = {}, req) {
	const queryObject = givenQueryObject;
	const queryParams = ControllerUtils.parseQuery(req);
	Object.keys(queryParams).filter(queryParam => queryParam.startsWith("_gte$")).forEach((queryParam) => {
		queryObject[queryParam.replace("_gte$", "")] = { $gte: queryParams[queryParam] };
	});
	return queryObject;
};

QueryParamActionHandler.checkAndApplyBetweenFilter = function checkAndApplyBetweenFilter(givenQueryObject = {}, req) {
	const queryObject = givenQueryObject;
	const queryParams = ControllerUtils.parseQuery(req);
	Object.keys(queryParams).filter(queryParam => queryParam.startsWith("_between$")).forEach((queryParam) => {
		const valuesToSearch = queryParams[queryParam].split(",");
		if (valuesToSearch.length > 1) {
			queryObject[queryParam.replace("_between$", "")] = { $gt: valuesToSearch[0], $lt: valuesToSearch[1] };
		} else {
			queryObject[queryParam.replace("_between$", "")] = { $gt: valuesToSearch[0], $lt: valuesToSearch[0] };
		}
	});
	return queryObject;
};

QueryParamActionHandler.checkAndApplyLessThanFilter = function checkAndApplyLessThanFilter(givenQueryObject = {}, req) {
	const queryObject = givenQueryObject;
	const queryParams = ControllerUtils.parseQuery(req);
	Object.keys(queryParams).filter(queryParam => queryParam.startsWith("_lt$")).forEach((queryParam) => {
		queryObject[queryParam.replace("_lt$", "")] = { $lt: queryParams[queryParam] };
	});
	return queryObject;
};

QueryParamActionHandler.checkAndApplyLessThanEqualsFilter = function checkAndApplyLessThanEqualsFilter(givenQueryObject = {}, req) {
	const queryObject = givenQueryObject;
	const queryParams = ControllerUtils.parseQuery(req);
	Object.keys(queryParams).filter(queryParam => queryParam.startsWith("_lte$")).forEach((queryParam) => {
		queryObject[queryParam.replace("_lte$", "")] = { $lte: queryParams[queryParam] };
	});
	return queryObject;
};
