const passport = require("passport");

const Authentication = module.exports = {};

let strategyIndex = 0;
Authentication.passportStrategy = null;

Authentication.createAuthenticationHandler = function createAuthenticationHandler(loginRequired = true, operation, authorizationHandler) {
	let result = null;
	if (loginRequired === false || !this.passportStrategy) {
		result = (req, res, next) => next();
	} else {
		result = (req, res, next) => {
			this.authenticate(req, res, next, operation, authorizationHandler);
		};
	}
	return result;
};

Authentication.authenticate = function authenticate(req, res, next, operation, authorizationHandler) {
	passport.authenticate(this.passportStrategy[strategyIndex], (error, user) => {
		if (error) {
			console.log(error);
			res.send(500);
			strategyIndex = 0;
		} else if (!user) {
			if (typeof this.passportStrategy !== "string" && this.passportStrategy[strategyIndex + 1]) {
				strategyIndex += 1;
				this.authenticate(req, res, next, operation, authorizationHandler);
			} else {
				res.send(401, { error: "Full authentication is required to access this resource" });
				strategyIndex = 0;
			}
		} else {
			req.user = user;
			if (authorizationHandler && operation) {
				authorizationHandler(req, operation, user, (result) => {
					if (result) {
						next();
						strategyIndex = 0;
					} else if (typeof this.passportStrategy !== "string" && this.passportStrategy[strategyIndex + 1]) {
						strategyIndex += 1;
						this.authenticate(req, res, next, operation, authorizationHandler);
					} else {
						res.send(403, { error: "Forbidden" });
						strategyIndex = 0;
					}
				});
			} else {
				next();
				strategyIndex = 0;
			}
		}
	})(req, res, next);
};
