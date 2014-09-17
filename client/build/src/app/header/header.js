angular.module( 'idss-dashboard.header', [
])

.controller( 'HeaderCtrl', ['$scope', '$location', 'LoginService', function HeaderCtrl( $scope, $location, LoginService ) {

  $scope.logout = function() {

  	LoginService.logout();

  };


}]);