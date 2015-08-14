angular.module( 'idss-dashboard.kpi-weight', [])

.controller( 'KpiWeightController', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'VariantService', 'KpiService', function KpiWeightController( $scope, $modalInstance, kpi, ModuleService, VariantService, KpiService ) {

    // work on a reference
    $scope.kpi = angular.copy(kpi);

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.validate = function() {
        if($scope.kpi.weight >= 1 && $scope.kpi.weight <= 5) {
            $scope.validationError = "";
        } else {
            $scope.validationError = "Value needs to be between 1 and 5";
        }
    };

    $scope.ok = function() {
        if($scope.kpi.weight >= 1 && $scope.kpi.weight <= 5) {
            $modalInstance.close($scope.kpi);
        } else {
            $scope.validationError = "Please provide a number between 1 and 5";
        }
    };

}]);