angular.module( 'idss-dashboard.qualitative-kpi-input', [])

.controller( 'QualitativeKpiInputCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'VariantService', 'KpiService', function QualitativeKpiInputCtrl( $scope, $modalInstance, kpi, ModuleService, VariantService, KpiService ) {

    // work on a reference
    $scope.kpi = angular.copy(kpi);

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
      $scope.kpi.outputs = KpiService.generateQualitativeKpiOutput($scope.kpi.inputSpecification.kpiScores.inputs);
      $modalInstance.close($scope.kpi);
    };

}]);