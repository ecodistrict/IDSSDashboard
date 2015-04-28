angular.module('idss-dashboard')

.factory('LoginService', ['$http', 'Session', '$location', 'authService', '$rootScope', 'NotificationService', function ($http, Session, $location, authService, $rootScope, NotificationService) {

    var login = function (credentials) {
        return $http
            .post('users/login', credentials)
            .error(function(status, data) {
                var label = 'Email or password was not correct';
                console.log(label);
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var user = res.data;
                authService.loginConfirmed();
                Session.create(user.sessionId, user._id, user.role);
                return user;
            });
    };

    var getCurrentUser = function() {
        return $http
            .get('users/authenticated')
            .then(function (res) {
                var user = res.data;
                if(!isAuthenticated()) {
                    Session.create(user.sessionId, user._id, user.role);
                }
                return user;
            });
    };

    var logout = function() {
        return $http
            .get('users/logout')
            .then(function (res) {
                Session.destroy();
                return true;
                //$rootScope.$broadcast('event:auth-loginRequired');
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
        }
    };

    var isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        var isAuthorized = authorizedRoles.indexOf(Session.userRole) !== -1 || authorizedRoles.indexOf('*') !== -1;
        return (isAuthenticated() && isAuthorized);
    };

    var createLogin = function(registrant) {
        return $http({
                method: 'POST',
                url:'users',
                data: registrant
            }).error(function(err) {
                NotificationService.createErrorFlash(err.message);
            }).then(function(res) {
                var user = res.data;
                NotificationService.createSuccessFlash(user.fname + ' ' + user.lname + ' (' + user.email + ') was added as a user');
                return user;
            });
    };

    var forgotPassword = function(credentials) {
        return $http
            .get('users/password/' + credentials.email).error(function(err) {
                NotificationService.createErrorFlash(err.message);
            })
            .then(function (res) {
                var user = res.data;
                NotificationService.createSuccessFlash('New password was generated');
                return user;
            });
    };

    // TODO: remove from this service..
    var getStakeholders = function() {
        return $http
            .get('users/stakeholders').error(function(err) {
                NotificationService.createErrorFlash(err.message);
            })
            .then(function (res) {
                var stakeholders = res.data;
                return stakeholders;
            });
    };

    return {
        login: login,
        logout: logout,
        isAuthenticated: isAuthenticated,
        isAuthorized: isAuthorized,
        getCurrentUser: getCurrentUser,
        createLogin: createLogin,
        forgotPassword: forgotPassword,
        getStakeholders: getStakeholders // move this to separate service?
    };
}])

.service('Session', [function () {
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
}]);