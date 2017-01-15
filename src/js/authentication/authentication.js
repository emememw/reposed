const passport = require("passport");

const Authentication = module.exports = {};

Authentication.passportStrategy = null;

Authentication.createAuthenticationHandler = function createAuthenticationHandler(loginRequired = true) {
	let result = null;
	if (loginRequired === false || !this.passportStrategy) {
		result = (req, res, next) => next();
	} else {
		result = (req, res, next) => {
			this.authenticate(req, res, next);
		};
	}
	return result;
};

Authentication.authenticate = function authenticate(req, res, next) {
	passport.authenticate(this.passportStrategy, (error, user) => {
		if (error) {
			console.log(error);
			res.send(500);
		} else if (!user) {
			res.send(401, { error: "Full authentication is required to access this resource" });
		} else {
			req.user = user;
			next();
		}
	})(req, res, next);
};
