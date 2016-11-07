exports.addRoutes = function (app, user, passport) {
	app.post('/users/login', passport.authenticate('local'), user.login);
	app.get('/users/logout', user.logout);
	app.post('/users', user.createUser);
	app.post('/users/kpiweight', user.setKpiWeight);
	app.post('/users/kpiambition', user.setKpiAmbition);
	app.delete('/users/:userId', user.deleteUser);
	app.get('/users', user.getUsers);
	app.get('/users/authenticated', user.getAuthenticatedUser);
	app.get('/users/stakeholders', user.getAllStakeholders);
	app.get('/users/stakeholders/:caseId', user.getStakeholders);
	app.put('/users/stakeholders/activecase', user.setActiveCase); // set to facilitators active
	app.delete('/users/stakeholders/:stakeholderId', user.deleteStakeholder);
	app.get('/users/password/:email', user.getNewPassword);
	app.get('/users/:userId', user.getUser);
	app.put('/users', user.updateUser);
};