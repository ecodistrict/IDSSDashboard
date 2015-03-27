exports.addRoutes = function (app, variant, userDependency, processDependency) {
	app.post('/variants', variant.createVariant);
	app.delete('/variants/:variantId', variant.deleteVariant);
	app.delete('/variants/moduleinput/:variantId/:kpiId', variant.deleteModuleInput);
	app.delete('/variants/moduleoutput/:variantId/:kpiId', variant.deleteModuleOutput);
	app.get('/variants', variant.getVariants);
	app.get('/variants/:variantId', variant.getVariant);
	app.get('/variants/moduleinput/:variantId/:moduleId/:kpiId', variant.getModuleInput);
	app.put('/variants/moduleinput/:variantId', variant.updateModuleInput);
	app.put('/variants/moduleoutput/outputstatus', variant.updateModuleOutputStatus);
	app.get('/variants/moduleoutput/:variantId/:moduleId/:kpiId', variant.getModuleOutput);
	app.put('/variants', variant.updateVariant);
};