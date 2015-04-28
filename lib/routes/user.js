exports.addRoutes = function (app, user, passport) {
	app.post('/users/login', passport.authenticate('local'), user.login);
	app.get('/users/logout', user.logout);
	app.post('/users', user.createUser);
	app.delete('/users/:userId', user.deleteUser);
	app.get('/users', user.getUsers);
	app.get('/users/authenticated', user.getAuthenticatedUser);
	app.get('/users/stakeholders', user.getStakeholders);
	app.get('/users/password/:email', user.getNewPassword);
	app.get('/users/:userId', user.getUser);
	app.put('/users', user.updateUser);
};