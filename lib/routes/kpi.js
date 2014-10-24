exports.addRoutes = function (app, kpi) {
	app.post('/kpis', kpi.createKpi);
	app.del('/kpis/:kpiId', kpi.deleteKpi);
	app.get('/kpis', kpi.getKpis);
	app.get('/kpis/:kpiId', kpi.getKpi);
	app.put('/kpis', kpi.updateKpi);
};