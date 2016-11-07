var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

exports.addRoutes = function (app, caseRepo) {
	app.post('/cases', ensureLoggedIn(), caseRepo.createCase);
	app.delete('/cases/:caseId', ensureLoggedIn(), caseRepo.deleteCase);
	app.get('/cases', ensureLoggedIn(), caseRepo.getCases);
	app.get('/cases/active', ensureLoggedIn(), caseRepo.getActiveCase);
	app.get('/cases/:caseId', ensureLoggedIn(), caseRepo.getCaseById);
	app.put('/cases', ensureLoggedIn(), caseRepo.updateCase);
};