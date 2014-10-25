exports.addRoutes = function (app, variant) {
	app.post('/variants', variant.createVariant);
	app.delete('/variants/:variantId', variant.deleteVariant);
	app.get('/variants', variant.getVariants);
	app.get('/variants/:variantId', variant.getVariant);
	app.put('/variants', variant.updateVariant);
};