angular.module('idss-dashboard')

.factory('LoginService', ['$http', 'Session', '$location', 'authService', '$rootScope', 'NotificationService', function ($http, Session, $location, authService, $rootScope, NotificationService) {

    var login = function (credentials) {
        return $http
            .post('users/login', credentials, {ignoreAuthModule: true})
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
    var getStakeholders = function(caseId) {
        return $http
            .get('users/stakeholders/' + caseId).error(function(err) {
                NotificationService.createErrorFlash(err.message);
            })
            .then(function (res) {
                var stakeholders = res.data;
                return stakeholders;
            });
    };

    // TODO: remove from this service..
    var getAllStakeholders = function(caseId) {
        return $http
            .get('users/stakeholders').error(function(err) {
                NotificationService.createErrorFlash(err.message);
            })
            .then(function (res) {
                var stakeholders = res.data;
                return stakeholders;
            });
    };

    var deleteStakeholder = function(stakeholder) {
        return $http
            .delete('users/stakeholders/' + stakeholder._id)
            .error(function(status, data) {
                var label = 'Error when deleting stakeholder';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var deletedStakeholder = res.data;
                var label = 'Stakeholder ' + deletedStakeholder.name + ' was successfully deleted';
                NotificationService.createSuccessFlash(label);
                return deletedStakeholder; // TODO: reset process!
            });
    };

    var setActiveCase = function(stakeholder) {
        return $http.put('users/stakeholders/activecase', stakeholder)
            .error(function(status, data) {
                var label = 'Error when updating stakeholder';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var updatedStakeholder = res.data;
                var label = 'Stakeholder ' + updatedStakeholder.name + ' was successfully updated';
                NotificationService.createSuccessFlash(label);
                return updatedStakeholder; 
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
        setActiveCase: setActiveCase,
        getStakeholders: getStakeholders, // move this to separate service?
        getAllStakeholders: getAllStakeholders, // move this to separate service?
        deleteStakeholder: deleteStakeholder
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