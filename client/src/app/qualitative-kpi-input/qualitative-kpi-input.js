angular.module( 'idss-dashboard.qualitative-kpi-input', [])

.controller( 'QualitativeKpiInputCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'VariantService', 'KpiService', function QualitativeKpiInputCtrl( $scope, $modalInstance, kpi, ModuleService, VariantService, KpiService ) {

    // work on a reference
    $scope.kpi = angular.copy(kpi);

    $scope.setKpiValue = function(value) {
    	$scope.kpi.value = value;
    };

    $scope.getChecked = function(value) {
    	return value === kpi.value ? 'checked' : '';
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
      $modalInstance.close($scope.kpi);
    };

}]);