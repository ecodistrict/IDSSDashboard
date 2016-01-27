var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

exports.addRoutes = function (app, variant) {
	app.post('/variants', ensureLoggedIn(), variant.createVariant);
	app.delete('/variants/:variantId', ensureLoggedIn(), variant.deleteVariant);
	app.get('/variants', ensureLoggedIn(), variant.getVariants);
	app.get('/variants/processid', ensureLoggedIn(), variant.getVariantsByProcessId);
	app.get('/variants/:variantId', ensureLoggedIn(), variant.getVariant);
	app.put('/variants', ensureLoggedIn(), variant.updateVariant);
};