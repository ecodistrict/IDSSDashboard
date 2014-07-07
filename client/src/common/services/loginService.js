angular.module('idss-dashboard')

.factory('LoginService', function ($http, Session, $location, authService) {

    var login = function (credentials) {
        return $http
            .post('/login', credentials)
            .then(function (res) {
                var user = res.data;
                console.log(user);
                authService.loginConfirmed();
                Session.create(user.id, user.userId, user.role);
            });
    };

    var getCurrentUser = function() {
        return $http
            .get('/authenticated-user')
            .then(function (res) {
                var user = res.data;
                console.log(user);
                return user;
            });
    };

    var logout = function() {
        return $http
            .get('/logout')
            .then(function (res) {
                Session.destroy();
                return true;
            });
    };

    // TODO: use this to reject all calls in buffer
    var cancelLogin = function() {
        authService.loginCancelled();
    };

    var isAuthenticated = function () {
        if(Session.userId) {
            return true;
        } else {
            return false;  
        };
    };

    var isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        return (isAuthenticated() &&
        authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    return {
        login: login,
        logout: logout,
        isAuthenticated: isAuthenticated,
        isAuthorized: isAuthorized,
        getCurrentUser: getCurrentUser
    };
})

.service('Session', function () {
  this.create = function (sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = null;
  };
  return this;
});