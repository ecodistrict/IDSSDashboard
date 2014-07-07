angular.module( 'idss-dashboard.header', [
])

.controller( 'HeaderCtrl', ['$scope', '$location', 'LoginService', function HeaderCtrl( $scope, $location, LoginService ) {
  console.log('header ctrl');

  $scope.logout = function() {

  	LoginService.logout().then(function() {
  		$location.path('/login');
  	});

  };

}]);