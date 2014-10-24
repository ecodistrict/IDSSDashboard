angular.module( 'idss-dashboard.register', [
  'idss-dashboard.register.forgotpassword'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'register', {
    url: '/register',
    views: {
      "main": {
        controller: 'RegisterCtrl',
        templateUrl: 'register/register.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data: {
      pageTitle: 'Register',
      authorizedRoles: ['*']
    }
  });
}])

.controller( 'RegisterCtrl', ['$scope', '$state', 'LoginService', function RegisterCtrl( $scope, $state, LoginService) {

  $scope.registrant = {
    role: 'Facilitator',
    firstName: '',
    lastName: '',
    email: '',
    password: null
  }; 

  $scope.register = function() {

    LoginService.createLogin($scope.registrant).then(function(user) {
        console.log(user);
        $scope.registrant.password = user.password;
    });

  };

}]);

