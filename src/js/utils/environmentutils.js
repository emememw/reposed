const EnvironmentUtils = module.exports = {};

EnvironmentUtils.isServer = function isServer() {
	return typeof window === "undefined" || !window || !window.document; // eslint-disable-line
};
