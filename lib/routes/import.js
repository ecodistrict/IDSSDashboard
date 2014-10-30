exports.addRoutes = function (app, importFile) {
	app.post('/import/geojson', importFile.geojsonFileImport);
};