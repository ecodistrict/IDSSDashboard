angular.module( 'idss-dashboard.header.reenterpassword', [])

.controller( 'ReenterPasswordCtrl', ['$scope', '$modalInstance', function ReenterPasswordCtrl( $scope, $modalInstance) {

  $scope.credentials = {
    username: '',
    password: ''
  };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
        $modalInstance.close($scope.credentials);
    };

}]);