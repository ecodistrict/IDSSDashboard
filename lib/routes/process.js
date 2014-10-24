exports.addRoutes = function (app, process) {
	app.post('/processes', process.createProcess);
	app.del('/processes/:processId', process.deleteProcess);
	app.get('/processes', process.getProcesses);
	app.get('/processes/active', process.getActiveProcess);
	app.get('/processes/:processId', process.getProcess);
	app.put('/processes', process.updateProcess);
};