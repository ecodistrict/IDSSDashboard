angular.module( 'idss-dashboard.login', [
])

.config(function config( $stateProvider ) {
    $stateProvider.state( 'login', {
        url: '/login',
        views: {
          "main": {
            controller: 'LoginCtrl',
            templateUrl: 'login/login.tpl.html'
          },
          "header": {
            controller: 'HeaderCtrl',
            templateUrl: 'header/header.tpl.html' 
          }
        },
        data:{ 
          pageTitle: 'Login',
          authorizedRoles: ['*']
        }
    });
})

.controller('LoginCtrl', ['$scope', '$rootScope', 'LoginService', 'authService', function LoginCtrl($scope, $rootScope, LoginService, authService) {
    $scope.credentials = {
        username: '',
        password: ''
    };
    $scope.login = function (credentials) {
        LoginService.login(credentials).then(function () {
            authService.loginConfirmed();
        }, function () {
            authService.loginCancelled();
        });
    };
}]);