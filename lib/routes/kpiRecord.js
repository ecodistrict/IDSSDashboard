exports.addRoutes = function (app, kpiRecord) {
	app.post('/kpirecords', kpiRecord.saveKpiRecord);
	// app.delete('/kpirecords/:kpiId', kpiRecord.deleteKpiRecord);
	// app.get('/kpirecords', kpiRecord.getKpiRecords);
	// app.get('/kpirecords/:kpiId', kpiRecord.getKpiRecord);
	app.get('/kpirecords/:variantId/:kpiAlias', kpiRecord.getKpiRecord);
	app.put('/kpirecords', kpiRecord.saveKpiRecord);
};