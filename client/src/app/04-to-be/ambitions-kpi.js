angular.module( 'idss-dashboard.to-be.ambitions-kpi', [])

.controller( 'AmbitionsKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'ProcessService', function AmbitionsKpiCtrl( $scope, $modalInstance, kpi, ModuleService, ProcessService ) {

    // work on a reference
    $scope.kpi = angular.copy(kpi);
    
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
      $modalInstance.close($scope.kpi);
    };

}]);



