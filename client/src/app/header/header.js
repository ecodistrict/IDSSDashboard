angular.module( 'idss-dashboard.header', [
])

.controller( 'HeaderCtrl', ['$scope', '$location', 'LoginService', function HeaderCtrl( $scope, $location, LoginService ) {
  console.log('header ctrl');

  console.log($scope);

  $scope.logout = function() {

  	LoginService.logout();

  };

}]);