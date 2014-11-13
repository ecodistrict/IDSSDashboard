exports.addRoutes = function (app, variant, userDependency, processDependency) {
	app.post('/variants', variant.createVariant);
	app.delete('/variants/:variantId', variant.deleteVariant);
	app.delete('/variants/moduleinput/:variantId/:kpiAlias', variant.deleteModuleInput);
	app.delete('/variants/moduleoutput/:variantId/:kpiAlias', variant.deleteModuleOutput);
	app.get('/variants', variant.getVariants);
	app.get('/variants/:variantId', variant.getVariant);
	app.get('/variants/moduleinput/:variantId/:moduleId/:kpiAlias', variant.getModuleInput);
	app.put('/variants/moduleinput/:variantId', variant.updateModuleInput);
	app.get('/variants/moduleoutput/:variantId/:moduleId/:kpiAlias', variant.getModuleOutput);
	app.put('/variants', variant.updateVariant);
};