angular.module('idss-dashboard')

.factory('LoginService', function ($http, Session) {

    var login = function (credentials) {
        return $http
            .post('/login', credentials)
            .then(function (res) {
              Session.create(res.id, res.userid, res.role);
            });
    };

    var isAuthenticated = function () {
        return !!Session.userId;
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
        isAuthenticated: isAuthenticated,
        isAuthorized: isAuthorized
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