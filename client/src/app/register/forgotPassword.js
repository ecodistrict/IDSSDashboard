angular.module( 'idss-dashboard.register.forgotpassword', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'forgotpassword', {
    url: '/forgot/password',
    views: {
      "main": {
        controller: 'ForgotPasswordController',
        templateUrl: 'register/forgotPassword.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data: {
      authorizedRoles: ['*']
    }
  });
}])

.controller( 'ForgotPasswordController', ['$scope', '$state', 'LoginService', function ForgotPasswordController( $scope, $state, LoginService) {

  $scope.registrant = {
    email: null,
  };
  
  $scope.requestNewPassword = function() {

      LoginService.forgotPassword($scope.registrant).then(function(user) {
        $scope.registrant.password = user.password;
      });
    
  };

}]);

