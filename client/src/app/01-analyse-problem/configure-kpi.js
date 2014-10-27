angular.module( 'idss-dashboard.analyse-problem.configure-kpi', [])

.controller( 'ConfigureKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'VariantService', function ConfigureKpiCtrl( $scope, $modalInstance, kpi, ModuleService, VariantService ) {

    // work on a reference
  	$scope.kpi = angular.copy(kpi);
    $scope.kpi.selectedModule = angular.copy(kpi.selectedModule);

  	$scope.relevantModules = [];

  	var modules = ModuleService.getModulesFromKpiId(kpi.alias);
  	_.each(modules, function(module) {
  		$scope.relevantModules.push(module);
  	});

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

  	$scope.ok = function() {
      $modalInstance.close($scope.kpi);
  	};

    $scope.removeKpiFromProcess = function(kpi) {
      VariantService.removeKpi($scope.kpi);
      $modalInstance.dismiss('cancel');
    };

}]);