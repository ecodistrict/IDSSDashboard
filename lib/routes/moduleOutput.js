exports.addRoutes = function (app, output) {
	app.delete('/moduleoutput/:kpiId', output.deleteModuleOutput);
	app.put('/moduleoutput/outputstatus', output.updateModuleOutputStatus);
	app.get('/moduleoutput/:variantId/:moduleId/:kpiId', output.getModuleOutput);
};