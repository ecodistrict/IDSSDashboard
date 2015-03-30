angular.module( 'idss-dashboard.quantitative-kpi-input', [])

.controller( 'QuantitativeKpiInputCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'VariantService', 'KpiService', function QuantitativeKpiInputCtrl( $scope, $modalInstance, kpi, ModuleService, VariantService, KpiService ) {

    // work on a reference
    $scope.kpi = angular.copy(kpi);

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
      $scope.kpi.outputs = KpiService.generateQuantitativeKpiOutput($scope.kpi.inputSpecification.kpiValueInputGroup.inputs.kpiValue);
      $modalInstance.close($scope.kpi);
    };

}]);