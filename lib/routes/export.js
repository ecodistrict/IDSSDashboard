exports.addRoutes = function (app, exportFile) {
	app.get('/export/ecodist', exportFile.generateEcodistFile);
};