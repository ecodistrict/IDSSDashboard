exports.addRoutes = function (app, kpiRecord) {
	app.post('/kpirecords', kpiRecord.saveKpiRecord);
	app.delete('/kpirecords/:kpiAlias', kpiRecord.deleteKpiRecord);
	app.delete('/kpirecords/byKpiAlias/:kpiAlias', kpiRecord.deleteKpiRecordsByKpiAlias);
	app.get('/kpirecords', kpiRecord.getKpiRecords);
	// app.get('/kpirecords/:kpiId', kpiRecord.getKpiRecord);
	app.get('/kpirecords/:variantId/:kpiAlias', kpiRecord.getKpiRecord); // completes with logged in userId 
	app.get('/kpirecords/:variantId/:kpiAlias/:userId', kpiRecord.getKpiRecord);
	//app.get('/kpirecords/:variantId/:moduleId/:kpiAlias/:asIsVariantId', kpiRecord.getModuleInputDashboard); // always logged in user (faciliator)
	app.put('/kpirecords', kpiRecord.saveKpiRecord);
};