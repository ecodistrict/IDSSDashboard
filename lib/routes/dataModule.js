exports.addRoutes = function (app, dataModule) {
	app.get('/datamodule', dataModule.getDistrictData);
};